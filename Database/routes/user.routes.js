const express = require("express");
const router = express();
const userController = require("../controllers/user.controller");
const { upload } = require("../../middleware/multer");
const authMiddleware = require("../../middleware/authMiddleware");
//router.post("/user", userController.createUser);
router.get("/users", userController.getUsers);
//router.get("/user", userController.getUserByNickname);
router.get("/user/:id", userController.getOneUser);
router.put(
  "/user/:id",
  authMiddleware,
  upload.single("avatar"),
  userController.updateUser
);
router.delete("/user/:id", authMiddleware, userController.deleteUser);

module.exports = router;
