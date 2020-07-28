const mongoose = require('mongoose');

// item schema

let matchDetailSchema = mongoose.Schema({
  date:{
    type: String,
    required: true
  },
  playedAgainst:{
    type: String,
    required: true
  },
  playedAt:{
    type: String,
    required: true
  },
  tournament:{
    type: String,
    required: true
  },
  matchOvers:{
    type: Number,
    required: true
  },
  matchID:{
    type: Number,
    required: true
  }
});

let MatchDetail = module.exports = mongoose.model('MatchDetail',matchDetailSchema);