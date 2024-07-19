const TrxCodesType = require("../models/TrxCodesType");
const CustomError = require("../exceptions/customError");

exports.getAll = async (req, res, next) => {
  try {
    const trxCodes = await TrxCodesType.fetchAll();
    if (!trxCodes || trxCodes.length === 0) {
      const error = new CustomError("No transaction codes found!");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Transaction codes retrieved successfully",
      data: trxCodes,
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
