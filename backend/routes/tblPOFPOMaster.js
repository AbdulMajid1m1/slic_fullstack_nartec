const express = require("express");
const router = express.Router();

const controller = require("../controllers/tblPOFPOMaster");
const isAuth = require("../middleware/is-auth");

router.post("/v1/foreignPO", controller.createRecord);

// Read all records
router.get("/v1/foreignPO/all", controller.getAllRecords);

// Read paginated records
router.get("/v1/foreignPO", controller.getPaginatedRecords);

// Read a single record by ID
router.get("/v1/foreignPO/:id", controller.getRecordById);

// Update a record by ID
router.put("/v1/foreignPO/:id", controller.updateRecord);

// Delete a record by ID
router.delete("/v1/foreignPO/:id", controller.deleteRecord);

module.exports = router;
