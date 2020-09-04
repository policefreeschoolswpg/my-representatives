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

const apiKey = process.env['GOOGLE_API_KEY'] || 'API_KEY';

const GeoJsonGeometriesLookup = require('geojson-geometries-lookup');
const fs = require('fs');
const wards = JSON.parse(fs.readFileSync('./data/wards.geojson'));
const wardLookup = new GeoJsonGeometriesLookup(wards);

app.use(cors());
app.set('etag', false);

app.use(express.static('data'));

app.get('/:query', async ({ params: query }, res) => {
  const [ latitudeString, longitudeString ] = query.query.split(',');
  const latitude = parseFloat(latitudeString);
  const longitude = parseFloat(longitudeString);

  const point = {
    type: 'Point',
    coordinates: [ longitude, latitude ]
  };

  const response = {
    latitude: `${latitude}`,
    longitude: `${longitude}`,
  };

  const containers = wardLookup.getContainers(point);
  const ward = containers.features[0];

  if (ward) {
    const properties = ward.properties;

    response.schools = {
      division: properties.division,
      ward: properties.ward,
    };
  }

    res.json(response);
});

if (SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

module.exports = app;
