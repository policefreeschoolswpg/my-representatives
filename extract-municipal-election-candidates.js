const fs = require('fs');
const sortBy = require('lodash.sortby');

// The raw data is from https://data.winnipeg.ca/Council-Services/Municipal-Election-Candidates/2mg6-4yyj/data
const rawData = JSON.parse(fs.readFileSync('data/municipal-election-candidates-raw.json')).data;

const ELECTION_DATE_COLUMN = 9;
const ELECTION_DATE_2022 = "2022-10-26T00:00:00";

const CANDIDATE_NAME_COLUMN = 11;
const POSITION_COLUMN = 12;
const STATUS_COLUMN = 14;

const COUNCIL_WARD_COLUMN = 15;
const SCHOOL_DIVISION_COLUMN = 16;
const SCHOOL_DIVISION_WARD_COLUMN = 17;

const PHONE_COLUMN = 18;
const EMAIL_COLUMN = 19;
const WEBSITE_COLUMN = 20;

const FACEBOOK_COLUMN = 23;
const TWITTER_COLUMN = 24;
const LINKEDIN_COLUMN = 25;
const INSTAGRAM_COLUMN = 26;

const data2022 = rawData.filter(row => row[ELECTION_DATE_COLUMN] === ELECTION_DATE_2022 && row[STATUS_COLUMN] === "Nominated");

const councilWardsToCandidates = {};
const schoolDivisionsToWardsToCandidates = {};

data2022.forEach(row => {
  if (row[POSITION_COLUMN] === "Councillor") {
    const ward = row[COUNCIL_WARD_COLUMN];

    councilWardsToCandidates[ward] ||= [];

    const candidate = {
      name: row[CANDIDATE_NAME_COLUMN],
      ...extractContactDetails(row)
    };

    councilWardsToCandidates[ward].push(candidate);
  } else if (row[POSITION_COLUMN] === "School Trustee") {
    const division = row[SCHOOL_DIVISION_COLUMN];
    const ward = row[SCHOOL_DIVISION_WARD_COLUMN];

    schoolDivisionsToWardsToCandidates[division] ||= {};
    schoolDivisionsToWardsToCandidates[division][ward] ||= [];

    const candidate = {
      name: row[CANDIDATE_NAME_COLUMN],
      ...extractContactDetails(row)
    };

    schoolDivisionsToWardsToCandidates[division][ward].push(candidate);
  }
});

Object.keys(councilWardsToCandidates).forEach(ward => {
  councilWardsToCandidates[ward] = sortBy(councilWardsToCandidates[ward], ['name']);
});

Object.keys(schoolDivisionsToWardsToCandidates).forEach(division => {
  const wardsToCandidates = schoolDivisionsToWardsToCandidates[division];

  Object.keys(wardsToCandidates).forEach(ward => {
    wardsToCandidates[ward] = sortBy(wardsToCandidates[ward], ['name']);
  });
})

fs.writeFileSync('data/municipal-election-candidates-2022.json', JSON.stringify({
  council: councilWardsToCandidates,
  schools: schoolDivisionsToWardsToCandidates,
}, null, 2));

function extractContactDetails(row) {
  const candidate = {};

  if (row[PHONE_COLUMN]) candidate.phone = row[PHONE_COLUMN];
  if (row[EMAIL_COLUMN]) candidate.email = row[EMAIL_COLUMN];
  if (row[WEBSITE_COLUMN]) candidate.website = row[WEBSITE_COLUMN][0];

  if (row[FACEBOOK_COLUMN]) candidate.facebook = row[FACEBOOK_COLUMN][0];
  if (row[TWITTER_COLUMN]) candidate.twitter = row[TWITTER_COLUMN][0];
  if (row[LINKEDIN_COLUMN]) candidate.linkedin = row[LINKEDIN_COLUMN][0];
  if (row[INSTAGRAM_COLUMN]) candidate.instagram = row[INSTAGRAM_COLUMN][0];

  return candidate;
}
