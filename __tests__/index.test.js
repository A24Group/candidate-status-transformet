const CsvToJson = require('csvtojson')
const _ = require('lodash');


async function validate(date, status, candidateType) {
  const jsonArray = await CsvToJson().fromFile('./candidateStatus.csv');
  candidate = _.find(jsonArray, {
    date: date,
    status: status,
    candidate_type: candidateType
  });

  if (candidate && parseInt(candidate.count) === 0) {
    return true;
  }

  return false
}

test('candidate with 2004-05-10, Renewals, allied must be 0', async () => {
  expect(await validate("2004-05-10", "Renewals", "allied")).toBe(true);
});

test('candidate with 2014-07-06, Renewals, allied must be 1', async () => {
  expect(await validate("2014-07-06", "Renewals", "allied")).toBe(false);
});

test('candidate with 2014-07-06, Renewals, allied must not be 0', async () => {
  expect(await validate("2014-07-06", "Renewals", "allied")).toBe(true);
});
