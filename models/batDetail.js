const mongoose = require('mongoose');

// item schema

let batDetailSchema = mongoose.Schema({
  runs:{
    type: Number,
    required: true
  },
  balls:{
    type: Number,
    required: true
  },
  dots:{
    type: Number,
    required: true
  },
  ones:{
    type: Number,
    required: true
  },
  twoes:{
    type: Number,
    required: true
  },
  threes:{
    type: Number,
    required: true
  },
  fours:{
    type: Number,
    required: true
  },
  fives:{
    type: Number,
    required: true
  },
  sixes:{
    type: Number,
    required: true
  },
  notOut:{
    type: Boolean,
    required: true
  },
  batPos:{
    type: Number,
    required: true
  },
  matchID:{
    type: Number,
    required: true
  }
});

let BatDetail = module.exports = mongoose.model('BatDetail',batDetailSchema);