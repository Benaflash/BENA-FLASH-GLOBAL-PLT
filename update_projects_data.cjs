const fs = require('fs');

let content = fs.readFileSync('src/data.ts', 'utf8');

content = content.replace(/"Electrical"/g, '"Electrical Installation"');
content = content.replace(/"Aircond"/g, '"Aircond Installation"');
content = content.replace(/"Solar PV"/g, '"Solar Installation"');
content = content.replace(/"Testing"/g, '"Testing & Commissioning"');
content = content.replace(/"M&E Works"/g, '"MSB & DB Installation"');

fs.writeFileSync('src/data.ts', content);
