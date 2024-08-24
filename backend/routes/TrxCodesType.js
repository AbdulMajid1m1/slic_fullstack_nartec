const express = require("express");

const isAuth = require("../middleware/is-auth");
const controller = require("../controllers/TrxCodesType");

const router = express.Router();

router.get("/v1/all", controller.getAll);

router.post("/v1/sync", controller.sync);

router.get("/v1/byLocationCode", controller.filterByLocation);

module.exports = router;
