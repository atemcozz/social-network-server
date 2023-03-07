const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { registerValidation } = require("../validators/registerValidation");
const router = express();
const authController = require("../controllers/auth.controller");

router.post("/register", registerValidation, authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.post("/recover", authController.recoverPassword);
module.exports = router;
