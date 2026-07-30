import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import {
  Package,
  Plus,
  TrendingDown,
  History,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  Wrench,
  ChevronRight,
} from "lucide-react";
import { Project } from "../types";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
}

interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  projectName: string;
  projectId: string;
  quantityUsed: number;
  unit: string;
  recordedBy: string;
  timestamp: string;
  notes?: string;
}

interface InventoryManageProps {
  projects: Project[];
}

export default function InventoryManage({ projects }: InventoryManageProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form States
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>("");
  const [newItemCategory, setNewItemCategory] = useState<string>("Aircond");
  const [newItemStock, setNewItemStock] = useState<number>(50);
  const [newItemUnit, setNewItemUnit] = useState<string>("unit");
  const [newItemMin, setNewItemMin] = useState<number>(10);

  // Usage Form States
  const [showUseForm, setShowUseForm] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [quantityUsed, setQuantityUsed] = useState<number>(1);
  const [recordedBy, setRecordedBy] = useState<string>("");
  const [usageNotes, setUsageNotes] = useState<string>("");

  const [notif, setNotif] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    // 1. Listen to Inventory
    const unsubInv = onSnapshot(collection(db, "inventory"), async (snap) => {
      if (snap.empty) {
        // Seed default inventory items for BFG PLT
        const defaults: InventoryItem[] = [
          { id: "inv-1", name: "Gas Pendingin Hawa R32", category: "Aircond", stock: 45, unit: "kg", minStock: 15 },
          { id: "inv-2", name: "Kabel Elektrik Fajar 1.5mm", category: "Wiring", stock: 120, unit: "meter", minStock: 30 },
          { id: "inv-3", name: "Paip Kuprum Daikin 1/2 inch", category: "Aircond", stock: 85, unit: "kaki", minStock: 20 },
          { id: "inv-4", name: "Soket Dinding Schneider 13A", category: "Aksesori", stock: 35, unit: "unit", minStock: 10 },
          { id: "inv-5", name: "Kotak DB Elektrik Hager 12-Way", category: "Wiring", stock: 12, unit: "unit", minStock: 5 },
        ];
        for (const item of defaults) {
          await setDoc(doc(db, "inventory", item.id), item);
        }
      } else {
        const list: InventoryItem[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as InventoryItem);
        });
        setItems(list);
      }
      setIsLoading(false);
    }, (error) => {
      console.warn("Error subscribing to inventory:", error);
      setIsLoading(false);
    });

    // 2. Listen to Transactions
    const qTrans = query(collection(db, "inventory_transactions"), orderBy("timestamp", "desc"));
    const unsubTrans = onSnapshot(qTrans, (snap) => {
      const list: InventoryTransaction[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as InventoryTransaction);
      });
      setTransactions(list);
    }, (error) => {
      console.warn("Error subscribing to inventory transactions:", error);
    });

    return () => {
      unsubInv();
      unsubTrans();
    };
  }, []);

  const triggerNotif = (type: "success" | "error", msg: string) => {
    setNotif({ type, msg });
    setTimeout(() => setNotif(null), 4000);
  };

  const handleAddNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      triggerNotif("error", "Sila masukkan nama bahan!");
      return;
    }

    try {
      const id = `inv-${Date.now()}`;
      await setDoc(doc(db, "inventory", id), {
        id,
        name: newItemName.trim(),
        category: newItemCategory,
        stock: Number(newItemStock),
        unit: newItemUnit.trim(),
        minStock: Number(newItemMin),
      });

      setNewItemName("");
      setNewItemStock(50);
      setNewItemUnit("unit");
      setNewItemMin(10);
      setShowAddForm(false);
      triggerNotif("success", `Bahan '${newItemName}' berjaya didaftarkan ke inventori.`);
    } catch (err) {
      console.error(err);
      triggerNotif("error", "Gagal mendaftar bahan baharu.");
    }
  };

  const handleRecordUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) {
      triggerNotif("error", "Sila pilih bahan dari senarai stok!");
      return;
    }
    if (!selectedProjectId) {
      triggerNotif("error", "Sila pilih projek rujukan!");
      return;
    }
    if (quantityUsed <= 0) {
      triggerNotif("error", "Kuantiti mestilah melebihi 0!");
      return;
    }

    const item = items.find((i) => i.id === selectedItemId);
    const project = projects.find((p) => p.id === selectedProjectId);

    if (!item) {
      triggerNotif("error", "Bahan tidak ditemui!");
      return;
    }
    if (item.stock < quantityUsed) {
      triggerNotif("error", `Stok tidak mencukupi! Baki stok semasa hanya: ${item.stock} ${item.unit}`);
      return;
    }

    try {
      // 1. Create Transaction Document
      const transId = `trans-${Date.now()}`;
      const newTransaction: InventoryTransaction = {
        id: transId,
        itemId: item.id,
        itemName: item.name,
        projectId: selectedProjectId,
        projectName: project ? project.title : "Projek Umum M&E",
        quantityUsed: Number(quantityUsed),
        unit: item.unit,
        recordedBy: recordedBy.trim() || "Teknisi BFG",
        timestamp: new Date().toISOString(),
        notes: usageNotes.trim() || undefined,
      };

      await setDoc(doc(db, "inventory_transactions", transId), newTransaction);

      // 2. Deduct inventory stock
      const newStock = item.stock - quantityUsed;
      await updateDoc(doc(db, "inventory", item.id), { stock: newStock });

      // Clean form
      setSelectedItemId("");
      setSelectedProjectId("");
      setQuantityUsed(1);
      setRecordedBy("");
      setUsageNotes("");
      setShowUseForm(false);
      triggerNotif("success", `Stok berjaya dikurangkan! ${quantityUsed} ${item.unit} '${item.name}' ditolak.`);
    } catch (err) {
      console.error(err);
      triggerNotif("error", "Gagal merekodkan penggunaan stok.");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-[#D4AF37]" />
            Sistem Inventori & Stok Bahan Teknikal BFG
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Pantau bekalan kabel, gas pendingin hawa, kotak DB, dan log kegunaan bahan bagi setiap projek yang dijalankan.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setShowUseForm(true);
              setShowAddForm(false);
            }}
            className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] rounded-xl text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <TrendingDown className="w-4 h-4" /> Rekod Guna Stok
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddForm(true);
              setShowUseForm(false);
            }}
            className="px-3 py-1.5 bg-[#D4AF37] hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs uppercase transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Stok Baru
          </button>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notif && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold transition-all text-center border shadow-xs animate-bounce ${
            notif.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {notif.type === "success" ? "✓" : "⚠"} {notif.msg}
        </div>
      )}

      {/* USE MATERIAL MODAL / SECTION */}
      {showUseForm && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200 shadow-3xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-[#D4AF37]" /> Merekod Penggunaan Bahan Teknikal Projek
            </h4>
            <button
              onClick={() => setShowUseForm(false)}
              className="text-[10px] bg-slate-200 hover:bg-slate-300 px-2 py-0.5 rounded-md font-bold text-slate-600 transition"
            >
              Tutup
            </button>
          </div>

          <form onSubmit={handleRecordUsage} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Select Material */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 uppercase text-[9px]">Pilih Bahan Inventori:</label>
              <select
                required
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none font-bold text-slate-800"
              >
                <option value="">-- Sila Pilih Bahan --</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} (Baki: {i.stock} {i.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Select Project */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 uppercase text-[9px]">Rujukan Projek Pelanggan:</label>
              <select
                required
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none font-bold text-slate-800"
              >
                <option value="">-- Sila Pilih Projek --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.client})
                  </option>
                ))}
                <option value="umum-mne">Sesi Penyenggaraan Umum M&E / Aircond</option>
              </select>
            </div>

            {/* 3. Quantity Used */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 uppercase text-[9px]">Kuantiti Digunakan:</label>
              <input
                type="number"
                required
                min={1}
                value={quantityUsed}
                onChange={(e) => setQuantityUsed(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none font-semibold text-slate-800"
              />
            </div>

            {/* 4. Recorded By */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 uppercase text-[9px]">Nama Teknisi / Penyelia:</label>
              <input
                type="text"
                required
                placeholder="E.g. Hafiz, Shahrul"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none font-semibold text-slate-800"
              />
            </div>

            {/* 5. Usage Notes */}
            <div className="md:col-span-2 space-y-1">
              <label className="block font-bold text-slate-500 uppercase text-[9px]">Catatan Penggunaan (Skop Kerja):</label>
              <input
                type="text"
                placeholder="E.g. Servis chemical 3 unit aircond ruang pejabat aras 2"
                value={usageNotes}
                onChange={(e) => setUsageNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none font-semibold text-slate-800"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-[#D4AF37] font-bold rounded-xl uppercase tracking-wider transition cursor-pointer"
              >
                Sahkan Penggunaan & Tolak Stok
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD NEW ITEM MODAL / SECTION */}
      {showAddForm && (
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-3xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#D4AF37]" /> Pendaftaran Stok Bahan Baru BFG
            </h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-[10px] bg-slate-200 hover:bg-slate-300 px-2 py-0.5 rounded-md font-bold text-slate-600 transition"
            >
              Tutup
            </button>
          </div>

          <form onSubmit={handleAddNewItem} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* 1. Item Name */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 uppercase text-[9px]">Nama Stok / Bahan:</label>
              <input
                type="text"
                required
                placeholder="E.g. Gas R410a Premium"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none font-semibold text-slate-800"
              />
            </div>

            {/* 2. Category */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 uppercase text-[9px]">Kategori Bahan:</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none font-bold text-slate-700 h-[38px]"
              >
                <option value="Aircond">Aircond & Cooling</option>
                <option value="Wiring">Wiring & Elektrikal</option>
                <option value="Aksesori">Aksesori & Fittings</option>
                <option value="Peralatan">Peralatan Teknikal</option>
              </select>
            </div>

            {/* 3. Unit */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 uppercase text-[9px]">Unit Pengukuran:</label>
              <input
                type="text"
                required
                placeholder="E.g. kg, meter, unit, kaki"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none font-semibold text-slate-800"
              />
            </div>

            {/* 4. Initial Stock */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 uppercase text-[9px]">Kuantiti Stok Permulaan:</label>
              <input
                type="number"
                required
                min={1}
                value={newItemStock}
                onChange={(e) => setNewItemStock(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none font-semibold text-slate-800"
              />
            </div>

            {/* 5. Min Alert */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 uppercase text-[9px]">Stok Minimum Untuk Amaran:</label>
              <input
                type="number"
                required
                min={1}
                value={newItemMin}
                onChange={(e) => setNewItemMin(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none font-semibold text-slate-800"
              />
            </div>

            <div className="flex items-end pb-0.5">
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl uppercase tracking-wider transition cursor-pointer shadow-xs text-[10.5px]"
              >
                Hantar Stok Baru
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INVENTORY LISTING BENTO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Material Stocks Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Package className="w-4.5 h-4.5 text-[#D4AF37]" /> Senarai Baki Stok Semasa
            </h4>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">Pemuatan Stok...</div>
            ) : items.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">Tiada stok berdaftar.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item) => {
                  const isLow = item.stock <= item.minStock;
                  const ratio = Math.min(100, (item.stock / (item.minStock * 4)) * 100);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-2xl flex flex-col justify-between transition-all shadow-3xs ${
                        isLow
                          ? "bg-rose-50/55 border-rose-200"
                          : "bg-slate-50/50 border-slate-200/80 hover:border-[#D4AF37]"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                          {isLow && (
                            <span className="text-[8.5px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> STOK KRITIKAL
                            </span>
                          )}
                        </div>
                        <h5 className="font-bold text-xs text-slate-800 mt-1">{item.name}</h5>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-baseline justify-between text-slate-800 mb-1.5">
                          <span className="text-[10px] text-slate-500 font-semibold">Baki Semasa:</span>
                          <span className="text-sm font-extrabold text-[#0F172A]">
                            {item.stock} <span className="text-[10px] font-bold text-slate-500">{item.unit}</span>
                          </span>
                        </div>

                        {/* Progress Meter Bar */}
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${ratio}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              isLow ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[8px] text-slate-400 font-bold mt-1">
                          <span>0 {item.unit}</span>
                          <span>Had Amaran: {item.minStock} {item.unit}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Log Usage History */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-full max-h-[500px] flex flex-col">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 shrink-0">
              <History className="w-4.5 h-4.5 text-[#D4AF37]" /> Log Kegunaan Terbaru
            </h4>

            <div className="overflow-y-auto flex-grow pr-1 space-y-3.5 scrollbar-thin">
              {transactions.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">Tiada log kegunaan dikesan.</div>
              ) : (
                transactions.map((tr) => (
                  <div key={tr.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2 text-[11px]">
                    <div className="flex items-center justify-between text-[9px] text-slate-400">
                      <span className="font-bold flex items-center gap-1 text-slate-500">
                        <User className="w-3 h-3 text-[#D4AF37]" /> {tr.recordedBy}
                      </span>
                      <span>{new Date(tr.timestamp).toLocaleDateString("ms-MY")}</span>
                    </div>

                    <div>
                      <span className="block font-extrabold text-[#0F172A] leading-snug">
                        {tr.itemName} ({tr.quantityUsed} {tr.unit})
                      </span>
                      <span className="text-[9.5px] font-bold text-slate-500 block truncate">
                        Projek: {tr.projectName}
                      </span>
                    </div>

                    {tr.notes && (
                      <p className="text-[9.5px] italic text-slate-500 bg-white p-1.5 rounded border border-slate-100">
                        "{tr.notes}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
