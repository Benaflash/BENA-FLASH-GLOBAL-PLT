const fs = require('fs');

let content = fs.readFileSync('src/components/ProjectManage.tsx', 'utf8');

content = content.replace(
  'const handleEditChange = (id: string, field: string, value: string) => {',
  'const handleEditChange = (id: string, field: string, value: any) => {'
);

fs.writeFileSync('src/components/ProjectManage.tsx', content);
