const mongoose = require('mongoose');

// item schema

let bowlDetailSchema = mongoose.Schema({
  overs:{
    type: Number,
    required: true
  },
  wickets:{
    type: Number,
    required: true
  },
  dots:{
    type: Number,
    required: true
  },
  maidens:{
    type: Number,
    required: true
  },
  runs:{
    type: Number,
    required: true
  },
  extras:{
    type: Number,
    required: true
  },
  fours:{
    type: Number,
    required: true
  },
  sixes:{
    type: Number,
    required: true
  },
  matchID:{
    type: Number,
    required: true
  }
});

let BowlDetail = module.exports = mongoose.model('BowlDetail',bowlDetailSchema);