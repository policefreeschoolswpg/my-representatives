const app = require('./app');
const supertest = require('supertest');
const request = supertest(app);

const nock = require('nock');
nock('https://maps.googleapis.com')
  .get('/maps/api/geocode/json?address=510%20main&components=country:CA|locality:Winnipeg&key=API_KEY')
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
