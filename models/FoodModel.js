const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  ingredients: {
    type: [String],
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  isVege: {
    type: Boolean,
    default: false,
  },
  isSpicy: {
    type: Boolean,
    default: false,
  }
},{
    timestamps:true
});

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;
