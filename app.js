const express = require('express');
const app = express();
const cors = require('cors');

const Sentry = require('@sentry/node');
const Tracing = require("@sentry/tracing");

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

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
    .get('https://maps.googleapis.com/maps/api/geocode/json')
    .query({
      bounds: '49.696011,-97.461243|50.002406,-96.981259',
      address: query.query,
      key: apiKey,
    })
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

if (SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

module.exports = app;
