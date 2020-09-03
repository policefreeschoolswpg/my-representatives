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

app.use(express.static('data'));

app.get('/:query', async ({ params: query }, res) => {
  const geoResponse = await request
    .get(`https://maps.googleapis.com/maps/api/geocode/json?bounds=49.696011,-97.461243|50.002406,-96.981259&address=${query.query}&key=${apiKey}`)
    .set('accept', 'json');

  const json = JSON.parse(geoResponse.text)

  if (json.status === "OK") {
    const location = json.results[0];
    const address = `${location.formatted_address.split(',')[0]}`;

    const centre = location.geometry.location;
    const point = {
      type: 'Point',
      coordinates: [ centre.lng, centre.lat ]
    };

    const response = {
      address,
      latitude: `${centre.lat}`,
      longitude: `${centre.lng}`,
    };

    const containers = wardLookup.getContainers(point);
    const ward = containers.features[0];

    if (ward) {
      const properties = ward.properties;

      response.division = properties.division;
      response.ward = properties.ward;
    }

    res.json(response);
  } else {
    res.status(404).json({});
  }
});

module.exports = app;
