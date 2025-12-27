const express = require('express');

const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
  res.send('Earthquake app server running');
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

module.exports = app;