const express=require("express");
const { json } = require("body-parser");
 const SessionData  = require('../models/session');
const { mongo } = require("mongoose");
 module.exports.session_Check = async (req, res) => {
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
module.exports.session_end = async (req, res) => {
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



module.exports.session_Create = async (req, res) => {
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
      ;
}