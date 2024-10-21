const express = require("express");
const {
  sendWhatsAppMessage,
  checkSession,
  getUserProfile,
  logoutWhatsApp,
} = require("../controllers/whatsappController.js");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append file extension.
  },
});

const upload = multer({ storage: storage });

router.get("/checkSession", checkSession);
router.get("/getUserProfile", getUserProfile);
router.post("/logoutWhatsApp", logoutWhatsApp);
// Route to send WhatsApp message with attachment using multer for file upload
router.post(
  "/sendWhatsAppMessage",
  upload.single("attachment"),
  sendWhatsAppMessage
);

module.exports = router;
