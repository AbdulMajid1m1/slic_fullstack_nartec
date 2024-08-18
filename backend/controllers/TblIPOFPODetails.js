const generateResponse = require("../utils/response");
const CustomError = require("../exceptions/customError");
const LineItem = require("../models/TblIPOFPODetails");

exports.getLineItemsByHeadSysId = async (req, res, next) => {
  const headSysId = parseFloat(req.params.headSysId);

  try {
    const records = await LineItem.getRecordsByHeadSysId(headSysId);

    if (!records || records.length === 0) {
      const error = new CustomError(
        "No records found for the provided HEAD_SYS_ID"
      );
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(
        generateResponse(200, true, "Records retrieved successfully", records)
      );
  } catch (error) {
    console.error("Error fetching records:", error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};

exports.fetchByMultipleIds = async (req, res, next) => {
  const { headSysIds } = req.body;
  try {
    if (!headSysIds || !Array.isArray(headSysIds) || headSysIds.length === 0) {
      const error = new CustomError(
        "Invalid input: headSysIds should be a non-empty array"
      );
      error.statusCode = 400;
      throw error;
    }

    const records = await LineItem.fetchByMultipleIds(headSysIds);
    if (!records || records.length === 0) {
      const error = new CustomError(
        "No line items found for the selected orders"
      );
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Records retrieved successfully",
      data: records,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = "Server error occurred";
    next(error);
  }
};

// Controller to create a new line item
exports.createLineItem = async (req, res, next) => {
  const data = req.body;

  try {
    const newRecord = await LineItem.createRecord(data);

    if (!newRecord) {
      const error = new CustomError("Failed to create the line item");
      error.statusCode = 500;
      throw error;
    }

    res
      .status(201)
      .json(
        generateResponse(201, true, "Line item created successfully", newRecord)
      );
  } catch (error) {
    console.error("Error creating line item:", error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = "Server error occurred";
    next(error);
  }
};

// Controller to get all line items
exports.getAllLineItems = async (req, res, next) => {
  try {
    const records = await LineItem.getAllRecords();

    if (!records || records.length === 0) {
      const error = new CustomError("No line items found");
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "All line items retrieved successfully",
          records
        )
      );
  } catch (error) {
    console.error("Error fetching all line items:", error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = "Server error occurred";
    next(error);
  }
};

// Controller to update a line item by HEAD_SYS_ID and ITEM_CODE
exports.updateLineItem = async (req, res, next) => {
  const { headSysId, itemCode } = req.params;
  const data = req.body;

  try {
    const updatedRecord = await LineItem.updateRecord(
      headSysId,
      itemCode,
      data
    );

    if (!updatedRecord) {
      const error = new CustomError("Failed to update the line item");
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Line item updated successfully",
          updatedRecord
        )
      );
  } catch (error) {
    console.error("Error updating line item:", error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = "Server error occurred";
    next(error);
  }
};

// Controller to delete a line item by HEAD_SYS_ID and ITEM_CODE
exports.deleteLineItem = async (req, res, next) => {
  const { headSysId, itemCode } = req.params;

  try {
    const deletedRecord = await LineItem.deleteRecord(headSysId, itemCode);

    if (!deletedRecord) {
      const error = new CustomError("Failed to delete the line item");
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Line item deleted successfully",
          deletedRecord
        )
      );
  } catch (error) {
    console.error("Error deleting line item:", error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = "Server error occurred";
    next(error);
  }
};
