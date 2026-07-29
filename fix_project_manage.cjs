const fs = require('fs');

let content = fs.readFileSync('src/components/ProjectManage.tsx', 'utf8');

// 1. Add imports
content = content.replace(
  'import { optWebp } from "../data";',
  `import { optWebp } from "../data";\nimport { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";\n\nconst mapContainerStyle = { width: '100%', height: '400px', borderRadius: '12px' };\nconst defaultCenter = { lat: 3.1390, lng: 101.6869 }; // KL`
);

// 2. Add state for maps and timeline
content = content.replace(
  'documentsText: "",\n  });',
  `documentsText: "",\n    lat: "",\n    lng: "",\n    milestones: [] as any[],\n  });`
);

// 3. Add Google Maps preview before the table
const mapHtml = `
      <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6 mb-6">
        <h4 className="text-sm font-extrabold uppercase text-[#0F172A] tracking-wider mb-4 border-l-4 border-[#D4AF37] pl-3">
          Peta Lokasi Projek Aktif
        </h4>
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY || import.meta.env.GOOGLE_PLACES_API_KEY || ""}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={8}
          >
            {projects.map((p) => p.coordinates && p.coordinates.lat && p.coordinates.lng ? (
              <Marker
                key={p.id}
                position={{ lat: p.coordinates.lat, lng: p.coordinates.lng }}
                title={p.title}
                label={p.title.charAt(0)}
              />
            ) : null)}
          </GoogleMap>
        </LoadScript>
      </div>
`;
content = content.replace(
  '<div className="bg-white border border-slate-200 shadow-md rounded-2xl overflow-hidden">',
  `${mapHtml}\n      <div className="bg-white border border-slate-200 shadow-md rounded-2xl overflow-hidden">`
);

fs.writeFileSync('src/components/ProjectManage.tsx', content);
