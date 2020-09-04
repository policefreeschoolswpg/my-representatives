const app = require('./app');
const supertest = require('supertest');
const request = supertest(app);

it('responds to a location query', async done => {
  const response = await request.get('/49.9001165,-97.1389641');

  expect(response.body.latitude).toBe('49.9001165');
  expect(response.body.longitude).toBe('-97.1389641');

  expect(response.body.schools.division).toBe('Winnipeg');
  expect(response.body.schools.ward).toBe('6');

  done();
});

it('handles when there are no matching wards', async done => {
  const response = await request.get('/50.1418634,-96.877496');

  expect(response.body.schools).toBeUndefined();

  done();
});
