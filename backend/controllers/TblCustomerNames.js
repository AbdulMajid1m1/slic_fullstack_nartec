const CustomerName = require("../models/TblCustomerNames");
const CustomError = require("../exceptions/customError");
const generateResponse = require("../utils/response");

exports.getCustomerNames = async (req, res, next) => {
  try {
    const customers = await CustomerName.fetchAll();
    if (customers.length <= 0) {
      const error = new CustomError("Couldn't find any customers");
      error.statusCode = 404;
      throw error;
    }
    res
      .status(200)
      .json(
        generateResponse(200, true, "Records retrieved successfully", customers)
      );
  } catch (error) {
    console.error(error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};
