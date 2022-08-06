const express = require("express");
const { registerValidation } = require("../../validators/registerValidation");
const router = express();
const authController = require("../controllers/auth.controller");

router.post("/register", registerValidation, authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/refresh", authController.refresh);
// router.post("/logout", userController.);
// //router.post("/activate/:link", userController.updateUser);
// router.get("/refresh", userController.);

module.exports = router;
