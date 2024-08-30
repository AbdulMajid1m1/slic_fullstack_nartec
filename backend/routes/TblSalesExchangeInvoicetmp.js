const express = require("express");
const router = express.Router();

const controller = require("../controllers/TblSalesExchangeInvoicetmp");
const isAuth = require("../middleware/is-auth");

router.post("/v1/createExchangeInvoice", controller.createInvoiceDetails);

module.exports = router;
