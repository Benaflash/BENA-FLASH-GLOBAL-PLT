import React, { useState } from "react";
import jsPDF from "jspdf";
import { Project } from "../types";
import {
  Plus,
  Trash2,
  ShieldCheck,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  Download,
  FileText,
} from "lucide-react";
import { optWebp } from "../data";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = { width: '100%', height: '400px', borderRadius: '12px' };
const defaultCenter = { lat: 3.1390, lng: 101.6869 }; // KL

interface ProjectManageProps {
  projects: Project[];
  onAdd: (proj: Omit<Project, "id">) => void;
  onEdit: (id: string, proj: Partial<Project>) => void;
  onDelete: (id: string) => void;
}

export default function ProjectManage({
  projects,
  onAdd,
  onEdit,
  onDelete,
}: ProjectManageProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const generateProjectUUID = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PRJ-BFG-${timestamp}-${randomPart}`;
  };

  const [autoProjectUuid, setAutoProjectUuid] = useState(generateProjectUUID());

  const [formData, setFormData] = useState({
    title: "",
    client: "",
    location: "",
    value: "",
    completionDate: "",
    category: "Electrical Installation" as Project["category"],
    status: "Completed" as Project["status"],
    img: "",
    imgBefore: "",
    description: "",
    imagesText: "",
    documentsText: "",
    lat: "",
    lng: "",
    milestones: [] as any[],
  });

  const categories: Project["category"][] = [
    "Electrical Installation",
    "Aircond Installation",
    "Testing & Commissioning",
    "MSB & DB Installation",
    "Solar Installation",
  ];
  const statuses: Project["status"][] = [
    "Completed",
    "In Progress",
    "Planning",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.client) return;

    // Use a high-quality default image if none specified
    const finalImg = formData.img.trim() || "https://picsum.photos/800/600";

    const imagesArray = formData.imagesText
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url !== "");

    const documentsArray = formData.documentsText
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url !== "");

    onAdd({
      id: autoProjectUuid,
      ...formData,
      img: finalImg,
      imgBefore: formData.imgBefore.trim()
        ? formData.imgBefore.trim()
        : undefined,
      images: imagesArray,
      documents: documentsArray,
      coordinates: formData.lat && formData.lng ? { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) } : undefined,
      milestones: formData.milestones,
    } as any);

    // Reset Form & Generate New UUID
    setAutoProjectUuid(generateProjectUUID());
    setFormData({
      title: "",
      client: "",
      location: "",
      value: "",
      completionDate: "",
      category: "Electrical Installation",
      status: "Completed",
      img: "",
      imgBefore: "",
      description: "",
      imagesText: "",
      documentsText: "",
      lat: "",
      lng: "",
      milestones: [],
    });
    setShowForm(false);
  };

  const calculateProgress = (milestones?: Project["milestones"], status?: Project["status"]) => {
    if (!milestones || milestones.length === 0) {
      if (status === "Completed") return 100;
      if (status === "In Progress") return 50;
      return 10;
    }
    const completed = milestones.filter((m) => m.status === "Completed").length;
    const inProgress = milestones.filter((m) => m.status === "In Progress").length;
    const score = completed * 100 + inProgress * 50;
    return Math.min(100, Math.round(score / milestones.length));
  };

  const handleEditChange = (id: string, field: string, value: any) => {
    onEdit(id, { [field]: value });
  };

  const handleDownloadProjectReport = (proj: Project) => {
    try {
      const doc = new jsPDF();

      // Top Header
      doc.setFillColor(15, 23, 42); // #0F172A
      doc.rect(0, 0, 210, 42, "F");

      doc.setFillColor(212, 175, 55); // #D4AF37
      doc.rect(0, 40, 210, 2, "F");

      doc.setTextColor(212, 175, 55);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("BENA FLASH GLOBAL PLT", 14, 18);

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("LAPORAN RINGKASAN PROJEK M&E ENGINEERING (CIDB G2)", 14, 26);
      doc.text("A-15A, Lorong Sungai Soi, Jaya 10, Jalan Kempadang, Kuantan, Pahang", 14, 32);

      // Report Title
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("LAPORAN STRUKTUR PROJEK & PRESTASI KERJA", 14, 52);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`ID PROJEK: ${proj.id.toUpperCase()}`, 14, 58);
      doc.text(`TARIKH DITERBITKAN: ${new Date().toLocaleDateString("ms-MY")}`, 14, 64);

      // Section 1: General Info
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 70, 182, 58, 3, 3, "FD");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("1. BUTIRAN UTAMA PROJEK & PELANGGAN", 20, 80);

      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.text(`Tajuk Projek    : ${proj.title}`, 20, 88);
      doc.text(`Kategori Kerja  : ${proj.category}`, 20, 94);
      doc.text(`Pelanggan Utama : ${proj.client}`, 20, 100);
      doc.text(`Lokasi Tapak    : ${proj.location}`, 20, 106);
      doc.text(`Nilai Kontrak   : ${proj.value || "Tender G2"}`, 20, 112);
      doc.text(`Status Semasa   : ${proj.status.toUpperCase()} (${proj.completionDate})`, 20, 118);

      // Section 2: Technical Scope
      doc.roundedRect(14, 134, 182, 45, 3, 3, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("2. SKOP KERJA TEKNIKAL & PERKAKASAN", 20, 144);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(
        proj.description || "Skop kerja merangkumi pemasangan pendawaian, pengujian voltan, dan penyerahan sijil keselamatan elektrik.",
        170
      );
      doc.text(descLines, 20, 152);

      // Section 3: Milestones Progress
      if (proj.milestones && proj.milestones.length > 0) {
        doc.roundedRect(14, 185, 182, 40, 3, 3, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("3. CARTA MILESTONE TIMELINE", 20, 195);

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        let startY = 203;
        proj.milestones.slice(0, 4).forEach((m: any, i: number) => {
          doc.text(`• ${m.title || `Milestone ${i+1}`} [${m.status || "In Progress"}] - ${m.date || "2026"}`, 20, startY);
          startY += 5;
        });
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "italic");
      doc.text("Laporan ini dijana daripada Pangkalan Data Portfolio Bena Flash Global PLT.", 14, 280);

      doc.save(`Laporan_Projek_${proj.title.replace(/[^a-zA-Z0-0]/g, "_").slice(0, 20)}.pdf`);
    } catch (e) {
      alert("Format laporan projek sedang dijana...");
    }
  };

  const handleEditClick = (proj: Project) => {
    if (editingId === proj.id) {
      setEditingId(null);
    } else {
      setEditingId(proj.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="font-bold text-[#0F172A] text-lg">
            Pangkalan Data Portfolio Projek
          </h3>
          <p className="text-xs text-slate-500">
            Uruskan rekod-rekod projek siap, projek aktif, dan nilai sebut harga
            tender M&E.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#D4AF37] text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-[#b8952c]"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? "Tutup Borang" : "Tambah Projek G2"}</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 shadow-md rounded-2xl p-6 sm:p-8 space-y-5.5"
        >
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-extrabold uppercase text-[#0F172A] tracking-wider border-l-4 border-[#D4AF37] pl-3">
              Daftar / Tambah Rekod Projek Baharu
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Sila lengkapkan butiran di bawah untuk menerbitkan projek ke dalam
              paparan portfolio awam.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="sm:col-span-2 lg:col-span-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block text-[10px] font-black text-[#0F172A] uppercase tracking-wider">
                  ID Unik Projek (Dijana Secara Automatik - UUID)
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs font-bold text-[#D4AF37] bg-[#0F172A] px-3 py-1 rounded-lg tracking-wider border border-[#D4AF37]/40 shadow-xs">
                    {autoProjectUuid}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Sistem Auto-UUID Aktif
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoProjectUuid(generateProjectUUID())}
                className="self-start sm:self-auto text-[10px] font-extrabold text-[#0F172A] hover:text-[#D4AF37] bg-white border border-slate-300 px-3 py-1.5 rounded-lg transition hover:bg-slate-100 cursor-pointer shadow-2xs"
              >
                🔄 Jana Semula ID
              </button>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama / Tajuk Projek
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="cth: Kerja Pendawaian Elektrikal Dan Papan Suis Utama Bangunan Parlimen"
                className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition duration-150"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Pelanggan Kontrak
              </label>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleChange}
                required
                placeholder="cth: Jabatan Kerja Raya (JKR)"
                className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition duration-150"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Kategori Kerja
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition duration-150 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Status Projek
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition duration-150 cursor-pointer"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Nilai Projek (Sekitar)
              </label>
              <input
                type="text"
                name="value"
                value={formData.value}
                onChange={handleChange}
                placeholder="cth: RM 650,000"
                className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition duration-150"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Lokasi Kerja
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="cth: Putrajaya"
                className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition duration-150"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Tarikh Siap / Jangka siap
              </label>
              <input
                type="text"
                name="completionDate"
                value={formData.completionDate}
                onChange={handleChange}
                placeholder="cth: 12/03/2026 atau Jun 2026"
                className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition duration-150"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                URL Gambar Siap
              </label>
              <input
                type="text"
                name="img"
                value={formData.img}
                onChange={handleChange}
                placeholder="cth: https://picsum.photos/..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white font-mono focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition duration-150"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-2 font-semibold">
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                URL Gambar Sebelum (Before-Slider, Opsional)
              </label>
              <input
                type="text"
                name="imgBefore"
                value={formData.imgBefore}
                onChange={handleChange}
                placeholder="cth: https://picsum.photos/..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white font-mono focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition duration-150"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                URL Gambar Tambahan (1 URL setiap baris - Opsional)
              </label>
              <textarea
                name="imagesText"
                value={formData.imagesText}
                onChange={handleChange}
                rows={2}
                placeholder="https://...&#10;https://..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white font-mono focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition duration-150"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                URL Fail Site Diari / Laporan (1 URL setiap baris - Opsional)
              </label>
              <textarea
                name="documentsText"
                value={formData.documentsText}
                onChange={handleChange}
                rows={2}
                placeholder="https://...&#10;https://..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white font-mono focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition duration-150"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Skop Kerja Teknikal / Huraian
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Terangkan skop pemasangan, pengujian voltan, penggunaan perkakasan keselamatan..."
              className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition duration-150 resize-y"
            />
          </div>

          <div className="flex justify-end gap-3.5 pt-3.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 text-xs font-bold text-slate-500 uppercase hover:bg-slate-100 rounded-xl transition duration-150 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-[#0F172A] text-[#D4AF37] px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition duration-150 hover:bg-slate-800 shadow-sm cursor-pointer"
            >
              Simpan Projek
            </button>
          </div>
        </form>
      )}

      {/* Projects Grid for Editing/Deletion */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#0F172A] font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Projek / Kategori</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Lokasi & Tarikh</th>
                <th className="p-4">Kemajuan Milestone</th>
                <th className="p-4">Nilai Kontrak</th>
                <th className="p-4">Status Kerja</th>
                <th className="p-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {projects.map((proj) => (
                <React.Fragment key={proj.id}>
                  <tr className="hover:bg-slate-50/55 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={optWebp(proj.img)}
                          alt={proj.title}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        <div>
                          <h5 className="font-bold text-slate-900 line-clamp-1">
                            {proj.title}
                          </h5>
                          <span className="inline-block bg-slate-100 text-[9px] font-bold text-[#0F172A] px-2 py-0.5 rounded uppercase mt-0.5">
                            {proj.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      {proj.client}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[150px]">
                          {proj.location}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {proj.completionDate}
                      </span>
                    </td>
                    <td className="p-4">
                      {(() => {
                        const progress = calculateProgress(proj.milestones, proj.status);
                        const totalMs = proj.milestones?.length || 0;
                        const completedMs = proj.milestones?.filter(m => m.status === 'Completed').length || 0;
                        return (
                          <div className="w-36 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-extrabold">
                              <span className="text-slate-600">Progress:</span>
                              <span className="text-[#0F172A]">{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  progress === 100
                                    ? "bg-emerald-500"
                                    : progress >= 50
                                    ? "bg-[#D4AF37]"
                                    : "bg-amber-500"
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 block">
                              {totalMs > 0 ? `${completedMs}/${totalMs} Milestone Selesai` : 'Status Utama'}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {proj.value || "Tender G2"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[9.5px] font-extrabold px-2.5 py-1 rounded-full uppercase border shadow-2xs ${
                          proj.status === "Completed"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : proj.status === "In Progress"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-blue-50 text-blue-800 border-blue-200"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            proj.status === "Completed"
                              ? "bg-emerald-500 animate-pulse"
                              : proj.status === "In Progress"
                                ? "bg-amber-500 animate-pulse"
                                : "bg-blue-500 animate-pulse"
                          }`}
                        />
                        <span>
                          {proj.status === "Completed"
                            ? "Selesai (Completed)"
                            : proj.status === "In Progress"
                              ? "Dalam Pelaksanaan (In Progress)"
                              : "Dalam Proses (Pending)"}
                        </span>
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleDownloadProjectReport(proj)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="Muat Turun Laporan Projek (PDF)"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(proj)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Kemaskini Projek"
                        >
                          <Plus
                            className={`w-4 h-4 transform ${editingId === proj.id ? "rotate-45" : ""} transition-transform`}
                          />
                        </button>
                        <button
                          onClick={() => onDelete(proj.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Padam Projek"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingId === proj.id && (
                    <tr className="bg-[#D4AF37]/5 border-y border-slate-200">
                      <td colSpan={7} className="p-5 sm:p-6 bg-slate-50/50">
                        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 sm:p-5 space-y-4">
                          <div className="border-b border-slate-100 pb-2">
                            <h6 className="text-[11px] font-extrabold uppercase text-[#0F172A] tracking-wider">
                              Kemaskini Segera Rekod Projek
                            </h6>
                            <p className="text-[10px] text-slate-400">
                              Pindaan akan disimpan secara automatik dalam
                              sistem tempatan dan disegerakkan ke pelayan.
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-1">Latitud Lokasi</label>
                              <input type="text" value={proj.coordinates?.lat || ''} onChange={(e) => {
                                const lat = parseFloat(e.target.value);
                                handleEditChange(proj.id, "coordinates", { ...proj.coordinates, lat: isNaN(lat) ? 0 : lat });
                              }} className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-1">Longitud Lokasi</label>
                              <input type="text" value={proj.coordinates?.lng || ''} onChange={(e) => {
                                const lng = parseFloat(e.target.value);
                                handleEditChange(proj.id, "coordinates", { ...proj.coordinates, lng: isNaN(lng) ? 0 : lng });
                              }} className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-1">
                                Tajuk Projek
                              </label>
                              <input
                                type="text"
                                value={proj.title}
                                onChange={(e) =>
                                  handleEditChange(
                                    proj.id,
                                    "title",
                                    e.target.value,
                                  )
                                }
                                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none transition duration-150"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-1">
                                Pelanggan
                              </label>
                              <input
                                type="text"
                                value={proj.client}
                                onChange={(e) =>
                                  handleEditChange(
                                    proj.id,
                                    "client",
                                    e.target.value,
                                  )
                                }
                                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none transition duration-150"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-1">
                                Nilai Kontrak
                              </label>
                              <input
                                type="text"
                                value={proj.value}
                                onChange={(e) =>
                                  handleEditChange(
                                    proj.id,
                                    "value",
                                    e.target.value,
                                  )
                                }
                                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none transition duration-150"
                              />
                            </div>
                            <div className="lg:col-span-3">
                              <label className="block text-[10px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-1">
                                Sungkupan & Skop Teknikal
                              </label>
                              <textarea
                                value={proj.description}
                                onChange={(e) =>
                                  handleEditChange(
                                    proj.id,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none transition duration-150"
                                rows={2.5}
                              />
                            </div>
                          </div>
                          
                            <div className="lg:col-span-3 mt-4 border-t border-slate-200 pt-4">
                              <label className="block text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">Milestones Timeline Projek</label>
                              
                              <div className="space-y-2 mb-3">
                                {proj.milestones?.map((m: any, idx: number) => (
                                  <div key={m.id || idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                                    <input type="text" value={m.title} onChange={(e) => {
                                      const ms = [...(proj.milestones || [])];
                                      ms[idx] = { ...ms[idx], title: e.target.value };
                                      handleEditChange(proj.id, "milestones", ms as any);
                                    }} placeholder="Tajuk (cth: Wiring)" className="flex-1 text-xs p-2 border border-slate-300 rounded" />
                                    
                                    <input type="date" value={m.date} onChange={(e) => {
                                      const ms = [...(proj.milestones || [])];
                                      ms[idx] = { ...ms[idx], date: e.target.value };
                                      handleEditChange(proj.id, "milestones", ms as any);
                                    }} className="w-32 text-xs p-2 border border-slate-300 rounded" />
                                    
                                    <select value={m.status} onChange={(e) => {
                                      const ms = [...(proj.milestones || [])];
                                      ms[idx] = { ...ms[idx], status: e.target.value };
                                      handleEditChange(proj.id, "milestones", ms as any);
                                    }} className="w-32 text-xs p-2 border border-slate-300 rounded">
                                      <option value="Pending">Pending</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Completed">Completed</option>
                                    </select>

                                    <button type="button" onClick={() => {
                                      const ms = proj.milestones?.filter((_, i) => i !== idx);
                                      handleEditChange(proj.id, "milestones", ms as any);
                                    }} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                ))}
                              </div>
                              
                              <button type="button" onClick={() => {
                                const ms = [...(proj.milestones || []), { id: Date.now().toString(), title: '', date: '', status: 'Pending' }];
                                handleEditChange(proj.id, "milestones", ms as any);
                              }} className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:text-blue-800"><Plus className="w-4 h-4"/> Tambah Milestone</button>
                            </div>

                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="bg-[#0F172A] text-[#D4AF37] px-4 py-2 rounded-lg text-[11px] font-extrabold uppercase tracking-wide hover:bg-slate-800 transition duration-150 cursor-pointer"
                            >
                              Tutup Suntingan
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
