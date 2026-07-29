const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '{checkedLead && (',
  '{checkedLeads.length > 0 && checkedLeads.map((checkedLead, _idx) => ('
);

content = content.replace(
  '                          <motion.div\n                            initial={{ opacity: 0, y: 10 }}',
  '                          <motion.div\n                            key={checkedLead.id}\n                            initial={{ opacity: 0, y: 10 }}'
);

// find the end of the motion.div and replace it with `))}
const endMarker = `                              )}
                            </div>
                          </motion.div>
                        )}`;

const newEndMarker = `                              )}
                            </div>
                          </motion.div>
                        ))}`;

content = content.replace(endMarker, newEndMarker);

fs.writeFileSync('src/App.tsx', content);
