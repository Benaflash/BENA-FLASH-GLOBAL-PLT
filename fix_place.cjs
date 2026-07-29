const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'let placeId = process.env.GOOGLE_PLACE_ID;',
  'let placeId = "ChIJ9Ztd7P2xyDERhp6V24En8tk"; // Use real BFG place ID'
);

fs.writeFileSync('server.ts', content);
