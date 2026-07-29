const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update state
content = content.replace(
  'const [checkedLead, setCheckedLead] = useState<LeadQuote | null>(null);',
  'const [checkedLeads, setCheckedLeads] = useState<LeadQuote[]>([]);\n  const [checkerKawasan, setCheckerKawasan] = useState<string>("");'
);

// Update search logic
const newSearchLogic = `  const handleCheckStatus = async () => {
    if (!checkerId.trim() && !checkerKawasan) {
      setCheckerError("Sila masukkan ID Rujukan / No Telefon atau pilih kawasan.");
      return;
    }
    setIsChecking(true);
    setCheckerError("");
    setCheckedLeads([]);
    try {
      if (checkerId.trim().startsWith("lead-")) {
        // Find by ID directly
        const docSnap = await getDoc(doc(db, "leads", checkerId.trim()));
        if (docSnap.exists()) {
          const data = docSnap.data() as LeadQuote;
          if (checkerKawasan && data.location.toLowerCase() !== checkerKawasan.toLowerCase()) {
             setCheckerError("ID ditemui tetapi kawasan tidak sepadan.");
          } else {
             setCheckedLeads([{ id: docSnap.id, ...data }]);
             localStorage.setItem("bfg_last_lead_id", docSnap.id);
          }
        } else {
          setCheckerError("ID Rujukan sebut harga tidak dijumpai. Sila pastikan kod betul.");
        }
      } else {
        // Query by Kawasan or Phone
        const leadsRef = collection(db, "leads");
        let q;
        if (checkerId.trim() && checkerKawasan) {
           q = query(leadsRef, where("phone", "==", checkerId.trim()), where("location", "==", checkerKawasan));
        } else if (checkerId.trim()) {
           q = query(leadsRef, where("phone", "==", checkerId.trim()));
        } else if (checkerKawasan) {
           q = query(leadsRef, where("location", "==", checkerKawasan));
        }
        
        if (q) {
          const querySnapshot = await getDocs(q);
          if (querySnapshot.empty) {
            setCheckerError("Tiada rekod dijumpai untuk carian ini.");
          } else {
            const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeadQuote));
            setCheckedLeads(results);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setCheckerError("Ralat talian atau carian tidak sah. Sila cuba seketika lagi.");
    } finally {
      setIsChecking(false);
    }
  };`;

content = content.replace(
  /const handleCheckStatus = async \(targetId: string\) => {[\s\S]*?setIsChecking\(false\);\n    }\n  };/,
  newSearchLogic
);

// Update input bindings
content = content.replace(
  'onClick={() => handleCheckStatus(checkerId)}',
  'onClick={() => handleCheckStatus()}'
);

fs.writeFileSync('src/App.tsx', content);
