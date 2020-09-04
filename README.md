# My Trustees API

This is an Express application that takes a latitude and longitude and returns the school division and ward for that position, if found.

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
    "ward": "6"
  },
  "council": {
    "ward": "Point Douglas",
    "councillor": {
      "name": "Vivian Santos",
      "phone": "204-986-8401",
      "email": "VSantos@winnipeg.ca"
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
