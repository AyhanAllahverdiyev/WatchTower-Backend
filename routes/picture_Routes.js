const express=require("express");
const pictureController=require("../controllers/picture_Controller");
 const router=express.Router();
router.post('/upload',pictureController.uploadPicture);
router.post('/allPictures',pictureController.get_Image);
router.get('/numberofPictures',pictureController.get_Image_number);
module.exports=router;