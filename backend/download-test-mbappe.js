const https = require('https');
const fs = require('fs');

const url = 'https://cdn.sofifa.net/players/231/747/25_120.png';
const file = fs.createWriteStream("mbappe.png");
https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  res.pipe(file);
  file.on("finish", () => {
    file.close();
    console.log("Download Completed. Size:", fs.statSync("mbappe.png").size);
  });
});
