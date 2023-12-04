const express=require("express");
const { json } = require("body-parser");
 const SessionData  = require('../models/session');
const { mongo } = require("mongoose");
const NFCData=require("../models/nfc_data");
const session_Check = async (req, res) => {
  try {
    const userId = req.body.id;
   

    const userSession = await SessionData.find({ userId: userId, isActive: true });
     

    if (userSession.length > 0) {
       console.log('Session active');
      const data = userSession[0].tagOrderIsread;
      const sessionId= userSession[0].session_id;
      res.status(200).json({ message: 'Session active', data,sessionId});
    } else {
      console.log('No session found');
      res.status(404).json({ message: 'No session found' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message});
  }
};
const session_end = async (req, res) => {
  try {
    const userId = req.body.id;
    console.log(userId);

    const userSessions = await SessionData.find({ userId: userId, isActive: true });

    if (userSessions.length > 0) {
      for (const session of userSessions) {
        session.isActive = false;
        await session.save();
      }
      console.log('Ended all active sessions');
      res.status(200).json({ message: 'Ended all active sessions' });
    } else {
      console.log('No active sessions found');
      res.status(404).json({ message: 'No active sessions found' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



const session_Create = async (req, res) => {
         try {
         
           
          const { userId, isActive, tagOrderIsread } = req.body;
          const userSession = await SessionData.find({ userId: userId, isActive: true });
          if (userSession.length > 0) {
            res.status(400).json({ message: 'Session already active' });
          
          }else{
           const sessionData = await SessionData.create({
            userId,
            isActive: true,
            tagOrderIsread, 
            session_id:new mongo.ObjectId()
          });
          res.status(201).json({ message: 'Session created', data: sessionData });
        }
        } catch (error) {
        console.log(error);
          res.status(500).json({ error: error.message });
        }   
}




const user_read_history_session=async (req,res)=>   {
  try{  
    const {user_id,session_id}=req.body;
  NFCData.find({user_id,session_id}).then((result)=>{ 
   console.log(result);
      if(result.length==0){
        console.log('User not found or session read empty');
        res.status(404).json({message:'User not found or session read empty'})
      }
      else{
        res.status(200).json(result);
      }
    });
    


  }
  catch(err){
    console.log(err);
    res.status(500).json({message:"Unable to get user read history for Session"})
  }
}
function DTO(data) {
  return data.map(item => ({
    userId: item.userId,
    isActive: item.isActive,
    createdAt: item.createdAt
  }));
}


const get_all_session_for_user= (req,res)=>{
  try{
  const {user_id}=req.body;
    SessionData.find({userId:user_id}).then((result)=>{
    console.log(DTO(result));
    if(result.length==0){
      console.log('session history empty');
      res.status(404).json({message:'session history empty'});
    }else{
      res.status(200).json(DTO(result));
    }
  }); 
}catch(err){
  console.log(err);
  res.status(500).json({message:"unable to get session history for user"});
}
}
 
module.exports={
  session_Check,
  session_Create,
  session_end,
  user_read_history_session,
  get_all_session_for_user
}