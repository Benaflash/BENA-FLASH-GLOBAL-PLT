import React, { useState } from "react";
import { Blog, BlogReaderLog } from "../types";
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  BookOpen,
  Eye,
  Share2,
  Search,
  Users,
  BarChart2,
  UserCheck,
  Globe,
  Clock,
  Mail,
} from "lucide-react";
import { optWebp } from "../data";

interface BlogManageProps {
  blogs: Blog[];
  readerLogs?: BlogReaderLog[];
  onAdd: (blog: Omit<Blog, "id">) => void;
  onEdit?: (id: string, blog: Partial<Blog>) => void;
  onDelete: (id: string) => void;
}

export default function BlogManage({
  blogs,
  readerLogs = [],
  onAdd,
  onEdit,
  onDelete,
}: BlogManageProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logSearch, setLogSearch] = useState("");
  const [logFilter, setLogFilter] = useState<"all" | "read" | "share">("all");
  const [selectedBlogFilter, setSelectedBlogFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    title: "",
    category: "Projek Korporat",
    snippet: "",
    content: "",
    readTime: "5 minit",
    author: "Kakitangan Kanan BFG",
    img: "",
    imagesText: "",
    websiteUrl: "https://www.bfgplt.com",
  });

  const categories = [
    "Projek Korporat",
    "Informasi Teknikal",
    "HVAC & Pendingin Hawa",
    "Solar PV & Lestari",
  ];

  // Analytics Calculations
  const totalReads = readerLogs.filter((l) => l.action === "read").length;
  const totalShares = readerLogs.filter((l) => l.action === "share").length;
  const uniqueReadersCount = new Set(
    readerLogs.map((l) => l.readerEmail).filter(Boolean)
  ).size;

  // Find most read blog
  const blogReadCounts: Record<string, number> = {};
  readerLogs.forEach((l) => {
    if (l.action === "read") {
      blogReadCounts[l.blogTitle] = (blogReadCounts[l.blogTitle] || 0) + 1;
    }
  });
  let topReadTitle = "Tiada Data";
  let maxReads = 0;
  Object.entries(blogReadCounts).forEach(([title, count]) => {
    if (count > maxReads) {
      maxReads = count;
      topReadTitle = title;
    }
  });

  // Filter logs for table
  const filteredLogs = readerLogs.filter((log) => {
    const matchesSearch =
      (log.readerEmail || "").toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.blogTitle || "").toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.platform || "").toLowerCase().includes(logSearch.toLowerCase());
    const matchesType = logFilter === "all" || log.action === logFilter;
    const matchesBlog =
      selectedBlogFilter === "all" || log.blogId === selectedBlogFilter;
    return matchesSearch && matchesType && matchesBlog;
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartEdit = (blog: Blog) => {
    setEditingId(blog.id);
    setFormData({
      title: blog.title,
      category: blog.category,
      snippet: blog.snippet,
      content: blog.content,
      readTime: blog.readTime,
      author: blog.author,
      img: blog.img,
      imagesText: blog.images ? blog.images.join("\n") : "",
      websiteUrl: blog.websiteUrl || "https://www.bfgplt.com",
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      title: "",
      category: "Projek Korporat",
      snippet: "",
      content: "",
      readTime: "5 minit",
      author: "Kakitangan Kanan BFG",
      img: "",
      imagesText: "",
      websiteUrl: "https://www.bfgplt.com",
    });
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    const defaultImg = "https://picsum.photos/800/600";

    const imagesArray = formData.imagesText
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url !== "");

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

    if (editingId && onEdit) {
      onEdit(editingId, {
        ...formData,
        img: formData.img.trim() || defaultImg,
        images: imagesArray,
      });
    } else {
      onAdd({
        ...formData,
        date: formattedDate,
        img: formData.img.trim() || defaultImg,
        images: imagesArray,
      });
    }

    handleCancel();
  };

  return (
    <div className="space-y-8">
      {/* Header & Write Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h3 className="font-bold text-[#0F172A] text-lg flex items-center gap-2 font-heading">
            <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            Halaman Artikel Pendidikan & Analisis Pembaca (SEO Blog)
          </h3>
          <p className="text-xs text-slate-500">
            Urus artikel pendidikan BFG dan pantau siapa yang membaca, membuka, dan berkongsi artikel secara masa nyata.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 bg-[#D4AF37] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase hover:bg-[#b8952c] transition shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? "Tutup Borang" : "Tulis Artikel Baru"}</span>
        </button>
      </div>

      {/* ADMIN-ONLY ANALYTICS & AUDIT PANEL */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded border border-[#D4AF37]/20">
                Admin Exclusive
              </span>
              <h4 className="text-base font-extrabold text-white">
                Statistik Pembaca & Log Capaian Artikel Blog
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Data nyata identiti emel pembaca yang membuka artikel serta jumlah perkongsian sosial.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-3 py-1.5 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
            <span>Kemaskini Nyata Firestore</span>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Jumlah Pembaca (Views)</p>
              <p className="text-2xl font-black text-white mt-1">{totalReads}</p>
              <p className="text-[10px] text-blue-400 mt-0.5">Kali Artikel Dibuka</p>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Eye className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Jumlah Perkongsian</p>
              <p className="text-2xl font-black text-[#D4AF37] mt-1">{totalShares}</p>
              <p className="text-[10px] text-amber-400 mt-0.5">Disebarkan ke Media Sosial</p>
            </div>
            <div className="p-3 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl border border-[#D4AF37]/20">
              <Share2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Pengguna Unik</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{uniqueReadersCount}</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">Identiti Emel Merekodkan Bacaan</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl flex items-center justify-between">
            <div className="overflow-hidden pr-2">
              <p className="text-[10px] uppercase font-bold text-slate-400">Artikel Paling Popolar</p>
              <p className="text-xs font-bold text-amber-300 mt-1 truncate" title={topReadTitle}>
                {topReadTitle}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{maxReads} Kali Dibaca</p>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari mengikut Emel Pembaca (cth. user@gmail.com) atau Tajuk Artikel..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Tabs */}
            <div className="bg-slate-800 border border-slate-700 p-1 rounded-xl flex items-center text-xs">
              <button
                onClick={() => setLogFilter("all")}
                className={`px-3 py-1 rounded-lg font-bold transition ${logFilter === "all" ? "bg-[#D4AF37] text-slate-900" : "text-slate-400 hover:text-white"}`}
              >
                Semua ({readerLogs.length})
              </button>
              <button
                onClick={() => setLogFilter("read")}
                className={`px-3 py-1 rounded-lg font-bold transition ${logFilter === "read" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                Membaca ({totalReads})
              </button>
              <button
                onClick={() => setLogFilter("share")}
                className={`px-3 py-1 rounded-lg font-bold transition ${logFilter === "share" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                Berkongsi ({totalShares})
              </button>
            </div>

            {/* Filter By Blog */}
            <select
              value={selectedBlogFilter}
              onChange={(e) => setSelectedBlogFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all">Semua Tajuk Artikel</option>
              {blogs.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title.length > 35 ? b.title.slice(0, 35) + "..." : b.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Detailed Logs Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/60 max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-800/90 text-slate-400 uppercase text-[9px] font-black tracking-wider sticky top-0 z-10">
              <tr>
                <th className="p-3.5 border-b border-slate-800">Masa / Tarikh</th>
                <th className="p-3.5 border-b border-slate-800">Emel Pengguna / Pembaca</th>
                <th className="p-3.5 border-b border-slate-800">Artikel Blog</th>
                <th className="p-3.5 border-b border-slate-800">Jenis Aktiviti</th>
                <th className="p-3.5 border-b border-slate-800">Platform / Saluran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                    Tiada rekod aktiviti pembaca dijumpai berdasarkan carian semasa.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const logDate = log.timestamp
                    ? new Date(log.timestamp).toLocaleString("ms-MY", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-";
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {logDate}
                      </td>
                      <td className="p-3.5 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{log.readerEmail || "tetamu@bfgplt.com"}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-amber-200/90 max-w-xs truncate" title={log.blogTitle}>
                        {log.blogTitle}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {log.action === "read" ? (
                          <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                            <Eye className="w-3 h-3" /> Membaca Artikel
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                            <Share2 className="w-3 h-3" /> Berkongsi Artikel
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-400 font-medium">
                        {log.platform || "Web Browser"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm"
        >
          <h4 className="text-xs font-extrabold uppercase text-[#0F172A] tracking-wider mb-2 border-l-4 border-[#D4AF37] pl-3">
            {editingId
              ? "Kemaskini Borang Butiran Artikel"
              : "Borang Terbitan Artikel SEO Baru"}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                Tajuk Artikel
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Cth: Panduan Penyelenggaraan Aircond VRV Bangunan"
                className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                Kategori Artikel
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                Nama Penulis / Pegawai
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                Anggaran Masa Membaca
              </label>
              <input
                type="text"
                name="readTime"
                value={formData.readTime}
                onChange={handleChange}
                placeholder="Cth: 4 Minit"
                className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                URL Gambar Utama (Featured Banner)
              </label>
              <input
                type="url"
                name="img"
                value={formData.img}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                Pautan URL Website Rasmi / Rujukan Artikel (Sumber Rujukan)
              </label>
              <input
                type="url"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleChange}
                placeholder="https://www.bfgplt.com atau pautan luar..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                URL Gambar Tambahan (Satu URL Setiap Baris)
              </label>
              <textarea
                name="imagesText"
                value={formData.imagesText}
                onChange={handleChange}
                rows={2}
                placeholder="https://...&#10;https://..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                Ringkasan Artikel (Snippet Preview)
              </label>
              <textarea
                name="snippet"
                value={formData.snippet}
                onChange={handleChange}
                rows={2}
                placeholder="Ringkasan pendek untuk dipaparkan pada kad artikel..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
              Kandungan Penuh Artikel
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={8}
              required
              placeholder="Tuliskan tip teknikal, rujukan peraturan kesihatan elektrik, atau panduan reka bentuk di sini dengan terperinci..."
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
              className="bg-[#0F172A] text-white px-5 py-2 rounded-xl text-xs font-bold uppercase transition hover:bg-slate-800 shadow-sm"
            >
              {editingId ? "Simpan Kemaskini" : "Terbitkan Artikel"}
            </button>
          </div>
        </form>
      )}

      {/* Blog list for editing/deletion with reader stats */}
      <div className="space-y-4">
        <h4 className="font-extrabold text-[#0F172A] text-sm flex items-center justify-between">
          <span>Senarai Artikel Diterbitkan ({blogs.length})</span>
          <span className="text-xs font-medium text-slate-500">
            Termasuk metrik pembaca dan perkongsian terkumpul
          </span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => {
            const blogReads = readerLogs.filter((l) => l.blogId === blog.id && l.action === "read").length || (blog.viewsCount || 0);
            const blogShares = readerLogs.filter((l) => l.blogId === blog.id && l.action === "share").length || (blog.sharesCount || 0);

            return (
              <div
                key={blog.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="relative h-44 bg-slate-100">
                    <img
                      src={optWebp(blog.img)}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      <button
                        onClick={() => handleStartEdit(blog)}
                        className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-full shadow-md transition-colors cursor-pointer"
                        title="Kemaskini Artikel"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(blog.id)}
                        className="p-2 bg-white text-rose-600 hover:bg-rose-50 rounded-full shadow-md transition-colors cursor-pointer"
                        title="Padam Artikel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="absolute bottom-3 left-3 bg-[#0F172A] text-[#D4AF37] text-[9px] uppercase font-bold px-2.5 py-1 rounded">
                      {blog.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{blog.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{blog.readTime}</span>
                      </div>
                    </div>

                    <h4 className="font-bold text-[#0F172A] text-sm line-clamp-2 leading-snug">
                      {blog.title}
                    </h4>
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                      {blog.snippet}
                    </p>

                    {/* Reader & Share Counters on Blog Card */}
                    <div className="pt-2 flex items-center gap-2">
                      <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-700 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          Pembaca
                        </span>
                        <span className="text-xs font-black text-blue-900">{blogReads}</span>
                      </div>

                      <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                          <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                          Kongsi
                        </span>
                        <span className="text-xs font-black text-amber-900">{blogShares}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>
                    Penulis:{" "}
                    <strong className="text-slate-600 font-bold">
                      {blog.author}
                    </strong>
                  </span>
                  {blog.websiteUrl && (
                    <span className="text-[#D4AF37] font-bold flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      Website
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
