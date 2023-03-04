const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");
const checkoutController = require("../controller/checkout");

router.get(
  "/checkout/:id",
  authController.protect,
  checkoutController.checkoutSession
);
module.exports = router;
