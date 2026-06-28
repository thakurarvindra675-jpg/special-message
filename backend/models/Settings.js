const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    websiteTitle: {
      type: String,
      default: 'A Special Message',
    },
    heroHeading: {
      type: String,
      default: 'Someone has left a special message for you ❤️',
    },
    heroSubtitle: {
      type: String,
      default: 'Search your name to reveal it.',
    },
    footerText: {
      type: String,
      default: 'Made with ❤️',
    },
    signature: {
      type: String,
      default: 'Forever Yours',
    },
    defaultTheme: {
      type: String,
      default: 'Midnight Aurora',
    },
    defaultMusicVolume: {
      type: Number,
      default: 0.5,
    },
    enableConfetti: {
      type: Boolean,
      default: true,
    },
    enableBackgroundMusic: {
      type: Boolean,
      default: true,
    },
    enableSearchSuggestions: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
