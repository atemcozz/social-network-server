const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const { registerValidation } = require("../../validators/registerValidation");
const router = express();
const authController = require("../controllers/auth.controller");

router.post("/register", registerValidation, authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/refresh", authController.refresh);
module.exports = router;
