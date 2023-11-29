const express=require("express");
const passwordController=require("../controllers/password_Controller");
const router=express.Router();
router.post("/update",passwordController.updatePassword);
router.post("/new",passwordController.newPassword);
router.post("/code",passwordController.sendCodeToEmail);
module.exports=router;