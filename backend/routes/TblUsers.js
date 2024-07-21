const express = require("express");

const userController = require("../controllers/TblUsers");
const userValidators = require("../validators/TblUsers");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post("/v1/signup", userValidators.auth, userController.signup);

router.post("/v1/login", userValidators.auth, userController.login);

router.post("/v1/slicLogin", userController.slicLogin);

router.post(
  "/v1/verify-email",
  userValidators.verify,
  userController.verifyEmail
);

router.put(
  "/v1/reset",
  isAuth,
  userValidators.reset,
  userController.resetPassword
);

router.put("/v1/logout", isAuth, userController.logout);

router.get("/v1/all", userController.getUsers);

router.put("/v1/:id", userController.updateUser);

router.delete("/v1/:id", userController.deleteUser);

module.exports = router;
