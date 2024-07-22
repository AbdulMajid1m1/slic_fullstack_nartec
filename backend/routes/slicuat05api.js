const express = require("express");

const controller = require("../controllers/slicuat05api");

const router = express.Router();

router.post("/v1/slicLogin", controller.slicLogin);

module.exports = router;
