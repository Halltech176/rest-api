const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);
router.patch(
  "/update-password",
  authController.protect,
  authController.updatePassword
);

module.exports = router;
