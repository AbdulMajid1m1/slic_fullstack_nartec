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
    res
      .status(200)
      .json(generateResponse(201, true, "New user created successfully", user));
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

exports.verifyEmail = async (req, res, next) => {
  const { userLoginID } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new Error(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    const token = await User.verifyEmail(userLoginID);
    if (!token) {
      const error = new CustomError("Email verification failed");
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(generateResponse(200, true, "Email verified successfully", token));
  } catch (error) {
    console.error("Error verifying email:", error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { userLoginID, newPassword } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new Error(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    if (req.email != userLoginID) {
      const error = new CustomError(
        "You are not authorized to reset password for this user"
      );
      error.statusCode = 401;
      throw error;
    }

    const updatedUser = await User.resetPassword(userLoginID, newPassword);
    if (!updatedUser) {
      const error = new CustomError("Reset Password failed");
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(generateResponse(200, true, "Password reset successfully"));
  } catch (error) {
    console.error("Error resetting password:", error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new Error(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    const updatedUser = await User.logoutUser(req.email);
    if (!updatedUser) {
      const error = new CustomError("Failed to logout");
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(
        generateResponse(200, true, "User logged out successfully", updatedUser)
      );
  } catch (error) {
    console.error("Error resetting password:", error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};
