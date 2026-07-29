const fs = require('fs');
let content = fs.readFileSync('src/components/CorporateLanding.tsx', 'utf8');

content = content.replace(
  'const t = translations[lang];',
  'const t = translations[lang];\n  const [lightboxState, setLightboxState] = useState<{ images: string[], index: number } | null>(null);'
);

fs.writeFileSync('src/components/CorporateLanding.tsx', content);
