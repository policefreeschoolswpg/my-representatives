const express = require('express');
const app = express();
const cors = require('cors');

const request = require('superagent');
const apiKey = process.env['GOOGLE_API_KEY'] || 'API_KEY';

const GeoJsonGeometriesLookup = require('geojson-geometries-lookup');
const fs = require('fs');
const wards = JSON.parse(fs.readFileSync('./data/wards.geojson'));
const wardLookup = new GeoJsonGeometriesLookup(wards);

app.use(cors());
app.set('etag', false);

app.get('/:query', async ({ params: query }, res) => {
  const response = await request
    .get(`https://maps.googleapis.com/maps/api/geocode/json?components=country:CA|locality:Winnipeg&address=${query.query}&key=${apiKey}`)
    .set('accept', 'json');

  const location = JSON.parse(response.text).results[0];
  const address = `${location.formatted_address.split(',')[0]}`;

  const centre = location.geometry.location;
  const point = {
    type: 'Point',
    coordinates: [ centre.lng, centre.lat ]
  };

  const containers = wardLookup.getContainers(point);
  const ward = containers.features[0];
  const properties = ward.properties;

  res.json({
    address,
    latitude: `${centre.lat}`,
    longitude: `${centre.lng}`,
    division: properties.division,
    ward: properties.ward
  });
});

module.exports = app;
