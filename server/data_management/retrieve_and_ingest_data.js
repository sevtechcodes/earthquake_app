//in server/data_management/retrieve_and_ingest_data.js

// Following 3 line dependencies necessary to receive and send http requests
const express = require('express');
const router = express.Router();
const axios = require('axios');

const client = require('../elasticsearch/client'); //Required the ES client we created before
require('log-timestamp'); //It prepends timestamps to the messages displayed in the terminal via the console.log() method. We will see this dependency come into play when we retrieve data from the USGS API.

const URL = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson`; //We will be retrieving data from this API

router.get('/earthquakes', async function (req, res) { // The end point: We define a route for /earthquakes
  console.log('Loading Application...');
  res.json('Running Application...');

  indexData = async () => {
    try {
      console.log('Retrieving data from the USGS API');

      const EARTHQUAKES = await axios.get(`${URL}`, {
        headers: {
          'Content-Type': ['application/json', 'charset=utf-8'],
        },
      });

      console.log('Data retrieved!');

      results = EARTHQUAKES.data.features; //gives you access to the features array(green box)

      console.log('Indexing data...');

			// These lines of code run through an array of earthquake objects. 
			// For each earthquake object in the array, it creates a json object that will be indexed later as documents.
      results.map(
        async (results) => (
          (earthquakeObject = {
            place: results.properties.place,
            time: results.properties.time,
            tz: results.properties.tz,
            url: results.properties.url,
            detail: results.properties.detail,
            felt: results.properties.felt,
            cdi: results.properties.cdi,
            alert: results.properties.alert,
            status: results.properties.status,
            tsunami: results.properties.tsunami,
            sig: results.properties.sig,
            net: results.properties.net,
            code: results.properties.code,
            sources: results.properties.sources,
            nst: results.properties.nst,
            dmin: results.properties.dmin,
            rms: results.properties.rms,
            mag: results.properties.mag,
            magType: results.properties.magType,
            type: results.properties.type,
            longitude: results.geometry.coordinates[0],
            latitude: results.geometry.coordinates[1],
            depth: results.geometry.coordinates[2],
          }),

					// We use our client to send the retrieve api data to ES for data transformation and data ingestion
          await client.index({  // client.index method to index the transform data
            index: 'earthquakes', //Where the data should be indexed into. We instruct Elasticsearch to ingest transformed data into the earthquakes index
            id: results.id, // We gave each document an id identical to the id of the earthquake object retrieved from the api
            body: earthquakeObject,// we set the body equal to earthquake object we defined above.It represents a document of one earthquake.
            pipeline: 'earthquake_data_pipeline', //send retrieved API data to Elasticsearch earthquake_data_pipeline for data transformation
          })
        )
      );

      if (EARTHQUAKES.data.length) { // If there is still data left that has not been indexed then
        indexData(); // keep calling the indexData function
      } else { // if all data has been index then
        console.log('Data has been indexed successfully!'); // print this.
      }
    } catch (err) {
      console.log(err);
    }
		//After data ingestion has been completed print this message
    console.log('Preparing for the next round of indexing...');
  };

	// Call the funtion
  indexData();
});

module.exports = router; //We expose a router via node.js module exports as this will be used in server.js
