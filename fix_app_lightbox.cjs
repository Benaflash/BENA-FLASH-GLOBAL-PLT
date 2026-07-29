const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Import Lightbox
content = content.replace(
  'import { CorporateLanding } from "./components/CorporateLanding";',
  'import { CorporateLanding } from "./components/CorporateLanding";\nimport { Lightbox } from "./components/Lightbox";'
);

// 2. Add Lightbox state
content = content.replace(
  'const [selectedProject, setSelectedProject] = useState<Project | null>(null);',
  'const [selectedProject, setSelectedProject] = useState<Project | null>(null);\n  const [lightboxState, setLightboxState] = useState<{ images: string[], index: number } | null>(null);'
);

// 3. Update the filteredProjects.map image click to open lightbox or project details?
// The prompt says: "Implement a lightbox effect for the project gallery images in the 'CorporateLanding' and 'ProjectDetail' views to allow users to click and view high-resolution versions of the completed work."
// In the 'projects' tab (not CorporateLanding but they probably mean it), and 'ProjectDetail' modal.

// Let's modify the ProjectDetail modal first to have Lightbox for its images.
const projectDetailImages = `
                {selectedProject.images &&
                  selectedProject.images.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-[13px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-4 border-l-4 border-[#D4AF37] pl-3">
                        {lang === "MS" ? "Galeri Projek" : "Project Gallery"}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedProject.images.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-100 rounded-lg overflow-hidden aspect-video border border-slate-200 hover:shadow-lg transition cursor-pointer"
                            onClick={() => setLightboxState({ images: [selectedProject.img, ...(selectedProject.imgBefore ? [selectedProject.imgBefore] : []), ...(selectedProject.images || [])], index: (selectedProject.imgBefore ? 2 : 1) + idx })}
                          >
                            <img
                              src={optWebp(imgUrl)}
                              alt={${'`${selectedProject.title} ${idx + 1}`'}}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
`;

content = content.replace(
  /\{selectedProject\.images &&[\s\S]*?\{selectedProject\.documents &&/m,
  `${projectDetailImages}\n                {selectedProject.documents &&`
);

// Also modify the main selectedProject.img and imgBefore to open Lightbox
const projectDetailMainImages = `
              <div className="relative h-64 sm:h-80 md:h-96 w-full bg-slate-900 flex-shrink-0 cursor-pointer" onClick={() => setLightboxState({ images: [selectedProject.img, ...(selectedProject.imgBefore ? [selectedProject.imgBefore] : []), ...(selectedProject.images || [])], index: 0 })}>
                <img
                  src={optWebp(selectedProject.img)}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
`;
content = content.replace(
  /<div className="relative h-64 sm:h-80 md:h-96 w-full bg-slate-900 flex-shrink-0">[\s\S]*?<img[\s\S]*?src=\{optWebp\(selectedProject\.img\)\}[\s\S]*?\/>/m,
  projectDetailMainImages
);


// 4. Add Lightbox component at the end of the return statement
content = content.replace(
  '{/* END PUBLIC PORTAL */}',
  `{/* END PUBLIC PORTAL */}
      {lightboxState && (
        <Lightbox
          images={lightboxState.images}
          currentIndex={lightboxState.index}
          onClose={() => setLightboxState(null)}
          onNext={() => setLightboxState(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null)}
          onPrev={() => setLightboxState(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null)}
        />
      )}`
);

fs.writeFileSync('src/App.tsx', content);
