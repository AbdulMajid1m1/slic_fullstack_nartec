const { validationResult } = require("express-validator");

const POSInvoiceMaster = require("../models/tblPOSInvoiceMaster");
const POSInvoiceDetails = require("../models/tblPOSInvoiceDetails");
const POSInvoiceTemp = require("../models/TblSalesReturnInvoicetmp");
const response = require("../utils/response");
const CustomError = require("../exceptions/customError");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Joi = require("joi");

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

exports.invoiceHeadersAndLineItems = async (req, res, next) => {
  try {
    const { InvoiceNo } = req.query;

    if (!InvoiceNo) {
      const error = new CustomError("InvoiceNo is required");
      error.statusCode = 400;
      throw error;
    }

    const invoiceHeader = await POSInvoiceMaster.getSingleInvoiceMasterByField(
      "InvoiceNo",
      InvoiceNo
    );

    if (!invoiceHeader) {
      const error = new CustomError("Invoice headers not found");
      error.statusCode = 404;
      throw error;
    }

    const invoiceDetails = await POSInvoiceDetails.getInvoiceDetailsByField(
      "InvoiceNo",
      invoiceHeader.InvoiceNo
    );

    res.status(200).json(
      response(200, true, "Invoice headers & line items found successfully", {
        invoiceHeader,
        invoiceDetails,
      })
    );
  } catch (error) {
    next(error);
  }
};

exports.getInvoicesByMobileNo = async (req, res, next) => {
  try {
    const { MobileNo } = req.query;

    if (!MobileNo) {
      const error = new CustomError("MobileNo is required");
      error.statusCode = 400;
      throw error;
    }

    const invoices = await POSInvoiceMaster.getInvoiceMasterByField(
      "MobileNo",
      MobileNo
    );

    if (!invoices || invoices.length == 0) {
      const error = new CustomError("No invoice found with the given number");
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(response(200, true, "Invoices found successfully", invoices));
  } catch (error) {
    next(error);
  }
};

exports.saveInvoice = async (req, res, next) => {
  try {
    const { master, details } = req.body;

    // Validate that master is an object and details is an array
    if (!master || !details || !Array.isArray(details)) {
      const error = new CustomError(
        "Invalid data format. 'master' should be an object and 'details' should be an array."
      );
      error.statusCode = 400;
      throw error;
    }

    // Check if the master invoice with the given InvoiceNo already exists
    let existingMaster = await POSInvoiceMaster.getSingleInvoiceMasterByField(
      "InvoiceNo",
      master.InvoiceNo
    );

    let newMaster;
    if (existingMaster) {
      // Update the existing master invoice
      newMaster = await POSInvoiceMaster.updateInvoiceMaster(
        existingMaster.id,
        master
      );
    } else {
      // Create a new master invoice
      newMaster = await POSInvoiceMaster.createInvoiceMaster(master);
    }

    // Create or update each detail item associated with the master invoice
    const detailPromises = details.map(async (detail) => {
      const detailData = { ...detail, Head_SYS_ID: newMaster.Head_SYS_ID };

      if (detail.id) {
        return await POSInvoiceDetails.updateInvoiceDetails(
          detail.id,
          detailData
        );
      } else {
        return await POSInvoiceDetails.createInvoiceDetails(detailData);
      }
    });

    const newDetails = await Promise.all(detailPromises);

    res.status(201).json(
      response(201, true, "Invoice saved successfully", {
        invoiceMaster: newMaster,
        invoiceDetails: newDetails,
      })
    );
  } catch (error) {
    next(error);
  }
};

exports.getAllMaters = async (req, res, next) => {
  try {
    const allInvoices = await POSInvoiceMaster.getAllInvoiceDetails();

    if (!allInvoices || allInvoices.length === 0) {
      const error = new CustomError("No invoices found");
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(
        response(
          200,
          true,
          "All invoice details retrieved successfully",
          allInvoices
        )
      );
  } catch (error) {
    next(error);
  }
};

// exports.getAllMaters = async (req, res, next) => {
//   try {
//     // Get sorting parameters from query (if any)
//     const sortParams = req.query;

//     // Define the valid fields that can be used for sorting
//     const validFields = [
//       "Rec_Num",
//       "TblSysNoID",
//       "SNo",
//       "DeliveryLocationCode",
//       "ItemSysID",
//       "InvoiceNo",
//       "Head_SYS_ID",
//       "TransactionCode",
//       "CustomerCode",
//       "SalesLocationCode",
//       "Remarks",
//       "TransactionType",
//       "UserID",
//       "MobileNo",
//       "TransactionDate",
//       "VatNumber",
//       "CustomerName",
//     ];

//     // Create the sortFields object
//     const sortFields = {};

//     // Loop through the query parameters and add valid sorting fields to sortFields object
//     for (const field in sortParams) {
//       if (validFields.includes(field)) {
//         // Assume sort order as either 'asc' or 'desc' passed as query value, default to 'asc'
//         sortFields[field] = sortParams[field] === "desc" ? "desc" : "asc";
//       }
//     }

//     // Fetch all invoices with sorting
//     const allInvoices = await POSInvoiceMaster.getAllInvoiceDetails(sortFields);

//     if (!allInvoices || allInvoices.length === 0) {
//       const error = new CustomError("No invoices found");
//       error.statusCode = 404;
//       throw error;
//     }

//     res
//       .status(200)
//       .json(
//         response(
//           200,
//           true,
//           "All invoice details retrieved successfully",
//           allInvoices
//         )
//       );
//   } catch (error) {
//     next(error);
//   }
// };

exports.getInvoiceDetailsByInvoiceNo = async (req, res, next) => {
  const { InvoiceNo } = req.query;

  try {
    if (!InvoiceNo) {
      const error = new CustomError("InvoiceNo is required");
      error.statusCode = 400;
      throw error;
    }

    const invoiceMaster = await POSInvoiceDetails.getInvoiceDetailsByField(
      "InvoiceNo",
      InvoiceNo
    );

    if (!invoiceMaster) {
      const error = new CustomError(
        `Invoice with number ${InvoiceNo} not found.`
      );
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(
        response(
          200,
          true,
          "Invoice master retrieved successfully",
          invoiceMaster
        )
      );
  } catch (error) {
    next(error);
  }
};

exports.archiveInvoice = async (req, res, next) => {
  try {
    const { invoiceNo } = req.body;

    if (!invoiceNo) {
      return res.status(400).json({ error: "Invoice number is required" });
    }

    // Fetch the invoice master and details
    const invoiceMaster = await prisma.tblPOSInvoiceMaster.findFirst({
      where: { InvoiceNo: invoiceNo },
    });

    if (!invoiceMaster) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const invoiceDetails = await prisma.tblPOSInvoiceDetails.findMany({
      where: { InvoiceNo: invoiceNo },
    });

    // Insert into archive tables (excluding the 'id' field)
    const { id, ...invoiceMasterDataWithoutId } = invoiceMaster;
    await prisma.tblPOSInvoiceMasterArchive.create({
      data: invoiceMasterDataWithoutId,
    });

    await Promise.all(
      invoiceDetails.map(({ id, ...detailDataWithoutId }) =>
        prisma.tblPOSInvoiceDetailsArchive.create({
          data: detailDataWithoutId,
        })
      )
    );

    // Optionally, delete from the original tables
    await prisma.tblPOSInvoiceMaster.deleteMany({
      where: { InvoiceNo: invoiceNo },
    });

    await prisma.tblPOSInvoiceDetails.deleteMany({
      where: { InvoiceNo: invoiceNo },
    });

    res.status(200).json({ message: "Invoice archived successfully" });
  } catch (error) {
    next(error);
  }
};

const allowedMasterColumns = {
  Rec_Num: Joi.number(),
  TblSysNoID: Joi.number(),
  SNo: Joi.number(),
  DeliveryLocationCode: Joi.string(),
  ItemSysID: Joi.string(),
  InvoiceNo: Joi.string(),
  Head_SYS_ID: Joi.string(),
  TransactionCode: Joi.string(),
  CustomerCode: Joi.string(),
  SalesLocationCode: Joi.string(),
  Remarks: Joi.string(),
  TransactionType: Joi.string(),
  UserID: Joi.string(),
  MobileNo: Joi.string(),
  TransactionDate: Joi.date(),
  id: Joi.string(),
  VatNumber: Joi.string(),
  CustomerName: Joi.string(),
};

exports.getPOSInvoiceMasterArchive = async (req, res) => {
  try {
    const columnsSchema = Joi.object({
      columns: Joi.array().items(
        Joi.string().valid(...Object.keys(allowedMasterColumns))
      ),
      filter: Joi.object().pattern(Joi.string(), Joi.any()),
    }).unknown(true);

    const { error, value } = columnsSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        message: `Invalid query parameter: ${error.details[0].message}`,
      });
    }

    const selectedColumns =
      value.columns && value.columns.length > 0
        ? value.columns
        : Object.keys(allowedMasterColumns);

    const filterConditions = value.filter || {};

    const select = selectedColumns.reduce((obj, col) => {
      obj[col] = true;
      return obj;
    }, {});

    const invoices = await prisma.tblPOSInvoiceMasterArchive.findMany({
      where: filterConditions,
      select,
      orderBy: {
        TransactionDate: "desc",
      },
    });

    return res.json(invoices);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const allowedDetailsColumns = {
  Rec_Num: Joi.number(),
  TblSysNoID: Joi.number(),
  SNo: Joi.number(),
  DeliveryLocationCode: Joi.string(),
  ItemSysID: Joi.string(),
  InvoiceNo: Joi.string(),
  Head_SYS_ID: Joi.string(),
  TransactionCode: Joi.string(),
  CustomerCode: Joi.string(),
  SalesLocationCode: Joi.string(),
  Remarks: Joi.string(),
  TransactionType: Joi.string(),
  UserID: Joi.string(),
  ItemSKU: Joi.string(),
  ItemUnit: Joi.string(),
  ItemSize: Joi.string(),
  ITEMRATE: Joi.number(),
  ItemPrice: Joi.number(),
  ItemQry: Joi.number(),
  TransactionDate: Joi.date(),
  id: Joi.string(),
};

exports.getPOSInvoiceDetailsArchive = async (req, res) => {
  try {
    const columnsSchema = Joi.object({
      columns: Joi.array().items(
        Joi.string().valid(...Object.keys(allowedDetailsColumns))
      ),
      filter: Joi.object().pattern(Joi.string(), Joi.any()),
    }).unknown(true);

    const { error, value } = columnsSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        message: `Invalid query parameter: ${error.details[0].message}`,
      });
    }

    const selectedColumns =
      value.columns && value.columns.length > 0
        ? value.columns
        : Object.keys(allowedDetailsColumns);

    const filterConditions = value.filter || {};

    const select = selectedColumns.reduce((obj, col) => {
      obj[col] = true;
      return obj;
    }, {});

    const details = await prisma.tblPOSInvoiceDetailsArchive.findMany({
      where: filterConditions,
      select,
      orderBy: {
        TransactionDate: "desc",
      },
    });

    return res.json(details);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getInvoiceDetailsByInvoiceNos = async (req, res, next) => {
  const { InvoiceNo } = req.body; // Get data from body instead of query

  try {
    // Check if InvoiceNo is provided and is an array
    if (!InvoiceNo || !Array.isArray(InvoiceNo)) {
      const error = new CustomError("A list of InvoiceNo is required");
      error.statusCode = 400;
      throw error;
    }

    // Fetch invoice details for multiple InvoiceNo
    const invoiceDetails = await POSInvoiceDetails.getInvoiceDetailsByFieldTwo(
      "InvoiceNo",
      InvoiceNo
    );

    if (!invoiceDetails || invoiceDetails.length === 0) {
      const error = new CustomError(
        `No invoice details found for the provided invoice numbers.`
      );
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(
        response(
          200,
          true,
          "Invoice details retrieved successfully",
          invoiceDetails
        )
      );
  } catch (error) {
    next(error);
  }
};
