import React, { useState } from "react";
import { Certification } from "../types";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Award,
  Save,
  Clipboard,
} from "lucide-react";

interface CertificationManageProps {
  certifications: Certification[];
  onSave: (updated: Certification[]) => void;
}

export default function CertificationManage({
  certifications,
  onSave,
}: CertificationManageProps) {
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Certification>>({});
  const [newCertForm, setNewCertForm] = useState<Partial<Certification>>({
    name: "",
    issuingBody: "",
    logoText: "",
    description: "",
    registrationNo: "",
    validity: "",
    specialties: [],
    imageUrl: "",
    pdfUrl: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Bullets lists helpers
  const [editSpecialtiesText, setEditSpecialtiesText] = useState("");
  const [newSpecialtiesText, setNewSpecialtiesText] = useState("");

  const handleStartEdit = (cert: Certification) => {
    setEditingCertId(cert.id);
    setEditForm(cert);
    setEditSpecialtiesText((cert.specialties || []).join("\n"));
  };

  const handleCancelEdit = () => {
    setEditingCertId(null);
    setEditForm({});
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name || !editForm.issuingBody || !editForm.logoText) {
      alert("Sila lengkapkan semua medan wajib.");
      return;
    }

    const specialtiesList = editSpecialtiesText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updated = certifications.map((c) => {
      if (c.id === editingCertId) {
        return {
          ...c,
          ...editForm,
          specialties: specialtiesList,
          imageUrl: editForm.imageUrl || undefined,
          pdfUrl: editForm.pdfUrl || undefined,
        } as Certification;
      }
      return c;
    });

    onSave(updated);
    setEditingCertId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    if (confirm("Adakah anda pasti mahu memadam sijil / perakuan ini?")) {
      const updated = certifications.filter((c) => c.id !== id);
      onSave(updated);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newCertForm.name ||
      !newCertForm.issuingBody ||
      !newCertForm.logoText
    ) {
      alert("Sila lengkapkan semua medan wajib.");
      return;
    }

    const specialtiesList = newSpecialtiesText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: newCertForm.name,
      issuingBody: newCertForm.issuingBody,
      logoText: newCertForm.logoText,
      description: newCertForm.description || "",
      registrationNo: newCertForm.registrationNo || "",
      validity: newCertForm.validity || "",
      specialties: specialtiesList,
      imageUrl: newCertForm.imageUrl || undefined,
      pdfUrl: newCertForm.pdfUrl || undefined,
    };

    onSave([...certifications, newCert]);
    setNewCertForm({
      name: "",
      issuingBody: "",
      logoText: "",
      description: "",
      registrationNo: "",
      validity: "",
      specialties: [],
      imageUrl: "",
      pdfUrl: "",
    });
    setNewSpecialtiesText("");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-[#0F172A] text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-[#D4AF37]" />
            Pengurusan Sijil, Perakuan & Lesen Syarikat (G2)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Kemaskini kelayakan rasmi daripada CIDB, ST, MOF atau badan piawaian
            lain di sini demi memelihara integriti permohonan sebut harga
            bumiputera.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#0F172A] text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition self-start sm:self-center"
        >
          {showAddForm ? (
            <X className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {showAddForm ? "Tutup Borang" : "Tambah Sijil Baharu"}
        </button>
      </div>

      {/* Add Sijil Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 shadow-inner"
        >
          <div className="border-b pb-2 mb-4">
            <h4 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider">
              Borang Pendaftaran Sijil / Lesen Baharu
            </h4>
            <p className="text-[10px] text-slate-400">
              Masukkan butiran rasmi untuk dikesan di halaman awam dan dimuat
              turun oleh rakan niaga.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Nama Sijil / Lesen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Perakuan Pendaftaran CIDB (G2)"
                value={newCertForm.name}
                onChange={(e) =>
                  setNewCertForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full p-2.5 border border-slate-300 rounded bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Badan Penerbit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Suruhanjaya Tenaga (ST)"
                value={newCertForm.issuingBody}
                onChange={(e) =>
                  setNewCertForm((prev) => ({
                    ...prev,
                    issuingBody: e.target.value,
                  }))
                }
                className="w-full p-2.5 border border-slate-300 rounded bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Kod / Logo Teks Ringkas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: CIDB G2 atau ST CLASS C"
                value={newCertForm.logoText}
                onChange={(e) =>
                  setNewCertForm((prev) => ({
                    ...prev,
                    logoText: e.target.value,
                  }))
                }
                className="w-full p-2.5 border border-slate-300 rounded bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                No. Pendaftaran Sijil / Lesen
              </label>
              <input
                type="text"
                placeholder="Contoh: 202304001234 atau ST(SEL)REG-9876"
                value={newCertForm.registrationNo}
                onChange={(e) =>
                  setNewCertForm((prev) => ({
                    ...prev,
                    registrationNo: e.target.value,
                  }))
                }
                className="w-full p-2.5 border border-slate-300 rounded bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Tempoh Sah Laku
              </label>
              <input
                type="text"
                placeholder="Contoh: Jun 2025 - Jun 2028 (Aktif)"
                value={newCertForm.validity}
                onChange={(e) =>
                  setNewCertForm((prev) => ({
                    ...prev,
                    validity: e.target.value,
                  }))
                }
                className="w-full p-2.5 border border-slate-300 rounded bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                URL Imej Sijil (Bagi Tontonan Sahaja - Dilindungi daripada Muat
                Turun)
              </label>
              <input
                type="text"
                placeholder="Contoh: https://example.com/sijil-cidb-original.jpg"
                value={newCertForm.imageUrl || ""}
                onChange={(e) =>
                  setNewCertForm((prev) => ({
                    ...prev,
                    imageUrl: e.target.value,
                  }))
                }
                className="w-full p-2.5 border border-slate-300 rounded bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                URL Fail PDF Sijil (Alternatif Tontonan Sahaja)
              </label>
              <input
                type="text"
                placeholder="Contoh: https://example.com/sijil-cidb-original.pdf"
                value={newCertForm.pdfUrl || ""}
                onChange={(e) =>
                  setNewCertForm((prev) => ({
                    ...prev,
                    pdfUrl: e.target.value,
                  }))
                }
                className="w-full p-2.5 border border-slate-300 rounded bg-white font-mono"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Ringkasan Deskripsi Sijil
            </label>
            <textarea
              rows={2}
              placeholder="Berikan keterangan ringkas mengenai kepentingan kelayakan ini bagi syarikat..."
              value={newCertForm.description}
              onChange={(e) =>
                setNewCertForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full p-2.5 border border-slate-300 rounded bg-white"
            />
          </div>

          <div className="text-xs">
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Butiran Spesifikasi Sijil / Bullets (Tulis satu perkara setiap
              satu barisan beza)
            </label>
            <textarea
              rows={3}
              placeholder="Contoh:
B04: Kerja Am Bangunan
B01: Kerja Kejuruteraan Awam
ME01: Sistem Penyaman Udara"
              value={newSpecialtiesText}
              onChange={(e) => setNewSpecialtiesText(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded bg-white font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" /> Simpan Sijil
            </button>
          </div>
        </form>
      )}

      {/* Sijil List */}
      <div className="space-y-4">
        {certifications.length === 0 ? (
          <div className="border border-dashed p-8 rounded-2xl text-center text-slate-400 text-xs">
            Tiada sijil berdaftar dikesan dalam pangkalan data. Gunakan borang
            di atas untuk mendaftarkannya sekarang.
          </div>
        ) : (
          certifications.map((cert) => {
            const isEditing = editingCertId === cert.id;
            return (
              <div
                key={cert.id}
                className="bg-white border rounded-2xl shadow-xs overflow-hidden"
              >
                {isEditing ? (
                  /* Edit Mode */
                  <form
                    onSubmit={handleSaveEdit}
                    className="p-6 space-y-4 text-xs bg-amber-50/30"
                  >
                    <div className="border-b pb-2 mb-2">
                      <span className="font-extrabold text-amber-700 text-[10px] uppercase tracking-wider">
                        Mod Kemaskini Sijil
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">
                          Nama Sijil <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full p-2.5 border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">
                          Badan Penerbit <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editForm.issuingBody}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              issuingBody: e.target.value,
                            }))
                          }
                          className="w-full p-2.5 border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">
                          Logo Teks Ringkas{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editForm.logoText}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              logoText: e.target.value,
                            }))
                          }
                          className="w-full p-2.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">
                          No. Pendaftaran
                        </label>
                        <input
                          type="text"
                          value={editForm.registrationNo || ""}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              registrationNo: e.target.value,
                            }))
                          }
                          className="w-full p-2.5 border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">
                          Tempoh Sah Laku
                        </label>
                        <input
                          type="text"
                          value={editForm.validity || ""}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              validity: e.target.value,
                            }))
                          }
                          className="w-full p-2.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">
                          URL Imej Sijil (Bagi Tontonan Sahaja)
                        </label>
                        <input
                          type="text"
                          value={editForm.imageUrl || ""}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              imageUrl: e.target.value,
                            }))
                          }
                          className="w-full p-2.5 border border-slate-300 rounded bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">
                          URL Fail PDF Sijil (Alternatif Paparan Sahaja)
                        </label>
                        <input
                          type="text"
                          value={editForm.pdfUrl || ""}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              pdfUrl: e.target.value,
                            }))
                          }
                          className="w-full p-2.5 border border-slate-300 rounded bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">
                        Deskripsi Ringkas
                      </label>
                      <textarea
                        rows={2}
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full p-2.5 border border-slate-300 rounded bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">
                        Butiran Spesifikasi Sijil (Satu per baris)
                      </label>
                      <textarea
                        rows={3}
                        value={editSpecialtiesText}
                        onChange={(e) => setEditSpecialtiesText(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded bg-white font-mono text-xs"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-bold"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-1 shadow"
                      >
                        <Check className="w-4 h-4" /> Simpan Perubahan
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Display Mode */
                  <div className="p-6 flex flex-col md:flex-row items-start gap-4 justify-between">
                    <div className="flex items-start gap-4">
                      {/* Logo Badge Mimicker */}
                      <div className="w-16 h-20 bg-slate-50 border-2 border-[#D4AF37]/50 rounded-xl flex flex-col items-center justify-center p-1.5 shrink-0 select-none">
                        <span className="text-[9px] font-black text-slate-400 text-center border-b pb-0.5 w-full uppercase block">
                          {cert.logoText.split(" ")[0]}
                        </span>
                        <span className="text-[12px] font-black text-[#0F172A] text-center block mt-1 tracking-tighter leading-tight whitespace-normal max-w-full">
                          {cert.logoText.split(" ").slice(1).join(" ") ||
                            cert.logoText}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-extrabold text-[#0F172A] text-sm uppercase">
                          {cert.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 block font-bold">
                          Diterbit oleh:{" "}
                          <strong className="text-slate-600 font-bold">
                            {cert.issuingBody}
                          </strong>
                        </span>

                        {(cert.registrationNo || cert.validity) && (
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 py-1 font-mono">
                            {cert.registrationNo && (
                              <span>
                                No Sijil:{" "}
                                <strong className="text-slate-700 font-bold">
                                  {cert.registrationNo}
                                </strong>
                              </span>
                            )}
                            {cert.validity && (
                              <span>
                                {" "}
                                validity:{" "}
                                <strong className="text-slate-700 font-bold">
                                  {cert.validity}
                                </strong>
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-2xl">
                          {cert.description}
                        </p>

                        {cert.specialties && cert.specialties.length > 0 && (
                          <div className="mt-2 pl-4 border-l-2 border-[#D4AF37]/40 space-y-0.5">
                            <span className="text-[9px] text-[#D4AF37] uppercase font-bold tracking-wider block">
                              Kelayakan Bidang / Kod Kerja:
                            </span>
                            {cert.specialties.map((spec, idx) => (
                              <span
                                key={idx}
                                className="block text-[10px] md:text-xs text-slate-600 list-item ml-2 list-disc"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0 self-end md:self-start">
                      <button
                        onClick={() => handleStartEdit(cert)}
                        className="p-2 border text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 rounded-lg transition"
                        title="Kemaskini Sijil"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cert.id)}
                        className="p-2 border border-rose-100 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        title="Padam Sijil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
