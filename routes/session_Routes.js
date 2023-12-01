const express=require("express");
const router=express.Router();
const sessionController=require("../controllers/session_Controller");
const User = require("../models/User");
router.post("/check",sessionController.session_Check);
router.post("/create",sessionController.session_Create);
router.post("/end",sessionController.session_end);
 module.exports=router;
 