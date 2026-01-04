const express = require('express');
const client = require('./elasticsearch/client');

const app = express();
const PORT = 3001;

const data = require('./data_management/retrieve_and_ingest_data');

app.use('/ingest_data', data)

app.get('/', (req, res) => {
  res.send('Earthquake app server running');
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

module.exports = app;