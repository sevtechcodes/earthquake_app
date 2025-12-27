const {Client} = require('@elastic/elasticsearch');
config = require('config');
const elasticConfig = config.get('elastic');	

const client = new Client({
	cloud: {
		id: elasticConfig.cloudID
	},
	auth: {
		username: elasticConfig.username,
		password: elasticConfig.password
	},
});

client.ping()
.then(() => console.log('You are connected to Elasticsearch!'))
.catch(console.error('Elasticesearch is not connected'));

module.exports = client;