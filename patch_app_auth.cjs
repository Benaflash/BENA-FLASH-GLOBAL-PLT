const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '  OperationType,\n} from "./lib/firebase";',
  '  OperationType,\n  setCachedAccessToken,\n} from "./lib/firebase";'
);

content = content.replace(
  '      const credential = GoogleAuthProvider.credentialFromResult(result);',
  '      const credential = GoogleAuthProvider.credentialFromResult(result);\n      if (credential?.accessToken) { setCachedAccessToken(credential.accessToken); }'
);

content = content.replace(
  '    setLoggedInRole(null);',
  '    setLoggedInRole(null);\n    setCachedAccessToken(null);'
);

fs.writeFileSync('src/App.tsx', content);
