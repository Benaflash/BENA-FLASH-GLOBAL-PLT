import React, { useState } from "react";
import { CompanyInfo, ClientLogo, StaffMember } from "../types";
import {
  Save,
  AlertCircle,
  Plus,
  Trash2,
  Image,
  Users,
  Award,
  ShieldCheck,
  Edit3,
  Check,
  X,
} from "lucide-react";

interface CompanyProfileEditProps {
  info: CompanyInfo;
  onSave: (updated: CompanyInfo) => void;
  clientLogos: ClientLogo[];
  onSaveClientLogos: (updated: ClientLogo[]) => void;
  staff: StaffMember[];
  onSaveStaff: (updated: StaffMember[]) => void;
}

export default function CompanyProfileEdit({
  info,
  onSave,
  clientLogos,
  onSaveClientLogos,
  staff,
  onSaveStaff,
}: CompanyProfileEditProps) {
  const [formData, setFormData] = useState<CompanyInfo>({
    ...info,
    beforeAfterBeforeImg: info.beforeAfterBeforeImg || "",
    beforeAfterAfterImg: info.beforeAfterAfterImg || "",
    promoText: info.promoText || "",
    promoLink: info.promoLink || "",
    isPromoActive: info.isPromoActive || false,
  });
  const [logos, setLogos] = useState<ClientLogo[]>([...clientLogos]);
  const [teamMembers, setTeamMembers] = useState<StaffMember[]>([...staff]);

  // Logos form state
  const [newLogoName, setNewLogoName] = useState("");
  const [newLogoUrl, setNewLogoUrl] = useState("");

  // Staff form state
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("");
  const [newStaffQual, setNewStaffQual] = useState("");
  const [newStaffExp, setNewStaffExp] = useState("");
  const [newStaffAvatarText, setNewStaffAvatarText] = useState("");
  const [newStaffAvatarUrl, setNewStaffAvatarUrl] = useState("");
  const [newStaffReportsTo, setNewStaffReportsTo] = useState<string>("");

  // Inline editing state for staff members
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editStaffName, setEditStaffName] = useState("");
  const [editStaffRole, setEditStaffRole] = useState("");
  const [editStaffQual, setEditStaffQual] = useState("");
  const [editStaffExp, setEditStaffExp] = useState("");
  const [editStaffAvatarText, setEditStaffAvatarText] = useState("");
  const [editStaffAvatarUrl, setEditStaffAvatarUrl] = useState("");
  const [editStaffReportsTo, setEditStaffReportsTo] = useState("");

  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("Projects") ||
        name.includes("Satisfaction") ||
        name.includes("Years") ||
        name.includes("Corporate") ||
        name.includes("Staff") ||
        name.includes("States")
          ? Number(value) || 0
          : value,
    }));
  };

  const handleStartEditStaff = (m: StaffMember) => {
    setEditingStaffId(m.id);
    setEditStaffName(m.name);
    setEditStaffRole(m.role);
    setEditStaffQual(m.qualification);
    setEditStaffExp(m.experience);
    setEditStaffAvatarText(m.avatarText);
    setEditStaffAvatarUrl(m.avatarUrl || "");
    setEditStaffReportsTo(m.reportsTo || "");
  };

  const handleSaveInlineStaff = (id: string) => {
    const updated = teamMembers.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          name: editStaffName,
          role: editStaffRole,
          qualification: editStaffQual,
          experience: editStaffExp,
          avatarText:
            editStaffAvatarText || editStaffName.substring(0, 2).toUpperCase(),
          avatarUrl: editStaffAvatarUrl.trim() || undefined,
          reportsTo: editStaffReportsTo || null,
        };
      }
      return m;
    });
    setTeamMembers(updated);
    setEditingStaffId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onSaveClientLogos(logos);
    onSaveStaff(teamMembers);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:p-8">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div>
          <h3 className="font-bold text-[#0F172A] text-lg">
            Maklumat Profil & Sijil Korporat
          </h3>
          <p className="text-xs text-slate-500">
            Kemaskinikan pendedahan statik, slogan, dan informasi kontrak
            kerajaan.
          </p>
        </div>
        <span className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] font-bold px-3 py-1 rounded">
          G7 Registered
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nama Syarikat
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tagline / Slogan Utama
            </label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              required
              className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              E-mel Rasmi Operasi
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              No Telefon Talian Pintar
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Selesai Projek (Counters)
            </label>
            <input
              type="number"
              name="completedProjects"
              value={formData.completedProjects}
              onChange={handleChange}
              required
              className="w-full text-xs p-2 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-white font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Keaktifan Negeri Operasi
            </label>
            <input
              type="number"
              name="operatingStates"
              value={formData.operatingStates}
              onChange={handleChange}
              required
              className="w-full text-xs p-2 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-white font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Kakitangan Teras Mandatori
            </label>
            <input
              type="number"
              name="coreStaff"
              value={formData.coreStaff}
              onChange={handleChange}
              required
              className="w-full text-xs p-2 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-white font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Pautan Kedai E-Commerce / Pembelian
          </label>
          <input
            type="text"
            name="ecommerceLink"
            value={formData.ecommerceLink}
            onChange={handleChange}
            className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50 font-mono"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Pautan Facebook
            </label>
            <input
              type="text"
              name="facebookUrl"
              value={formData.facebookUrl || ""}
              onChange={handleChange}
              placeholder="https://facebook.com/..."
              className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Pautan TikTok
            </label>
            <input
              type="text"
              name="tiktokUrl"
              value={formData.tiktokUrl || ""}
              onChange={handleChange}
              placeholder="https://tiktok.com/@..."
              className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Pautan Instagram
            </label>
            <input
              type="text"
              name="instagramUrl"
              value={formData.instagramUrl || ""}
              onChange={handleChange}
              placeholder="https://instagram.com/..."
              className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Pautan X / Twitter
            </label>
            <input
              type="text"
              name="twitterUrl"
              value={formData.twitterUrl || ""}
              onChange={handleChange}
              placeholder="https://x.com/..."
              className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Pautan YouTube
            </label>
            <input
              type="text"
              name="youtubeUrl"
              value={formData.youtubeUrl || ""}
              onChange={handleChange}
              placeholder="https://youtube.com/@..."
              className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Alamat Fizikal Pejabat Urusan
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={2}
            required
            className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Profil Syarikat Lengkap (Perihal Tentang Kami)
          </label>
          <textarea
            name="aboutText"
            value={formData.aboutText}
            onChange={handleChange}
            rows={5}
            required
            className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50 leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Gambar Profil Syarikat (URL)
          </label>
          <input
            type="text"
            name="aboutImgUrl"
            value={formData.aboutImgUrl || ""}
            onChange={handleChange}
            placeholder="https://... (URL gambar)"
            className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50 font-mono"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Gambar Projek Kualiti (SEBELUM) URL
            </label>
            <input
              type="text"
              name="beforeAfterBeforeImg"
              value={formData.beforeAfterBeforeImg || ""}
              onChange={handleChange}
              className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Gambar Projek Kualiti (SELEPAS) URL
            </label>
            <input
              type="text"
              name="beforeAfterAfterImg"
              value={formData.beforeAfterAfterImg || ""}
              onChange={handleChange}
              className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* PROMOSI / KEMPEN SECTOR */}
        <div className="border-t pt-6 space-y-4">
          <div>
            <h4 className="font-bold text-[#0F172A] text-sm flex items-center gap-2">
              <span className="text-[#D4AF37]">✨</span>
              Kempen & Promosi Semasa
            </h4>
            <p className="text-[11px] text-slate-500">
              Urus hebahan tetingkap terapung (banner) promosi atau makluman
              terbaharu untuk tapak utama.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="isPromoActive"
                name="isPromoActive"
                checked={formData.isPromoActive || false}
                onChange={handleChange}
                className="w-4 h-4 text-[#D4AF37] border-slate-300 rounded focus:ring-[#D4AF37]"
              />
              <label
                htmlFor="isPromoActive"
                className="text-xs font-bold text-[#0F172A] uppercase"
              >
                Aktifkan Paparan Promosi
              </label>
            </div>
            {formData.isPromoActive && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Teks Promosi / Pengumuman
                  </label>
                  <input
                    type="text"
                    name="promoText"
                    value={formData.promoText || ""}
                    onChange={handleChange}
                    className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-white"
                    placeholder="Contoh: Diskaun 15% Untuk Servis Aircond"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Pautan Rujukan (Opsyenal)
                  </label>
                  <input
                    type="text"
                    name="promoLink"
                    value={formData.promoLink || ""}
                    onChange={handleChange}
                    className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-white font-mono"
                    placeholder="https://wa.me/..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KAKITANGAN / STAFF SECTOR */}
        <div className="border-t pt-6 space-y-4">
          <div>
            <h4 className="font-bold text-[#0F172A] text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D4AF37]" strokeWidth={2.5} />
              Pengurusan Kakitangan & Carta Organisasi
            </h4>
            <p className="text-[11px] text-slate-500">
              Uruskan senarai kakitangan kompeten G2. Anda boleh memuat
              naik/pautkan foto realistik mereka, mengemaskinikan perincian
              kelulusan, serta menstrukturkan hubungan pelaporan bagi melakar
              carta organisasi automatik.
            </p>
          </div>

          {/* New Staff Form */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block border-b pb-1">
              Tambah Kakitangan Baharu
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Nama Penuh
                </label>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="Contoh: Nor Azman Bin Zakaria"
                  className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Jawatan / Peranan
                </label>
                <input
                  type="text"
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  placeholder="Contoh: PW4 WIREMAN"
                  className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Penyelia / Melapor Kepada
                </label>
                <select
                  value={newStaffReportsTo}
                  onChange={(e) => setNewStaffReportsTo(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
                >
                  <option value="">Tiada (Pimpinan Utama/Root)</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Kelayakan Akademik / Sijil Kompetensi ST
                </label>
                <input
                  type="text"
                  value={newStaffQual}
                  onChange={(e) => setNewStaffQual(e.target.value)}
                  placeholder="Contoh: Sijil Kekompetenan Pendawaian Elektrikal PW4 ST"
                  className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Pengalaman Kerja Teknikal
                </label>
                <input
                  type="text"
                  value={newStaffExp}
                  onChange={(e) => setNewStaffExp(e.target.value)}
                  placeholder="Contoh: Pengalaman 10 tahun audit industri dan pencawang voltan rendah"
                  className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  URL Foto Kakitangan (Sila masukkan foto real syarikat)
                </label>
                <input
                  type="text"
                  value={newStaffAvatarUrl}
                  onChange={(e) => setNewStaffAvatarUrl(e.target.value)}
                  placeholder="Contoh: https://example.com/staff-photo.jpg"
                  className="w-full text-xs p-2 border border-slate-300 rounded bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Singkatan Nama (Avatar Teks)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStaffAvatarText}
                    onChange={(e) => setNewStaffAvatarText(e.target.value)}
                    placeholder="Contoh: NA"
                    maxLength={2}
                    className="w-full text-xs p-2 border border-slate-300 rounded bg-white font-bold uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newStaffName.trim() || !newStaffRole.trim()) {
                        alert("Sila isi sekurang-kurangnya Nama dan Jawatan.");
                        return;
                      }
                      const id = `staff-${Date.now()}`;
                      const newItem: StaffMember = {
                        id,
                        name: newStaffName.trim(),
                        role: newStaffRole.trim(),
                        qualification:
                          newStaffQual.trim() || "Tiada perincian kelulusan.",
                        experience:
                          newStaffExp.trim() || "Tiada perincian pengalaman.",
                        avatarText:
                          newStaffAvatarText.trim() ||
                          newStaffName.trim().substring(0, 2).toUpperCase(),
                        avatarUrl: newStaffAvatarUrl.trim() || undefined,
                        reportsTo: newStaffReportsTo || null,
                      };
                      setTeamMembers([...teamMembers, newItem]);
                      // Reset fields
                      setNewStaffName("");
                      setNewStaffRole("");
                      setNewStaffQual("");
                      setNewStaffExp("");
                      setNewStaffAvatarText("");
                      setNewStaffAvatarUrl("");
                      setNewStaffReportsTo("");
                    }}
                    className="bg-[#0F172A] text-white px-4 py-2 rounded font-bold hover:bg-slate-800 transition shrink-0"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* List of Staff Members with Inline Edit Capability */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block border-b pb-1">
              Senarai Profil Organisasi Semasa
            </span>
            <div className="grid grid-cols-1 gap-3">
              {teamMembers.map((m) => {
                const isEditing = editingStaffId === m.id;
                return (
                  <div
                    key={m.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs"
                  >
                    {isEditing ? (
                      <div className="w-full space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                              Nama Penuh
                            </label>
                            <input
                              type="text"
                              value={editStaffName}
                              onChange={(e) => setEditStaffName(e.target.value)}
                              className="w-full p-2 border rounded bg-slate-50"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                              Jawatan/Peranan
                            </label>
                            <input
                              type="text"
                              value={editStaffRole}
                              onChange={(e) => setEditStaffRole(e.target.value)}
                              className="w-full p-2 border rounded bg-slate-50"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                              Melapor Kepada
                            </label>
                            <select
                              value={editStaffReportsTo}
                              onChange={(e) =>
                                setEditStaffReportsTo(e.target.value)
                              }
                              className="w-full p-2 border rounded bg-slate-50"
                            >
                              <option value="">Tiada (Root)</option>
                              {teamMembers
                                .filter((other) => other.id !== m.id)
                                .map((other) => (
                                  <option key={other.id} value={other.id}>
                                    {other.name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                              Kelayakan
                            </label>
                            <input
                              type="text"
                              value={editStaffQual}
                              onChange={(e) => setEditStaffQual(e.target.value)}
                              className="w-full p-2 border rounded bg-slate-50"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                              Pengalaman
                            </label>
                            <input
                              type="text"
                              value={editStaffExp}
                              onChange={(e) => setEditStaffExp(e.target.value)}
                              className="w-full p-2 border rounded bg-slate-50"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                              URL Foto Real
                            </label>
                            <input
                              type="text"
                              value={editStaffAvatarUrl}
                              onChange={(e) =>
                                setEditStaffAvatarUrl(e.target.value)
                              }
                              className="w-full p-2 border rounded bg-slate-50 font-mono"
                            />
                          </div>
                          <div className="flex gap-2 items-end justify-between">
                            <div className="flex-1">
                              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                                Teks Avatar
                              </label>
                              <input
                                type="text"
                                value={editStaffAvatarText}
                                onChange={(e) =>
                                  setEditStaffAvatarText(e.target.value)
                                }
                                className="w-full p-2 border rounded bg-slate-50 uppercase font-bold text-center"
                                maxLength={2}
                              />
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleSaveInlineStaff(m.id)}
                                className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingStaffId(null)}
                                className="p-2 bg-slate-300 text-slate-700 rounded hover:bg-slate-400 transition"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 truncate">
                          {m.avatarUrl ? (
                            <img
                              src={m.avatarUrl}
                              alt={m.name}
                              loading="lazy"
                              width="40"
                              height="40"
                              className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                              {m.avatarText}
                            </div>
                          )}
                          <div className="truncate">
                            <h5 className="font-bold text-[#0F172A] text-xs leading-none">
                              {m.name}
                            </h5>
                            <span className="text-[10px] font-semibold text-[#D4AF37] tracking-wider uppercase block mt-1">
                              {m.role}
                            </span>
                            <span className="text-[9px] text-slate-400 block font-bold leading-normal mt-0.5">
                              Melapor kepada:{" "}
                              {m.reportsTo
                                ? teamMembers.find((p) => p.id === m.reportsTo)
                                    ?.name || m.reportsTo
                                : "Tiada / Pimpinan Atasan"}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-1.5 shrink-0 self-end md:self-center">
                          <button
                            type="button"
                            onClick={() => handleStartEditStaff(m)}
                            className="p-1.5 border text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 rounded transition"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                confirm(
                                  `Adakah anda pasti mahu memadam kakitangan: ${m.name}?`,
                                )
                              ) {
                                setTeamMembers(
                                  teamMembers.filter(
                                    (item) => item.id !== m.id,
                                  ),
                                );
                              }
                            }}
                            className="p-1.5 border border-rose-100 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition"
                            title="Padam"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* LOGO CLIENT SECTOR */}
        <div className="border-t pt-6 space-y-4">
          <div>
            <h4 className="font-bold text-[#0F172A] text-sm flex items-center gap-2">
              <Image className="w-4 h-4 text-[#D4AF37]" strokeWidth={2.5} />
              Logo Rakan Kerjasama & Korporat Client
            </h4>
            <p className="text-[11px] text-slate-500">
              Uruskan logo agensi kerajaan, TNB, atau syarikat pemaju yang
              dipaparkan di halaman utama. Anda boleh masukkan teks atau url
              imej logo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Nama Client / Agensi
              </label>
              <input
                type="text"
                value={newLogoName}
                onChange={(e) => setNewLogoName(e.target.value)}
                placeholder="Contoh: PETRONAS atau JKR PAHANG"
                className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                URL Imej Logo (Opsional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLogoUrl}
                  onChange={(e) => setNewLogoUrl(e.target.value)}
                  placeholder="Contoh: https://example.com/logo.png"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newLogoName.trim()) return;
                    const item: ClientLogo = {
                      id: `partner-${Date.now()}`,
                      name: newLogoName.trim(),
                      logoUrl: newLogoUrl.trim() || undefined,
                    };
                    setLogos([...logos, item]);
                    setNewLogoName("");
                    setNewLogoUrl("");
                  }}
                  className="bg-[#0F172A] text-white px-3 py-2 rounded hover:bg-slate-800 transition flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 text-[#D4AF37]" strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between shadow-2xs"
              >
                <div className="truncate pr-2">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {logo.name}
                  </p>
                  {logo.logoUrl ? (
                    <span className="text-[9px] text-[#D4AF37] block truncate font-mono">
                      {logo.logoUrl}
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-400 block font-heading font-extrabold uppercase tracking-tighter">
                      Stylized Text Logo
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setLogos(logos.filter((L) => L.id !== logo.id))
                  }
                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {logos.length === 0 && (
              <div className="col-span-full text-center py-4 text-slate-400 italic text-xs">
                Tiada logo client dimasukkan. Sila isi nama agensi di atas.
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <AlertCircle className="w-4 h-4 text-[#D4AF37]" />
            <span>
              Semua data disimpan di dalam pelayar sandbox dan diselaraskan
              secara langsung.
            </span>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 bg-[#0F172A] text-white px-5 py-3 rounded text-xs font-bold uppercase transition hover:bg-slate-800"
          >
            <Save className="w-4 h-4 text-[#D4AF37]" />
            <span>
              {isSaved ? "Berjaya Disimpan!" : "Simpan Profil Syarikat"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
