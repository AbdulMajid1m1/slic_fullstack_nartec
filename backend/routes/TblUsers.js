const express = require("express");

const userController = require("../controllers/TblUsers");
const userValidators = require("../validators/TblUsers");

const router = express.Router();

router.post("/v1/signup", userValidators.auth, userController.signup);

router.post("/v1/login", userValidators.auth, userController.login);

router.put("/v1/reset", userValidators.reset, userController.resetPassword);

module.exports = router;
