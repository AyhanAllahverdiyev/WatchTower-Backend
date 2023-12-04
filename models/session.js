const mongoose = require("mongoose");
const tagorderSche=require("../models/tagOrder");
const sessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  tagOrderIsread: {
    type: Array,
    required: true,
  },
  session_id:{
    type: String,
    required : false

  }
},
{
  timestamps: { createdAt: true, updatedAt: false },
  collection: "session",
});
 

const SessionData = mongoose.model("session", sessionSchema);

module.exports = SessionData;
