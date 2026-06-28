const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String, // 'view', 'complete', 'music', 'search', 'admin'
      default: 'view',
    },
    personId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
