require('dotenv').config();
const { Client } = require('@elastic/elasticsearch');
const config = require('config');

const elasticConfig = config.get('elastic');

const client = new Client({
  cloud:{
		id: elasticConfig.cloudID
	},
  auth: {
    apiKey: elasticConfig.apiKey
  }
});

(async () => {
  try {
    await client.ping();
    console.log('Elasticsearch is connected');
  } catch (err) {
    console.error('Elasticsearch is not connected:', err.message);
  }
})();


module.exports = client;
