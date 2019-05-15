'use strict';

const mongoose = require('../mongoose').mongoose;
const _ = require('lodash');

let groupModel;

const groupModelSchema = new mongoose.Schema({
  agency_group_id: String,
  candidate_id: String,
  candidate_type: String,
  historical_status: Boolean,
  status: String,
  comment: String,
  status_id: String,
  changed_at: {
    type: Date,
    index: true
  },
  changed_by: {
    system: Boolean,
    id: String,
    name: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: Date
});

groupModel = mongoose.model('group', groupModelSchema);

module.exports = groupModel;
