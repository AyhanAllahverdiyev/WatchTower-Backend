const express = require("express");
const authController = require("../controllers/auth_Controllers");
const router = express.Router();

router.get("/signup", authController.signup_get);
router.post("/signup", authController.signup_post);
router.get("/login", authController.login_get);
router.post("/login", authController.login_post);
router.get("/logout", authController.logout_get);
router.post("/refresh-token", authController.jwt_get);
router.post("/jwt-verify", authController.jwt_verify);
module.exports = router;
