import React, { useState } from "react";
import { motion } from "motion/react";
import {
  X,
  Send,
  Briefcase,
  FileSignature,
  Paperclip,
  FileText,
  Upload,
  Trash2,
  Check,
} from "lucide-react";
import { Career } from "../types";

interface CareerApplicationModalProps {
  job: Career;
  onClose: () => void;
  onSubmit: (data: {
    careerId: string;
    careerTitle: string;
    name: string;
    email: string;
    phone: string;
    experienceSummary: string;
    resumeUrl?: string;
    resumeName?: string;
    certificatesUrl?: string;
    certificatesName?: string;
    othersUrl?: string;
    othersName?: string;
  }) => void;
}

export default function CareerApplicationModal({
  job,
  onClose,
  onSubmit,
}: CareerApplicationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experienceSummary: "",
  });

  const [resumeFile, setResumeFile] = useState<{
    name: string;
    base64: string;
  } | null>(null);
  const [certFile, setCertFile] = useState<{
    name: string;
    base64: string;
  } | null>(null);
  const [otherFile, setOtherFile] = useState<{
    name: string;
    base64: string;
  } | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "resume" | "cert" | "other",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Had saiz fail dikesan! Sila pastikan saiz fail kurang dari 5MB.");
      return;
    }

    setIsLoadingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (type === "resume") {
        setResumeFile({ name: file.name, base64 });
      } else if (type === "cert") {
        setCertFile({ name: file.name, base64 });
      } else {
        setOtherFile({ name: file.name, base64 });
      }
      setIsLoadingFile(false);
    };
    reader.onerror = () => {
      alert("Ralat memuat naik fail.");
      setIsLoadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;

    onSubmit({
      careerId: job.id,
      careerTitle: job.title,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      experienceSummary: formData.experienceSummary,
      resumeUrl: resumeFile?.base64,
      resumeName: resumeFile?.name,
      certificatesUrl: certFile?.base64,
      certificatesName: certFile?.name,
      othersUrl: otherFile?.base64,
      othersName: otherFile?.name,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-[#0F172A] text-white px-5 py-4.5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-slate-800/80 text-slate-300 hover:text-white rounded-full transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#D4AF37] block mb-0.5">
            MOHON JAWATAN
          </span>
          <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2 tracking-tight text-white leading-tight">
            <Briefcase className="w-4.5 h-4.5 text-[#D4AF37]" />
            {job.title}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
            {job.department} &bull; {job.location}
          </p>
        </div>

        {/* Modal Body with safe scrollbar */}
        <div className="p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          {isSubmitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold animate-bounce shadow-inner">
                ✓
              </div>
              <div className="space-y-1.5 animate-pulse">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  Permohonan Berjaya Dihantar!
                </h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Terima kasih atas minat anda menyertai{" "}
                  <strong>Bena Flash Global PLT</strong>. Unit Sumber Manusia
                  (HR) kami sedang menilai permohonan anda.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-705 uppercase tracking-wider mb-1.5">
                  Nama Penuh Calon
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Nama seperti di kad pengenalan"
                  className="w-full text-xs p-2.5 border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none bg-slate-50 font-semibold text-slate-800 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-705 uppercase tracking-wider mb-1.5">
                    E-mel Perhubungan
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="nama@gmail.com"
                    className="w-full text-xs p-2.5 border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none bg-slate-50 text-slate-800 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-705 uppercase tracking-wider mb-1.5">
                    No. Telefon (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="cth: 013-4567890"
                    className="w-full text-xs p-2.5 border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none bg-slate-50 text-slate-800 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-705 uppercase tracking-wider mb-1.5">
                  Ringkasan Kualifikasi & Sijil Kompetensi
                </label>
                <textarea
                  name="experienceSummary"
                  value={formData.experienceSummary}
                  onChange={handleChange}
                  required
                  rows={2}
                  placeholder="cth: Pemegang PW4 ST, pengalaman memasang DB & kabel industri selama 3 tahun..."
                  className="w-full text-xs p-2.5 border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none bg-slate-50 leading-relaxed text-slate-800 resize-none transition"
                />
              </div>

              {/* Lampiran Dokumen Sokongan */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-3">
                <div className="flex items-center gap-1.5 border-b border-slate-200/60 pb-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">
                    Dokumen Sokongan (Maks 5MB)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* RESUME UPLOAD */}
                  <div className="space-y-1">
                    <span className="block text-[8px] font-extrabold text-slate-500 uppercase tracking-wide">
                      1. Resume / CV
                    </span>
                    {resumeFile ? (
                      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg text-[9px]">
                        <span
                          className="truncate text-green-800 font-bold max-w-[70px]"
                          title={resumeFile.name}
                        >
                          {resumeFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setResumeFile(null)}
                          className="text-red-500 hover:text-red-700 cursor-pointer p-0.5 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-2 px-1 border border-dashed border-slate-300 rounded-lg hover:border-[#D4AF37] hover:bg-white transition cursor-pointer text-center bg-white/50">
                        <Upload className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
                        <span className="text-[8px] font-extrabold text-slate-700">
                          Muat Naik CV
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,image/*"
                          onChange={(e) => handleFileChange(e, "resume")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* CERTIFICATE UPLOAD */}
                  <div className="space-y-1">
                    <span className="block text-[8px] font-extrabold text-slate-500 uppercase tracking-wide">
                      2. Sijil Elektrik/M&E
                    </span>
                    {certFile ? (
                      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg text-[9px]">
                        <span
                          className="truncate text-green-800 font-bold max-w-[70px]"
                          title={certFile.name}
                        >
                          {certFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCertFile(null)}
                          className="text-red-500 hover:text-red-700 cursor-pointer p-0.5 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-2 px-1 border border-dashed border-slate-300 rounded-lg hover:border-[#D4AF37] hover:bg-white transition cursor-pointer text-center bg-white/50">
                        <Upload className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
                        <span className="text-[8px] font-extrabold text-slate-700">
                          Muat Naik Sijil
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,image/*"
                          onChange={(e) => handleFileChange(e, "cert")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* OTHERS UPLOAD */}
                  <div className="space-y-1">
                    <span className="block text-[8px] font-extrabold text-slate-500 uppercase tracking-wide">
                      3. Kad CIDB / Lain
                    </span>
                    {otherFile ? (
                      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg text-[9px]">
                        <span
                          className="truncate text-green-800 font-bold max-w-[70px]"
                          title={otherFile.name}
                        >
                          {otherFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setOtherFile(null)}
                          className="text-red-500 hover:text-red-700 cursor-pointer p-0.5 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-2 px-1 border border-dashed border-slate-300 rounded-lg hover:border-[#D4AF37] hover:bg-white transition cursor-pointer text-center bg-white/50">
                        <Upload className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
                        <span className="text-[8px] font-extrabold text-slate-700">
                          Dokumen Lain
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,image/*"
                          onChange={(e) => handleFileChange(e, "other")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoadingFile}
                className="w-full flex items-center justify-center gap-2 bg-[#0F172A] text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition shadow-md disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>
                  {isLoadingFile
                    ? "Mengambil fail..."
                    : "Hantar Borang Permohonan"}
                </span>
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
