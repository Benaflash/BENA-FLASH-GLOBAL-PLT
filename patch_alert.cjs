const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  '      alert("Ralat kritikal: Gagal menghantar permohonan sebut harga.");',
  '      alert("Ralat kritikal: Gagal menghantar permohonan sebut harga. Detail: " + err.message);'
);
fs.writeFileSync('src/App.tsx', content);
