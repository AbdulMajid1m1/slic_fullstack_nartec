const express = require("express");

const controller = require("../controllers/invoice");

const router = express.Router();

// Existing routes
router.get(
  "/v1/invoice-details",
  controller.getInvoiceDetailsByTransactionCode
);

router.put("/v1/update-invoice-temp", controller.updateInvoiceTemp);

// * Pass mobile no as query parameter and user will get all the invoices
router.get("/v1/invoices", controller.getInvoicesByMobileNo);

// * Pass Invoice no as query and user will get headers (master) & Line items (Details)
router.get("/v1/headers-and-line-items", controller.invoiceHeadersAndLineItems);

// * Save Invoice header and list of invoice details
router.post("/v1/saveInvoice", controller.saveInvoice);

// * Get all invoice details
router.get("/v1/masters", controller.getAllMaters);

// * Get invoice details by invoice number
router.get("/v1/detailsByInvoiceNo", controller.getInvoiceDetailsByInvoiceNo);

router.post("/v1/archiveInvoice", controller.archiveInvoice);


// Define routes
router.get('/v1/invoiceMasterArchive', controller.getPOSInvoiceMasterArchive);
router.get('/v1/invoiceDetailsArchive', controller.getPOSInvoiceDetailsArchive);

module.exports = router;
