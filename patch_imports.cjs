const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '  getDoc as _getDoc,\n} from "firebase/firestore";',
  '  getDoc as _getDoc,\n  query,\n  where,\n  getDocs as _getDocs,\n} from "firebase/firestore";\nconst getDocs = async (queryRef: any) => { return _getDocs(queryRef); };'
);

fs.writeFileSync('src/App.tsx', content);
