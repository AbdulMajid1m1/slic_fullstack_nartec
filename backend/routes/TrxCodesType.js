const express = require("express");

const isAuth = require("../middleware/is-auth");
const codesTypeController = require("../controllers/TrxCodesType");

const router = express.Router();

router.get("/v1/all", codesTypeController.getAll);

module.exports = router;
