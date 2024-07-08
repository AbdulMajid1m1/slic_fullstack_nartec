const express = require("express");

const testController = require("../controllers/sample");

const router = express.Router();

// Define a simple GET route for testing
router.get("/test", testController.getTest);

module.exports = router;
