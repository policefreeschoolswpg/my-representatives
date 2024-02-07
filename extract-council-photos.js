const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream");
const { promisify } = require("util");

const pipelineAsync = promisify(pipeline);

async function downloadImage(url, imagePath) {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

  await pipelineAsync(response.body, fs.createWriteStream(imagePath));
}

async function processJsonFile(inputFilePath) {
  const inputData = JSON.parse(fs.readFileSync(inputFilePath, "utf8"));
  const outputData = [];

  for (const item of inputData) {
    if (!item.current_council) {
      continue;
    }

    const filename = path.basename(item.portrait);
    const photoPath = path.join("photos", "council", filename);
    const photoUrl = hackPhotoUrl(item.portrait);

    try {
      await downloadImage(photoUrl, path.join(__dirname, photoPath));
      outputData.push({ name: item.person, photo: filename });
    } catch (error) {
      console.error(`Failed to download image from ${photoUrl}: ${error}`);
    }
  }

  fs.writeFileSync(
    path.join(__dirname, "data/council-photos.json"),
    JSON.stringify(outputData, null, 2)
  );
}

function hackPhotoUrl(url) {
  return url.replace(
    /winnipeg\.ca\/[C|c]ouncil/,
    "//legacy.winnipeg.ca/council"
  );
}

const inputFilePath = path.join(__dirname, "data/council-contacts.json");
processJsonFile(inputFilePath).then(() => console.log("Processing complete."));
