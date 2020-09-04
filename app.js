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

const divisionWards = JSON.parse(fs.readFileSync('./data/school-division-wards.geojson'));
const divisionWardLookup = new GeoJsonGeometriesLookup(divisionWards);

const councilWards = JSON.parse(fs.readFileSync('./data/council-wards.geojson'));
const councilWardLookup = new GeoJsonGeometriesLookup(councilWards);

const councilContacts = JSON.parse(fs.readFileSync('./data/council-contacts.json'));

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

  const divisionContainers = divisionWardLookup.getContainers(point);
  const divisionWard = divisionContainers.features[0];

  if (divisionWard) {
    const properties = divisionWard.properties;

    response.schools = {
      division: properties.division,
      ward: properties.ward,
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
