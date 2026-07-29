const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldStepper = `  const renderStepper = (status: string) => {
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
  };`;

const newStepper = `  const renderStepper = (status: string) => {
    const steps = [
      { label: "Diterima", match: ["New", "Reviewed", "Contacted", "Completed"], currentOf: ["New"] },
      { label: "Semakan", match: ["Reviewed", "Contacted", "Completed"], currentOf: ["Reviewed"] },
      { label: "Lawatan", match: ["Contacted", "Completed"], currentOf: ["Contacted"] },
      { label: "Selesai", match: ["Completed"], currentOf: ["Completed"] }
    ];
    
    return (
      <div className="flex items-center justify-between w-full mt-4 mb-5 relative px-1">
        <div className="absolute left-4 right-4 top-2.5 h-0.5 bg-slate-200 z-0 rounded-full"></div>
        {steps.map((step, idx) => {
          const isActive = step.match.includes(status);
          const isCurrent = step.currentOf.includes(status);
          return (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div className={\`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300 \${isActive ? 'bg-[#0F172A] border-[#0F172A] text-[#D4AF37] shadow-sm scale-110' : 'bg-white border-slate-300 text-slate-300'} \${isCurrent ? 'animate-pulse ring-2 ring-[#D4AF37] ring-offset-1' : ''}\`}>
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
  };`;

content = content.replace(oldStepper, newStepper);
fs.writeFileSync('src/App.tsx', content);
