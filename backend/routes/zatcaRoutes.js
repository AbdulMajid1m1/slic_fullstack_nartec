const express = require("express");
const { generateZatcaQrCode } = require("../controllers/zatcaController.js");

const router = express.Router();

// Route to generate ZATCA QR Code
router.post("/generateZatcaQrCode", generateZatcaQrCode);

module.exports = router;
