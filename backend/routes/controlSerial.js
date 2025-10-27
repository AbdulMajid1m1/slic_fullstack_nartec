const express = require("express");
const router = express.Router();

const controlSerialController = require("../controllers/controlSerial");
const controlSerialValidator = require("../validators/controlSerial");
const isAuth = require("../middleware/is-auth");

/**
 * POST /api/controlSerials
 * Create bulk control serials
 * Body: { ItemCode: string, qty: number }
 */
router.post(
  "/",
  isAuth,
  controlSerialValidator.createControlSerials,
  controlSerialController.createControlSerials
);

/**
 * GET /api/controlSerials
 * Get all control serials with pagination
 * Query: ?page=1&limit=10&search=value
 */
router.get("/", isAuth, controlSerialController.getControlSerials);

/**
 * GET /api/controlSerials/all
 * Get all control serials without pagination
 */
router.get("/all", isAuth, controlSerialController.getAllControlSerials);

/**
 * GET /api/controlSerials/search/by-itemcode?ItemCode=value
 * Search control serials by ItemCode
 */
router.get(
  "/search/by-itemcode",
  isAuth,
  controlSerialController.searchByItemCode
);

/**
 * GET /api/controlSerials/search/by-serial?serialNumber=value
 * Search control serial by serial number
 */
router.get(
  "/search/by-serial",
  isAuth,
  controlSerialController.searchBySerialNumber
);

/**
 * GET /api/controlSerials/:id
 * Get control serial by ID
 */
router.get("/:id", isAuth, controlSerialController.getControlSerialById);

/**
 * PUT /api/controlSerials/:id
 * Update control serial
 * Body: { ItemCode: string }
 */
router.put(
  "/:id",
  isAuth,
  controlSerialValidator.updateControlSerial,
  controlSerialController.updateControlSerial
);

/**
 * DELETE /api/controlSerials/:id
 * Delete control serial
 */
router.delete("/:id", isAuth, controlSerialController.deleteControlSerial);

module.exports = router;
