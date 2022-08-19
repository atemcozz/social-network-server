const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const { registerValidation } = require("../../validators/registerValidation");
const router = express();
const authController = require("../controllers/auth.controller");

router.post("/register", registerValidation, authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/refresh", authController.refresh);
router.get("/auth", authMiddleware, (req, res) => res.json({ msg: "success" }));
module.exports = router;
