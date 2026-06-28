const Activity = require('../models/Activity');

const getActivityFeed = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(50);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getActivityFeed
};
