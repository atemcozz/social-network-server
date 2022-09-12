const express = require("express");
const router = express();

const postController = require("../controllers/post.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const { upload } = require("../../middleware/multer");
router.post(
  "/post",
  authMiddleware,
  upload.array("files[]"),
  postController.createPost
);
router.post("/like_post", authMiddleware, postController.likePost);
router.post("/post/comment", authMiddleware, postController.createComment);
router.delete(
  "/post/comment/:id",
  authMiddleware,
  postController.deleteComment
);
router.get("/post/comments/:id", postController.getComments);
router.get("/posts", postController.getPosts);
router.get("/posts/new", postController.getPosts);
router.get("/posts/popular", postController.getPopularPosts);
router.get("/post/:id", postController.getPostByID);
router.get("/posts/:id", postController.getPostsByUser);
router.delete("/post/:id", postController.deletePost);
module.exports = router;
