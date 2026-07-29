import React, { useState } from "react";
import { Testimonial } from "../types";
import { Check, Trash2, Edit, Save, Undo, Loader2 } from "lucide-react";

interface TestimonialManageProps {
  testimonials: Testimonial[];
  onUpdate: (id: string, data: Partial<Testimonial>) => Promise<any> | any;
  onDelete: (id: string) => Promise<any> | any;
}

export default function TestimonialManage({
  testimonials,
  onUpdate,
  onDelete,
}: TestimonialManageProps) {
  // Inline editing state fields
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editCompany, setEditCompany] = useState<string>("");
  const [editRating, setEditRating] = useState<number>(5);
  const [editFeedback, setEditFeedback] = useState<string>("");
  const [editVerified, setEditVerified] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");

  // Busy loading state to keep track of any active database updates
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleStartEdit = (t: Testimonial) => {
    setErrorText("");
    setEditingId(t.id);
    setEditName(t.clientName);
    setEditCompany(t.clientCompany || "");
    setEditRating(t.rating);
    setEditFeedback(t.feedback);
    setEditVerified(t.verified);
  };

  const handleCancelEdit = () => {
    if (busyId) return; // Prevent canceling while busy
    setEditingId(null);
    setErrorText("");
  };

  const handleSave = async (id: string) => {
    if (busyId) return;
    setErrorText("");

    if (!editName.trim()) {
      setErrorText("Nama pelanggan tidak boleh dibiarkan kosong.");
      return;
    }
    if (editName.length > 200) {
      setErrorText("Nama pelanggan terlalu panjang (maksimum 200 aksara).");
      return;
    }
    if (!editFeedback.trim()) {
      setErrorText("Maklum balas atau ulasan pelanggan wajib diisi.");
      return;
    }
    if (editFeedback.length > 2000) {
      setErrorText("Ulasan terlalu panjang (maksimum 2000 aksara).");
      return;
    }

    try {
      setBusyId(id);
      // Trigger update callback and wait for it to fully complete
      await onUpdate(id, {
        clientName: editName.trim(),
        clientCompany: editCompany.trim() || undefined,
        rating: Number(editRating),
        feedback: editFeedback.trim(),
        verified: editVerified,
      });
      setEditingId(null);
    } catch (err: any) {
      setErrorText(err?.message || "Ralat berlaku ketika menyimpan kemaskini.");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleVerified = async (t: Testimonial) => {
    if (busyId) return;
    try {
      setBusyId(t.id);
      await onUpdate(t.id, { verified: !t.verified });
    } catch (err: any) {
      alert(
        "Gagal mengemaskini status pengesahan: " +
          (err?.message || err.toString()),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (busyId) return;
    try {
      setBusyId(id);
      await onDelete(id);
    } catch (err: any) {
      alert("Gagal memadam maklum balas: " + (err?.message || err.toString()));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6" id="testimonial-manage-root">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="font-extrabold text-[#0F172A] text-xl tracking-tight">
          Pengurusan Maklum Balas Pelanggan (Testimonials)
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Lakukan audit, tapis ulasan palsu, kemaskan butiran pelanggan, atau
          sahkan maklum balas sebelum dipaparkan pada laman utama syarikat.
        </p>
      </div>

      <div className="grid gap-5">
        {testimonials.length === 0 ? (
          <div
            className="text-center p-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200"
            id="no-testimonials-alert"
          >
            Tiada maklum balas direkodkan dalam sistem.
          </div>
        ) : (
          testimonials.map((t) => {
            const isEditing = t.id === editingId;
            const isCardBusy = busyId === t.id;

            return (
              <div
                key={t.id}
                id={`testimonial-card-${t.id}`}
                className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                  isEditing
                    ? "bg-slate-50/90 border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/15"
                    : "bg-white border-slate-200 shadow-sm hover:shadow-md"
                } ${isCardBusy ? "opacity-75 pointer-events-none" : ""}`}
              >
                {/* Visual loading mask for active items */}
                {isCardBusy && (
                  <div className="absolute inset-0 bg-slate-50/30 backdrop-blur-[0.5px] flex items-center justify-center z-10">
                    <div className="bg-slate-800 text-white rounded-xl px-4 py-2 shadow-lg flex items-center gap-2 text-xs font-bold animate-pulse">
                      <Loader2 className="w-4.5 h-4.5 animate-spin text-[#D4AF37]" />
                      Sila Tunggu...
                    </div>
                  </div>
                )}

                {isEditing ? (
                  /* EDIT MODE ACTIVE CONTAINER */
                  <div className="space-y-4" id={`editing-container-${t.id}`}>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                        Mod Kemaskini Maklum Balas
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        UID: {t.userId}
                      </span>
                    </div>

                    {errorText && (
                      <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-lg border border-rose-100 font-medium">
                        ⚠️ {errorText}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          Nama Pelanggan / Pemberi Ulasan
                        </label>
                        <input
                          type="text"
                          disabled={isCardBusy}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#D4AF37] focus:outline-none bg-white font-semibold text-slate-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          Syarikat / Jawatan Pelanggan (Sebarang/Pilihan)
                        </label>
                        <input
                          type="text"
                          disabled={isCardBusy}
                          value={editCompany}
                          onChange={(e) => setEditCompany(e.target.value)}
                          className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#D4AF37] focus:outline-none bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          Penilaian Kepuasan (Rating)
                        </label>
                        <select
                          disabled={isCardBusy}
                          value={editRating}
                          onChange={(e) =>
                            setEditRating(Number(e.target.value))
                          }
                          className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#D4AF37] focus:outline-none bg-white font-bold text-slate-800"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ 5 Bintang</option>
                          <option value="4">⭐⭐⭐⭐ 4 Bintang</option>
                          <option value="3">⭐⭐⭐ 3 Bintang</option>
                          <option value="2">⭐⭐ 2 Bintang</option>
                          <option value="1">⭐ 1 Bintang</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 pt-2 md:pt-6">
                        <input
                          type="checkbox"
                          disabled={isCardBusy}
                          id={`chk-verified-${t.id}`}
                          checked={editVerified}
                          onChange={(e) => setEditVerified(e.target.checked)}
                          className="w-4.5 h-4.5 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        <label
                          htmlFor={`chk-verified-${t.id}`}
                          className="text-sm font-bold text-slate-800 cursor-pointer select-none"
                        >
                          Sahkan Maklum Balas Ini (Paparkan di Utama)
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        Maklum Balas / Pengalaman Pelanggan
                      </label>
                      <textarea
                        disabled={isCardBusy}
                        value={editFeedback}
                        onChange={(e) => setEditFeedback(e.target.value)}
                        rows={4}
                        className="w-full text-sm p-3 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#D4AF37] focus:outline-none bg-white text-slate-700 leading-relaxed"
                      />
                    </div>

                    <div className="flex flex-wrap justify-end gap-3 pt-2 border-t border-slate-200 mt-2">
                      <button
                        type="button"
                        disabled={isCardBusy}
                        onClick={handleCancelEdit}
                        className="text-xs font-bold px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Undo className="w-3.5 h-3.5" /> Batal
                      </button>
                      <button
                        type="button"
                        disabled={isCardBusy}
                        onClick={() => handleSave(t.id)}
                        className="text-xs font-bold px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" /> Simpan Perubahan
                      </button>
                    </div>
                  </div>
                ) : (
                  /* READ MODE CARD */
                  <div
                    className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
                    id={`readable-view-${t.id}`}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center flex-wrap gap-2.5">
                        <h4 className="font-extrabold text-slate-900 text-base">
                          {t.clientName}
                        </h4>
                        {t.clientCompany && (
                          <span className="text-xs text-[#0F172A] bg-slate-100 font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
                            {t.clientCompany}
                          </span>
                        )}
                        <span className="text-[11px] uppercase tracking-wide font-extrabold text-[#D4AF37] bg-yellow-50 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                          ★ RATING: {t.rating}/5
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 italic bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        "{t.feedback}"
                      </p>

                      <div className="text-[10px] text-slate-400 font-mono flex flex-wrap gap-4 select-none">
                        <span>Tarikh: {t.date}</span>
                        <span>•</span>
                        <span>UID: {t.userId}</span>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-stretch gap-3 w-full md:w-auto md:border-l border-slate-200 md:pl-5 pt-3 md:pt-0 shrink-0">
                      <div className="flex flex-col items-center gap-0.5 min-w-[95px] bg-slate-50 p-2 rounded-xl border border-slate-100 select-none">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400">
                          Status
                        </span>
                        {t.verified ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> Disahkan
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            Pending
                          </span>
                        )}
                      </div>

                      <div className="flex md:flex-col gap-2 flex-1 md:flex-initial">
                        <button
                          type="button"
                          disabled={busyId !== null}
                          onClick={() => handleToggleVerified(t)}
                          className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors flex-1 md:flex-initial text-center cursor-pointer disabled:opacity-50 select-none ${
                            t.verified
                              ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          {t.verified ? "Batal Sah" : "Sahkan"}
                        </button>

                        <button
                          type="button"
                          disabled={busyId !== null}
                          onClick={() => handleStartEdit(t)}
                          className="text-xs font-bold px-3 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors flex items-center justify-center gap-1 flex-1 md:flex-initial cursor-pointer disabled:opacity-50"
                        >
                          <Edit className="w-3.5 h-3.5" /> Kemaskini
                        </button>

                        <button
                          type="button"
                          disabled={busyId !== null}
                          onClick={() => {
                            if (
                              confirm(
                                "Adakah anda pasti mahu memadam maklum balas ini?",
                              )
                            ) {
                              handleDelete(t.id);
                            }
                          }}
                          className="text-xs font-bold px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-250 rounded-lg transition-colors flex items-center justify-center gap-1 flex-1 md:flex-initial cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Padam
                        </button>
                      </div>
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
