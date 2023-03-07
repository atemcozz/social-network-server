const express = require("express");
const router = express();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/authMiddleware");

const { userInfoValidation } = require("../validators/userInfoValidation");
const userMiddleware = require("../middleware/userMiddleware");
//router.post("/user", userController.createUser);
router.get("/users", userController.getUsers);
router.post(
  "/user/:id/subscribe",
  authMiddleware,
  userController.subscribeUser
);
//router.get("/user", userController.getUserByNickname);
router.get("/user/:id", userMiddleware, userController.getOneUser);
router.get("/user/:id/subscriptions", userController.getUserSubscriptions);
router.put(
  "/user/:id",
  authMiddleware,
  userInfoValidation,
  userController.updateUser
);
router.delete("/user/:id", authMiddleware, userController.deleteUser);
router.post("/bookmark", authMiddleware, userController.addBookmark);
module.exports = router;
