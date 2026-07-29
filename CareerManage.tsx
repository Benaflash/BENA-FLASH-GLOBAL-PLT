import React, { useState } from "react";
import { AircondRate } from "../types";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Calculator,
  DollarSign,
  ListOrdered,
} from "lucide-react";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface AircondRatesManageProps {
  rates: AircondRate[];
}

export const AircondRatesManage: React.FC<AircondRatesManageProps> = ({
  rates,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AircondRate>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleEdit = (rate: AircondRate) => {
    setEditingId(rate.id);
    setFormData({ ...rate });
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Adakah anda pasti mahu memadam jenis kerja/kalkulator servis ini?",
      )
    )
      return;
    try {
      setIsSubmitting(true);
      await deleteDoc(doc(db, "calculatorRates", id));
      alert("Jenis kerja berjaya dipadam dari kalkulator.");
    } catch (e) {
      console.error(e);
      alert("Ralat memadam data kalkulator.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNew = () => {
    const nextOrder =
      rates.length > 0 ? Math.max(...rates.map((r) => r.order || 0)) + 1 : 1;
    setEditingId("new");
    setFormData({
      id: "",
      labelMs: "",
      labelEn: "",
      minPrice: 0,
      maxPrice: 0,
      order: nextOrder,
    });
  };

  const handleSave = async () => {
    let targetId = formData.id
      ?.trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");

    if (!targetId && editingId === "new") {
      alert("Sila masukkan ID unik (contoh: wall_mounted, portable_ac).");
      return;
    }

    if (!formData.labelMs || !formData.labelEn) {
      alert("Sila masukkan label dalam Bahasa Melayu dan Bahasa Inggeris.");
      return;
    }

    if (formData.minPrice === undefined || formData.maxPrice === undefined) {
      alert("Sila masukkan anggaran harga minimum dan maksimum.");
      return;
    }

    if (formData.minPrice > formData.maxPrice) {
      alert("Harga minimum tidak boleh melebihi harga maksimum.");
      return;
    }

    const id = editingId === "new" ? targetId! : editingId!;
    const payload: AircondRate = {
      id,
      labelMs: formData.labelMs.trim(),
      labelEn: formData.labelEn.trim(),
      minPrice: Number(formData.minPrice),
      maxPrice: Number(formData.maxPrice),
      order: formData.order ? Number(formData.order) : 1,
    };

    try {
      setIsSubmitting(true);
      await setDoc(doc(db, "calculatorRates", id), payload);
      alert("Kadar harga kalkulator berjaya disimpan!");
      setEditingId(null);
      setFormData({});
    } catch (e) {
      console.error(e);
      alert("Ralat menyimpan kadar harga kalkulator.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#D4AF37]" />
            Tetapan Kadar Harga Kalkulator (M&E & E-Commerce)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Uruskan jenis kerja/servis, label dwibahasa, dan kadar anggaran
            harga siling/lantai yang dipaparkan di Kalkulator Anggaran Servis
            (Aircond, Elektrikal, & Produk Kedai).
          </p>
        </div>
        <button
          onClick={handleAddNew}
          disabled={isSubmitting}
          className="bg-slate-900 duration-150 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-xs font-bold self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" /> Tambah Jenis Kerja/Servis
        </button>
      </div>

      {editingId && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="font-bold text-[#0F172A] text-sm">
              {editingId === "new"
                ? "Tambah Unit/Kategori Servis Baru"
                : "Kemaskini Kategori Servis"}
            </h3>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({});
              }}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editingId === "new" && (
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  ID Unik (Sistem)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: wall_mounted, ceiling_cassette, portable_ac"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                  value={formData.id || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  ID ini hanya boleh mengandungi huruf kecil, nombor, dash (-)
                  dan underscores (_) tanpa jarak.
                </span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Nama Servis (Bahasa Melayu)
              </label>
              <input
                type="text"
                placeholder="Contoh: Unit Split Lekat Dinding"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                value={formData.labelMs || ""}
                onChange={(e) =>
                  setFormData({ ...formData, labelMs: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Nama Servis (English)
              </label>
              <input
                type="text"
                placeholder="Contoh: Wall Mounted Split Unit"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                value={formData.labelEn || ""}
                onChange={(e) =>
                  setFormData({ ...formData, labelEn: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Harga Minimum (RM)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">
                  RM
                </span>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full border border-slate-300 rounded-lg p-2.5 pl-9 text-xs focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none font-bold"
                  value={
                    formData.minPrice !== undefined ? formData.minPrice : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minPrice:
                        e.target.value === "" ? 0 : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Harga Maksimum (RM)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">
                  RM
                </span>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full border border-slate-300 rounded-lg p-2.5 pl-9 text-xs focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none font-bold"
                  value={
                    formData.maxPrice !== undefined ? formData.maxPrice : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxPrice:
                        e.target.value === "" ? 0 : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Susunan Turutan (Order)
              </label>
              <div className="relative">
                <ListOrdered className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  placeholder="1"
                  className="w-full border border-slate-300 rounded-lg p-2.5 pl-9 text-xs focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none font-bold"
                  value={formData.order !== undefined ? formData.order : ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: e.target.value === "" ? 1 : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2 border-t border-slate-200">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 duration-150 text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Simpan Perubahan
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({});
              }}
              disabled={isSubmitting}
              className="bg-slate-200 hover:bg-slate-300 duration-150 text-slate-700 px-5 py-2 rounded-lg text-xs font-medium cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200">
              <th className="py-3 px-4">Turutan</th>
              <th className="py-3 px-4">ID Unik</th>
              <th className="py-3 px-4">Nama Unit (Bahasa Melayu)</th>
              <th className="py-3 px-4">Nama Unit (English)</th>
              <th className="py-3 px-4 text-right">Harga Anggaran (RM)</th>
              <th className="py-3 px-4 text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {rates.map((rate) => (
              <tr key={rate.id} className="hover:bg-slate-50 duration-150">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                  #{rate.order || 0}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-600 font-bold bg-slate-50/50">
                  {rate.id}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-800">
                  {rate.labelMs}
                </td>
                <td className="py-3.5 px-4 text-slate-500">{rate.labelEn}</td>
                <td className="py-3.5 px-4 text-right font-bold text-[#0F172A]">
                  RM {rate.minPrice} - RM {rate.maxPrice}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(rate)}
                      disabled={isSubmitting}
                      className="p-1.5 duration-150 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded cursor-pointer"
                      title="Kemaskini"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rate.id)}
                      disabled={isSubmitting}
                      className="p-1.5 duration-150 bg-red-50 text-red-600 hover:bg-red-100 rounded cursor-pointer"
                      title="Padam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rates.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-slate-400 font-medium"
                >
                  Tiada rekod jenis perkhidmatan ditemui dalam sistem. Sila
                  tambah baru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
