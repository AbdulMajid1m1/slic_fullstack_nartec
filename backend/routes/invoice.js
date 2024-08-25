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

module.exports = router;
