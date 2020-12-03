const parse = require('csv-parse/lib/sync');
const fs = require('fs');

const data = parse(
  fs.readFileSync('data/wsd-postal-codes.csv'),
  {
    columns: false,
    relax_column_count: true,
  }
);

const rowsWithPostalCodes = data.filter( ([ , , , possibleCode]) => possibleCode.match(/^\w\d\w \d\w\d$/));

const postalCodeToHighSchool = rowsWithPostalCodes.reduce((postalCodeToHighSchool, row) => {
  postalCodeToHighSchool[row[3]] = row[7];
  return postalCodeToHighSchool;
}, {});

fs.writeFileSync('data/wsd-postal-code-to-high-school.json', JSON.stringify(postalCodeToHighSchool, null, 2));
