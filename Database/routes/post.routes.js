const express = require("express");
const router = express();

const postController = require("../controllers/post.controller");
const authMiddleware = require("../../middleware/authMiddleware");

router.post(
  "/post",
  authMiddleware,

  postController.createPost
);
router.post("/like_post", authMiddleware, postController.likePost);
router.post("/post/comment", authMiddleware, postController.createComment);
// router.post("/post/bookmark/:id", authMiddleware, postController.addBookmark);
router.delete(
  "/post/comment/:id",
  authMiddleware,
  postController.deleteComment
);
router.get("/post/comments/:id", postController.getComments);
router.get("/posts", postController.getPosts);
router.get("/posts/saved", authMiddleware, postController.getSavedPosts);
router.get("/posts/new", postController.getPosts);
router.get("/posts/popular", postController.getPopularPosts);
router.get("/post/:id", postController.getPostByID);
router.get("/posts/:id", postController.getPostsByUser);
router.delete("/post/:id", authMiddleware, postController.deletePost);
module.exports = router;
