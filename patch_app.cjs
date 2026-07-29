const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const updateLeadFunc = `
  const handleUpdateLeadField = async (id: string, field: string, value: any) => {
    let leadToUpdate: any = undefined;
    const updated = leads.map((L) => {
      if (L.id === id) {
        leadToUpdate = { ...L, [field]: value };
        return leadToUpdate;
      }
      return L;
    });
    setLeads(updated as any);
    saveToLocal("bfg_leads", updated);

    if (leadToUpdate && dbRef.current) {
      try {
        const updateDoc = {
          fields: {
            [field]: { stringValue: value },
          },
        };
        const updateUrl = \`https://firestore.googleapis.com/v1/projects/\${FIRESTORE_PROJECT_ID}/databases/\${FIRESTORE_DB_ID}/documents/leads/\${leadToUpdate.id}?updateMask.fieldPaths=\${field}&key=\${FIREBASE_API_KEY}\`;
        
        await fetch(updateUrl, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateDoc),
        });
      } catch (e) {
        console.error(\`Gagal mengemaskini \${field} di Firestore\`, e);
      }
    }
  };
`;

content = content.replace(
  'const handleLeadFeedbackChange = async (id: string, feedback: string) => {',
  updateLeadFunc + '\n  const handleLeadFeedbackChange = async (id: string, feedback: string) => {'
);

// Inject UI logic for estimatedCompletionDate in CustomerPortal/CheckedLead
const uiTarget = `                              <div className="mt-1">
                                <span className="text-[8px] font-bold text-slate-400 uppercase block mt-1">
                                  Nota Khas Daripada Jurutera / Admin:
                                </span>
                                {checkedLead.adminFeedback ? (
                                  <p className="font-semibold text-slate-800 leading-relaxed bg-yellow-50/50 p-2 border border-yellow-250/30 rounded-lg mt-1 text-[11px] whitespace-pre-wrap">
                                    💬 {checkedLead.adminFeedback}
                                  </p>
                                ) : (
                                  <p className="text-slate-400 italic mt-0.5 text-[10px]">
                                    Pegawai sedang memperincikan dokumen. Sila
                                    lawati seketika lagi untuk menerima
                                    pengesahan.
                                  </p>
                                )}
                              </div>`;

const newUiTarget = `                              <div className="mt-1">
                                <span className="text-[8px] font-bold text-slate-400 uppercase block mt-1">
                                  Nota Khas Daripada Jurutera / Admin:
                                </span>
                                {checkedLead.adminFeedback ? (
                                  <p className="font-semibold text-slate-800 leading-relaxed bg-yellow-50/50 p-2 border border-yellow-250/30 rounded-lg mt-1 text-[11px] whitespace-pre-wrap">
                                    💬 {checkedLead.adminFeedback}
                                  </p>
                                ) : (
                                  <p className="text-slate-400 italic mt-0.5 text-[10px]">
                                    Pegawai sedang memperincikan dokumen. Sila
                                    lawati seketika lagi untuk menerima
                                    pengesahan.
                                  </p>
                                )}
                              </div>
                              {checkedLead.estimatedCompletionDate && (
                                <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                                  <span className="text-[9px] font-bold text-blue-800 uppercase tracking-wider">Tarikh Dijangka Selesai:</span>
                                  <span className="font-mono text-[10px] font-bold text-blue-900 bg-white px-2 py-1 rounded shadow-sm border border-blue-100">{checkedLead.estimatedCompletionDate}</span>
                                </div>
                              )}`;

content = content.replace(uiTarget, newUiTarget);

fs.writeFileSync('src/App.tsx', content);
