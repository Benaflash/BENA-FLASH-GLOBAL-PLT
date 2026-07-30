import React, { useState } from "react";
import { Career, Application } from "../types";
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  Mail,
  FolderOpen,
  AlignLeft,
  FileText,
} from "lucide-react";

interface CareerManageProps {
  careers: Career[];
  applications: Application[];
  onAddCareer: (career: Omit<Career, "id">) => void;
  onEditCareer?: (id: string, career: Partial<Career>) => void;
  onDeleteCareer: (id: string) => void;
  onAddApplication?: (app: Omit<Application, "id" | "date">) => void;
  onEditApplication?: (id: string, app: Partial<Application>) => void;
  onDeleteApplication: (id: string) => void;
}

export default function CareerManage({
  careers,
  applications,
  onAddCareer,
  onEditCareer,
  onDeleteCareer,
  onAddApplication,
  onEditApplication,
  onDeleteApplication,
}: CareerManageProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    department: "M&E Engineering Division",
    location: "Kuala Lumpur & Selangor",
    jobType: "Full-time" as Career["jobType"],
    salary: "",
    requirementsText: "",
    status: "Active" as Career["status"],
  });

  // Candidate/Application states for manual entry & editing
  const [showAppForm, setShowAppForm] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [appFormData, setAppFormData] = useState({
    careerId: "",
    name: "",
    email: "",
    phone: "",
    experienceSummary: "",
    status: "New" as "New" | "Reviewed" | "Contacted" | "Rejected",
  });

  const jobTypes: Career["jobType"][] = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartEdit = (job: Career) => {
    setEditingId(job.id);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      jobType: job.jobType,
      salary: job.salary,
      requirementsText: job.requirements.join("\n"),
      status: job.status,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      title: "",
      department: "M&E Engineering Division",
      location: "Kuala Lumpur & Selangor",
      jobType: "Full-time",
      salary: "",
      requirementsText: "",
      status: "Active",
    });
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    // Split requirements by line
    const requirements = formData.requirementsText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (editingId && onEditCareer) {
      onEditCareer(editingId, {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        jobType: formData.jobType,
        salary: formData.salary || "Kompetitif mengikut pengalaman",
        requirements,
        status: formData.status,
      });
    } else {
      onAddCareer({
        title: formData.title,
        department: formData.department,
        location: formData.location,
        jobType: formData.jobType,
        salary: formData.salary || "Kompetitif mengikut pengalaman",
        requirements,
        status: formData.status,
      });
    }

    handleCancel();
  };

  // Candidate detail handlers
  const handleAppChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setAppFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartAppEdit = (app: Application) => {
    setEditingAppId(app.id);
    setAppFormData({
      careerId: app.careerId,
      name: app.name,
      email: app.email,
      phone: app.phone,
      experienceSummary: app.experienceSummary,
      status: app.status || "New",
    });
    setShowAppForm(true);
  };

  const handleCancelApp = () => {
    setEditingAppId(null);
    setAppFormData({
      careerId: "",
      name: "",
      email: "",
      phone: "",
      experienceSummary: "",
      status: "New",
    });
    setShowAppForm(false);
  };

  const handleAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appFormData.name || !appFormData.email) return;

    // Set fallback careerId to first career if none selected
    let targetCareerId = appFormData.careerId;
    if (!targetCareerId && careers.length > 0) {
      targetCareerId = careers[0].id;
    }

    const matchedCareer = careers.find((c) => c.id === targetCareerId);
    const careerTitle = matchedCareer ? matchedCareer.title : "Jawatan Umum";

    if (editingAppId && onEditApplication) {
      onEditApplication(editingAppId, {
        careerId: targetCareerId,
        careerTitle,
        name: appFormData.name,
        email: appFormData.email,
        phone: appFormData.phone,
        experienceSummary: appFormData.experienceSummary,
        status: appFormData.status,
      });
    } else if (onAddApplication) {
      onAddApplication({
        careerId: targetCareerId,
        careerTitle,
        name: appFormData.name,
        email: appFormData.email,
        phone: appFormData.phone,
        experienceSummary: appFormData.experienceSummary,
        status: appFormData.status,
      });
    }

    handleCancelApp();
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1 - Manage vacancies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-bold text-[#0F172A] text-lg">
              Halaman Pengambilan Pasukan G2
            </h3>
            <p className="text-xs text-slate-500">
              Iklankan kekosongan jawatan teknikal (Chargeman, Wireman,
              Technicians, Internship).
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#0F172A] text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" strokeWidth={2.5} />
            <span>{showForm ? "Tutup Borang" : "Tambah Jawatan Taklimat"}</span>
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4"
          >
            <h4 className="text-xs font-extrabold uppercase text-[#0F172A] tracking-wider mb-2 border-l-4 border-[#D4AF37] pl-2">
              {editingId
                ? "Borang Kemaskini Maklumat Jawatan"
                : "Maklumat Kekosongan Jawatan"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Tajuk Jawatan
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="cth: Chargeman A4 (Full Time)"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Bahagian / Jabatan
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="cth: M&E Engineering Division"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Jenis Pekerjaan
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
                >
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Gaji Ditawarkan
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="cth: RM 3,500 - RM 4,800"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Lokasi Stesen Kerja
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="cth: Seri Kembangan, Selangor"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Kriteria & Syarat Kekompetenan Rasmi (Satu kriteria setiap
                baris)
              </label>
              <textarea
                name="requirementsText"
                value={formData.requirementsText}
                onChange={handleChange}
                rows={4}
                required
                placeholder="cth: Memiliki Kekompetenan ST A4&#10;Pengalaman 3 Tahun&#10;Sedia bekerja outstation..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:bg-slate-100 rounded"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-[#0F172A] text-white px-5 py-2 rounded text-xs font-bold uppercase transition hover:bg-slate-800"
              >
                {editingId ? "Simpan Perubahan" : "Simpan Jawatan"}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[#0F172A] font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Nama Jawatan</th>
                  <th className="p-4">Jabatan</th>
                  <th className="p-4">Lokasi & jenis</th>
                  <th className="p-4">Gaji</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {careers.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-slate-50/55 transition-colors"
                  >
                    <td className="p-4 font-bold text-slate-800">
                      {job.title}
                    </td>
                    <td className="p-4 font-semibold text-slate-600">
                      {job.department}
                    </td>
                    <td className="p-4 text-slate-500">
                      <span>{job.location}</span>
                      <span className="block text-[10px] font-bold text-[#D4AF37] uppercase">
                        {job.jobType}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {job.salary}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded ${
                          job.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(job)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Kemaskini Jawatan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCareer(job.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Padam Iklan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 2 - View job applications received */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-bold text-[#0F172A] text-md">
              Pemohon Yang Berminat (Resume & Butiran)
            </h3>
            <p className="text-xs text-slate-500">
              Rekod calon-calon bertalenta bumiputera yang telah menghantar
              permohonan melalui borang rasmi.
            </p>
          </div>
          <button
            onClick={() => {
              if (showAppForm) {
                handleCancelApp();
              } else {
                setShowAppForm(true);
              }
            }}
            className="flex items-center gap-2 bg-[#0F172A] text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" strokeWidth={2.5} />
            <span>
              {showAppForm ? "Tutup Borang Calon" : "Tambah Calon Manual"}
            </span>
          </button>
        </div>

        {showAppForm && (
          <form
            onSubmit={handleAppSubmit}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4"
          >
            <h4 className="text-xs font-extrabold uppercase text-[#0F172A] tracking-wider mb-2 border-l-4 border-[#D4AF37] pl-2">
              {editingAppId
                ? "Kemaskini Butiran Calon"
                : "Daftar Calon Baru Mandiri"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Nama Penuh Calon
                </label>
                <input
                  type="text"
                  name="name"
                  value={appFormData.name}
                  onChange={handleAppChange}
                  required
                  placeholder="cth: Muhammad Afiq"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Nombor Telefon
                </label>
                <input
                  type="text"
                  name="phone"
                  value={appFormData.phone}
                  onChange={handleAppChange}
                  required
                  placeholder="cth: 0137788990"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  E-mel Calon
                </label>
                <input
                  type="email"
                  name="email"
                  value={appFormData.email}
                  onChange={handleAppChange}
                  required
                  placeholder="cth: afiq@gmail.com"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
                />
              </div>

              {editingAppId && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Status Pemprosesan Calon
                  </label>
                  <select
                    name="status"
                    value={appFormData.status}
                    onChange={handleAppChange}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white font-bold text-rose-700"
                  >
                    <option value="New">Baru (Belum Diproses)</option>
                    <option value="Reviewed">Disemak / Reviewing</option>
                    <option value="Contacted">Dihubungi / Contacted</option>
                    <option value="Rejected">Ditolak / Archived</option>
                  </select>
                </div>
              )}

              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Jawatan Yang Dimohon / Dipadankan
                </label>
                <select
                  name="careerId"
                  value={appFormData.careerId}
                  onChange={handleAppChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
                >
                  <option value="">-- Sila Pilih Jawatan / Bidang --</option>
                  {careers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Ringkasan Pengalaman & Latar Belakang
                </label>
                <textarea
                  name="experienceSummary"
                  value={appFormData.experienceSummary}
                  onChange={handleAppChange}
                  rows={4}
                  required
                  placeholder="cth: Mempunyai sijil kekompetenan Wireman PW4, berpengalaman 2 tahun dalam pemasangan papan agihan elektrik..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelApp}
                className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:bg-slate-100 rounded"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-[#0F172A] text-white px-5 py-2 rounded text-xs font-bold uppercase transition hover:bg-slate-800"
              >
                {editingAppId ? "Kemaskini Calon" : "Daftar Calon"}
              </button>
            </div>
          </form>
        )}

        {applications.length === 0 ? (
          <div className="p-8 border border-dashed rounded-xl text-center text-slate-400 text-xs">
            Tiada aplikasi calon diterima buat masa kini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative shadow-sm"
              >
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <button
                    onClick={() => handleStartAppEdit(app)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Kemaskini Calon"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteApplication(app.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Gugurkan Permohonan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#D4AF37]">
                  {app.careerTitle}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  {app.name}
                </h4>
                <span className="text-[10px] text-slate-400 block mb-3">
                  Diterima: {app.date}
                </span>

                <div className="space-y-1.5 text-xs mb-4">
                  <p className="text-slate-600 font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <strong>No. Tel:</strong>{" "}
                    <a href={`tel:${app.phone}`} className="hover:underline">
                      {app.phone}
                    </a>
                  </p>
                  <p className="text-slate-600 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <strong>E-mel:</strong>{" "}
                    <a href={`mailto:${app.email}`} className="hover:underline">
                      {app.email}
                    </a>
                  </p>
                </div>

                <div className="bg-white p-3 border border-slate-100 rounded-lg text-xs text-slate-700 leading-relaxed font-sans">
                  <span className="block font-bold text-[9px] uppercase text-slate-400 mb-1">
                    Ringkasan Pengalaman Calon
                  </span>
                  {app.experienceSummary}
                </div>

                {/* Dokumen Lampiran Calon */}
                {(app.resumeUrl || app.certificatesUrl || app.othersUrl) && (
                  <div className="mt-3.5 pt-3.5 border-t border-slate-200/80 space-y-2">
                    <span className="block font-bold text-[9px] uppercase text-slate-400 tracking-wider">
                      Dokumen Sokongan Dilampirkan (Boleh Muat Turun)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          download={app.resumeName || "Resume_Calon.pdf"}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 rounded-lg text-[10px] font-bold transition duration-150 cursor-pointer"
                          title={`Muat turun ${app.resumeName || "Resume"}`}
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          <span>Resume CV</span>
                        </a>
                      )}
                      {app.certificatesUrl && (
                        <a
                          href={app.certificatesUrl}
                          download={
                            app.certificatesName || "Sijil_Kompetensi.pdf"
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold transition duration-150 cursor-pointer"
                          title={`Muat turun ${app.certificatesName || "Sijil"}`}
                        >
                          <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Sijil & Kompetensi</span>
                        </a>
                      )}
                      {app.othersUrl && (
                        <a
                          href={app.othersUrl}
                          download={app.othersName || "Dokumen_Sokongan.pdf"}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-100 text-purple-700 rounded-lg text-[10px] font-bold transition duration-150 cursor-pointer"
                          title={`Muat turun ${app.othersName || "Dokumen"}`}
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-purple-500" />
                          <span>Sijil Lain / CIDB</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Calon & Tindakan Pantas */}
                <div className="mt-4 pt-3.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400">
                      Status Mandiri:
                    </span>
                    <select
                      value={app.status || "New"}
                      onChange={(e) => {
                        if (onEditApplication) {
                          onEditApplication(app.id, {
                            status: e.target.value as any,
                          });
                        }
                      }}
                      className={`text-[11px] font-bold py-1 px-2.5 rounded-md border focus:outline-none transition-colors cursor-pointer ${
                        (app.status || "New") === "New"
                          ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          : (app.status || "New") === "Reviewed"
                            ? "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
                            : (app.status || "New") === "Contacted"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-250 hover:bg-slate-150"
                      }`}
                    >
                      <option value="New">Baru (Belum Diproses)</option>
                      <option value="Reviewed">Disemak / Reviewing</option>
                      <option value="Contacted">Dihubungi / Contacted</option>
                      <option value="Rejected">Ditolak / Archived</option>
                    </select>
                  </div>

                  {(app.status || "New") === "New" ? (
                    <span className="inline-flex items-center gap-1.5 text-[9px] bg-rose-600 font-extrabold text-white px-2.5 py-1 rounded-full shadow-xs animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white block"></span>
                      BARU / UNREAD
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[9px] bg-emerald-100 font-extrabold text-[#0D9488] px-2.5 py-1 rounded-full border border-emerald-300">
                      DIKEMASKINI:{" "}
                      {app.status === "Reviewed"
                        ? "DISEMAK"
                        : app.status === "Contacted"
                          ? "DIHUBUNGI"
                          : "DITOLAK"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
