const { body } = require("express-validator");

exports.createControlSerials = [
  body("ItemCode")
    .notEmpty()
    .withMessage("ItemCode is required.")
    .isString()
    .withMessage("ItemCode must be a string."),

  body("qty")
    .notEmpty()
    .withMessage("Quantity is required.")
    .isInt({ min: 1, max: 10000 })
    .withMessage("Quantity must be an integer between 1 and 10000."),
];

exports.updateControlSerial = [
  body("ItemCode")
    .optional()
    .isString()
    .withMessage("ItemCode must be a string."),
];
