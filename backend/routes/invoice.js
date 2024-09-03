const express = require("express");

const controller = require("../controllers/invoice");

const router = express.Router();

// Define your routes here, for example:
// router.get(
//   "/v1/invoice-details/:transactionCode",
//   controller.getInvoiceDetailsByTransactionCode
// );

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
router.post("/v1/createInvoice", controller.saveInvoice);

module.exports = router;
