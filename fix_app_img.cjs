const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const mainImgHTML = `              <div className="relative h-64 bg-slate-100 cursor-pointer" onClick={() => setLightboxState({ images: [selectedProject.img, ...(selectedProject.imgBefore ? [selectedProject.imgBefore] : []), ...(selectedProject.images || [])], index: 0 })}>
                <img
                  src={optWebp(selectedProject.img)}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  width="800"
                  height="400"
                />`;

content = content.replace(
  /<div className="relative h-64 bg-slate-100">[\s\S]*?<img[\s\S]*?height="400"[\s\S]*?\/>/,
  mainImgHTML
);

fs.writeFileSync('src/App.tsx', content);
