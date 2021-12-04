const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = () => {
  // we could add googleId and displayName if needed
  return new User({}).save();
};
