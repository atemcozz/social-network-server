const express = require("express");
const router = express();
const postController = require("../controllers/post.controller");
const authMiddleware = require("../../middleware/authMiddleware");
router.post("/post", postController.createPost);
router.post("/like_post", authMiddleware, postController.likePost);
router.get("/post_liked", postController.getLikeStatus);
router.get("/posts", postController.getPosts);
router.get("/post/:id", postController.getOnePost);
router.get("/posts/user", postController.getPostsByUser);
router.delete("/post/:id", postController.deletePost);

module.exports = router;
