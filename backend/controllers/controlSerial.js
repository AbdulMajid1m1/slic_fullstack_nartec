const { validationResult } = require("express-validator");

const ControlSerialModel = require("../models/controlSerial");
const ItemCodeModel = require("../models/tblItemCodes1S1Br");
const SupplierModel = require("../models/supplier");
const { sendControlSerialNotificationEmail } = require("../utils/emailManager");
const generateResponse = require("../utils/response");
const CustomError = require("../exceptions/customError");

/**
 * Generate serial number using formula: ItemCode + 6-digit series number
 * @param {string} itemCode - Item ItemCode
 * @param {string} seriesNumber - 6-digit series number
 * @returns {string} - Generated serial number
 */
function generateSerialNumber(itemCode, seriesNumber) {
  return `${itemCode}${seriesNumber}`;
}

exports.createControlSerials = async (req, res, next) => {
  try {
    const { ItemCode, qty, supplierId, poNumber, size } = req.body;

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new CustomError(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    // Verify supplier exists
    const supplier = await SupplierModel.getSupplierById(supplierId);
    if (!supplier) {
      const error = new CustomError("Supplier not found");
      error.statusCode = 404;
      throw error;
    }

    // Verify product exists
    const product = await ItemCodeModel.findByItemCode(ItemCode);
    if (!product) {
      const error = new CustomError("Product with given ItemCode not found");
      error.statusCode = 404;
      throw error;
    }

    // Generate bulk serials
    const serials = [];

    // Get the starting series number (only query once)
    let currentSeriesNumber = await ControlSerialModel.getNextSeriesNumber(
      product.id
    );

    for (let i = 0; i < qty; i++) {
      // Generate serial number using the actual ItemCode string + series number
      const serialNumber = generateSerialNumber(ItemCode, currentSeriesNumber);

      serials.push({
        serialNumber,
        ItemCode: product.id, // Use the product's id (foreign key reference)
        supplierId: supplierId,
        poNumber: poNumber,
        size: size || null,
      });

      // Increment series number for next iteration
      const nextNum = parseInt(currentSeriesNumber) + 1;
      if (nextNum > 999999) {
        throw new Error("Series number exceeds maximum value (999999)");
      }
      currentSeriesNumber = nextNum.toString().padStart(6, "0");
    }

    // Create all serials
    const result = await ControlSerialModel.createBulk(serials);

    if (!result || result.count === 0) {
      const error = new CustomError("Failed to create control serials");
      error.statusCode = 500;
      throw error;
    }

    // Fetch created records with product details
    const createdSerials = await Promise.all(
      serials.map((serial) =>
        ControlSerialModel.findBySerialNumber(serial.serialNumber)
      )
    );

    // Send email notification to supplier
    try {
      const emailResult = await sendControlSerialNotificationEmail({
        supplierEmail: supplier.email,
        supplierName: supplier.name,
        poNumber: poNumber,
        itemCode: ItemCode,
        quantity: qty,
        size: size || null,
      });
      console.log("Email notification result:", emailResult);
    } catch (emailError) {
      console.error("Error sending email notification:", emailError);
      // Don't fail the operation if email sending fails
    }

    res
      .status(201)
      .json(
        generateResponse(
          201,
          true,
          `${qty} control serial(s) created successfully`,
          createdSerials
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * GET - Retrieve all control serials with pagination
 */
exports.getControlSerials = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || null;
    const poNumber = req.query.poNumber || null;
    const supplierId = req.query.supplierId || null;

    const result = await ControlSerialModel.findAllWithPagination(
      page,
      limit,
      search,
      poNumber,
      supplierId
    );
    const { controlSerials, pagination } = result;

    if (!controlSerials || controlSerials.length === 0) {
      const error = new CustomError("No control serials found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json(
      generateResponse(200, true, "Control serials retrieved successfully", {
        controlSerials,
        pagination,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET - Retrieve all control serials without pagination
 */
exports.getAllControlSerials = async (req, res, next) => {
  try {
    const result = await ControlSerialModel.findAll();

    if (!result || result.length === 0) {
      const error = new CustomError("No control serials found");
      error.statusCode = 404;
      return next(error);
    }

    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Control serials retrieved successfully",
          result
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * GET - Retrieve control serial by ID
 */
exports.getControlSerialById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const controlSerial = await ControlSerialModel.findById(id);

    if (!controlSerial) {
      const error = new CustomError("Control serial not found");
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Control serial retrieved successfully",
          controlSerial
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * GET - Search control serials by ItemCode
 */
exports.searchByItemCode = async (req, res, next) => {
  try {
    const { ItemCode } = req.query;

    if (!ItemCode) {
      const error = new CustomError("ItemCode query parameter is required");
      error.statusCode = 400;
      throw error;
    }

    const controlSerials = await ControlSerialModel.findByItemCode(ItemCode);

    if (!controlSerials || controlSerials.length === 0) {
      const error = new CustomError(
        "No control serials found for the given ItemCode"
      );
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Control serials retrieved successfully",
          controlSerials
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * POST - Send control serial notification emails by PO number
 * Body: { poNumber: string }
 * This will find all control serials for the PO number which are not yet sent,
 * group them by supplier and size, send notification email for each group,
 * and mark those control serials as isSentToSupplier = true when email sending succeeds.
 */
exports.sendControlSerialsByPoNumber = async (req, res, next) => {
  try {
    const { poNumber } = req.body;

    if (!poNumber) {
      const error = new CustomError("PO number is required");
      error.statusCode = 400;
      throw error;
    }

    // Find all control serials for this PO number that are not yet sent
    const allSerials = await ControlSerialModel.findByPoNumber(poNumber);
    const unsent = (allSerials || []).filter((s) => !s.isSentToSupplier);

    if (!unsent || unsent.length === 0) {
      const error = new CustomError("No unsent control serials found for this PO number");
      error.statusCode = 404;
      throw error;
    }

    // Group by supplierId + size to preserve the original email payload shape
    const groups = {};
    for (const s of unsent) {
      const key = `${s.supplierId}_${s.size || ""}`;
      if (!groups[key]) {
        groups[key] = {
          supplierId: s.supplierId,
          supplier: s.supplier,
          poNumber: s.poNumber,
          size: s.size,
          serials: [],
        };
      }
      groups[key].serials.push(s);
    }

    const sentSummary = [];
    const failedSummary = [];

    // Iterate groups and send emails
    for (const key of Object.keys(groups)) {
      const group = groups[key];
      const supplier = group.supplier;

      try {
        // Send email notification
        const emailResult = await sendControlSerialNotificationEmail({
          supplierEmail: supplier.email,
          supplierName: supplier.name,
          poNumber: group.poNumber,
          itemCode: group.serials.map((s) => s.product?.ItemCode).join(", "),
          quantity: group.serials.length,
          size: group.size || null,
        });

        // Mark all serials in this group as sent
        const serialIds = group.serials.map((s) => s.id);
        await ControlSerialModel.markAsSentByIds(serialIds);

        sentSummary.push({
          supplierId: supplier.id,
          supplierEmail: supplier.email,
          poNumber: group.poNumber,
          quantity: group.serials.length,
        });
      } catch (groupError) {
        console.error(`Error sending email for group ${key}:`, groupError);
        failedSummary.push({
          supplierId: supplier.id,
          supplierEmail: supplier.email,
          poNumber: group.poNumber,
          quantity: group.serials.length,
          error: groupError.message,
        });
      }
    }

    res.status(200).json(
      generateResponse(200, true, "Send-by-PO process completed", {
        sent: sentSummary,
        failed: failedSummary,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET - Search control serial by serial number
 */
exports.searchBySerialNumber = async (req, res, next) => {
  try {
    const { serialNumber } = req.query;

    if (!serialNumber) {
      const error = new CustomError("serialNumber query parameter is required");
      error.statusCode = 400;
      throw error;
    }

    const controlSerial = await ControlSerialModel.findBySerialNumber(
      serialNumber
    );

    if (!controlSerial) {
      const error = new CustomError(
        "No control serial found with the given serial number"
      );
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Control serial retrieved successfully",
          controlSerial
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * GET - Search control serials by PO number
 */
exports.searchByPoNumber = async (req, res, next) => {
  try {
    const { poNumber } = req.query;

    if (!poNumber) {
      const error = new CustomError("poNumber query parameter is required");
      error.statusCode = 400;
      throw error;
    }

    const controlSerials = await ControlSerialModel.findByPoNumber(poNumber);

    if (!controlSerials || controlSerials.length === 0) {
      const error = new CustomError(
        "No control serials found for the given PO number"
      );
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Control serials retrieved successfully",
          controlSerials
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT - Update control serial
 */
exports.updateControlSerial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ItemCode } = req.body;

    // Check if control serial exists
    const existingSerial = await ControlSerialModel.findById(id);
    if (!existingSerial) {
      const error = new CustomError("Control serial not found");
      error.statusCode = 404;
      throw error;
    }

    // If ItemCode is being updated, verify the product exists
    if (ItemCode && ItemCode !== existingSerial.ItemCode) {
      const product = await ItemCodeModel.findByItemCode(ItemCode);
      if (!product) {
        const error = new CustomError("Product with given ItemCode not found");
        error.statusCode = 404;
        throw error;
      }

      // Prepare update data with the product's id
      const updateData = {
        ItemCode: product.id, // Use the product's id (foreign key reference)
      };

      const updatedSerial = await ControlSerialModel.update(id, updateData);

      res
        .status(200)
        .json(
          generateResponse(
            200,
            true,
            "Control serial updated successfully",
            updatedSerial
          )
        );
    } else {
      // No update needed if ItemCode is the same
      res
        .status(200)
        .json(
          generateResponse(
            200,
            true,
            "Control serial is already up to date",
            existingSerial
          )
        );
    }
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE - Delete control serial
 */
exports.deleteControlSerial = async (req, res, next) => {
  try {
    const { id } = req.params;

    const controlSerial = await ControlSerialModel.findById(id);
    if (!controlSerial) {
      const error = new CustomError("Control serial not found");
      error.statusCode = 404;
      throw error;
    }

    const deletedSerial = await ControlSerialModel.deleteById(id);

    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Control serial deleted successfully",
          deletedSerial
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Get PO numbers with supplier details for authenticated supplier
 * Used by supplier portal with supplier bearer token
 */
exports.getSupplierPoNumbersWithSupplierDetails = async (req, res, next) => {
  try {
    // Get supplier ID from the authenticated request (set by is-supplier-auth middleware)
    const supplierEmail = req?.email;

    if (!supplierEmail) {
        const error = new CustomError("Supplier email not found in token");
        error.statusCode = 401;
        throw error;
    }

    // Verify supplier exists
    const supplier = await SupplierModel.getSupplierByEmail(supplierEmail);
    if (!supplier) {
      const error = new CustomError("Supplier not found");
      error.statusCode = 404;
      throw error;
    }

    // Get unique PO numbers with supplier details
    const poNumbersWithSupplier = await ControlSerialModel.getPoNumbersWithSupplierDetailsBySupplierId(supplier.id);

    // Get total count of control serials for each PO number
    const poNumbersWithCount = await Promise.all(
        poNumbersWithSupplier.map(async (po) => {
            const count = await ControlSerialModel.countByPoNumberAndSupplierId(po.poNumber, supplier.id);
            return {
                ...po,
                totalCount: count
            };
        })
    );

    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "PO numbers with supplier details retrieved successfully",
            poNumbersWithCount,
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Get PO numbers with supplier details for authenticated SLIC admin
 * Used by SLIC project
 */
exports.getPoNumbersWithSupplierDetails = async (req, res, next) => {
    try {

        // Get unique PO numbers with supplier details
        const poNumbersWithSupplier = await ControlSerialModel.getPoNumbersWithSupplierDetails();

        // Get total count of control serials for each PO number
        const poNumbersWithCount = await Promise.all(
            poNumbersWithSupplier.map(async (po) => {
                const count = await ControlSerialModel.countByPoNumber(po.poNumber);
                return {
                    ...po,
                    totalCount: count
                };
            })
        );

        res
            .status(200)
            .json(
                generateResponse(
                    200,
                    true,
                    "PO numbers with supplier details retrieved successfully",
                    poNumbersWithCount
                )
            );
    } catch (error) {
        next(error);
    }
};