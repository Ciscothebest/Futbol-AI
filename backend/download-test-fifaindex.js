const https = require('https');
const fs = require('fs');

const url = 'https://fifastatic.fifaindex.com/FIFA24/players/231747.png';
const file = fs.createWriteStream("mbappe-fifaindex.png");
https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  res.pipe(file);
  file.on("finish", () => {
    file.close();
    console.log("Download Completed. Size:", fs.statSync("mbappe-fifaindex.png").size);
  });
});
