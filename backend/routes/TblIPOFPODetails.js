const express = require("express");
const router = express.Router();

const controller = require("../controllers/TblIPOFPODetails");
const isAuth = require("../middleware/is-auth");

router.get("/v1/:headSysId", controller.getLineItemsByHeadSysId);

module.exports = router;
