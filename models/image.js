const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  data: {
    type: Buffer, // Store the image data as a Buffer
    required: true
  },
  contentType: {
    type: String, // Store the image MIME type
    required: true
  },
  alertType: {
    type: String,
    required: true
  },
  alertBody:{
    type: String,
    required: true

  },
  userEmail :{
    type: String,
    required:true
  }
  
}, {
  timestamps: true, updatedAt: true, createdAt: true

 
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;

