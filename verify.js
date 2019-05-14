const CsvToJson = require('csvtojson')
const _ = require('lodash');

async function run() {
  const output = await CsvToJson().fromFile('./candidateStatus.csv');
  const assertion = await CsvToJson().fromFile('./sample.csv');

  for (let i=0; i < output.length; i++) {
    validate_item(output[i], assertion)
  }
}

function validate_item(actual, assertion) {

  let candidate = _.find(assertion, {
    date: actual.date,
    status: actual.status,
    candidate_type: actual.candidate_type
  });

  if (candidate) {
    if (parseInt(actual.count) !== parseInt(candidate.count)) {
      console.error(`Found, ${actual.count} not equal to expected ${candidate.count} for date: ${actual.date} status: ${actual.status} and type: ${actual.candidate_type}`)
    }
  } else {
    console.error('MISSING ENTRY')
  }
}

run()
