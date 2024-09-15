const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: String,
  address: String,
  lat: Number,
  lng: Number,
  contact: String,
});

const Hospital = mongoose.model('Hospital', hospitalSchema);

module.exports = Hospital;
