const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  data: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;