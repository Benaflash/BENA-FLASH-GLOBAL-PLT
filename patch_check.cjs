const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldCheck = `  const handleCheckStatus = async () => {
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
    } catch (err: any) {`;

const newCheck = `  const handleCheckStatus = async (overrideId?: string) => {
    const targetId = overrideId || checkerId;
    if (!targetId.trim() && !checkerKawasan) {
      setCheckerError("Sila masukkan ID Rujukan / No Telefon atau pilih kawasan.");
      return;
    }
    setIsChecking(true);
    setCheckerError("");
    setCheckedLeads([]);
    try {
      if (targetId.trim().startsWith("lead-")) {
        // Find by ID directly
        const docSnap = await getDoc(doc(db, "leads", targetId.trim()));
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
        if (targetId.trim() && checkerKawasan) {
           q = query(leadsRef, where("phone", "==", targetId.trim()), where("location", "==", checkerKawasan));
        } else if (targetId.trim()) {
           q = query(leadsRef, where("phone", "==", targetId.trim()));
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
    } catch (err: any) {`;

content = content.replace(oldCheck, newCheck);
fs.writeFileSync('src/App.tsx', content);
