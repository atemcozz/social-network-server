const express = require("express");
const router = express();
const userController = require("../controllers/user.controller");

//router.post("/user", userController.createUser);
router.get("/users", userController.getUsers);
//router.get("/user", userController.getUserByNickname);
router.get("/user/:id", userController.getOneUser);
router.put("/user/:id", userController.updateUser);
router.delete("/user/:id", userController.deleteUser);

module.exports = router;
