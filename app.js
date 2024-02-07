const express = require('express');
const app = express();

const compression = require('compression');
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

const wsdPostalCodeToDistrict = JSON.parse(fs.readFileSync('./data/wsd-postal-code-to-district.json'));

const trusteeContacts = JSON.parse(fs.readFileSync('./data/school-division-contacts.json'));

const councilWards = JSON.parse(fs.readFileSync('./data/council-wards.geojson'));
const councilWardLookup = new GeoJsonGeometriesLookup(councilWards);

const councilContacts = JSON.parse(fs.readFileSync('./data/council-contacts.json')).filter(contact => contact.current_council);
const councilPhotos = JSON.parse(fs.readFileSync('./data/council-photos.json'));

const manitobaDivisions = JSON.parse(fs.readFileSync('./data/manitoba-electoral-divisions.geojson'));
const manitobaDivisionLookup = new GeoJsonGeometriesLookup(manitobaDivisions);

const manitobaContacts = JSON.parse(fs.readFileSync('./data/manitoba-contacts.json'));

const municipalElectionCandidates2022 = JSON.parse(fs.readFileSync('./data/municipal-election-candidates-2022.json'));

app.use(compression());

app.use(cors());
app.set('etag', false);

app.use(express.static('data'));
app.use('/photos', express.static('photos'));

app.get('/:query', async ({ params: { query }, query: queryParameters }, res) => {
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
          photo: `/photos/schools/${trustee['PHOTO NAME']}`,
        })),
      candidates2022: municipalElectionCandidates2022.schools[properties.division][properties.ward]
    };

    const queryPostalCode = queryParameters['postal-code'];

    if (queryPostalCode) {
      const district = wsdPostalCodeToDistrict[queryPostalCode];

      if (district) {
        response.schools.district = district;
      }
    }
  }

  const councilContainers = councilWardLookup.getContainers(point);
  const councilWard = councilContainers.features[0];

  if (councilWard) {
    const properties = councilWard.properties;
    const photo = `/photos/council/${councilPhotos.find(councillor => councillor.name === properties.councillor).photo}`;

    response.council = {
      ward: properties.name,
      councillor: {
        name: properties.councillor,
        phone: properties.phone,
        photo,
      },
      candidates2022: municipalElectionCandidates2022.council[properties.name]
    };

    const contact = councilContacts.find(c => c.person === properties.councillor);
    const emailLink = contact.email_link_english;
    const emailLinkURL = new URL(emailLink);
    const emailUsername = emailLinkURL.searchParams.get('Recipient');
    const email = `${emailUsername}@winnipeg.ca`;

    response.council.councillor.email = email;
  }

  const manitobaContainers = manitobaDivisionLookup.getContainers(point);
  const manitobaDivision = manitobaContainers.features[0];

  if (manitobaDivision) {
    const properties = manitobaDivision.properties;

    response.manitoba = {
      division: properties.ED,
    };

    const contact = manitobaContacts.find(c => c.division === properties.ED);

    if (contact) {
      response.manitoba.member = {
        ...contact,
        photo: `/photos/manitoba/${contact.photo}`,
      };

      delete response.manitoba.member.division;
    }
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
