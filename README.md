# candidate-status-transformet

## Introduction

Generate candidate status data from database collection to csv format

System requirements:

* Need to install node
* Need to install local mongodb

## Workflow

* Install dependencies by running `npm install`
* Need to update collection name in `models/AgencyGroupCandidateStatusHistory` according to your collection name in database.
* Run `node index.js` for getting csv file
* Output : CSV file will store on your current file system with `candidateStatus.csv`
