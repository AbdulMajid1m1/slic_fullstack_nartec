const generateResponse = require("../utils/response");
const CustomError = require("../exceptions/customError");
const model = require("../models/TblIPOFPODetails");

exports.getLineItemsByHeadSysId = async (req, res, next) => {
  const headSysId = parseFloat(req.params.headSysId);

  try {
    const records = await model.getRecordsByHeadSysId(headSysId);

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
