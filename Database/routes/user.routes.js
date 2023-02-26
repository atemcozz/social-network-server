const express = require("express");
const router = express();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../../middleware/authMiddleware");

const { userInfoValidation } = require("../../validators/userInfoValidation");
//router.post("/user", userController.createUser);
router.get("/users", userController.getUsers);
//router.get("/user", userController.getUserByNickname);
router.get("/user/:id", userController.getOneUser);
router.put(
  "/user/:id",
  authMiddleware,
  userInfoValidation,
  userController.updateUser
);
router.delete("/user/:id", authMiddleware, userController.deleteUser);
router.post("/bookmark", authMiddleware, userController.addBookmark);
module.exports = router;
