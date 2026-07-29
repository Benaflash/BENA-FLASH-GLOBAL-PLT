const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Kawasan dropdown
const newInputs = `                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={checkerId}
                            onChange={(e) => setCheckerId(e.target.value)}
                            placeholder="Masukkan ID Rujukan / No. Telefon"
                            className="flex-grow text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-slate-50 font-mono text-slate-700"
                          />
                          <div className="flex gap-2">
                            <select
                              value={checkerKawasan}
                              onChange={(e) => setCheckerKawasan(e.target.value)}
                              className="flex-grow text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-slate-50 text-slate-700"
                            >
                              <option value="">Semua Kawasan (Pilihan)</option>
                              <option value="Kuantan">Kuantan</option>
                              <option value="Pekan">Pekan</option>
                              <option value="Gambang">Gambang</option>
                              <option value="Kemaman">Kemaman</option>
                              <option value="Maran">Maran</option>
                              <option value="Temerloh">Temerloh</option>
                            </select>
                            <button
                              onClick={() => handleCheckStatus()}
                              disabled={isChecking}
                              className="bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] hover:text-white text-[10px] font-bold uppercase px-4 rounded-xl transition shadow-2xs shrink-0 cursor-pointer disabled:opacity-55"
                            >
                              {isChecking ? "Carian..." : "Semak"}
                            </button>
                          </div>
                        </div>`;

content = content.replace(
  /<div className="flex gap-2">\s*<input\s*type="text"\s*value=\{checkerId\}\s*onChange=\{\(e\) => setCheckerId\(e\.target\.value\)\}\s*placeholder="Masukkan ID Rujukan Sebut Harga"\s*className="flex-grow text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-\[#D4AF37\] bg-slate-50 font-mono text-slate-700"\s*\/>\s*<button\s*onClick=\{\(\) => handleCheckStatus\(\)\}\s*disabled=\{isChecking\}\s*className="bg-\[#0F172A\] hover:bg-slate-800 text-\[#D4AF37\] hover:text-white text-\[10px\] font-bold uppercase px-4 rounded-xl transition shadow-2xs shrink-0 cursor-pointer disabled:opacity-55"\s*>\s*\{isChecking \? "Carian\.\.\." : "Semak"\}\s*<\/button>\s*<\/div>/,
  newInputs
);

// 2. Change {checkedLead && ( to {checkedLeads.length > 0 && checkedLeads.map((checkedLead) => (
// And update the closing tag. Wait, I should just replace the whole checkedLead block using a script.

fs.writeFileSync('src/App.tsx', content);
