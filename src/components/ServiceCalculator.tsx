import React, { useState, useEffect } from "react";
import { Calculator, Zap, Snowflake, TrendingDown, Sun, ShieldCheck, ArrowRight } from "lucide-react";
import { translations } from "../translations";
import { AircondRate } from "../types";

interface ServiceCalculatorProps {
  lang?: "MS" | "EN";
  customRates?: AircondRate[];
}

export const ServiceCalculator: React.FC<ServiceCalculatorProps> = ({
  lang = "MS",
  customRates = [],
}) => {
  const [calcMode, setCalcMode] = useState<"aircond" | "energy_solar">("aircond");
  const [units, setUnits] = useState<number>(1);
  const t = translations[lang];

  // Energy & Solar Calculator State
  const [monthlyBill, setMonthlyBill] = useState<number>(350);
  const [upgradeType, setUpgradeType] = useState<"solar" | "wiring" | "hybrid">("solar");
  const [propertyType, setPropertyType] = useState<"residential" | "banglo" | "commercial">("residential");

  // Determine raw rates for Aircond Calculator
  const activeRates =
    customRates && customRates.length > 0
      ? customRates
      : [
          {
            id: "split",
            labelMs: "Unit Split Lekat Dinding",
            labelEn: "Wall Mounted Split Unit",
            minPrice: 150,
            maxPrice: 250,
            order: 1,
          },
          {
            id: "cassette",
            labelMs: "Unit Siling Kaset",
            labelEn: "Ceiling Cassette Unit",
            minPrice: 350,
            maxPrice: 600,
            order: 2,
          },
          {
            id: "central",
            labelMs: "HVAC Pusat / Chiller (Satu Zon)",
            labelEn: "Central HVAC / Chiller (Per Zone)",
            minPrice: 1500,
            maxPrice: 3000,
            order: 3,
          },
        ];

  const [acType, setAcType] = useState<string>("");

  useEffect(() => {
    if (activeRates.length > 0) {
      if (!activeRates.some((r) => r.id === acType)) {
        setAcType(activeRates[0].id);
      }
    }
  }, [activeRates]);

  const selectedRate =
    activeRates.find((r) => r.id === acType) || activeRates[0];
  const totalMin = selectedRate ? (selectedRate.minPrice || 0) * units : 0;
  const totalMax = selectedRate ? (selectedRate.maxPrice || 0) * units : 0;

  // Energy & Solar Calculations
  const getSavingsPercent = () => {
    switch (upgradeType) {
      case "solar":
        return 0.70; // 70% savings
      case "wiring":
        return 0.22; // 22% efficiency optimization
      case "hybrid":
        return 0.85; // 85% maximum savings
      default:
        return 0.70;
    }
  };

  const savingsPct = getSavingsPercent();
  const monthlySavings = Math.round(monthlyBill * savingsPct);
  const yearlySavings = monthlySavings * 12;
  const tenYearSavings = yearlySavings * 10;
  const newMonthlyBill = Math.max(0, monthlyBill - monthlySavings);

  return (
    <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-sm space-y-7 mt-12 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <Calculator className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#0F172A] text-xl sm:text-2xl font-heading tracking-tight">
              {calcMode === "aircond" ? t.calcTitle : "Kalkulator Penjimatan Elektrik & Solar"}
            </h3>
            <p className="text-[11px] text-[#D4AF37] mt-0.5 uppercase tracking-wider font-extrabold">
              {calcMode === "aircond" ? t.calcSubtitle : "Anggaran Penjimatan Bil Bulanan & Tahunan BFG"}
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setCalcMode("aircond")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
              calcMode === "aircond"
                ? "bg-[#0F172A] text-[#D4AF37] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span>Servis Aircond</span>
          </button>
          <button
            onClick={() => setCalcMode("energy_solar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
              calcMode === "energy_solar"
                ? "bg-[#0F172A] text-[#D4AF37] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Solar & Pendawaian</span>
          </button>
        </div>
      </div>

      {calcMode === "aircond" ? (
        /* AIRCOND CALCULATOR MODE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-3">
                {t.acTypeLabel}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {activeRates.map((rate) => (
                  <label
                    key={rate.id}
                    className={`relative flex flex-col justify-between p-4.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 min-h-[96px] ${
                      acType === rate.id
                        ? "border-[#D4AF37] bg-amber-500/[0.03] shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-extrabold text-slate-800 leading-tight">
                        {lang === "MS" ? rate.labelMs : rate.labelEn}
                      </span>
                      <input
                        type="radio"
                        name="acType"
                        value={rate.id}
                        checked={acType === rate.id}
                        onChange={() => setAcType(rate.id)}
                        className="accent-[#D4AF37] w-4.5 h-4.5 cursor-pointer mt-0.5 shrink-0"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium block mt-2">
                      RM {rate.minPrice} - RM {rate.maxPrice}/unit
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1">
                  {t.unitsLabel}
                </label>
                <span className="text-[11px] text-slate-500 font-medium">
                  Berapakah bilangan unit aircond yang ingin diservis?
                </span>
              </div>
              <div className="flex items-center gap-4 self-start sm:self-auto bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <button
                  onClick={() => setUnits(Math.max(1, units - 1))}
                  className="w-11 h-11 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 transition duration-150 cursor-pointer text-lg select-none"
                  type="button"
                >
                  -
                </button>
                <span className="text-lg font-extrabold text-[#0F172A] w-10 text-center select-none">
                  {units}
                </span>
                <button
                  onClick={() => setUnits(units + 1)}
                  className="w-11 h-11 rounded-lg bg-[#0F172A] text-[#D4AF37] flex items-center justify-center font-extrabold hover:bg-slate-800 transition duration-150 cursor-pointer text-lg select-none"
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#D4AF37] opacity-10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Ringkasan & Sebut Harga Anggaran
                </span>
                <span className="text-[10px] font-extrabold bg-[#D4AF37]/20 text-[#D4AF37] px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                  {units} Unit
                </span>
              </div>

              {/* Itemized breakdown box */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="text-slate-300 font-medium">Jenis Unit:</span>
                  <span className="font-extrabold text-white text-right">
                    {lang === "MS" ? selectedRate?.labelMs : selectedRate?.labelEn}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="text-slate-300 font-medium">Kadar Per Unit:</span>
                  <span className="font-mono text-amber-300 font-bold">
                    RM {selectedRate?.minPrice} - RM {selectedRate?.maxPrice}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="text-slate-300 font-medium">Kuantiti Servis:</span>
                  <span className="font-mono text-white font-extrabold">
                    {units} Unit Aircond
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-300 font-medium">Pemeriksaan & Jaminan:</span>
                  <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    PERCUMA (30 Hari Guarantee)
                  </span>
                </div>
              </div>

              {/* Total Price Range Display */}
              <div className="text-center bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-[#D4AF37]/30 p-4 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider block mb-1">
                  Jumlah Anggaran Kos Servis:
                </span>
                <div className="text-3xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight drop-shadow-sm">
                  RM {totalMin.toLocaleString()} - RM {totalMax.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">
                  *Harga termasuk bahan kimia pembersihan berkualiti & pemantauan gas R32/R410A
                </span>
              </div>

              <div className="text-[10.5px] text-slate-300 leading-relaxed p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <span className="font-extrabold text-slate-200 block text-xs mb-0.5">
                  {t.calcNoteTitle}
                </span>
                <p className="text-slate-400 text-[10px]">{t.calcNoteDesc}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
              <a
                href={`https://wa.me/601162995904?text=${encodeURIComponent(
                  `Salam Bena Flash Global, saya ingin tempah servis aircond:\n- Jenis: ${selectedRate?.labelMs}\n- Kuantiti: ${units} Unit\n- Anggaran Kos: RM ${totalMin} - RM ${totalMax}\n\nMohon sahkan slot temujanji!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#D4AF37] hover:bg-[#b8952c] text-[#0F172A] py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>Tempah Sebut Harga (WhatsApp)</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* ENERGY & SOLAR SAVINGS CALCULATOR MODE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            {/* Monthly Bill Input */}
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Purata Bil Elektrik Bulanan Semasa (TNB)
                </label>
                <span className="font-mono text-lg font-black text-[#0F172A] bg-amber-100 px-3 py-1 rounded-xl border border-amber-300/60">
                  RM {monthlyBill}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="2500"
                step="25"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>RM 100</span>
                <span>RM 1,000</span>
                <span>RM 2,500+</span>
              </div>
            </div>

            {/* Upgrade Selection */}
            <div>
              <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-3">
                Pilihan Naik Taraf Sistem Tenaga
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setUpgradeType("solar")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    upgradeType === "solar"
                      ? "border-[#D4AF37] bg-amber-50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span className="font-extrabold text-xs text-[#0F172A]">Solar PV Grid-Tied</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Pemasangan solar bumbung kediaman NEM (Penjimatan ~70%)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setUpgradeType("wiring")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    upgradeType === "wiring"
                      ? "border-[#D4AF37] bg-amber-50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="font-extrabold text-xs text-[#0F172A]">Pendawaian 3-Fasa</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Balancing fasa & pembaikan kebocoran arus (Penjimatan ~22%)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setUpgradeType("hybrid")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    upgradeType === "hybrid"
                      ? "border-[#D4AF37] bg-amber-50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-xs text-[#0F172A]">Hybrid Solar + Smart</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Gabungan Solar + Sistem Pendawaian Pintar (Penjimatan ~85%)
                  </p>
                </button>
              </div>
            </div>

            {/* Property Type Selector */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <span className="text-xs font-bold text-slate-700 uppercase">Kategori Premis / Kediaman:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPropertyType("residential")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    propertyType === "residential"
                      ? "bg-[#0F172A] text-white"
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  Teres / Flat
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyType("banglo")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    propertyType === "banglo"
                      ? "bg-[#0F172A] text-white"
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  Banglo / Semi-D
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyType("commercial")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    propertyType === "commercial"
                      ? "bg-[#0F172A] text-white"
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  Komersial
                </button>
              </div>
            </div>
          </div>

          {/* Energy Savings Result Display */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between text-white relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#D4AF37] opacity-10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest">
                  Anggaran Penjimatan Bil
                </span>
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  ~{Math.round(savingsPct * 100)}% Penjimatan
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Anggaran Penjimatan Bulanan:</span>
                  <div className="text-3xl font-black text-amber-400 font-mono mt-0.5">
                    RM {monthlySavings.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ bulan</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Setahun:</span>
                    <span className="text-lg font-black text-white font-mono">RM {yearlySavings.toLocaleString()}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">10 Tahun:</span>
                    <span className="text-lg font-black text-emerald-300 font-mono">RM {tenYearSavings.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-300 flex items-center justify-between bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  <span>Bil Bulanan Baru Dianggarkan:</span>
                  <span className="font-mono font-bold text-amber-300">RM {newMonthlyBill} / bln</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                *Penjimatan sebenar tertakluk kepada audit tapak teknikal oleh jurutera chargeman Bena Flash Global PLT dan saiz sistem yang dipasang.
              </p>

              <a
                href="https://wa.me/601162995904?text=Salam%20Bena%20Flash%20Global%2C%20saya%20telah%20mengira%20penjimatan%20solar%20%2F%20pendawaian%20di%20web%20app.%20Boleh%20dapatkan%20audit%20tapak%20percuma%3F"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#D4AF37] hover:bg-[#b8952c] text-[#0F172A] py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>Dapatkan Audit Tenaga Percuma</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
