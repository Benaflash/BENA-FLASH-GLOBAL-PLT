const fs = require('fs');

let content = fs.readFileSync('src/components/CorporateLanding.tsx', 'utf8');

content = content.replace(
  'lang = "MS",\n}: {',
  'lang = "MS",\n}: {\n  services?: any[];\n  clientLogos?: any[];\n  companyInfo?: any;\n  lang?: "MS" | "EN";\n}) => {\n  const [lightboxState, setLightboxState] = useState<{ images: string[], index: number } | null>(null);'
);

// We need to carefully replace it. 
// Actually, let's just use regex.

content = fs.readFileSync('src/components/CorporateLanding.tsx', 'utf8');
content = content.replace(
  /export const CorporateLanding = \(\{[\s\S]*?\} \=\> \{/,
  `$&
  const [lightboxState, setLightboxState] = useState<{ images: string[], index: number } | null>(null);`
);

fs.writeFileSync('src/components/CorporateLanding.tsx', content);
