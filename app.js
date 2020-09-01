const express = require('express');
const app = express();

const request = require('superagent');
const apiKey = process.env['WINNIPEG_TRANSIT_API_KEY'] || 'API_KEY';

app.get('/:query', async ({ params: query }, res) => {
  const response = await request
    .get(`https://api.winnipegtransit.com/v3/locations:${query.query}.json?api-key=${apiKey}`)
    .set('accept', 'json');

  const location = JSON.parse(response.text).locations[0];
  const address = `${location['street-number']} ${location.street.name}`;

  res.json({ address });
});

module.exports = app;
