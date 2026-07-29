const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
content = content.replace(
  'import {  CompanyInfo,',
  'import { WorkspaceIntegrations } from "./components/WorkspaceIntegrations";\nimport {  CompanyInfo,'
);

// Add tab
const newTab = `                        {
                          id: "workspace",
                          label: "Google Workspace",
                          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
                        },
                      ]
                        .filter((item) => item.roles.includes(loggedInRole))`;
content = content.replace(
  '                      ]\n                        .filter((item) => item.roles.includes(loggedInRole))',
  newTab
);

// Add active section
const newSection = `                          {adminActiveSection === "faqs" && (
                            <motion.div`;

const sectionReplacement = `                          {adminActiveSection === "workspace" && (
                            <WorkspaceIntegrations />
                          )}

                          {adminActiveSection === "faqs" && (
                            <motion.div`;
content = content.replace(newSection, sectionReplacement);

fs.writeFileSync('src/App.tsx', content);
