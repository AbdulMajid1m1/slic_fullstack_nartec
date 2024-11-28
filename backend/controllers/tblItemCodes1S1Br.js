const mod10CheckDigit = require("mod10-check-digit");
const { validationResult } = require("express-validator");

const ItemCodeModel = require("../models/tblItemCodes1S1Br");
const BarSeriesNo = require("../models/barSeriesNo");
const generateResponse = require("../utils/response");
const CustomError = require("../exceptions/customError");

function calculateCheckDigit(gtinWithoutCheckDigit) {
  const digits = gtinWithoutCheckDigit.split("").map(Number);
  let sum = 0;

  // EAN-13 check digit calculation (modulo-10 algorithm)
  for (let i = 0; i < digits.length; i++) {
    sum += i % 2 === 0 ? digits[i] * 1 : digits[i] * 3;
  }

  const remainder = sum % 10;
  const checkDigit = remainder === 0 ? 0 : 10 - remainder;

  return checkDigit.toString();
}

async function generateBarcode(id) {
  const GCP = "6287898";
  const seriesNo = await BarSeriesNo.getBarSeriesNo(id);

  if (!seriesNo) {
    throw new CustomError("BarSeriesNo not found", 404);
  }

  // Construct the base barcode
  const baseBarcode = `${GCP}${seriesNo.BarSeriesNo}`;

  // Add a leading zero if the base barcode length is 11
  let barcode;
  if (baseBarcode.length === 11) {
    barcode = `${GCP}0${seriesNo.BarSeriesNo}`;
  } else if (baseBarcode.length === 12) {
    barcode = baseBarcode;
  } else {
    throw new CustomError("BarSeriesNo is not in a valid format", 400);
  }

  // Calculate the check digit and append it
  const CHECK_DIGIT = calculateCheckDigit(barcode);
  barcode += CHECK_DIGIT;

  if (barcode.length !== 13) {
    throw new CustomError("Generated barcode is not 13 characters long", 500);
  }

  // Increment the BarSeriesNo for the next generation
  const number = (Number(seriesNo.BarSeriesNo) + 1).toString();
  const result = await BarSeriesNo.updateBarSeriesNo(id, number);

  if (!result) {
    throw new CustomError("Failed to update BarSeriesNo", 500);
  }

  return barcode;
}
exports.getItemCodes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || null;

    const result = await ItemCodeModel.findAllWithPagination(
      page,
      limit,
      search
    );
    const { itemCodes, pagination } = result;

    if (!itemCodes || itemCodes.length <= 0) {
      const error = new CustomError("No item codes found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json(
      generateResponse(200, true, "Item codes retrieved successfully", {
        itemCodes,
        pagination,
      })
    );
  } catch (error) {
    next(error);
  }
};

exports.getAllItemCodes = async (req, res, next) => {
  try {
    const result = await ItemCodeModel.findAll();

    if (!result || result.length <= 0) {
      const error = new CustomError("No item codes found");
      error.statusCode = 404;
      return next(error);
    }

    res
      .status(200)
      .json(
        generateResponse(200, true, "Item codes retrieved successfully", result)
      );
  } catch (error) {
    console.log(error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};

// exports.updateGTINs = async (req, res, next) => {
//   try {
//     // Fetch all item codes
//     const itemCodes = await ItemCodeModel.findAll();

//     // Update each item code with the correct check digit
//     const updatePromises = itemCodes.map(async (item) => {
//       if (item.GTIN && item.GTIN.length === 13) {
//         const gtinWithoutCheckDigit = item.GTIN.slice(0, 12);
//         const correctCheckDigit = calculateCheckDigit(gtinWithoutCheckDigit);
//         const updatedGTIN = `${gtinWithoutCheckDigit}${correctCheckDigit}`;

//         // Update the record only if it needs correction
//         if (updatedGTIN !== item.GTIN) {
//           return await ItemCodeModel.update(item.id, { GTIN: updatedGTIN });
//         }
//       }
//     });

//     await Promise.all(updatePromises);

//     res.status(200).json({ message: "GTINs updated successfully" });
//   } catch (error) {
//     next(error);
//   }
// };

exports.postItemCode = async (req, res, next) => {
  try {
    const { itemCode, quantity, description, startSize, endSize } = req.body;

    const barcode = await generateBarcode(1);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new CustomError(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    // // Convert date fields to ISO-8601 strings
    // if (body.ExpiryDate) {
    //   body.ExpiryDate = new Date(body.ExpiryDate).toISOString();
    // }
    // if (body.ProductionDate) {
    //   body.ProductionDate = new Date(body.ProductionDate).toISOString();
    // }

    // const _itemCode = await ItemCodeModel.create(req.body);

    const body = {
      GTIN: barcode,
      ItemCode: itemCode,
      ItemQty: Number(quantity),
      EnglishName: description,
      ArabicName: description,
      QRCodeInternational: barcode,
      ProductSize: startSize,
    };
    const _itemCode = await ItemCodeModel.create(body);

    res
      .status(201)
      .json(
        generateResponse(201, true, "Item code created successfully", _itemCode)
      );
  } catch (error) {
    next(error);
  }
};

exports.postItemCodeV2 = async (req, res, next) => {
  try {
    const { itemCode, quantity, description, startSize, endSize } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new CustomError(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    const numRecords = endSize - startSize + 1;
    let recordsCreated = [];

    for (let size = startSize; size <= endSize; size++) {
      const barcode = await generateBarcode(1);
      const body = {
        GTIN: barcode,
        ItemCode: itemCode,
        ItemQty: 1,
        EnglishName: description,
        ArabicName: description,
        QRCodeInternational: barcode,
        ProductSize: size.toString(),
      };

      const _itemCode = await ItemCodeModel.create(body);
      recordsCreated.push(_itemCode);
    }

    res
      .status(201)
      .json(
        generateResponse(
          201,
          true,
          "Item codes created successfully",
          recordsCreated
        )
      );
  } catch (error) {
    next(error);
  }
};

exports.putItemCode = async (req, res, next) => {
  try {
    const GTIN = req.params.GTIN;

    const existingItemCode = await ItemCodeModel.findById(GTIN);

    if (!existingItemCode) {
      const error = new CustomError("Item code not found");
      error.statusCode = 404;
      throw error;
    }

    const { itemCode, quantity, description, startSize, ArabicName, endSize } =
      req.body;

    // Prepare the updated data
    const updatedData = {
      ItemCode: itemCode || existingItemCode.ItemCode,
      ItemQty:
        quantity !== undefined ? Number(quantity) : existingItemCode.ItemQty,
      EnglishName: description || existingItemCode.EnglishName,
      ArabicName: ArabicName || existingItemCode.ArabicName,
      ProductSize: startSize || existingItemCode.ProductSize,
    };

    // Save the updated item code data
    const updatedItemCode = await ItemCodeModel.update(
      existingItemCode.id,
      updatedData
    );

    if (!updatedItemCode) {
      const error = new CustomError(`Couldn't update item code`);
      error.statusCode = 500;
      throw error;
    }

    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Item code updated successfully",
          updatedItemCode
        )
      );
  } catch (error) {
    next(error);
  }
};

exports.deleteItemCode = async (req, res, next) => {
  try {
    const GTIN = req.params.GTIN;
    const itemCode = await ItemCodeModel.findById(GTIN);
    if (!itemCode) {
      const error = new CustomError("Item code not found");
      error.statusCode = 404;
      throw error;
    }
    const deletedItemCode = await ItemCodeModel.deleteById(itemCode.id);
    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Item code deleted successfully",
          deletedItemCode
        )
      );
  } catch (error) {
    next(error);
  }
};

exports.searchByPartialGTIN = async (req, res, next) => {
  try {
    const GTIN = req.query.GTIN;
    const itemCodes = await ItemCodeModel.searchByGtin(GTIN);
    if (!itemCodes || itemCodes.length <= 0) {
      const error = new CustomError("No item codes found with the given GTIN");
      error.statusCode = 404;
      throw error;
    }
    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Item code retrieved successfully",
          itemCodes
        )
      );
  } catch (error) {
    next(error);
  }
};

exports.searchByGTIN = async (req, res, next) => {
  try {
    const GTIN = req.query.GTIN;
    const itemCode = await ItemCodeModel.findById(GTIN);
    if (!itemCode) {
      const error = new CustomError("No item code found with the given GTIN");
      error.statusCode = 404;
      throw error;
    }
    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Item code retrieved successfully",
          itemCode
        )
      );
  } catch (error) {
    next(error);
  }
};

exports.findByItemCode = async (req, res, next) => {
  try {
    const itemCode = req.query.itemCode;
    const item = await ItemCodeModel.findByItemCode(itemCode);
    if (!item) {
      const error = new CustomError("No item code found");
      error.statusCode = 404;
      throw error;
    }
    res
      .status(200)
      .json(
        generateResponse(200, true, "Item code retrieved successfully", item)
      );
  } catch (error) {
    next(error);
  }
};
