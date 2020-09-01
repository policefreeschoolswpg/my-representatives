const app = require('./app');
const supertest = require('supertest');
const request = supertest(app);

it('responds', async done => {
  const response = await request.get('/');
  expect(response.body.message).toBe('hello');
  done();
});
