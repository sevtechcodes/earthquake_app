const { Client } = require('@elastic/elasticsearch');
const client = require('./elasticsearch/client');
const express = require('express');
const cors = require('cors'); //Allow our server and client of differemt origins to exchange information without encountering a cors error

const app = express();

const data = require('./data_management/retrieve_and_ingest_data');

app.use('/ingest_data', data);

app.use(cors()); //Enable all cors requests

//End point to handle https request from clients
app.get('/results', (req, res) => {
	//user inputs
  const passedType = req.query.type;
  const passedMag = req.query.mag;
  const passedLocation = req.query.location;
  const passedDateRange = req.query.dateRange;
  const passedSortOption = req.query.sortOption;

	//send search request to ES and retrieve earthquake documents that match the user seletced criteria
  async function sendESRequest() {
    const body = await client.search({
      index: 'earthquakes',
      body: {
        sort: [ //sort parameter
          {
            mag: { // order by the value field 'mag'
              order: passedSortOption,
            },
          },
        ],
        size: 300, //retrieve up to 300 documents
        query: {
          bool: {
            filter: [
              {
                term: { type: passedType },
              },
              {
                range: {
                  mag: {
                    gte: passedMag,
                  },
                },
              },
              {
                match: { place: passedLocation },
              },
              // for those who use prettier, make sure there is no whitespace.
              {
                range: {
                  '@timestamp': {
                    gte: `now-${passedDateRange}d/d`,
                    lt: 'now/d',
                  },
                },
              },
            ],
          },
        },
      },
    });
    res.json(body.hits.hits);
  }
  sendESRequest();
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.group(`Server started on ${PORT}`));