import React, { useState } from "react";
import { ServiceInfo } from "../types";
import { Plus, Edit2, Trash2, Box, Wind, Zap, Wrench } from "lucide-react";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export const ServiceManage = ({ services }: { services: ServiceInfo[] }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ServiceInfo>>({});

  const handleEdit = (s: ServiceInfo) => {
    setEditingId(s.id);
    setFormData({ ...s });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Pasti mahu memadam servis ini?")) return;
    try {
      await deleteDoc(doc(db, "services", id));
      alert("Servis berjaya dipadam.");
    } catch (e) {
      console.error(e);
      alert("Ralat memadam servis.");
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      alert("Sila lengkapkan nama dan keterangan servis.");
      return;
    }
    const id = editingId || `svc-${Date.now()}`;
    const payload: ServiceInfo = {
      id,
      title: formData.title || "",
      description: formData.description || "",
      iconName: formData.iconName || "Box",
      imageUrl: formData.imageUrl || "",
      bullets: formData.bullets || [],
    };

    try {
      await setDoc(doc(db, "services", id), payload);
      alert("Servis berjaya disimpan.");
      setEditingId(null);
      setFormData({});
    } catch (e) {
      console.error(e);
      alert("Ralat menyimpan servis.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-l border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Katalog Servis</h2>
        <button
          onClick={() => {
            setEditingId("new");
            setFormData({ bullets: [] });
          }}
          className="bg-slate-900 text-white px-4 py-2 rounded flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Servis
        </button>
      </div>

      {editingId && (
        <div className="bg-slate-50 p-6 rounded-lg mb-6 border border-slate-200">
          <h3 className="font-bold mb-4">
            {editingId === "new" ? "Tambah Servis Baru" : "Kemaskini Servis"}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">
                Nama Servis (Title)
              </label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">
                Gambar Service (URL)
              </label>
              <input
                type="text"
                placeholder="https://images..."
                className="w-full border rounded p-2 text-xs font-mono"
                value={formData.imageUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">
                Ikon (Lucide)
              </label>
              <select
                className="w-full border rounded p-2"
                value={formData.iconName || "Box"}
                onChange={(e) =>
                  setFormData({ ...formData, iconName: e.target.value })
                }
              >
                <option value="Zap">Zap (Elektrik)</option>
                <option value="Wind">Wind (Aircond)</option>
                <option value="Wrench">Wrench (Mekanikal)</option>
                <option value="Box">Box (Umum)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-1">
                Keterangan (Description)
              </label>
              <textarea
                className="w-full border rounded p-2"
                rows={3}
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-1">
                Bullet Points (Pisahkan dengan koma)
              </label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={(formData.bullets || []).join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bullets: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded font-bold"
            >
              Simpan Servis
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="bg-slate-300 text-slate-800 px-4 py-2 rounded"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {services.map((s) => (
          <div
            key={s.id}
            className="flex justify-between items-center p-4 border rounded shadow-sm"
          >
            <div>
              <h4 className="font-bold text-lg">
                {s.title} ({s.iconName})
              </h4>
              <p className="text-sm text-slate-600 truncate max-w-xl">
                {s.description}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(s)}
                className="p-2 bg-blue-100 text-blue-600 rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                className="p-2 bg-red-100 text-red-600 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <p className="text-slate-500">Tiada rekod servis ditemui.</p>
        )}
      </div>
    </div>
  );
};
