(async () => {
  'use strict'

  const _ = require('lodash');
  const moment = require('moment');
  const fs = require('fs');
  const json2csv = require('json2csv').parse;
  const constanst = require('./constant');
  const utils = require('./utils');
  const mongoose = require('./mongoose');

  // prepare connection with mongodb
  await mongoose.connect();
  const executeModel = require('./models/AgencyGroupCandidateStatusHistory');

  console.time("StartTime");

  let uniqueStatus = await executeModel.find().distinct('status').exec();
  let uniqueCandidateType = await executeModel.find().distinct('candidate_type').exec();

  // find minimum date from collection
  let minDate = await executeModel.find({}, {created_at: 1}).limit(1).exec();
  minDate = minDate ? minDate.created_at : new Date();

  // find maximum date from collection
  let maxDate = await executeModel.findOne({}, {created_at: 1}).sort({created_at: 1}).exec();
  maxDate = maxDate ? maxDate.created_at : new Date();

  // generate dates array with format from minDate to maxDate
  let dates = utils.getDates(maxDate,minDate);

  // prepare object via cartesian product for each date, status and type
  let destination = utils.arrToObj(
    //utils.cartesianProduct([dates, constanst.status, constanst.candidate_type])
    utils.cartesianProduct([dates, uniqueStatus, uniqueCandidateType])
  );

  try {
    // get documents from collection via query filter if needed else get all records
    // TODO we can also add filter of data between date range
    let agency_group_id = "";
    let query = {};
    if (agency_group_id) {
      query.agency_group_id = agency_group_id;
    }

    let data = await executeModel.find(query, {status: 1, candidate_type: 1, created_at: 1}).exec();
    console.log("Total Record need to process : ", data.length);
    let index = -1;
    _.forEach(data, entry => {
      // find index using document data from destination array of object
      index = _.findIndex(destination, {
        status: entry.status,
        candidate_type: entry.candidate_type,
        date: moment(entry.created_at).format("YYYY-MM-DD")
      });

      // if candidate not exists then update counter
      if (destination[index] && index >= 0 &&
        _.findIndex(destination[index].candidate_id, entry.candidate_id) === -1
      ) {
        destination[index].candidate_id.push(entry.candidate_id);
        destination[index].count++;
      }
    });

    // delete unwanted property for generate csv
    _.map(destination, (acc) => {
      delete acc.candidate_id
      return acc
    })

    // prepare object for generate csv
    const csv = json2csv(destination, ['date', 'status', 'type', 'count']);

    fs.writeFile('candidateStatus.csv', csv, function(err) {
      if (err) throw err;

      console.timeEnd("StartTime");
      console.log('CSV created successfully...!!!');
    });

  } catch(err) {
    console.log("Error while parsing Data : ", err);
  }


})()
