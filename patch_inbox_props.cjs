const fs = require('fs');
let content = fs.readFileSync('src/components/LeadInbox.tsx', 'utf8');

content = content.replace(
  'onFeedbackChange: (id: string, feedback: string) => void;',
  'onFeedbackChange: (id: string, feedback: string) => void;\n  onUpdateField?: (id: string, field: string, value: any) => void;'
);

content = content.replace(
  '{ leads, onStatusChange, onFeedbackChange, onDelete }',
  '{ leads, onStatusChange, onFeedbackChange, onDelete, onUpdateField }'
);

content = content.replace(
  'const url = \`/api/update-lead/\${lead.id}\`;',
  'if (onUpdateField) { onUpdateField(lead.id, "estimatedCompletionDate", e.target.value); }'
);

fs.writeFileSync('src/components/LeadInbox.tsx', content);
