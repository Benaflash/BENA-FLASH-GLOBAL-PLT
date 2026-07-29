import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Download,
  Database,
  CloudLightning,
  RefreshCw,
  HardDrive,
  FileText,
  Calendar,
  CheckCircle2,
} from "lucide-react";

interface Backup {
  id: string;
  timestamp: string;
  fileName: string;
  jsonData: string;
  sizeBytes: string | number;
}

export default function BackupDashboard() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const fetchBackups = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/backups");
      if (!res.ok) throw new Error("Gagal mengambil data dari server");
      const data = await res.json();
      if (data.success) {
        setBackups(data.backups || []);
      } else {
        setError(data.error || "Gagal memproses data.");
      }
    } catch (err: any) {
      setError(err.message || "Ralat rangkaian.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const triggerBackupNow = async () => {
    setIsBackingUp(true);
    setSuccessMsg("");
    setError("");
    try {
      const res = await fetch("/api/backup-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Gagal menjalankan sandaran database");
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Sandaran automatik berjaya! Fail rujukan: ${data.fileName}`);
        fetchBackups();
      } else {
        setError(data.error || "Sandaran gagal.");
      }
    } catch (err: any) {
      setError(err.message || "Ralat rangkaian semasa sandaran.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDownloadBackup = (backup: Backup) => {
    try {
      // Decode stringified JSON and download
      const dataStr = backup.jsonData;
      if (!dataStr) {
        alert("Ralat: Tiada data kandungan ditemui!");
        return;
      }
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", backup.fileName || `${backup.id}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e: any) {
      alert("Gagal memuat turun: " + e.message);
    }
  };

  const formatSize = (bytesStr: string | number) => {
    const bytes = Number(bytesStr || 0);
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Card Alert Banner */}
      <div className="bg-[#0F172A] border-b-4 border-[#D4AF37] rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-12 -translate-y-6">
          <Database className="w-64 h-64 text-[#D4AF37]" />
        </div>

        <div className="space-y-2 relative z-10">
          <span className="bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full inline-block tracking-wider">
            Sistem Sandaran Keselamatan Awam (Durable Backups)
          </span>
          <h3 className="font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
            <CloudLightning className="w-6 h-6 text-[#D4AF37]" />
            Sandaran Automatik 24 Jam BFG PLT
          </h3>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Sistem ini melakukan sandaran keseluruhan pangkalan data (Firestore) termasuk senarai tempahan, pelanggan, testimoni, blog, dan inventori secara automatik ke dalam storan sandaran Firebase setiap 24 jam.
          </p>
        </div>

        <button
          type="button"
          disabled={isBackingUp}
          onClick={triggerBackupNow}
          className="bg-[#D4AF37] hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs uppercase transition flex items-center gap-2 cursor-pointer shadow-lg tracking-wider shrink-0 relative z-10"
        >
          {isBackingUp ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Menjalankan Sandaran...
            </>
          ) : (
            <>
              <Database className="w-4 h-4" /> Sandar Pangkalan Data Sekarang
            </>
          )}
        </button>
      </div>

      {/* FEEDBACK BANNERS */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          Ralat: {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* BACKUP LISTS TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b pb-3">
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <HardDrive className="w-4.5 h-4.5 text-[#D4AF37]" />
              Sejarah Fail Sandaran Durable
            </h4>
            <p className="text-[11px] text-slate-500">
              Muat turun salinan data offline (JSON) untuk tujuan keselamatan luaran.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchBackups}
            className="p-2 text-slate-500 hover:text-[#D4AF37] hover:bg-slate-50 rounded-xl transition"
            title="Segarkan Senarai"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-semibold flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
            Membaca data sandaran dari Firebase...
          </div>
        ) : backups.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 border border-dashed rounded-2xl bg-slate-50/50">
            <Database className="w-12 h-12 mx-auto mb-2 text-slate-200" />
            Tiada rekod sandaran ditemui. Tekan butang di atas untuk menjana fail sandaran pertama anda!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b">
                  <th className="py-3 px-4">Tarikh & Masa Sandaran</th>
                  <th className="py-3 px-4">Nama Fail Sandaran</th>
                  <th className="py-3 px-4">Saiz Data</th>
                  <th className="py-3 px-4">Status Keselamatan</th>
                  <th className="py-3 px-4 text-right">Tindakan Fail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {backups.map((bk) => (
                  <tr key={bk.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <div>
                        <span className="block text-slate-800 font-bold">
                          {new Date(bk.timestamp).toLocaleString("ms-MY")}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-mono">
                          ID: {bk.id}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {bk.fileName || `backup_${bk.id}.json`}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono">
                      {formatSize(bk.sizeBytes)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Selesai (Durable)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDownloadBackup(bk)}
                        className="bg-slate-900 hover:bg-[#D4AF37] hover:text-slate-950 text-white font-bold uppercase px-3 py-1.5 rounded-lg text-[9.5px] transition flex items-center gap-1.5 ml-auto cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" /> Muat Turun
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
