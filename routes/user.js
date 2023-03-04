const express = require("express");
const router = express.Router();

const UserController = require("../controller/user");
const AuthController = require("../controller/auth");

router.patch(
  "/updateMe",
  AuthController.protect,
  UserController.uploadPhoto,
  UserController.updateMe
);
router.delete("/deleteMe", AuthController.protect, UserController.deleteMe);

module.exports = router;
