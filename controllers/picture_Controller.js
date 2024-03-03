const User = require("../models/User");
var fs = require('fs')
const Image=require("../models/image");
const dotenv = require('dotenv');
const bodyParser = require('body-parser'); // Import body-parser
dotenv.config();
const multer = require('multer');
const ImageUrl=require("../models/imageUrl");
const { ObjectId } = require("mongodb");
const { mongo } = require("mongoose");
 
const uploadPicture = async (req, res) => {
  try {
    const imageData = req.body.image;
    const contentType = req.body.contentType;

    // Decode base64 image data
    const decodedImage = Buffer.from(imageData, 'base64');
 
 
    // Create a new instance of the Image model
    const newImage = new Image({
      data: decodedImage,
      contentType: contentType,
     });

    // Save the image to MongoDB
    await newImage.save();
     const imageUrl = `${req.protocol}://${req.get('host')}/picture/image/${newImage._id}`;
     ImageUrl.create({imageUrl:imageUrl}).then((data)=>{
      console.log(data);
     });
     
    
    res.status(201).send('Image uploaded successfully');

  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

const getImageUrl = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Send the image data back
    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




 const getImageViaUrl = async (req, res) => {
  try {
    const id = req.params.id;
    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Set content type based on image type
    res.set('Content-Type', image.contentType);

    // Send binary data as response
    res.send(image.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};






const getAllImageUrls = async (req, res) => {
  try {
    const images = await Image.find();
    
    // Extract URLs from images
    const imageUrls = images.map(image => `${req.protocol}://${req.get('host')}/picture/image/${image._id}`);
      console.log(imageUrls);
    res.status(200).json(imageUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const deleteImage = async (req, res) => {
  try {
    const id = req.params.id;
    const image = await Image.findByIdAndDelete(id);
    console.log(id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



module.exports = {
  uploadPicture,
  getImageUrl,
  getAllImageUrls,
  getImageViaUrl,
  deleteImage
};

// Path: models/imageUrl.js