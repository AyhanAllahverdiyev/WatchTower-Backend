const User = require("../models/User");
var fs = require('fs')
const Image=require("../models/image");
const dotenv = require('dotenv');
const bodyParser = require('body-parser'); // Import body-parser
dotenv.config();


const uploadPicture = async (req, res) => {
    try {
      const imageData = req.body.image;
      const contentType = req.body.contentType;
  
      // Decode base64 image data
      const decodedImage = Buffer.from(imageData, 'base64');
      
      // Create a new instance of the Image model
      const newImage = new Image({
        data: decodedImage,
        contentType: contentType
      });
  
      // Save the image to MongoDB
      await newImage.save();
  
      console.log('Image uploaded successfully');
       
      res.status(201).send('Image uploaded successfully');
  
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }

const get_Image= async (req,res)=>{
  
    try {
        const index=req.body.index;
        const images = await Image.find().skip(index).limit(1);
    
        // Check if no images are found
        if (images.length === 0) {
          return res.status(404).json({ error: 'No images found' });
        }
    
        // Convert each image data from base64 to binary
        const imageDataArray = images.map(image => Buffer.from(image.data, 'base64'));
    
        // Set the Content-Type header to image/jpeg assuming all images are JPEG format
        res.set('Content-Type', 'image/jpeg');
    
        // Send the image data array in the response
        res.send(imageDataArray);
      } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    
}
const get_Image_number= async (req,res)=>{
    
    try {
       var imageCount = await Image.countDocuments();
        res.status(200).json(imageCount);
      } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
}
 

  
  module.exports = {
    uploadPicture,
    get_Image,
    get_Image_number
  }