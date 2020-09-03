const app = require('./app');
const supertest = require('supertest');
const request = supertest(app);

const nock = require('nock');
nock('https://maps.googleapis.com')
  .get('/maps/api/geocode/json?address=510%20main&bounds=49.696011,-97.461243|50.002406,-96.981259&key=API_KEY')
  .reply(200, {
    "results" : [
       {
          "address_components" : [
             {
                "long_name" : "510",
                "short_name" : "510",
                "types" : [ "street_number" ]
             },
             {
                "long_name" : "Main Street",
                "short_name" : "Main St",
                "types" : [ "route" ]
             },
             {
                "long_name" : "Civic Centre",
                "short_name" : "Civic Centre",
                "types" : [ "neighborhood", "political" ]
             },
             {
                "long_name" : "Winnipeg",
                "short_name" : "Winnipeg",
                "types" : [ "locality", "political" ]
             },
             {
                "long_name" : "Division No. 11",
                "short_name" : "Division No. 11",
                "types" : [ "administrative_area_level_2", "political" ]
             },
             {
                "long_name" : "Manitoba",
                "short_name" : "MB",
                "types" : [ "administrative_area_level_1", "political" ]
             },
             {
                "long_name" : "Canada",
                "short_name" : "CA",
                "types" : [ "country", "political" ]
             },
             {
                "long_name" : "R3B 1B9",
                "short_name" : "R3B 1B9",
                "types" : [ "postal_code" ]
             }
          ],
          "formatted_address" : "510 Main St, Winnipeg, MB R3B 1B9, Canada",
          "geometry" : {
             "bounds" : {
                "northeast" : {
                   "lat" : 49.9003617,
                   "lng" : -97.1383367
                },
                "southwest" : {
                   "lat" : 49.899537,
                   "lng" : -97.13969489999999
                }
             },
             "location" : {
                "lat" : 49.9001165,
                "lng" : -97.1389641
             },
             "location_type" : "ROOFTOP",
             "viewport" : {
                "northeast" : {
                   "lat" : 49.9012983302915,
                   "lng" : -97.13766681970849
                },
                "southwest" : {
                   "lat" : 49.8986003697085,
                   "lng" : -97.14036478029151
                }
             }
          },
          "place_id" : "ChIJgR7xGV1x6lIRRTjb8aa2Xng",
          "types" : [ "premise" ]
       }
    ],
    "status" : "OK"
 })
 .get('/maps/api/geocode/json?address=321%20main&bounds=49.696011,-97.461243|50.002406,-96.981259&key=API_KEY')
 .reply(200, {
  "results": [
    {
      "address_components": [
        {
          "long_name": "321",
          "short_name": "321",
          "types": [
            "street_number"
          ]
        },
        {
          "long_name": "Main Street",
          "short_name": "Main St",
          "types": [
            "route"
          ]
        },
        {
          "long_name": "Steinbach",
          "short_name": "Steinbach",
          "types": [
            "locality",
            "political"
          ]
        },
        {
          "long_name": "Division No. 2",
          "short_name": "Division No. 2",
          "types": [
            "administrative_area_level_2",
            "political"
          ]
        },
        {
          "long_name": "Manitoba",
          "short_name": "MB",
          "types": [
            "administrative_area_level_1",
            "political"
          ]
        },
        {
          "long_name": "Canada",
          "short_name": "CA",
          "types": [
            "country",
            "political"
          ]
        },
        {
          "long_name": "R5G 1Z2",
          "short_name": "R5G 1Z2",
          "types": [
            "postal_code"
          ]
        }
      ],
      "formatted_address": "321 Main St, Steinbach, MB R5G 1Z2, Canada",
      "geometry": {
        "location": {
          "lat": 49.52597129999999,
          "lng": -96.68377679999999
        },
        "location_type": "ROOFTOP",
        "viewport": {
          "northeast": {
            "lat": 49.52732028029149,
            "lng": -96.6824278197085
          },
          "southwest": {
            "lat": 49.5246223197085,
            "lng": -96.6851257802915
          }
        }
      },
      "place_id": "ChIJyR6Oe7k1wFIRtBERDeFLjvg",
      "plus_code": {
        "compound_code": "G8G8+9F Steinbach, MB, Canada",
        "global_code": "86X5G8G8+9F"
      },
      "types": [
        "street_address"
      ]
    }
  ],
  "status": "OK"
})
.get('/maps/api/geocode/json?address=2540%20portage&bounds=49.696011,-97.461243|50.002406,-96.981259&key=API_KEY')
.reply(200, {
  "results": [],
  "status": "ZERO_RESULTS"
});

it('responds to a location query', async done => {
  const response = await request.get('/510 main');

  expect(response.body.address).toBe('510 Main St');
  expect(response.body.latitude).toBe('49.9001165');
  expect(response.body.longitude).toBe('-97.1389641');

  expect(response.body.division).toBe('Winnipeg');
  expect(response.body.ward).toBe('6');

  done();
});

it('handles when there are no matching wards', async done => {
  const response = await request.get('/321 main');

  expect(response.body.address).toBe('321 Main St');
  expect(response.body.division).toBeUndefined();
  expect(response.body.ward).toBeUndefined();

  done();
});

it('404s when there are no geocoding results', async done => {
  const response = await request.get('/2540 portage');

  expect(response.status).toBe(404);
  done();
});
