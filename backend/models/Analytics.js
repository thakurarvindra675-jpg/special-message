const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    personId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: true,
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    completedReading: {
      type: Number,
      default: 0,
    },
    firstViewed: {
      type: Date,
    },
    lastViewed: {
      type: Date,
    },
    sessions: [
      {
        browser: String,
        os: String,
        referrer: String,
        duration: Number,
        viewedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analytics', analyticsSchema);
