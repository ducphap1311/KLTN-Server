// routes/User.js

const express = require("express");
const router = express.Router();
const {
    register,
    login,
    dashboard,
    getUsers,
    sendEmail,
    forgotPassword,
    resetPassword,
    verifyEmail, // Thêm controller xác thực email
} = require("../controllers/User");
const authenticateUser = require("../middlewares/auth");

// Các route hiện tại
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/allusers").get(getUsers);
router.route("/dashboard").get(authenticateUser, dashboard);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").put(authenticateUser, resetPassword);
router.route("/send-email").post(sendEmail);

// Thêm route xác thực email
router.route("/verify-email").get(verifyEmail);

module.exports = router;
