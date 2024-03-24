const mongoose = require('mongoose');

const imageUrlSchema = new mongoose.Schema({
  
  imageUrl:{
    type:String,
    required:true
},
imageId:{
  type:String,
  required:true
}
}, {
  timestamps: true

 
});

const ImageUrl = mongoose.model('ImageUrl', imageUrlSchema );

module.exports = ImageUrl;

// Path: routes/picture_Routes.js