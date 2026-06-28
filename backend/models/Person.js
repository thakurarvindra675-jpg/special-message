const mongoose = require('mongoose');

const personSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    relationship: {
      type: String,
      trim: true,
    },
    message: {
      type: String, // Can store HTML from Rich Text Editor
      required: true,
    },
    songUrl: {
      type: String,
      default: '',
    },
    songName: {
      type: String,
      default: '',
    },
    songSize: {
      type: Number, // size in bytes
      default: 0,
    },
    songDuration: {
      type: Number, // duration in seconds
      default: 0,
    },
    songStartTime: {
      type: Number,
      default: 0,
    },
    songEndTime: {
      type: Number,
      default: 0,
    },
    theme: {
      type: String,
      default: 'Midnight Aurora',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Person', personSchema);
