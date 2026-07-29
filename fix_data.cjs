const fs = require('fs');
let content = fs.readFileSync('src/data.ts', 'utf8');
content = content.replace(
  /\];[\s]*\{[\s]*id: "cert-7"/,
  ', { id: "cert-7"'
);
fs.writeFileSync('src/data.ts', content);
