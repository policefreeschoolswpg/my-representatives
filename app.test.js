const app = require('./app');
const supertest = require('supertest');
const request = supertest(app);

it('responds to a location query', async done => {
  const response = await request.get('/49.9001165,-97.1389641?postal-code=R3B%202Z1');

  expect(response.body.latitude).toBe('49.9001165');
  expect(response.body.longitude).toBe('-97.1389641');

  expect(response.body.schools.division).toBe('Winnipeg');
  expect(response.body.schools.ward).toBe('6');
  expect(response.body.schools.district).toBe('Inner City');

  expect(response.body.schools.trustees).toEqual([
    {
      name: 'Yijie (Jennifer) Chen',
      email: 'ychen@wsd1.org',
      phone: '204-789-0469',
      photo: '/photos/schools/Chen.jpg',
    },
  ]);

  expect(response.body.schools.candidates2022).toEqual([{
    "name": "Jamie BONNER",
    "email": "info@jamiebonner.com",
  }, {
    "name": "Luanne KARN",
    "phone": "204-999-8639",
    "email": "luannekarn@luannekarnwpg.com",
    "website": "https://www.luannekarnwpg.com/",
    "facebook": "https://www.facebook.com/groups/1491255174644419",
    "twitter": "https://twitter.com/KarnLuanne"
  }, {
    "name": "Perla JAVATE",
    "phone": "204-955-5603",
    "email": "perla@perlajavate.ca",
    "website": "http://www.perlajavate.ca",
    "facebook": "https://www.facebook.com/Perla-Javate-for-WSD-School%20Trustee-Ward-6-112318831590827"
  }]);

  expect(response.body.council.ward).toBe('Point Douglas');

  expect(response.body.council.councillor).toEqual({
    name: 'Vivian Santos',
    phone: '204-986-8401',
    email: 'VSantos@winnipeg.ca',
    photo: '/photos/council/Santos.png',
  });

  expect(response.body.council.candidates2022).toEqual([{
    "name": "Joe PEREIRA",
    "phone": "204-782-1047",
    "email": "Joe.Pereira@shaw.ca",
    "website": "http://www.votejoepereira.ca",
    "facebook": "https://www.facebook.com/profile.php?id=100007148748365",
    "twitter": "https://mobile.twitter.com/JoeApereira",
    "linkedin": "https://ca.linkedin.com/in/joe-pereira-43b8087b",
    "instagram": "https://www.instagram.com/joepereira3423/",
  }, {
    "name": "Moe ELTASSI",
    "phone": "204-430-2976",
    "email": "info@votemoeeltassi.com",
    "website": "http://votemoeeltassi.com",
  }, {
    "name": "Vivian SANTOS",
    "email": "info@vivian4pointdouglas.ca",
    "website": "http://www.vivian4pointdouglas.ca",
  }]);

  expect(response.body.manitoba.division).toBe('Point Douglas');

  expect(response.body.manitoba.member).toEqual({
    "name": "Bernadette Smith",
    "email": "Bernadette.Smith@leg.gov.mb.ca",
    "constituencyEmail": "bernadette.smith@yourmanitoba.ca",
    "phone": "(204) 945-3710",
    "constituencyPhone": "(204) 414-1477",
    "photo": "/photos/manitoba/smith.jpg"
  });

  done();
});

it('parses the councillor email properly', async done => {
  const response = await request.get('/49.77207304732028,-97.20588441358123');

  expect(response.body.council.councillor).toEqual({
    name: 'Janice Lukes',
    phone: '204-986-6824',
    email: 'Jlukes@winnipeg.ca',
    photo: '/photos/council/lukes3.jpg',
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
