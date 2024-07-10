const { validationResult } = require("express-validator");

const User = require("../models/TblUsers");
const generateResponse = require("../utils/response");
const CustomError = require("../exceptions/customError");

exports.signup = async (req, res, next) => {
  const { userLoginID, userPassword } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new Error(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    // Check if this email already exists or not
    const existingUser = await User.getUserByLoginId(userLoginID);
    if (existingUser) {
      const error = new CustomError("User already exists");
      error.statusCode = 409;
      throw error;
    }

    const user = await User.createUser(userLoginID, userPassword);
    if (!user) {
      const error = new CustomError("User not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json(generateResponse(201, true, "Login successful", user));
  } catch (error) {
    console.log(error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { userLoginID, userPassword } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new Error(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    const user = await User.loginUser(userLoginID, userPassword);

    res.status(200).json(generateResponse(200, true, "Login successful", user));
  } catch (error) {
    console.log(error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};
