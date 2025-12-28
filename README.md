# Offical Elastic Community - Earthquake Watch App

## S2E1 - Project planning
We are goinging to build a fullstack web app with Node.js and React. Then we will connect the server to Elastic Cloud. 
![Frontend-part1](images/image.png)
![Frontend-part2](images/image-1.png)

Next we will ingest global earthquake data into Elasticsearch, we will be getting this data from the USGS API.
![Data Ingest](images/image-2.png)
![Data Playout](images/image-3.png)

![Kibana Dashboard](images/image-4.png)


## S2E2 - Building Server using Node.js with Express
### Create project on local and run it
- On terminal
``` 
mkdir earthquake_app
cd earthquake_app
npm init -y
npm install @elastic/elasticsearch axios config cors express log-timestamp nodemon
code .
```
- In the project folder, add a folder **server** and inside the folder add a file **server.js**. Write the following code inside:

```javascript
const express = require('express');

const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
  res.send('Earthquake app server running');
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
```
 - In the package.json replace **index.js** with **server.js**. Server.js will be our app entry point. Also add this line under the **"Script"** section to run the app automaticly by nodemon when we do any change: 
 ```"start": "nodemon server/server.js"```

## Add your project to Github
In the project directory add a file **.gitignore**
Write inside
```javascript
# Node modules
node_modules/

# Logs
logs/
*.log
npm-debug.log*

# Environment variables
.env

# OS files
.DS_Store
Thumbs.db

# IDE/editor files
.vscode/
.idea/

# Optional: build/output folders
dist/
build/
```

- On the terminal:
```javascript
npm init
git add .
git commit -m 'Initial commit'
git remote add origin https://github.com/username/repository.git
git push -u origin master
```

## S2E3 - Create an Elastic Cloud deployment
- Select a distribution model for your unique needs: Self-managed / Elastic Cloud / Elastic Cloud Enterprice / Elastic Cloud on Kubernetes.
We will use **Elastic Cloud**. 

### Create Elastic Cloud account
Try (Free 30 day trial)[https://cloud.elastic.co/registration?pg=global&plcmt=nav&cta=205352-primary]
(API Doc)[https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-license-post-start-trial]

Click on (**Create hosted deployment**)[https://cloud.elastic.co/home] => Choose Elasticsearch => Give a name of your choice to your deployment like Earthquake-App-Deployment => Click on Create hosted deployment.
Save the deployment credentials username and password somewhere immediately, as they will disappear. 
Your deployment is ready after that! The page will direct you to a page that you can create your first index.

## S2E4 - Connect securely the Node.js server to Elastic Cloud
### Authentication types
There are 2 ways to connect to the Elastic Cloud
 - Basic authentication (logging in as a user)
 - API key => Best practice for production

To use API key, log into Elastic Cloud as a user first by basic authentication. 
In the repo, create **config** directory to store Elastic Cloud credentials => **default.json** and **custom-environment-variables.json**files.
Add the following for the basic authentication:

default.js
```javascript
{
	"elastic": {
		"cloudID": "", //this can be found under deployment list-> your deployment 'Cloud ID'
		"username": "",
		"password": ""
	}
}
```

custom-environment-variables.json
```javascript
{
  "elastic": {
    "cloudID": "ELASTIC_ID",
    "username": "ELASTIC_USERNAME",
    "password": "ELASTIC_PASSWORD"
  }
}
```

Create ELASTIC_ID, ELASTIC_USERNAME, ELASTIC_PASSWORD in .env file with actual credentails.


### Connect server to communicate with Elastic Cloud securely with Elastic Search client

Go to (Javascript client)[https://www.elastic.co/docs/reference/elasticsearch/clients/javascript] as we are using Node.js. This will allow your app to communicate with Elastic search cluster.

- Create a new instance of Elastic search client. This client will contain our elasticclub access credentials that points to our ES cluster. Then we will setup our server to connect to Elastic cloud and display a message in the terminal of its connection status. To do so in the **server** directory create a new directory named **elasticsearch** => **client.js** file. In the file write the following:

```javascript
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
```
- Add the following line into the server.js, where we create cluster.

```javascript
const client = require('./elasticsearch/client');
```
Finally the server is running fine and 'Elasticsearcj is connected'!

### Create API key
In the server directory create file **create-api-key.js** and write the following code inside.

```javascript
//in server/create-api-key.js
const client = require('./elasticsearch/client');

async function generateApiKeys(opts) {
  const body = await client.security.createApiKey({
    body: {
      name: 'earthquake_app',
      role_descriptors: {
        earthquakes_example_writer: {
          cluster: ['monitor'],
          index: [
            {
              names: ['earthquakes'],
              privileges: ['create_index', 'write', 'read', 'manage'],
            },
          ],
        },
      },
    },
  });
  return Buffer.from(`${body.id}:${body.api_key}`).toString('base64');
}

generateApiKeys()
  .then(console.log)
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
```
- in the project directory on the terminal run this code
```javascript
node server/create-api-key.js
```
copy the key it provides and add it to .env file as ELASTIC_API_KEY=api-key

In the default.json => add one more line ** "apiKey": "" **
In the custom-enviroment-variables.json  => add one more lin ** "apiKey": "ELASTIC_API_KEY"**
In the client.js => replace the following with new line;
```javascript
    username: elasticConfig.username,
    password: elasticConfig.password
```

with this
```javascript
 apiKey: elasticConfig.apiKey
 ```
Now our app is using API key to connect instead of basic auth.

## S2E5  - Plan for effient data storage & search performance in Elasticsearch
### Assess the API data 

- Determine what data we need
- Discover if we need to transform the data to fit our use case
- Decide on the desired mapping for efficient storage and search of data

We will use the last 30 days of the earthquakes data so be sure to have this page pulled up as we are going over it. 

![Data Card we need for Frontend-FE](images/image-5.png)
The information shown here is what we need from the USGS API. We will store this information on Elasticsearch in the form of documents. Each document will contain information about one earthquake.

**Examine the data struture of the earthquake API**
- (Earthquake Catalog Documentation)[https://earthquake.usgs.gov/data/comcat/index.php#nst]
- (USGS website - output data structure of the earthquake api )[https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php]
- (USGS Data of last 30 days)[https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson]

Check USGS Output => Features
```javascript
 features: [
    {
      type: "Feature",
      properties: {
        mag: Decimal,
        place: String,
        time: Long Integer,
        updated: Long Integer,
        tz: Integer,
        url: String,
        detail: String,
        felt:Integer,
        cdi: Decimal,
        mmi: Decimal,
        alert: String,
        status: String,
        tsunami: Integer,
        sig:Integer,
        net: String,
        code: String,
        ids: String,
        sources: String,
        types: String,
        nst: Integer,
        dmin: Decimal,
        rms: Decimal,
        gap: Decimal,
        magType: String,
        type: String
      },
      geometry: {
        type: "Point",
        coordinates: [
          longitude,
          latitude,
          depth
        ]
      },
      id: String
    },
    …
  ]
```
![Output comparison with the fields we need](images/image-6.png)

To save storage, we will only index the fields mag, place, time, url, sig(significance), type, and coordinates array which includes longitude, latitude, and depth in that order.

![Fields we need under 'Features'](images/image-7.png)

### How to store this data using the smallest disk space while maximizing our search performance
**Mapping** defines how a document and its fields are indexed and stored.
It does that by assigning types to fields being indexed. Depending on the assigned field type, each field is indexed and primed for different types of requests(full text search, exact searches, aggregations, sorting & etc).

Choose correct typed for each field
- (Elasticsearch Field data types)[https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/field-data-types]
- (Elasticsearch Numeric field types)[https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/number]
- (Elasticsearch Geopoint field type)[https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/geo-point]

![Table of the fields we need with data types](images/image-8.png)

## S2E6  - Setup Elasticsearch for data transformation and data ingestion
- create an ingest pipeline to transform the retrieved data
- create an index called earthwuakes with the desired mapping

### 