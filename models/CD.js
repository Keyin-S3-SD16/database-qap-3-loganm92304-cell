const mongoose = require('mongoose');

const cdSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    artist: {
      type: String,
      required: [true, 'Artist is required'],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Release year is required'],
      min: [1800, 'Year must be valid'],
      max: [new Date().getFullYear(), 'Year cannot be in the future'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CD', cdSchema);