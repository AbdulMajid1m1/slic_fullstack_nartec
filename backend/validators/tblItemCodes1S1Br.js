const { body } = require("express-validator");

exports.postItemCode = [
  body("GTIN")
    .notEmpty()
    .withMessage("GTIN is required.")
    .isString()
    .withMessage("GTIN must be a string.")
    .isLength({ max: 50 })
    .withMessage("GTIN must not exceed 50 characters."),

  body("ItemCode")
    .optional()
    .isString()
    .withMessage("ItemCode must be a string.")
    .isLength({ max: 20 })
    .withMessage("ItemCode must not exceed 20 characters."),

  body("EnglishName")
    .optional()
    .isString()
    .withMessage("EnglishName must be a string.")
    .isLength({ max: 255 })
    .withMessage("EnglishName must not exceed 255 characters."),

  body("ArabicName")
    .optional()
    .isString()
    .withMessage("ArabicName must be a string.")
    .isLength({ max: 255 })
    .withMessage("ArabicName must not exceed 255 characters."),

  body("LotNo")
    .notEmpty()
    .withMessage("LotNo is required.")
    .isString()
    .withMessage("LotNo must be a string.")
    .isLength({ max: 50 })
    .withMessage("LotNo must not exceed 50 characters."),

  //   body("ExpiryDate")
  //     .optional()
  //     .isISO8601()
  //     .withMessage("ExpiryDate must be a valid date."),

  body("sERIALnUMBER")
    .optional()
    .isString()
    .withMessage("sERIALnUMBER must be a string.")
    .isLength({ max: 150 })
    .withMessage("sERIALnUMBER must not exceed 150 characters."),

  body("ItemQty")
    .optional()
    .not()
    .isString()
    .withMessage("ItemQty must be an integer")
    .isNumeric()
    .withMessage("ItemQty must be an integer."),

  body("WHLocation")
    .optional()
    .isString()
    .withMessage("WHLocation must be a string.")
    .isLength({ max: 150 })
    .withMessage("WHLocation must not exceed 150 characters."),

  body("BinLocation")
    .optional()
    .isString()
    .withMessage("BinLocation must be a string.")
    .isLength({ max: 50 })
    .withMessage("BinLocation must not exceed 50 characters."),

  body("QRCodeInternational")
    .optional()
    .isString()
    .withMessage("QRCodeInternational must be a string.")
    .isLength({ max: 255 })
    .withMessage("QRCodeInternational must not exceed 255 characters."),

  body("ModelName")
    .optional()
    .isString()
    .withMessage("ModelName must be a string.")
    .isLength({ max: 100 })
    .withMessage("ModelName must not exceed 100 characters."),

  //   body("ProductionDate")
  //     .optional()
  //     .isISO8601()
  //     .withMessage("ProductionDate must be a valid date."),

  body("ProductType")
    .optional()
    .isString()
    .withMessage("ProductType must be a string.")
    .isLength({ max: 50 })
    .withMessage("ProductType must not exceed 50 characters."),

  body("BrandName")
    .optional()
    .isString()
    .withMessage("BrandName must be a string.")
    .isLength({ max: 100 })
    .withMessage("BrandName must not exceed 100 characters."),

  body("PackagingType")
    .optional()
    .isString()
    .withMessage("PackagingType must be a string.")
    .isLength({ max: 100 })
    .withMessage("PackagingType must not exceed 100 characters."),

  body("ProductUnit")
    .optional()
    .isString()
    .withMessage("ProductUnit must be a string.")
    .isLength({ max: 50 })
    .withMessage("ProductUnit must not exceed 50 characters."),

  body("ProductSize")
    .optional()
    .isString()
    .withMessage("ProductSize must be a string.")
    .isLength({ max: 50 })
    .withMessage("ProductSize must not exceed 50 characters."),
];
