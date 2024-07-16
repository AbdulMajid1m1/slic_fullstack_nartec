const express = require("express");
const router = express.Router();

const controller = require("../controllers/locationCompany");
const isAuth = require("../middleware/is-auth");

router.get("/v1/all", controller.getAllLocationsCompanies);

router.get("/v1/locations", controller.getAllLocations);

module.exports = router;
