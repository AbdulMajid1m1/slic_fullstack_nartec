const { validationResult } = require("express-validator");

const ControlSerialModel = require("../models/controlSerial");
const ItemCodeModel = require("../models/tblItemCodes1S1Br");
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
    const { ItemCode, qty } = req.body;

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new CustomError(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
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
    for (let i = 0; i < qty; i++) {
      const seriesNumber = await ControlSerialModel.getNextSeriesNumber(
        ItemCode
      );
      const serialNumber = generateSerialNumber(ItemCode, seriesNumber);

      // Double-check uniqueness
      const exists = await ControlSerialModel.serialNumberExists(serialNumber);
      if (exists) {
        throw new Error(`Serial number ${serialNumber} already exists`);
      }

      serials.push({
        serialNumber,
        ItemCode,
      });
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

    const result = await ControlSerialModel.findAllWithPagination(
      page,
      limit,
      search
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
    }

    // Prepare update data
    const updateData = {
      ItemCode: ItemCode || existingSerial.ItemCode,
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
