# My Trustees API

This is an Express application that takes a latitude and longitude and returns the Winnipeg city council ward/councillor and school division/ward/trustee(s) for that position, if found.

Example query (for City Hall, 510 Main):

```
GET /49.9001165,-97.1389641
```

Response:

```
{
  "latitude": "49.9001165",
  "longitude": "-97.1389641",
  "schools": {
    "division": "Winnipeg",
    "ward": "6",
    "trustees": [
      {
        "name": "Yijie (Jennifer) Chen",
        "email": "ychen@wsd1.org",
        "phone": "204-789-0469",
        "photo": "/photos/schools/Chen.jpg"
      }
    ]
  },
  "council": {
    "ward": "Point Douglas",
    "councillor": {
      "name": "Vivian Santos",
      "phone": "204-986-8401",
      "photo": "/photos/council/Santos.png",
      "email": "VSantos@winnipeg.ca"
    }
  },
  "manitoba": {
    "division": "Point Douglas",
    "member": {
      "name": "Bernadette Smith",
      "email": "Bernadette.Smith@leg.gov.mb.ca",
      "constituencyEmail": "bernadette.smith@yourmanitoba.ca",
      "phone": "(204) 945-3710",
      "constituencyPhone": "(204) 414-1477",
      "photo": "/photos/manitoba/smith.jpg"
    }
  }
}
```

It uses [Node](https://nodejs.org/en/download/) and [Yarn](https://classic.yarnpkg.com/en/docs/install/).

```
yarn install
yarn start
```

## Tests

```
yarn test
```
