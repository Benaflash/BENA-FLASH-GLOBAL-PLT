const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const updatedTimestamp = `                            {/* Stepper Progress Bar */}
                            {renderStepper(checkedLead.status)}
                            {checkedLead.updatedAt && (
                              <div className="text-center mt-0 mb-3">
                                <span className="text-[8px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full inline-block">
                                  Dikemaskini pada: {new Date(checkedLead.updatedAt).toLocaleString('ms-MY')}
                                </span>
                              </div>
                            )}`;

content = content.replace(
  '                            {/* Stepper Progress Bar */}\n                            {renderStepper(checkedLead.status)}',
  updatedTimestamp
);

fs.writeFileSync('src/App.tsx', content);
