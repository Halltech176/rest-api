const express = require("express");
const adminController = require("../controller/admin");
const authController = require("../controller/auth");
const router = express.Router();

router.use(authController.protect);
router.use(authController.restrict("super-admin"));

router.route("/").get(adminController.getAllUsers);

router.route("/:id").delete(adminController.deleteUser);

module.exports = router;
