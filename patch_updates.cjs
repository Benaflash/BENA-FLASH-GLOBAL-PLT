const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. handleLeadStatusChange
content = content.replace(
  '        leadToUpdate = { ...L, status: nextStatus };',
  '        leadToUpdate = { ...L, status: nextStatus, updatedAt: new Date().toISOString() };'
);
content = content.replace(
  '      await updateDoc(doc(db, "leads", id), { status: nextStatus });',
  '      await updateDoc(doc(db, "leads", id), { status: nextStatus, updatedAt: new Date().toISOString() });'
);

// 2. handleUpdateLeadField
content = content.replace(
  '        leadToUpdate = { ...L, [field]: value };',
  '        leadToUpdate = { ...L, [field]: value, updatedAt: new Date().toISOString() };'
);
content = content.replace(
  '        await updateDoc(doc(db, "leads", id), { [field]: value });',
  '        await updateDoc(doc(db, "leads", id), { [field]: value, updatedAt: new Date().toISOString() });'
);

// 3. handleLeadFeedbackChange
content = content.replace(
  '        leadToUpdate = { ...L, adminFeedback: feedback };',
  '        leadToUpdate = { ...L, adminFeedback: feedback, updatedAt: new Date().toISOString() };'
);
content = content.replace(
  '      await updateDoc(doc(db, "leads", id), { adminFeedback: feedback });',
  '      await updateDoc(doc(db, "leads", id), { adminFeedback: feedback, updatedAt: new Date().toISOString() });'
);

fs.writeFileSync('src/App.tsx', content);
