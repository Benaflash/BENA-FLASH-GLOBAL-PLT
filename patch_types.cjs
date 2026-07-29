const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(
  '  adminFeedback?: string; // Remark or update from admin',
  '  adminFeedback?: string; // Remark or update from admin\n  updatedAt?: string; // Timestamp of last update'
);
fs.writeFileSync('src/types.ts', content);
