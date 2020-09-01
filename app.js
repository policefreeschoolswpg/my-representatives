const express = require('express');
const app = express();
const cors = require('cors');

const request = require('superagent');
const apiKey = process.env['WINNIPEG_TRANSIT_API_KEY'] || 'API_KEY';

const GeoJsonGeometriesLookup = require('geojson-geometries-lookup');
const fs = require('fs');
const wards = JSON.parse(fs.readFileSync('./data/wards.geojson'));
const wardLookup = new GeoJsonGeometriesLookup(wards);

app.use(cors());
app.set('etag', false);

app.get('/:query', async ({ params: query }, res) => {
  const response = await request
    .get(`https://api.winnipegtransit.com/v3/locations:${query.query}.json?api-key=${apiKey}`)
    .set('accept', 'json');

  const location = JSON.parse(response.text).locations[0];
  const address = `${location['street-number']} ${location.street.name}`;

  const centre = location.centre.geographic;
  const point = {
    type: 'Point',
    coordinates: [ parseFloat(centre.longitude), parseFloat(centre.latitude) ]
  };

  const containers = wardLookup.getContainers(point);
  const ward = containers.features[0];
  const properties = ward.properties;

  res.json({
    address,
    latitude: centre.latitude,
    longitude: centre.longitude,
    division: properties.division,
    ward: properties.ward
  });
});

module.exports = app;
