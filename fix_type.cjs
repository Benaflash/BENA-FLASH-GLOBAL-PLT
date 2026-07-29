const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  'return docSnap.data().role as UserRole;',
  'return (docSnap.data() as any).role as UserRole;'
);
fs.writeFileSync('src/App.tsx', content);
