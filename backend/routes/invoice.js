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

module.exports = router;
