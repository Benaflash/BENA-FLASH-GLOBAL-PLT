const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'onFeedbackChange={handleLeadFeedbackChange}',
  'onFeedbackChange={handleLeadFeedbackChange}\n                              onUpdateField={handleUpdateLeadField}'
);

fs.writeFileSync('src/App.tsx', content);
