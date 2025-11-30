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

  body("supplierId")
    .notEmpty()
    .withMessage("Supplier ID is required.")
    .isString()
    .withMessage("Supplier ID must be a string."),

  body("poNumber")
    .notEmpty()
    .withMessage("PO Number is required.")
    .isString()
    .withMessage("PO Number must be a string."),

  body("size").optional().isString().withMessage("Size must be a string."),
];

exports.updateControlSerial = [
  body("ItemCode")
    .optional()
    .isString()
    .withMessage("ItemCode must be a string."),

  body("size").optional().isString().withMessage("Size must be a string."),

  body("poNumber")
    .optional()
    .isString()
    .withMessage("PO Number must be a string."),

  body("supplierId")
    .optional()
    .isString()
    .withMessage("Supplier ID must be a string."),

  body("binLocationId")
    .optional({ nullable: true })
    .isString()
    .withMessage("Bin Location ID must be a string."),
];
