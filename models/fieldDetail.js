const mongoose = require('mongoose');

// item schema

let fieldDetailSchema = mongoose.Schema({
  catches:{
    type: Number,
    required: true
  },
  runOuts:{
    type: Number,
    required: true
  },
  stumps:{
    type: Number,
    required: true
  },
  matchID:{
    type: Number,
    required: true
  }
});

let FieldDetail = module.exports = mongoose.model('FieldDetail',fieldDetailSchema);