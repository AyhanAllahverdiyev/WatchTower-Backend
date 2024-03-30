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
const uuid=require('uuid');
const { uniq } = require("lodash");
const WebSocket=require('ws')

const wss = new WebSocket.Server({ port: 3003 }); 

wss.on('connection', (ws) => {
  console.log('Client connected for Image Alerts');

    ws.send(" Connection Active ");
   ws.on('close', () => {
    console.log('Client disconnected');
   
  });

  
});
  



const uploadPicture = async (req, res) => {
  try {
    const imageData = req.body.image;
    const contentType = req.body.contentType;
    const alertType = req.body.alertType;
    const alertBody = req.body.alertBody;
    const userEmail = req.body.userEmail;
    
    // Decode base64 image data
    const decodedImage = Buffer.from(imageData, 'base64');
 
    // Create a new instance of the Image model
    const newImage = new Image({
      data: decodedImage,
      contentType: contentType,
      alertType: alertType,
      alertBody: alertBody,
      userEmail: userEmail
    });

    // Save the image to MongoDB
    await newImage.save();

    // Construct the imageUrl using the ObjectId of newImage
    const imageUrl = `${req.protocol}://${req.get('host')}/picture/image/${newImage._id}`;

    // Create a new instance of the ImageUrl model
    const newImageUrl = new ImageUrl({
      imageUrl: imageUrl,
      imageId: newImage._id // Set imageId as the ObjectId of newImage
    });

    // Save the imageUrl to MongoDB
    await newImageUrl.save();
  
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send("refresh"); // Send your desired message here
      }
    })

    
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
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send("refresh");
      }
    })



    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const alertNumber =async(req, res)=>{
  try{
    const numberOfAlerts=await Image.find().count();
    console.log('number of alerts=====================>',numberOfAlerts);
    res.status(200).json(numberOfAlerts);

  } catch(error){
    console.log(error);
    res.status(500).send('error');
  }
}



function extractId(inputString) {
  // Find the start index of the ObjectId value
  const startIndex = inputString.indexOf('"') + 1;
  // Find the end index of the ObjectId value
  const endIndex = inputString.lastIndexOf('"');
  // Extract the ObjectId value from the input string
  const id = inputString.substring(startIndex, endIndex);
  return id;
}
 
const showAlertByIndex= async(req, res)=>{
  const index=req.body.index;
  

console.log(req.body);
  console.log('index====================>',index);
  try{
    //get the _id of the indexed data 
  const id=await Image.find().skip(index).limit(1).select('_id');
  const image=await Image.find().skip(index).limit(1);
  const newId = extractId(id.toString());

  //finding the url of the image from ImageUrl collection and getting the imageUrl
  const url=await ImageUrl.find({imageId:newId}).select('imageUrl');
    
   console.log('id=====================>',newId);//output: 65fd903101a6d01a9d842e1e
    console.log('url=====================>',url[0].imageUrl);
    //generating a random id for the alertœ

    const uniqueIdForImageKeysInFrontEnd=uuid.v4();
    console.log('uniqueId=====================>',uniqueIdForImageKeysInFrontEnd);

const returnDataofAlertWithUrl={
  uniqueId:uniqueIdForImageKeysInFrontEnd,
  id:newId,
  url:url[0].imageUrl,
  email: image[0].userEmail,
  alertType: image[0].alertBody,
  alertBody: image[0].alertType,
  createdAt:image[0].createdAt,
}

 
     
      
  
    res.status(200).json(returnDataofAlertWithUrl);
  }catch(error){
    console.log(error);
    res.status(500).send('error');
  
  }






}

module.exports = {
  showAlertByIndex,
  alertNumber,
  uploadPicture,
  getImageUrl,
  getAllImageUrls,
  getImageViaUrl,
  deleteImage
};

// Path: models/imageUrl.js