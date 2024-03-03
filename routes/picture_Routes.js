const express=require("express");
const pictureController=require("../controllers/picture_Controller");
 const router=express.Router();
router.post('/upload',pictureController.uploadPicture);
router.post('/deleteImage/:id', pictureController.deleteImage);
router.get('/image/:id',pictureController.getImageUrl);
router.get('/allPictureUrls',pictureController.getAllImageUrls); 
router.get('/imageViaUrl/:id',pictureController.getImageViaUrl);
module.exports=router;