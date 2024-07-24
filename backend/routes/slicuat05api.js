const express = require("express");

const controller = require("../controllers/slicuat05api");

const router = express.Router();

router.post("/v1/slicLogin", controller.slicLogin);

router.post("/v1/getApi", controller.slicGetApi);

router.post("/v1/postData", controller.slicPostData);

module.exports = router;
