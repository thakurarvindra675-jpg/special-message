const Person = require('../models/Person');
const Analytics = require('../models/Analytics');
const Settings = require('../models/Settings');
const Activity = require('../models/Activity');

const exportBackup = async (req, res) => {
  try {
    const people = await Person.find({});
    const analytics = await Analytics.find({});
    const settings = await Settings.find({});
    const activity = await Activity.find({});

    const backupData = {
      people,
      analytics,
      settings,
      activity,
      timestamp: new Date().toISOString()
    };

    res.header('Content-Type', 'application/json');
    res.attachment(`backup-${new Date().toISOString().split('T')[0]}.json`);
    res.send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    res.status(500).json({ message: 'Backup Failed' });
  }
};

const importBackup = async (req, res) => {
  try {
    const { people, analytics, settings, activity } = req.body;

    if (people && people.length > 0) {
      await Person.deleteMany({});
      await Person.insertMany(people);
    }
    
    if (analytics && analytics.length > 0) {
      await Analytics.deleteMany({});
      await Analytics.insertMany(analytics);
    }

    if (settings && settings.length > 0) {
      await Settings.deleteMany({});
      await Settings.insertMany(settings);
    }

    if (activity && activity.length > 0) {
      await Activity.deleteMany({});
      await Activity.insertMany(activity);
    }

    await Activity.create({
      message: 'System restored from backup',
      type: 'admin'
    });

    res.json({ message: 'Restore complete' });
  } catch (error) {
    res.status(500).json({ message: 'Restore Failed' });
  }
};

module.exports = {
  exportBackup,
  importBackup
};
