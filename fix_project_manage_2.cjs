const fs = require('fs');

let content = fs.readFileSync('src/components/ProjectManage.tsx', 'utf8');

// 1. In handleSubmit
content = content.replace(
  'documents: documentsArray,\n    });',
  `documents: documentsArray,\n      coordinates: formData.lat && formData.lng ? { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) } : undefined,\n      milestones: formData.milestones,\n    });`
);

content = content.replace(
  'documentsText: "",\n    });',
  `documentsText: "",\n      lat: "",\n      lng: "",\n      milestones: [],\n    });`
);

// 2. Add coordinates to the edit fields
content = content.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">',
  `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-1">Latitud Lokasi</label>
                              <input type="text" value={proj.coordinates?.lat || ''} onChange={(e) => {
                                const lat = parseFloat(e.target.value);
                                handleEditChange(proj.id, "coordinates", { ...proj.coordinates, lat: isNaN(lat) ? 0 : lat });
                              }} className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-1">Longitud Lokasi</label>
                              <input type="text" value={proj.coordinates?.lng || ''} onChange={(e) => {
                                const lng = parseFloat(e.target.value);
                                handleEditChange(proj.id, "coordinates", { ...proj.coordinates, lng: isNaN(lng) ? 0 : lng });
                              }} className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none" />
                            </div>`
);

// 3. Add Milestones timeline editor to the edit form
const timelineEditor = `
                            <div className="lg:col-span-3 mt-4 border-t border-slate-200 pt-4">
                              <label className="block text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">Milestones Timeline Projek</label>
                              
                              <div className="space-y-2 mb-3">
                                {proj.milestones?.map((m: any, idx: number) => (
                                  <div key={m.id || idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                                    <input type="text" value={m.title} onChange={(e) => {
                                      const ms = [...(proj.milestones || [])];
                                      ms[idx] = { ...ms[idx], title: e.target.value };
                                      handleEditChange(proj.id, "milestones", ms as any);
                                    }} placeholder="Tajuk (cth: Wiring)" className="flex-1 text-xs p-2 border border-slate-300 rounded" />
                                    
                                    <input type="date" value={m.date} onChange={(e) => {
                                      const ms = [...(proj.milestones || [])];
                                      ms[idx] = { ...ms[idx], date: e.target.value };
                                      handleEditChange(proj.id, "milestones", ms as any);
                                    }} className="w-32 text-xs p-2 border border-slate-300 rounded" />
                                    
                                    <select value={m.status} onChange={(e) => {
                                      const ms = [...(proj.milestones || [])];
                                      ms[idx] = { ...ms[idx], status: e.target.value };
                                      handleEditChange(proj.id, "milestones", ms as any);
                                    }} className="w-32 text-xs p-2 border border-slate-300 rounded">
                                      <option value="Pending">Pending</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Completed">Completed</option>
                                    </select>

                                    <button type="button" onClick={() => {
                                      const ms = proj.milestones?.filter((_, i) => i !== idx);
                                      handleEditChange(proj.id, "milestones", ms as any);
                                    }} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                ))}
                              </div>
                              
                              <button type="button" onClick={() => {
                                const ms = [...(proj.milestones || []), { id: Date.now().toString(), title: '', date: '', status: 'Pending' }];
                                handleEditChange(proj.id, "milestones", ms as any);
                              }} className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:text-blue-800"><Plus className="w-4 h-4"/> Tambah Milestone</button>
                            </div>
`;

content = content.replace(
  '<div className="flex justify-end pt-1">',
  `${timelineEditor}\n                          <div className="flex justify-end pt-1">`
);

fs.writeFileSync('src/components/ProjectManage.tsx', content);
