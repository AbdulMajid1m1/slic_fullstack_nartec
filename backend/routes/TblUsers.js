const express = require("express");

const userController = require("../controllers/TblUsers");
const userValidators = require("../validators/TblUsers");

const router = express.Router();

router.post("/v1/signup", userValidators.signup, userController.signup);

router.post("/v1/login", userValidators.signup, userController.login);

module.exports = router;
