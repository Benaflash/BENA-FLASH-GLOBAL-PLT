const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const tokenCode = `
export let cachedAccessToken: string | null = null;
export function setCachedAccessToken(token: string | null) {
  cachedAccessToken = token;
}
`;

content = content + tokenCode;

fs.writeFileSync('src/lib/firebase.ts', content);
