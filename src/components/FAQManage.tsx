import React, { useState } from "react";
import { FAQItem } from "../types";
import { Plus, Trash2, Edit2 } from "lucide-react";

interface FAQManageProps {
  faqs: FAQItem[];
  onAdd: (faq: Omit<FAQItem, "id">) => void;
  onEdit: (id: string, faq: Partial<FAQItem>) => void;
  onDelete: (id: string) => void;
}

export default function FAQManage({
  faqs,
  onAdd,
  onEdit,
  onDelete,
}: FAQManageProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ question: "", answer: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onEdit(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
    }
    setFormData({ question: "", answer: "" });
    setShowForm(false);
  };

  const handleEditClick = (faq: FAQItem) => {
    setEditingId(faq.id);
    setFormData({ question: faq.question, answer: faq.answer });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ question: "", answer: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="font-bold text-[#0F172A] text-lg">
            Urus Soalan Lazim (FAQ)
          </h3>
          <p className="text-xs text-slate-500">
            Tambah, sunting dan padam soalan lazim awam.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#D4AF37] text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-[#b8952c]"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? "Batal" : "Tambah FAQ"}</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 shadow-md rounded-2xl p-6 sm:p-8 space-y-5.5"
        >
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-extrabold uppercase text-[#0F172A] tracking-wider border-l-4 border-[#D4AF37] pl-3">
              {editingId ? "Kemaskini FAQ" : "Tambah FAQ Baru"}
            </h4>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Soalan
              </label>
              <input
                type="text"
                name="question"
                value={formData.question}
                onChange={handleChange}
                required
                className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Jawapan
              </label>
              <textarea
                name="answer"
                value={formData.answer}
                onChange={handleChange}
                required
                rows={4}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2 text-xs font-bold text-slate-500 uppercase"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-[#0F172A] text-white rounded-lg uppercase"
              >
                Simpan
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start"
          >
            <div className="space-y-2 flex-1">
              <h4 className="font-bold text-slate-800 text-sm">
                {faq.question}
              </h4>
              <p className="text-xs text-slate-500">{faq.answer}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEditClick(faq)}
                className="p-2 text-blue-600 bg-blue-50 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(faq.id)}
                className="p-2 text-red-600 bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
