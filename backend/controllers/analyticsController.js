const Analytics = require('../models/Analytics');
const Activity = require('../models/Activity');
const Person = require('../models/Person');

const recordOpen = async (req, res) => {
  try {
    const { personId, browser, os, referrer } = req.body;
    let analytics = await Analytics.findOne({ personId });

    if (!analytics) {
      analytics = new Analytics({ personId, firstViewed: Date.now() });
    }

    analytics.totalViews += 1;
    analytics.lastViewed = Date.now();
    analytics.sessions.push({ browser, os, referrer });

    await analytics.save();

    const person = await Person.findById(personId);
    if (person) {
      await Activity.create({
        message: `${person.name} viewed their message`,
        type: 'view',
        personId
      });
    }

    res.json({ success: true, analyticsId: analytics._id });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const recordClose = async (req, res) => {
  try {
    const { personId, timeSpent, completed } = req.body;
    let analytics = await Analytics.findOne({ personId });

    if (analytics) {
      analytics.totalTimeSpent += timeSpent || 0;
      if (completed) {
        analytics.completedReading += 1;
      }
      
      // Update the last session duration
      if (analytics.sessions.length > 0) {
        analytics.sessions[analytics.sessions.length - 1].duration = timeSpent;
      }
      
      await analytics.save();
    }

    if (completed) {
      const person = await Person.findById(personId);
      if (person) {
        await Activity.create({
          message: `${person.name} completed reading`,
          type: 'complete',
          personId
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalPeople = await Person.countDocuments();
    const allAnalytics = await Analytics.find({});
    
    let totalViews = 0;
    let totalTime = 0;
    let totalCompleted = 0;

    allAnalytics.forEach(a => {
      totalViews += a.totalViews;
      totalTime += a.totalTimeSpent;
      totalCompleted += a.completedReading;
    });

    const averageReadingTime = totalViews > 0 ? (totalTime / totalViews) : 0;
    const completionRate = totalViews > 0 ? ((totalCompleted / totalViews) * 100) : 0;

    res.json({
      totalPeople,
      totalViews,
      averageReadingTime: Math.round(averageReadingTime),
      completionRate: Math.round(completionRate)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  recordOpen,
  recordClose,
  getDashboardStats
};
