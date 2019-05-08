'use strict';
const moment = require('moment');

function getDates(startDate, stopDate) {
  let dateArray = [];
  while (moment(startDate) <= moment(stopDate)) {
    dateArray.push(moment(startDate).format("YYYY-MM-DD"));
    startDate = moment(startDate).add(1, "days");
  }
  return dateArray;
}

function cartesianProduct(arr) {
  return arr.reduce(
    function(a, b) {
        return a
        .map(function(x) {
          return b.map(function(y) {
            return x.concat(y);
          });
        })
        .reduce(function(a, b) {
          return a.concat(b);
        }, []);
    },
    [[]]
  );
}

function arrToObj(arr) {
  var obj = arr.map(function(x) {
    return {
      date: x[0],
      status: x[1],
      candidate_type: x[2],
      candidate_id: [],
      count: 0
    };
  });
  return obj;
}

module.exports = {
  getDates,
  cartesianProduct,
  arrToObj
}
