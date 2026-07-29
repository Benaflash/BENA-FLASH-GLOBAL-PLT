const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeadQuote));',
  'const results = querySnapshot.docs.map(doc => { const data = doc.data() as LeadQuote; return { id: doc.id, ...data }; });'
);

fs.writeFileSync('src/App.tsx', content);
