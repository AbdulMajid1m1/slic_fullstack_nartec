const express = require("express");

const router = express.Router();

const customerController = require("../controllers/TblCustomerNames");

router.get("/v1/all", customerController.getCustomerNames);

module.exports = router;
