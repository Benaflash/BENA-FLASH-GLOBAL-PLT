import React from "react";
import { motion } from "motion/react";
import {
  X,
  FileText,
  Download,
  CheckCircle2,
  ShieldCheck,
  Lock,
} from "lucide-react";

interface DocReaderProps {
  title: string;
  sub: string;
  onClose: () => void;
  sections: { title: string; bullets: string[] }[];
  imageUrl?: string;
  pdfUrl?: string;
}

export default function DocReader({
  title,
  sub,
  onClose,
  sections,
  imageUrl,
  pdfUrl,
}: DocReaderProps) {
  const isSecureOnly = !!(imageUrl || pdfUrl);

  return (
    <div className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
      >
        {/* Header */}
        <div className="bg-[#0F172A] text-white p-6 flex justify-between items-center relative">
          <div className="space-y-1">
            <span className="text-[10px] text-[#D4AF37] font-extrabold uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <ShieldCheck className="w-4 h-4" />
              Sijil Sah & Mandat Pelesenan Rasmi
            </span>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-xs text-slate-300">{sub}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1 bg-[#f8fafc]">
          {/* SECURE PROTECTED NOTICE FOR IMAGES or PDFS */}
          {isSecureOnly && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-2.5 text-amber-800 text-xs">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold leading-snug">
                Sijil ini dilindungi hak milik Bena Flash Global PLT. Pilihan
                Muat Turun telah disekat. Hanya dibenarkan untuk tatapan sahaja.
              </span>
            </div>
          )}

          {/* Secure Display of Real Image or PDF */}
          {imageUrl ? (
            <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-md flex items-center justify-center p-2 select-none">
              {/* Prevents dragging or saving of the picture easily */}
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                onContextMenu={(e) => e.preventDefault()}
              />
              <img
                src={imageUrl}
                alt={title}
                referrerPolicy="no-referrer"
                onContextMenu={(e) => e.preventDefault()}
                className="max-h-[50vh] object-contain rounded-xl select-none pointer-events-none"
                style={{ WebkitUserSelect: "none" } as any}
              />
            </div>
          ) : pdfUrl ? (
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white h-96 relative select-none">
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full border-none pointer-events-none select-none"
                onContextMenu={(e) => e.preventDefault()}
                title={title}
              />
              <div className="absolute inset-0 bg-transparent pointer-events-none" />
            </div>
          ) : null}

          {/* Fallback metadata details always displayed */}
          <div className="bg-white border p-6 rounded-2xl relative shadow-inner font-mono text-xs text-slate-700 space-y-4">
            {/* Stamp Logo */}
            <div className="absolute top-6 right-6 w-20 h-20 border-4 border-slate-300 rounded-full flex flex-col items-center justify-center rotate-12 opacity-80 border-dashed">
              <span className="text-[10px] font-bold text-slate-400">
                BFG PLT
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">
                M&E G2
              </span>
            </div>

            <div className="border-b pb-4">
              <h4 className="text-sm font-bold text-[#0F172A] uppercase">
                BENA FLASH GLOBAL PLT
              </h4>
              <p className="text-[9px] uppercase font-bold text-slate-400">
                REKOD DIGITAL KORPORAT BERKOMPETEN
              </p>
            </div>

            {sections.map((sec, idx) => (
              <div key={idx} className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase border-b pb-1 block">
                  {idx + 1}. {sec.title}
                </span>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px] leading-relaxed">
                  {sec.bullets.map((bullet, bIdx) => (
                    <li key={bIdx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="pt-6 border-t font-sans text-center text-slate-400 text-[10px]">
              Dokumen ini dijana secara digital bagi tujuan rujukan sebut harga
              Bena Flash Global PLT.
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Dokumen Disahkan Aktif (2026/2027)</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none text-xs font-bold uppercase text-slate-600 px-4 py-2 hover:bg-slate-100 rounded"
            >
              Tutup
            </button>
            {!isSecureOnly ? (
              <a
                href="data:text/plain;charset=utf-8,BENA FLASH GLOBAL CORPORATE ACCREDITATION DOCUMENT"
                download={`${title.replace(/\s+/g, "_")}_Sijil.txt`}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded text-xs font-bold uppercase transition hover:bg-[#b8952c]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Muat Turun Dokumen</span>
              </a>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 border border-slate-200 px-3 py-2 rounded bg-slate-50 font-bold uppercase">
                <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>VIEW ONLY SECURITY</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
