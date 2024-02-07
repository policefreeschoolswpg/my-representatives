# My Representatives API

🚨 As of February 2024 this is only up to date for Winnipeg city council!

This is an Express application that takes a latitude and longitude and returns the following, if found:

* Winnipeg city council ward/councillor
* school division/ward/trustee(s)
* Manitoba electoral division/MLA
* candidate information for 2022 municipal election

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

Data sources from `/data` are also served directly for programmatic consumption, such as on [this interactive map](https://policefreeschoolswpg.ca/action/) that shows school division wards.

Representative photos are served from `/photos` when available.

It uses [Node](https://nodejs.org/en/download/) and [Yarn](https://classic.yarnpkg.com/en/docs/install/).

```
yarn install
yarn start
```

## Tests

```
yarn test
```

## Data

These governing bodies shamefully lack official structured data sources to enumerate the names and contact information for the people whose decisions affect our lives. This repository is an attempt to synthesise such data sources from unstructured places using scripts where feasible or manually when not.

* Winnipeg city council: `council-contacts.json` is from [here](https://data.winnipeg.ca/resource/r4tk-7dip.json), `council-wards.geojson` from [here](https://data.winnipeg.ca/Council-Services/Electoral-Ward/ede3-teb8)
* Winnipeg area school trustees: `school-division-contacts.json` is a JSON export from a spreadsheet manually compiled from the disparate school division sites
* Winnipeg School Division wards: `wsd-postal-code-to-district.json` is generated by `extract-wsd-catchments.js` as described in 9b0f368
* MLAs: `manitoba-contacts.json` is extracted from the creaky, apparently-hand-maintained [government site](https://www.gov.mb.ca/legislature/members/mla_list_alphabetical.html) using `extract-mlas.js`

## Avenues for improvement

* code autoformatting
* testing in CI
* versioning
* support for historic data vs just “right now”
* school trustee information for all of Manitoba
* automation of data extraction to keep up on changes
* embeddable widget to interface with this data such as [here](https://winnipegpolicecauseharm.org/blog/our-city-is-unwell/)
