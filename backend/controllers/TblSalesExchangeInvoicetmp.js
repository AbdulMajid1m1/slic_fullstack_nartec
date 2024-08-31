const { validationResult } = require("express-validator");
const TblSalesExchangeInvoicetmp = require("../models/TblSalesExchangeInvoicetmp");
const response = require("../utils/response");
const CustomError = require("../exceptions/customError");

exports.getInvoiceDetailsById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const details = await TblSalesExchangeInvoicetmp.getInvoiceDetailsById(
      Number(id)
    );

    if (!details) {
      const error = new CustomError("Invoice details not found");
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(response(200, true, "Invoice details found successfully", details));
  } catch (error) {
    next(error);
  }
};

exports.createInvoiceDetails = async (req, res, next) => {
  const data = req.body;

  try {
    const newDetails = await TblSalesExchangeInvoicetmp.createInvoiceDetails({
      Description: data.EnglishName,
      GTIN: data.GTIN,
      ItemCode: data.ModelName,
      ItemSize: data.ProductSize,
    });
    res
      .status(201)
      .json(
        response(
          201,
          true,
          "Sales Exchange Invoice details created successfully",
          newDetails
        )
      );
  } catch (error) {
    next(error);
  }
};

exports.updateInvoiceDetails = async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const updatedDetails =
      await TblSalesExchangeInvoicetmp.updateInvoiceDetails(Number(id), data);
    res
      .status(200)
      .json(
        response(
          200,
          true,
          "Invoice details updated successfully",
          updatedDetails
        )
      );
  } catch (error) {
    next(error);
  }
};

exports.deleteInvoiceDetails = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedDetails =
      await TblSalesExchangeInvoicetmp.deleteInvoiceDetails(Number(id));
    res
      .status(200)
      .json(
        response(
          200,
          true,
          "Invoice details deleted successfully",
          deletedDetails
        )
      );
  } catch (error) {
    next(error);
  }
};

exports.getAllInvoiceDetails = async (req, res, next) => {
  try {
    const details = await TblSalesExchangeInvoicetmp.getAllInvoiceDetails();
    res
      .status(200)
      .json(
        response(
          200,
          true,
          "All invoice details retrieved successfully",
          details
        )
      );
  } catch (error) {
    next(error);
  }
};

exports.getInvoiceDetailsByField = async (req, res, next) => {
  const { field, value } = req.query;

  try {
    const details = await TblSalesExchangeInvoicetmp.getInvoiceDetailsByField(
      field,
      value
    );

    if (!details || details.length === 0) {
      const error = new CustomError(`No invoice details found for ${field}`);
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(response(200, true, `Invoice details found for ${field}`, details));
  } catch (error) {
    next(error);
  }
};

exports.getDetailsByInvoiceNoAndTransactionCode = async (req, res, next) => {
  const { InvoiceNo, TransactionCode } = req.query;

  try {
    const details =
      await TblSalesExchangeInvoicetmp.getDetailsByInvoiceNoAndTransactionCode(
        InvoiceNo,
        TransactionCode
      );

    if (!details || details.length === 0) {
      const error = new CustomError(
        "No invoice details found for the provided InvoiceNo and TransactionCode"
      );
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(response(200, true, "Invoice details found successfully", details));
  } catch (error) {
    next(error);
  }
};
