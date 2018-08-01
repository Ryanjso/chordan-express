const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const userSchema = new Schema({
  role: {type: String, enum: ["Client", "Freelancer", "Admin"]},
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  profilePicture: String,
  openOrders: Array,
  closedOrders: Array,
  reviews: {type: Object, default: null},
  accountStatus: {type: Boolean, default: true},
  ipAddress: {type: String, default: null},
  description: String,  // description of self, NOT description of each package
  portfolio: Array,
  location: String,
  radiusFromZip: Number, // of miles? else should be string...

}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;