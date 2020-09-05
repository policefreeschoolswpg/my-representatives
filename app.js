const express = require('express');
const app = express();
const cors = require('cors');

const isValidCoordinates = require('is-valid-coordinates')

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

const divisionWards = JSON.parse(fs.readFileSync('./data/school-division-wards.geojson'));
const divisionWardLookup = new GeoJsonGeometriesLookup(divisionWards);

const trusteeContacts = JSON.parse(fs.readFileSync('./data/school-division-contacts.json'));

const councilWards = JSON.parse(fs.readFileSync('./data/council-wards.geojson'));
const councilWardLookup = new GeoJsonGeometriesLookup(councilWards);

const councilContacts = JSON.parse(fs.readFileSync('./data/council-contacts.json'));
const councilPhotos = JSON.parse(fs.readFileSync('./data/council-photos.json'));

app.use(cors());
app.set('etag', false);

app.use(express.static('data'));

app.get('/:query', async ({ params: { query } }, res) => {
  if (!query.includes(',')) {
    res.status(400).json(constructError(query));
    return;
  }

  const [ latitudeString, longitudeString ] = query.split(',');

  const latitude = parseFloat(latitudeString);
  const longitude = parseFloat(longitudeString);

  if (!isValidCoordinates(longitude, latitude)) {
    res.status(400).json(constructError(query));
    return;
  }

  const point = {
    type: 'Point',
    coordinates: [ longitude, latitude ]
  };

  const response = {
    latitude: `${latitude}`,
    longitude: `${longitude}`,
  };

  const divisionContainers = divisionWardLookup.getContainers(point);
  const divisionWard = divisionContainers.features[0];

  if (divisionWard) {
    const properties = divisionWard.properties;

    response.schools = {
      division: properties.division,
      ward: properties.ward,
      trustees: trusteeContacts.filter(trustee => {
          return trustee['SCHOOL DIVISION'] === properties.division.toUpperCase() &&
            trustee['WARD'].replace('/','-') === properties.ward
        }).map(trustee => ({
          name: trustee['TRUSTEE'],
          email: trustee['EMAIL'],
          phone: trustee['PHONE'],
          photo: trustee['PHOTO NAME'],
        }))
    };
  }

  const councilContainers = councilWardLookup.getContainers(point);
  const councilWard = councilContainers.features[0];

  if (councilWard) {
    const properties = councilWard.properties;

    response.council = {
      ward: properties.name,
      councillor: {
        name: properties.councillor,
        phone: properties.phone,
        photo: councilPhotos.find(councillor => councillor.name === properties.councillor).photo,
      },
    };

    const contact = councilContacts.find(c => c.person === properties.councillor);
    const emailLink = contact.email_link;
    const recipientIndex = emailLink.indexOf('Recipient=');
    const ampersandAfterRecipientIndex = emailLink.indexOf('&', recipientIndex + 1);
    const emailUsername = emailLink.substring(recipientIndex + 10, ampersandAfterRecipientIndex);
    const email = `${emailUsername}@winnipeg.ca`;

    response.council.councillor.email = email;
  }

  res.json(response);
});

if (SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

module.exports = app;

function constructError(query) {
  return {
    error: `Expected /lat,lng, got /${query}`,
  };
};
