const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The error was adding an extra </div>
content = content.replace(
  '                          </motion.div>\n                        )}\n                      </div>\n                      </div>',
  '                          </motion.div>\n                        )}\n                      </div>'
);

fs.writeFileSync('src/App.tsx', content);
