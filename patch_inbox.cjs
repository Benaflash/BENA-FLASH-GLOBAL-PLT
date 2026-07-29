const fs = require('fs');
let content = fs.readFileSync('src/components/LeadInbox.tsx', 'utf8');

// 1. Add Bell icon
content = content.replace(
  'MessageSquare,',
  'MessageSquare,\n  Bell,'
);

// 2. Add Hantar Peringatan button and estimatedCompletionDate
const targetReplacement = `              {/* Display visit scheduling slot */}
              {lead.scheduledDate && (
                <div className="p-3.5 bg-yellow-50/60 border border-[#D4AF37]/30 rounded-xl flex items-center gap-2.5 text-xs animate-pulse">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <div className="flex-grow">
                    <span className="font-extrabold text-[#D4AF37] uppercase text-[9px] tracking-widest block">
                      SLOT TEMUJANJI SERVIS (AIRCOND/MEK)
                    </span>
                    <span className="font-bold text-slate-800">
                      Tarikh:{" "}
                      <span className="underline">{lead.scheduledDate}</span> |
                      Slot Masa:{" "}
                      <span className="underline">
                        {lead.scheduledTimeSlot || "Sesi Penuh"}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      let phoneFormat = lead.phone.replace(/[^0-9]/g, "");
                      if (phoneFormat.startsWith("0")) phoneFormat = "6" + phoneFormat;
                      const waText = encodeURIComponent(
                        \`Salam sejahtera \${lead.name}, ini adalah peringatan mesra daripada Bena Flash Global untuk temujanji servis anda pada \${lead.scheduledDate} (\${lead.scheduledTimeSlot || 'Sesi Penuh'}).\\n\\nTerima kasih.\`
                      );
                      window.open(\`https://wa.me/\${phoneFormat}?text=\${waText}\`, "_blank");
                    }}
                    className="shrink-0 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg transition-colors flex items-center justify-center shadow-sm"
                    title="Hantar Peringatan WhatsApp"
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                </div>
              )}`;

content = content.replace(
  /{lead\.scheduledDate && \([\s\S]*?SLOT TEMUJANJI SERVIS \(AIRCOND\/MEK\)[\s\S]*?Tarikh:{" "}[\s\S]*?<span className="underline">{lead\.scheduledDate}<\/span> |[\s\S]*?Slot Masa:{" "}[\s\S]*?<span className="underline">[\s\S]*?{lead\.scheduledTimeSlot \|\| "Sesi Penuh"}[\s\S]*?<\/span>[\s\S]*?<\/span>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\)}/,
  targetReplacement
);

// 3. Add Estimated Completion Date field
const dateTarget = `                <div className="flex gap-2">
                  <input
                    type="text"
                    id={\`feedback-input-\${lead.id}\`}
                    defaultValue={lead.adminFeedback || ""}
                    placeholder="Masukkan maklum balas (e.g. 'Jadual disahkan, teknisyen sedia datang jam 11:30 AM')"
                    className="flex-grow text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#D4AF37] bg-white text-slate-800 font-semibold shadow-2xs"
                    onBlur={(e) => {
                      onFeedbackChange(lead.id, e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onFeedbackChange(
                          lead.id,
                          (e.target as HTMLInputElement).value,
                        );
                        alert("Maklum balas dikemaskini dalam sistem.");
                      }
                    }}
                  />
                </div>`;

const newDateTarget = `                <div className="flex gap-2">
                  <input
                    type="text"
                    id={\`feedback-input-\${lead.id}\`}
                    defaultValue={lead.adminFeedback || ""}
                    placeholder="Masukkan maklum balas (e.g. 'Jadual disahkan, teknisyen sedia datang jam 11:30 AM')"
                    className="flex-grow text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#D4AF37] bg-white text-slate-800 font-semibold shadow-2xs"
                    onBlur={(e) => {
                      onFeedbackChange(lead.id, e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onFeedbackChange(
                          lead.id,
                          (e.target as HTMLInputElement).value,
                        );
                        alert("Maklum balas dikemaskini dalam sistem.");
                      }
                    }}
                  />
                  <input
                    type="date"
                    title="Tarikh Dijangka Selesai"
                    defaultValue={lead.estimatedCompletionDate || ""}
                    className="shrink-0 w-32 text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#D4AF37] bg-white text-slate-500 shadow-2xs"
                    onChange={async (e) => {
                      try {
                        const url = \`/api/update-lead/\${lead.id}\`; 
                        // Note: we can just fire and forget or we can use Firebase if it was full-stack, 
                        // but here we just update state/local storage through a generic callback if we want, or we can use onFeedbackChange to pass a JSON?
                        // Wait, there's no prop for this. Let's just fire a fetch or add a prop. But LeadInbox doesn't have onEstimateChange. 
                        // I'll leave it as a comment if no endpoint exists, but we can update it locally in App.tsx
                        // Better to trigger a custom event or mutate window object as a hack, but let's see.
                      } catch (err) {}
                    }}
                  />
                </div>`;
// Actually, let's look at `onFeedbackChange`. I can just add `onUpdateLead` to LeadInboxProps.
