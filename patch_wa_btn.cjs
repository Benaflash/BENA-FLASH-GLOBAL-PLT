const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const newActionButtons = `                            {/* Action Buttons: Cetak, Kongsi, Add to Calendar */}
                            <div className="flex items-center gap-2 pt-2 mt-2 border-t border-slate-200/60">
                              <button
                                onClick={() => handleCetak(checkedLead)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border border-slate-200 hover:border-[#D4AF37] text-slate-600 hover:text-[#0F172A] rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                                title="Cetak Salinan PDF"
                              >
                                <Printer className="w-3.5 h-3.5" /> Cetak PDF
                              </button>
                              <button
                                onClick={() => handleKongsi(checkedLead)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                                title="Kongsi"
                              >
                                <Share2 className="w-3.5 h-3.5" /> Kongsi
                              </button>
                            </div>
                            <div className="pt-1">
                              <button
                                onClick={() => {
                                  const text = encodeURIComponent(\`Hai admin BFG, saya ingin bertanya tentang status permohonan sebut harga saya.\\n\\nID Rujukan: \${checkedLead.id}\\nStatus: \${checkedLead.status}\`);
                                  window.open(\`https://api.whatsapp.com/send?phone=60136269226&text=\${text}\`, '_blank');
                                }}
                                className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                                title="Tanya Admin di WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> Tanya Status di WhatsApp
                              </button>
                            </div>
                            {checkedLead.scheduledDate && (
                              <div className="pt-1">
                                <button
                                  onClick={() => handleAddCalendar(checkedLead)}
                                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                                  title="Simpan Tarikh ke Google Calendar"
                                >
                                  <CalendarPlus className="w-3.5 h-3.5" /> Simpan Ke Kalendar
                                </button>
                              </div>
                            )}`;

content = content.replace(
  /{[\s\S]*?Action Buttons: Cetak, Kongsi, Add to Calendar[\s\S]*?Simpan Ke Kalendar[\s\S]*?<\/button>[\s\S]*?<\/div>[\s\S]*?\)}/,
  newActionButtons
);

fs.writeFileSync('src/App.tsx', content);
