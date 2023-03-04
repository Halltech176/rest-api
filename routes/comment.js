const express = require("express");
const router = express.Router();
const commentController = require("../controller/comment");
const authController = require("../controller/auth");

router
  .route("/post/:id/comment")
  .post(authController.protect, commentController.createComment)
  .delete(authController.protect, commentController.deleteComment);

router.get(
  "/post/:id/comments",
  authController.protect,
  commentController.getComments
);

router.delete("/");

module.exports = router;
