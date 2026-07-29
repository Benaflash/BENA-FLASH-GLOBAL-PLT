const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[#D4AF37]/20">
                              <div className="flex items-center gap-2">
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
                                  title="Kongsi Pautan"
                                >
                                  <Share2 className="w-3.5 h-3.5" /> Kongsi
                                </button>
                              </div>
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
                              {checkedLead.scheduledDate && (
                                <button
                                  onClick={() => handleAddCalendar(checkedLead)}
                                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                                  title="Simpan Tarikh ke Google Calendar"
                                >
                                  <CalendarPlus className="w-3.5 h-3.5" /> Simpan Ke Kalendar
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>`;

content = content.replace(
  /                              \)}\n                            <\/div>\n                          <\/motion\.div>\n                        \)}\n                      <\/div>/,
  replacement + "\n                      </div>"
);

fs.writeFileSync('src/App.tsx', content);
