const app = require('./app');
const supertest = require('supertest');
const request = supertest(app);

it('responds to a location query', async done => {
  const response = await request.get('/49.9001165,-97.1389641');

  expect(response.body.latitude).toBe('49.9001165');
  expect(response.body.longitude).toBe('-97.1389641');

  expect(response.body.schools.division).toBe('Winnipeg');
  expect(response.body.schools.ward).toBe('6');

  expect(response.body.schools.trustees).toEqual([
    {
      name: 'Yijie (Jennifer) Chen',
      email: 'ychen@wsd1.org',
      phone: '204-789-0469',
      photo: 'Chen.jpg',
    },
  ]);

  expect(response.body.council.ward).toBe('Point Douglas');

  expect(response.body.council.councillor).toEqual({
    name: 'Vivian Santos',
    phone: '204-986-8401',
    email: 'VSantos@winnipeg.ca',
    photo: 'Santos.png',
  });

  done();
});

it('parses the councillor email properly', async done => {
  const response = await request.get('/49.77207304732028,-97.20588441358123');

  expect(response.body.council.councillor).toEqual({
    name: 'Janice Lukes',
    phone: '204-986-6824',
    email: 'Jlukes@winnipeg.ca',
    photo: 'lukes3.jpg',
  });

  done();
});

it('handles when there are no matching wards', async done => {
  const response = await request.get('/50.1418634,-96.877496');

  expect(response.body.schools).toBeUndefined();
  expect(response.body.council).toBeUndefined();

  done();
});

it('400s when the path doesn’t have a comma', async done => {
  const response = await request.get('/jortle');

  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Expected /lat,lng, got /jortle');
  done();
});

it('400s when the path has invalid coordinates', async done => {
  const response = await request.get('/1312,-1870.0');

  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Expected /lat,lng, got /1312,-1870.0');
  done();
});
