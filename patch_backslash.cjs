const fs = require('fs');
let content = fs.readFileSync('src/components/WorkspaceIntegrations.tsx', 'utf8');

content = content.replace(
  'Authorization: \\`Bearer \\${cachedAccessToken}\\`',
  'Authorization: `Bearer ${cachedAccessToken}`'
);

fs.writeFileSync('src/components/WorkspaceIntegrations.tsx', content);
