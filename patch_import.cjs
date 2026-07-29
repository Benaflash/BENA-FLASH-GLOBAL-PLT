const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'import { WorkspaceIntegrations } from "./components/WorkspaceIntegrations";\\nimport {  CompanyInfo,',
  'import {  CompanyInfo,'
);

content = content.replace(
  'import { WorkspaceIntegrations } from "./components/WorkspaceIntegrations";\nimport {  CompanyInfo,',
  'import {  CompanyInfo,'
);

content = 'import { WorkspaceIntegrations } from "./components/WorkspaceIntegrations";\n' + content;

fs.writeFileSync('src/App.tsx', content);
