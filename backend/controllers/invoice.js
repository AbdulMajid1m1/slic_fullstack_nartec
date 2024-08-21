const { validationResult } = require("express-validator");

const POSInvoiceMaster = require("../models/tblPOSInvoiceMaster");
const POSInvoiceDetails = require("../models/tblPOSInvoiceDetails");
const response = require("../utils/response");
const CustomError = require("../exceptions/customError");

exports.getInvoiceDetailsByTransactionCode = async (req, res, next) => {
  const { transactionCode } = req.params;

  try {
    // Validate the input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new CustomError(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    // Search for the transaction code in tblPOSInvoiceMaster
    const invoiceMaster = await POSInvoiceMaster.getInvoiceMasterByField(
      "TransactionCode",
      transactionCode
    );

    if (!invoiceMaster || invoiceMaster.length === 0) {
      const error = new CustomError(
        "TransactionCode not found in Invoice Master"
      );
      error.statusCode = 404;
      throw error;
    }

    // Get all records from tblPOSInvoiceDetails with the same TransactionCode
    const invoiceDetails = await POSInvoiceDetails.getInvoiceDetailsByField(
      "TransactionCode",
      transactionCode
    );

    if (!invoiceDetails || invoiceDetails.length === 0) {
      const error = new CustomError(
        "No invoice details found for the provided TransactionCode"
      );
      error.statusCode = 404;
      throw error;
    }

    // Return the details
    res
      .status(200)
      .json(
        response(
          200,
          true,
          "Invoice details found successfully",
          invoiceDetails
        )
      );
  } catch (error) {
    next(error);
  }
};
