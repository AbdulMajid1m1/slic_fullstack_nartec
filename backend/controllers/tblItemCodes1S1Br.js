const { validationResult } = require("express-validator");

const ItemCodeModel = require("../models/tblItemCodes1S1Br");
const generateResponse = require("../utils/response");

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
      const error = new Error("No item codes found");
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
    error.message = null;
    next(error);
  }
};

exports.getAllItemCodes = async (req, res, next) => {
  try {
    const result = await ItemCodeModel.findAll();

    if (!result || result.length <= 0) {
      const error = new Error("No item codes found");
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
    error.message = null;
    next(error);
  }
};

exports.postItemCode = async (req, res, next) => {
  try {
    const body = req.body;

    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new Error(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    // Convert date fields to ISO-8601 strings
    if (body.ExpiryDate) {
      body.ExpiryDate = new Date(body.ExpiryDate).toISOString();
    }
    if (body.ProductionDate) {
      body.ProductionDate = new Date(body.ProductionDate).toISOString();
    }

    const itemCode = await ItemCodeModel.create(body);

    res
      .status(201)
      .json(
        generateResponse(201, true, "Item code created successfully", itemCode)
      );
  } catch (error) {
    // console.log(error);
    error.message = null;
    next(error);
  }
};

exports.putItemCode = async (req, res, next) => {
  try {
    const GTIN = req.params.GTIN;
    const body = req.body;

    const existingItemCode = await ItemCodeModel.findById(GTIN);

    if (!existingItemCode) {
      return res
        .status(404)
        .json(generateResponse(404, false, "Item code not found"));
    }

    if (body.ExpiryDate) {
      body.ExpiryDate = new Date(body.ExpiryDate).toISOString();
    }
    if (body.ProductionDate) {
      body.ProductionDate = new Date(body.ProductionDate).toISOString();
    }

    const updatedData = {
      ...existingItemCode,
      ...body,
    };

    const updatedItemCode = await ItemCodeModel.update(GTIN, updatedData);

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
    console.log(error);
    error.message = null;
    next(error);
  }
};

exports.deleteItemCode = async (req, res, next) => {
  try {
    const GTIN = req.params.GTIN;
    const itemCode = await ItemCodeModel.findById(GTIN);
    if (!itemCode) {
      const error = new Error("Item code not found");
      error.statusCode = 404;
      return next(error);
    }
    const deletedItemCode = await ItemCodeModel.delete(GTIN);
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
    console.log(error);
    error.message = null;
    next(error);
  }
};
