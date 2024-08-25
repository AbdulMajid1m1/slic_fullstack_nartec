const { validationResult } = require("express-validator");

const POSInvoiceMaster = require("../models/tblPOSInvoiceMaster");
const POSInvoiceDetails = require("../models/tblPOSInvoiceDetails");
const POSInvoiceTemp = require("../models/TblSalesReturnInvoicetmp");
const response = require("../utils/response");
const CustomError = require("../exceptions/customError");

// exports.getInvoiceDetailsByTransactionCode = async (req, res, next) => {
//   const { transactionCode } = req.params;

//   try {
//     // Validate the input
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       const msg = errors.errors[0].msg;
//       const error = new CustomError(msg);
//       error.statusCode = 422;
//       error.data = errors;
//       return next(error);
//     }

//     // Search for the transaction code in tblPOSInvoiceMaster
//     const invoiceMaster = await POSInvoiceMaster.getInvoiceMasterByField(
//       "TransactionCode",
//       transactionCode
//     );

//     if (!invoiceMaster || invoiceMaster.length === 0) {
//       const error = new CustomError(
//         "TransactionCode not found in Invoice Master"
//       );
//       error.statusCode = 404;
//       throw error;
//     }

//     // Get all records from tblPOSInvoiceDetails with the same TransactionCode
//     const invoiceDetails = await POSInvoiceDetails.getInvoiceDetailsByField(
//       "TransactionCode",
//       transactionCode
//     );

//     if (!invoiceDetails || invoiceDetails.length === 0) {
//       const error = new CustomError(
//         "No invoice details found for the provided TransactionCode"
//       );
//       error.statusCode = 404;
//       throw error;
//     }

//     // Return the details
//     res
//       .status(200)
//       .json(
//         response(
//           200,
//           true,
//           "Invoice details found successfully",
//           invoiceDetails
//         )
//       );
//   } catch (error) {
//     next(error);
//   }
// };

exports.getInvoiceDetailsByTransactionCode = async (req, res, next) => {
  const { transactionCode, invoiceNo } = req.query;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new CustomError(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    const data =
      await POSInvoiceDetails.getDetailsByInvoiceNoAndTransactionCode(
        invoiceNo,
        transactionCode
      );

    if (!data || data.length === 0) {
      const error = new CustomError("Items not found in Invoice Details");
      error.statusCode = 404;
      throw error;
    }

    for (const item of data) {
      console.log(item);
      const existing = await POSInvoiceTemp.getByItemSysIdAndItemCode(
        item.ItemSysID?.toString(),
        item.ItemSKU?.toString()
      );

      if (existing) {
        // update
        await POSInvoiceTemp.updateSalesReturnInvoice(
          item.ItemSysID?.toString(),
          item.ItemSKU?.toString(),
          {
            SNo: item.SNo != null ? Number(item.SNo) : null,
            ItemCode: item.ItemSKU?.toString(),
            Description: item.ItemSKU?.toString(),
            ReturnQty: item.ItemQry != null ? Number(item.ItemQry) : null,
            InvoiceQty: item.ItemQry != null ? Number(item.ItemQry) : null,
            UnitCode: item.ItemUnit?.toString(),
            HeadSysId: item.Head_SYS_ID?.toString(),
            ItemSysID: item.ItemSysID?.toString(),
            DeliveryLocationCode: item.DeliveryLocationCode?.toString(),
            ItemSize: item.ItemSize?.toString(),
          }
        );
        console.log("Item already exists, lets update it");
      } else {
        await POSInvoiceTemp.createSalesReturnInvoice({
          // Ensure no id field is being passed here
          SNo: item.SNo != null ? Number(item.SNo) : null,
          ItemCode: item.ItemSKU?.toString(),
          Description: item.ItemSKU?.toString(),
          ReturnQty: item.ItemQry != null ? Number(item.ItemQry) : null,
          InvoiceQty: item.ItemQry != null ? Number(item.ItemQry) : null,
          UnitCode: item.ItemUnit?.toString(),
          HeadSysId: item.Head_SYS_ID?.toString(),
          ItemSysID: item.ItemSysID?.toString(),
          DeliveryLocationCode: item.DeliveryLocationCode?.toString(),
          ItemSize: item.ItemSize?.toString(),
        });
      }
    }

    res
      .status(200)
      .json(response(200, true, "Invoice details found successfully", data));
  } catch (error) {
    next(error);
  }
};

exports.updateInvoiceTemp = async (req, res, next) => {
  try {
    const { ItemSysID, ItemCode, ReturnQty } = req.body;

    const tempItem = await POSInvoiceTemp.getByItemSysIdAndItemCode(
      ItemSysID,
      ItemCode
    );

    if (!tempItem) {
      const error = new CustomError("Item not found in Invoice Temp");
      error.statusCode = 404;
      throw error;
    }

    const updatedItem = await POSInvoiceTemp.updateSalesReturnInvoice(
      ItemSysID,
      ItemCode,
      {
        ReturnQty: Number(ReturnQty),
      }
    );

    res
      .status(200)
      .json(response(200, true, "Invoice Temp updated", updatedItem));
  } catch (error) {
    next(error);
  }
};
