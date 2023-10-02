const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name:{
    type: String
  },
  email:{
    type: String,
    unique:true
  },
  password:{
    type: String
  },
  createdAt:{
    type: String
  },
  verified:{
    type: Boolean,
    default:false
  },
  role:{
    type: String,
    default: 'user'
  },
  resetToken: {
    type: String,
  },
  resetTokenExpiry: {
    type: Date,
  },
});

module.exports = mongoose.model('User', userSchema);