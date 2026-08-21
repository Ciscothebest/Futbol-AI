const fs = require('fs');

const filePath = 'C:/Users/franc/OneDrive/Escritorio/Futbol AI Local/frontend/app.js';
let content = fs.readFileSync(filePath, 'utf8');

if (content.includes('let currentPage = 1;')) {
  content = content.replace('let currentPage = 1;', 'currentPage = 1;');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('FIXED DUPLICATE CURRENT PAGE DECLARATION!');
} else {
  console.log('NO DUPLICATE CURRENT PAGE FOUND');
}
