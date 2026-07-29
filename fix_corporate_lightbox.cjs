const fs = require('fs');

let content = fs.readFileSync('src/components/CorporateLanding.tsx', 'utf8');

// 1. Add import for Lightbox
content = content.replace(
  'import { optWebp } from "../data";',
  'import { optWebp } from "../data";\nimport { Lightbox } from "./Lightbox";\nimport { useState } from "react";'
);

// 2. Add state
content = content.replace(
  'const IconMap: Record<string, React.ElementType> = {',
  '  const [lightboxState, setLightboxState] = useState<{ images: string[], index: number } | null>(null);\nconst IconMap: Record<string, React.ElementType> = {'
);
// Wait, IconMap is outside the component.
content = fs.readFileSync('src/components/CorporateLanding.tsx', 'utf8');
content = content.replace(
  'import { optWebp } from "../data";',
  'import { optWebp } from "../data";\nimport { Lightbox } from "./Lightbox";\nimport { useState } from "react";'
);
content = content.replace(
  'export function CorporateLanding({',
  'export function CorporateLanding({\n  services,\n  clientLogos,\n  companyInfo,\n  lang,\n}: CorporateLandingProps) {\n  const [lightboxState, setLightboxState] = useState<{ images: string[], index: number } | null>(null);\n'
);

// We need to clean up the existing signature.
const existingSig = `export function CorporateLanding({
  services,
  clientLogos,
  companyInfo,
  lang,
}: CorporateLandingProps) {`;
content = content.replace(
  existingSig,
  `${existingSig}\n  const [lightboxState, setLightboxState] = useState<{ images: string[], index: number } | null>(null);`
);

// 3. Make the image clickable
const imgHtml = `
                {svc.imageUrl ? (
                  <div 
                    className="h-44 sm:h-48 w-full bg-slate-100 relative overflow-hidden cursor-pointer"
                    onClick={() => setLightboxState({ images: [svc.imageUrl!], index: 0 })}
                  >
                    <img
                      src={optWebp(svc.imageUrl)}
                      alt={svc.title}
`;

content = content.replace(
  /\{svc\.imageUrl \? \([\s\S]*?<div className="h-44 sm:h-48 w-full bg-slate-100 relative overflow-hidden">[\s\S]*?<img[\s\S]*?alt=\{svc\.title\}/,
  imgHtml
);

// 4. Add the Lightbox to the bottom
content = content.replace(
  '      </div>\n    </div>\n  );\n}',
  `      </div>\n      {lightboxState && (\n        <Lightbox\n          images={lightboxState.images}\n          currentIndex={lightboxState.index}\n          onClose={() => setLightboxState(null)}\n          onNext={() => setLightboxState(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null)}\n          onPrev={() => setLightboxState(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null)}\n        />\n      )}\n    </div>\n  );\n}`
);

fs.writeFileSync('src/components/CorporateLanding.tsx', content);
