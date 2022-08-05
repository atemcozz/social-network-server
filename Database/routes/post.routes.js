const express = require("express");
const router = express();
const postController = require("../controllers/post.controller");

router.post("/post", postController.createPost);
router.get("/posts", postController.getPosts);
router.get("/post/:id", postController.getOnePost);
router.get("/posts/user", postController.getPostsByUser);
router.delete("/post/:id", postController.deletePost);

module.exports = router;
