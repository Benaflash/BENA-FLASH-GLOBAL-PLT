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

    try {
      if (db) {
        await updateDoc(doc(db, "leads", id), { [field]: value });
      }
    } catch (e) {
      console.error(\`Gagal mengemaskini \${field} di Firestore\`, e);
    }
  };
`;

content = content.replace(
  /const handleUpdateLeadField = async[\s\S]*?console\.error\(\`Gagal mengemaskini \${field} di Firestore\`, e\);\n      }\n    }\n  };/,
  updateLeadFunc.trim()
);

fs.writeFileSync('src/App.tsx', content);
