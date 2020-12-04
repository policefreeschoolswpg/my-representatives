const parse = require('csv-parse/lib/sync');
const fs = require('fs');

const highSchoolToDistrict = JSON.parse(fs.readFileSync('data/wsd-high-school-to-district.json'));

const data = parse(
  fs.readFileSync('data/wsd-postal-codes.csv'),
  {
    columns: false,
    relax_column_count: true,
  }
);

const rowsWithPostalCodes = data.filter( ([ , , , possibleCode]) => possibleCode.match(/^\w\d\w \d\w\d$/));

const postalCodeToHighSchool = rowsWithPostalCodes.reduce((postalCodeToHighSchool, row) => {
  const school = row[7];
  const district = highSchoolToDistrict[school];
  postalCodeToHighSchool[row[3]] = district;
  return postalCodeToHighSchool;
}, {});

fs.writeFileSync('data/wsd-postal-code-to-district.json', JSON.stringify(postalCodeToHighSchool, null, 2));
