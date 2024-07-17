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
      const error = new CustomError("No records found!");
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
