const mongoose = require('mongoose');

// item schema

let mIDSchema = mongoose.Schema({
  matchID:{
    type: Number,
    required: true
  }
});

let MID = module.exports = mongoose.model('MID',mIDSchema);