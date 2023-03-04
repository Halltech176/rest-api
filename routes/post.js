const express = require("express");
const router = express.Router();
const PostController = require("../controller/post");
const authController = require("../controller/auth");

router.route("/posts").get(authController.protect, PostController.getPosts);
router.route("/post").post(authController.protect, PostController.createPost);
router.get(
  "/top-posts",
  authController.protect,
  authController.restrict("admin", "super-admin"),
  PostController.getTopPosts,
  PostController.getPosts
);
router.get(
  "/posts-stats",
  authController.protect,
  authController.restrict("admin", "super-admin"),
  PostController.getPostsStats
);
router.get(
  "/daily-posts/:year",
  authController.protect,
  authController.restrict("admin", "super-admin"),
  PostController.getDailyPosts
);

router
  .route("/post/:id")
  .get(PostController.getPost)
  .patch(
    authController.protect,
    PostController.uploadPostImages,
    PostController.resizePostImage,
    PostController.updatePost
  )
  .delete(
    authController.protect,
    authController.restrict("admin", "super-admin"),
    PostController.deletePost
  );

module.exports = router;
