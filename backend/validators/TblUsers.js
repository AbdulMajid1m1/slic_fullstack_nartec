const { body } = require("express-validator");

exports.auth = [
  body("userLoginID")
    .isEmail()
    .withMessage("UserLoginID must be a valid email address")
    .normalizeEmail(),
  body("userPassword")
    .isString()
    .withMessage("UserPassword must be a string")
    .isLength({ min: 8 })
    .withMessage("UserPassword must be at least 8 characters long"),
];

exports.reset = [
  body("userLoginID")
    .isEmail()
    .withMessage("UserLoginID must be a valid email address")
    .normalizeEmail(),
  body("newPassword")
    .isString()
    .withMessage("UserPassword must be a string")
    .isLength({ min: 8 })
    .withMessage("UserPassword must be at least 8 characters long"),
];

exports.verify = [
  body("userLoginID")
    .isEmail()
    .withMessage("UserLoginID must be a valid email address")
    .normalizeEmail(),
];
