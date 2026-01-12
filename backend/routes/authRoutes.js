const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/register", register);
router.post("/login", authLimiter, login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.put("/change-password", protect, changePassword);

module.exports = router;
