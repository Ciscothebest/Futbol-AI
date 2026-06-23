const https = require('https');
const fs = require('fs');

const url = 'https://cdn.futbin.com/content/FIFA25/pfp/earth/231747.png';
const file = fs.createWriteStream("mbappe-futbin-25.png");
https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  res.pipe(file);
  file.on("finish", () => {
    file.close();
    console.log("Download Completed. Size:", fs.statSync("mbappe-futbin-25.png").size);
  });
});
