const app = require('./app');
const supertest = require('supertest');
const request = supertest(app);

const nock = require('nock');
nock('https://api.winnipegtransit.com')
  .get('/v3/locations:510%20main.json?api-key=API_KEY')
  .reply(200, {"locations":[{"key":151168,"street-number":510,"street":{"key":2265,"name":"Main Street","type":"Street"},"centre":{"utm":{"zone":"14U","x":633652,"y":5529177},"geographic":{"latitude":"49.90004","longitude":"-97.1389"}},"type":"address"}]});

it('responds to a location query', async done => {
  const response = await request.get('/510 main');
  expect(response.body.address).toBe('510 Main Street');
  done();
});
