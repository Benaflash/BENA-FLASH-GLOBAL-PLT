const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const customerEmailFn = `
  const sendCustomerBookingEmail = async (lead: LeadQuote) => {
    try {
      const subject = \`Pengesahan Tempahan BFG PLT - Ruj: \${lead.id}\`;
      const htmlContent = \`
<div style="font-family:sans-serif; max-width:600px; border:1px solid #e2e8f0; border-radius:12px; padding:24px; color:#1e293b;">
  <h2 style="color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:12px; margin-top:0;">Terima Kasih atas Tempahan Anda</h2>
  <p>Hai \${lead.name},</p>
  <p>Tempahan atau permohonan sebut harga anda telah berjaya diterima oleh pihak Bena Flash Global PLT.</p>
  <div style="background:#f8fafc; padding:16px; border-radius:8px; margin:20px 0; border: 1px dashed #cbd5e1;">
    <p style="margin: 0; font-size: 14px;"><strong>No. Rujukan Booking Anda:</strong></p>
    <h3 style="margin: 5px 0 0 0; color: #D4AF37; font-size: 24px; letter-spacing: 1px;">\${lead.id}</h3>
  </div>
  <p>Anda boleh menggunakan No. Rujukan ini untuk menyemak status tempahan anda di portal rasmi kami pada bila-bila masa.</p>
  <p>Pasukan teknikal kami akan menyemak butiran anda dan menghubungi anda sebentar lagi.</p>
  <br/>
  <p>Yang Benar,<br/><strong>Pasukan BFG PLT</strong></p>
</div>\`;

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: lead.email, subject, html: htmlContent }),
      });
      if (res.ok) {
        console.log("E-mel pengesahan berjaya dihantar kepada pelanggan!");
      } else {
        console.error("Gagal menghantar e-mel pelanggan.");
      }
    } catch (e) {
      console.error("Ralat e-mel pelanggan:", e);
    }
  };
`;

content = content.replace(
  '  const sendGmailApplicationNotification = async (app: Application) => {',
  customerEmailFn + '\n  const sendGmailApplicationNotification = async (app: Application) => {'
);

content = content.replace(
  'sendGmailNotification(newLead);',
  'sendGmailNotification(newLead);\n    sendCustomerBookingEmail(newLead);'
);

fs.writeFileSync('src/App.tsx', content);
