# Candidate-status-transformet

## Introduction

Generate candidate status data from database collection to csv format

System requirements:

* Install Node.js
* Install local MongoDB

## Workflow

* Install dependencies by running `npm install`
* Update collection name in `models/AgencyGroupCandidateStatusHistory` according to your collection name in database.
* Run `node index.js` for getting csv file
* Output : CSV file will store on your current file system with `candidateStatus.csv`
