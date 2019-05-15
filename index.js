(async () => {
  'use strict'

  const _ = require('lodash');
  const moment = require('moment');
  const fs = require('fs');
  const json2csv = require('json2csv').parse;
  const utils = require('./utils');
  const mongoose = require('./mongoose');

  // prepare connection with mongodb
  await mongoose.connect();
  const executeModel = require('./models/AgencyGroupCandidateStatusHistory');

  console.time("StartTime");

  let agency_group_id = "";
  let query = {};
  //changed_at: {"$gte": new Date("2010-01-02T00:00:00.000Z"), "$lt": new Date("2010-01-02T23:59:50.000Z")}
  if (agency_group_id) {
    query.agency_group_id = agency_group_id;
  }

  let uniqueStatus = await executeModel.find(query).distinct('status').exec();
  let uniqueCandidateType = await executeModel.find(query).distinct('candidate_type').exec();

  // find minimum date from collection
  let minDate = await executeModel.findOne(query, {changed_at: 1}).sort({changed_at: -1}).limit(1).exec();
  minDate = minDate ? minDate.changed_at : new Date();
  console.log("minDate : ", minDate);
  // find maximum date from collection
  let maxDate = await executeModel.findOne(query, {changed_at: 1}).sort({changed_at: 1}).exec();
  maxDate = maxDate ? maxDate.changed_at : new Date();
  console.log("minDate : ", maxDate);

  // generate dates array with format from minDate to maxDate
  let dates = utils.getDates(maxDate,minDate);
  console.log("Total dates to manipulate : ", dates.length);
  // prepare object via cartesian product for each date, status and type
  let destination = utils.arrToObj(
    //utils.cartesianProduct([dates, constanst.status, constanst.candidate_type])
    utils.cartesianProduct([dates, uniqueStatus, uniqueCandidateType])
  );

  // prepare holder for
  let holdLastUpdateCount = {};
  let holdLastUpdateIDs = {};
  let combinationOfStatus = Math.pow(uniqueStatus.length, uniqueCandidateType.length);
  let prepareKey = ''
  _.times(combinationOfStatus, (index) => {
    prepareKey = `${destination[index].status}.${destination[index].candidate_type}`
    holdLastUpdateCount[prepareKey] = 0;
    holdLastUpdateIDs[prepareKey] = []
  });

  console.log("Count of unique entry generated for each date, status and type : ", destination.length);
  try {
    // get documents from collection via query filter if needed else get all records
    // TODO we can also add filter of data between date range
    let data = await executeModel.find(query, {status: 1, candidate_type: 1, changed_at: 1, candidate_id: 1}).sort({changed_at: 1}).exec();
    console.log("Total Record need to process : ", data.length);
    let index = -1;
    let lastUpdatedIndex = -1;
    _.forEach(data, (entry, entryIndex) => {
      entry.candidate_id = entry.candidate_id ? entry.candidate_id.toString() : ''

      // find index using document data from destination array of object
      index = _.findIndex(destination, {
        status: entry.status,
        candidate_type: entry.candidate_type,
        date: moment(entry.changed_at).format("YYYY-MM-DD")
      });

      // if candidate not exists then update counter
      if (destination[index] && index >= 0
      ) {
        destination[index].candidate_id.push(entry.candidate_id);
        destination[index].count = holdLastUpdateCount[`${destination[index].status}.${destination[index].candidate_type}`] + 1;

        if(lastUpdatedIndex >= 0) {
          let loopThrough = lastUpdatedIndex + 1;
          if( loopThrough !== index) {
            let innerKey = ''
            _.times((index - loopThrough), (i) => {
              innerKey = `${destination[loopThrough].status}.${destination[loopThrough].candidate_type}`;
              destination[loopThrough].count = holdLastUpdateCount[innerKey];
              destination[loopThrough].candidate_id = holdLastUpdateIDs[innerKey];
              loopThrough++;
            })
          }
        }

        // find element for decrease the counter
        let indexDecrease = _.findLastIndex(destination, (desti) => {
          if (desti.date === moment(entry.changed_at).format("YYYY-MM-DD")
          && desti.candidate_type === entry.candidate_type
          && desti.status !== entry.status
          && desti.candidate_id
          && desti.candidate_id.length && desti.candidate_id.indexOf(entry.candidate_id) >= 0) {
            return true;
          }
          return false
        });

        // candidate already updated status on same date, need to decrease counter
        if (indexDecrease !== -1) {
          delete destination[indexDecrease].candidate_id[entry.candidate_id];
          //destination[indexDecrease].count--
          destination[indexDecrease].count = holdLastUpdateCount[`${destination[indexDecrease].status}.${destination[indexDecrease].candidate_type}`] - 1;
          holdLastUpdateCount[`${destination[indexDecrease].status}.${destination[indexDecrease].candidate_type}`] = destination[indexDecrease].count;
          holdLastUpdateIDs[`${destination[indexDecrease].status}.${destination[indexDecrease].candidate_type}`] = destination[indexDecrease].candidate_id
        }

        // hold reference
        holdLastUpdateCount[`${destination[index].status}.${destination[index].candidate_type}`] = destination[index].count;
        holdLastUpdateIDs[`${destination[index].status}.${destination[index].candidate_type}`] = destination[index].candidate_id;
        lastUpdatedIndex = index;
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
