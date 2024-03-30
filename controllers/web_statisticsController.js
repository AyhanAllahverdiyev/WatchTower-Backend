 
const express=require("express");
const User = require("../models/User");
const { json } = require("body-parser");
 const SessionData  = require('../models/session');
const { mongo } = require("mongoose");
const NFCData=require("../models/nfc_data");
const tagOrder=require("../models/tagOrder");
const Image=require("../models/image");
const dotenv = require('dotenv');
const bodyParser = require('body-parser'); // Import body-parser
dotenv.config();
const multer = require('multer');
const ImageUrl=require("../models/imageUrl");
const { ObjectId } = require("mongodb");
const uuid=require('uuid');
const { uniq } = require("lodash");
 
const getUserCount= async (req, res)=>{
    try{
      const count=await User.countDocuments();
      console.log(count);
      res.status(200).json({count});
    }catch(err){
      console.log(err);
      res.status(500).json({message:"Unable to get user count"});
    }
  
  
  
  
  }


const totalTagCount=async(req,res)=>{
    try{
        const count=await tagOrder.countDocuments({});
        res.status(200).json({count:count});
    }
    catch(err){
        res.status(500).send("Error getting tag count");
    }
}


const getActiveSessionNumber= async(req,res)=>{
    try{ 
    const count =await SessionData.find({isActive:true}).countDocuments();
    console.log("Active session number:",count);
    res.status(200).json({count});
    }catch(err){
      console.log(err);
      res.status(500).json({message:"Unable to get active session number"});
    }
  
  }




const alertNumberForToday=async (req,res)=>{
    try {
      // Get the start of today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      // Get the end of today
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
  
      // Aggregate to count the alerts created today
      const count = await Image.aggregate([
        {
          $match: {
            createdAt: { $gte: todayStart, $lte: todayEnd }
          }
        },
        {
          $count: 'totalAlerts'
        }
      ]);
  
      // Send the count as response
      res.json({ count: count.length > 0 ? count[0].totalAlerts : 0 });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  
module.exports= {
    getUserCount,
    totalTagCount,
    getActiveSessionNumber,
    alertNumberForToday
}