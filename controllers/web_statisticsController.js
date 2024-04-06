 
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
 const imageUrl=require('../models/imageUrl');

const getUserCount= async (req, res)=>{
    try{
      const count=await User.countDocuments();
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
    res.status(200).json({count});
    }catch(err){
      console.log(err);
      res.status(500).json({message:"Unable to get active session number"});
    }
  
  }




const alertNumberForToday=async (req,res)=>{
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
  
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
  
      res.json({ count: count.length > 0 ? count[0].totalAlerts : 0 });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }; 

  

  

  
const lineChartData = async (req, res) => {
    try {
      const countsByMonth = await NFCData.aggregate([
        {
          $project: {
            month: { $month: { $toDate: '$createdAt' } }, // Extract month from createdAt field
            year: { $year: { $toDate: '$createdAt' } } // Extract year from createdAt field
          }
        },
        {
          $group: {
            _id: { month: '$month', year: '$year' }, // Group by month and year
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 } // Sort by year and month ascending
        }
      ]);
  
      const formattedCountsByMonth = countsByMonth.map(entry => ({
        [`${entry._id.month.toString().padStart(2, '0')}/${entry._id.year}`]: entry.count // Include the full year
      }));
  
      res.status(200).json({ countsByMonth: formattedCountsByMonth });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };


  const barChartData = async (req, res) => {
    try {
      const countsByMonth = await ImageUrl.aggregate([
        {
          $project: {
            month: { $month: { $toDate: '$createdAt' } }, // Extract month from createdAt field
            year: { $year: { $toDate: '$createdAt' } } // Extract year from createdAt field
          }
        },
        {
          $group: {
            _id: { month: '$month', year: '$year' }, // Group by month and year
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 } // Sort by year and month ascending
        }
      ]);
  
      const formattedCountsByMonth = countsByMonth.map(entry => ({
        [`${entry._id.month.toString().padStart(2, '0')}/${entry._id.year}`]: entry.count // Include the full year
      }));
  
      res.status(200).json({ countsByMonth: formattedCountsByMonth });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  
  
module.exports= {
    barChartData,
    lineChartData,
    getUserCount,
    totalTagCount,
    getActiveSessionNumber,
    alertNumberForToday
}