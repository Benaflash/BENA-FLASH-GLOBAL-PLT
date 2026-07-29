const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const helperFunctions = `
  const handleCetak = (lead: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(\`
        <html>
          <head>
            <title>Status Permohonan - \${lead.id}</title>
            <style>
              body { font-family: sans-serif; padding: 20px; color: #333; }
              .card { border: 1px solid #ccc; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto; }
              h2 { color: #0F172A; margin-top: 0; font-size: 18px; text-transform: uppercase; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; }
              .row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; font-size: 14px; }
              .label { font-weight: bold; color: #555; }
              .status { font-weight: bold; background: #eee; padding: 2px 6px; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>Maklumat Permohonan Sebut Harga BFG</h2>
              <div class="row"><span class="label">ID Rujukan:</span> <span>\${lead.id}</span></div>
              <div class="row"><span class="label">Pelanggan:</span> <span>\${lead.name}</span></div>
              <div class="row"><span class="label">Servis:</span> <span>\${lead.serviceType}</span></div>
              <div class="row"><span class="label">Tarikh:</span> <span>\${lead.scheduledDate || "Tidak Terjadual"}</span></div>
              <div class="row"><span class="label">Masa:</span> <span>\${lead.scheduledTimeSlot || "N/A"}</span></div>
              <div class="row"><span class="label">Status Semasa:</span> <span class="status">\${lead.status === "New" ? "Menunggu Maklumbalas" : lead.status}</span></div>
              \${lead.adminFeedback ? \`<div class="row" style="flex-direction: column; border:none;"><span class="label">Nota Pengesahan Admin:</span> <span style="margin-top:5px; padding:10px; background:#f9f9f9; border-left:3px solid #D4AF37;">\${lead.adminFeedback}</span></div>\` : ''}
              <p style="margin-top: 30px; font-size: 11px; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top:10px;">Cetakan janaan automatik dari Bena Flash Global - Sistem Tempahan Rasmi</p>
            </div>
            <script>
              window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 300); }
            </script>
          </body>
        </html>
      \`);
      printWindow.document.close();
    }
  };

  const handleKongsi = (lead: any) => {
    const statusTxt = lead.status === "New" ? "Menunggu Maklumbalas" : lead.status;
    const text = \`Sila semak status permohonan sebut harga BFG saya!\\n\\nID Rujukan: \${lead.id}\\nStatus Semasa: \${statusTxt}\\n\\nSemak secara langsung di: \${window.location.origin}\`;
    const whatsappUrl = \`https://api.whatsapp.com/send?text=\${encodeURIComponent(text)}\`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddCalendar = (lead: any) => {
    if (!lead.scheduledDate) return;
    
    const [year, month, day] = lead.scheduledDate.split("-");
    if (!year || !month || !day) return;
    
    let hour = 9;
    let min = 0;
    if (lead.scheduledTimeSlot) {
      const match = lead.scheduledTimeSlot.match(/(\\d+):(\\d+)\\s*(AM|PM|am|pm)?/);
      if (match) {
        let h = parseInt(match[1]);
        const m = parseInt(match[2]);
        const ampm = match[3] ? match[3].toLowerCase() : null;
        if (ampm === 'pm' && h < 12) h += 12;
        if (ampm === 'am' && h === 12) h = 0;
        hour = h;
        min = m;
      }
    }
    
    const startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, min);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const formatGoogleDate = (d: Date) => {
      return d.toISOString().replace(/-|:|\.\\d+/g, "");
    };
    
    const dates = \`\${formatGoogleDate(startDate)}/\${formatGoogleDate(endDate)}\`;
    const text = encodeURIComponent(\`Temujanji Lawatan Tapak BFG - \${lead.serviceType}\`);
    const details = encodeURIComponent(\`Sesi lawatan tapak oleh pasukan Bena Flash Global.\\n\\nID Rujukan: \${lead.id}\\nPelanggan: \${lead.name}\\nServis: \${lead.serviceType}\\n\\nSila hubungi BFG untuk sebarang pindaan.\`);
    
    const calUrl = \`https://calendar.google.com/calendar/render?action=TEMPLATE&text=\${text}&dates=\${dates}&details=\${details}\`;
    window.open(calUrl, '_blank');
  };

  const renderStepper = (status: string) => {
    const steps = [
      { label: "Diterima", match: ["New", "Reviewed", "Contacted", "Completed"] },
      { label: "Semakan", match: ["Reviewed", "Contacted", "Completed"] },
      { label: "Lawatan", match: ["Contacted", "Completed"] },
      { label: "Selesai", match: ["Completed"] }
    ];
    
    return (
      <div className="flex items-center justify-between w-full mt-4 mb-5 relative px-1">
        <div className="absolute left-4 right-4 top-2.5 h-0.5 bg-slate-200 z-0 rounded-full"></div>
        {steps.map((step, idx) => {
          const isActive = step.match.includes(status);
          return (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div className={\`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300 \${isActive ? 'bg-[#0F172A] border-[#0F172A] text-[#D4AF37] shadow-sm scale-110' : 'bg-white border-slate-300 text-slate-300'}\`}>
                {isActive ? '✓' : (idx + 1)}
              </div>
              <span className={\`text-[8px] font-bold uppercase mt-1.5 text-center leading-tight \${isActive ? 'text-[#0F172A]' : 'text-slate-400'}\`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    );
  };
`;

content = content.replace(
  'const handleCheckStatus = async (targetId: string) => {',
  helperFunctions + '\n  const handleCheckStatus = async (targetId: string) => {'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Helper functions injected.");
