import React, { useState } from "react";
import { MapPin, CheckCircle2, Clock, ExternalLink, Zap, Wind, ShieldCheck, ChevronRight } from "lucide-react";
import { Project } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ProjectMapProps {
  projects: Project[];
  onSelectProject?: (project: Project) => void;
}

interface MapLocationPin {
  id: string;
  name: string;
  district: "Kuantan" | "Pekan" | "Temerloh" | "Gebeng" | "Gambang";
  coords: { x: number; y: number }; // Percentage positions on map canvas
  projectId?: string;
  client: string;
  title: string;
  category: string;
  status: "Completed" | "In Progress";
  value?: string;
  completionDate?: string;
}

const DEFAULT_LOCATIONS: MapLocationPin[] = [
  {
    id: "loc-1",
    name: "Kawasan Perindustrian Gebeng, Kuantan",
    district: "Gebeng",
    coords: { x: 72, y: 22 },
    title: "Pemasangan Substation 33kV & Wiring Chiller",
    client: "Petronas Chemical / Gebeng Industrial Estate",
    category: "Electrical Installation",
    status: "Completed",
    value: "RM 280,000",
    completionDate: "Disember 2025",
  },
  {
    id: "loc-2",
    name: "Hospital Tengku Ampuan Afzan (HTAA), Kuantan",
    district: "Kuantan",
    coords: { x: 62, y: 42 },
    title: "Servis Chiller Komersil & Sistem HVAC Ward Utama",
    client: "Kementerian Kesihatan Malaysia (KKM)",
    category: "Aircond Installation",
    status: "Completed",
    value: "RM 145,000",
    completionDate: "Januari 2026",
  },
  {
    id: "loc-3",
    name: "Taman Teknologi Otomotif Pekan",
    district: "Pekan",
    coords: { x: 65, y: 78 },
    title: "Pemasangan Panel Kuasa Solar PV 120kWp & Audit Tenaga",
    client: "DRB-HICOM Automotive Complex Pekan",
    category: "Solar Installation",
    status: "Completed",
    value: "RM 320,000",
    completionDate: "Februari 2026",
  },
  {
    id: "loc-4",
    name: "Universiti Malaysia Pahang Al-Sultan Abdullah (UMPSA), Gambang",
    district: "Gambang",
    coords: { x: 42, y: 52 },
    title: "Ujian Kekompetenan Pendawaian Tiga Fasa & Papan Agihan",
    client: "Pusat Pembangunan Kampus UMPSA",
    category: "Electrical Installation",
    status: "In Progress",
    value: "RM 95,000",
    completionDate: "Dalam Pelaksanaan 2026",
  },
  {
    id: "loc-5",
    name: "Pusat Bandar Indera Mahkota, Kuantan",
    district: "Kuantan",
    coords: { x: 55, y: 35 },
    title: "Penyelenggaraan Berjadual VRV Aircond Pejabat Kerajaan",
    client: "Jabatan Kerja Raya (JKR) Kuantan",
    category: "Aircond Installation",
    status: "Completed",
    value: "RM 85,000",
    completionDate: "Mac 2025",
  },
  {
    id: "loc-6",
    name: "Pekan Waterfront & Commercial Centre",
    district: "Pekan",
    coords: { x: 70, y: 88 },
    title: "Pemasangan Sistem Pencahayaan LED Pintar & Pintu Pagar Elektrik",
    client: "Majlis Perbandaran Pekan",
    category: "Electrical Installation",
    status: "In Progress",
    value: "RM 110,000",
    completionDate: "Dalam Pelaksanaan 2026",
  },
];

export const ProjectMapVisualization: React.FC<ProjectMapProps> = ({
  projects,
  onSelectProject,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");

  // Construct combined locations from DEFAULT_LOCATIONS and dynamic projects
  const dynamicProjectPins: MapLocationPin[] = (projects || []).map((p, idx) => {
    // Attempt coordinate mapping if coordinates exist, else derive from location string
    let x = 50 + (idx % 5) * 8 - 15;
    let y = 35 + (idx % 4) * 12 - 10;
    let district: "Kuantan" | "Pekan" | "Temerloh" | "Gebeng" | "Gambang" = "Kuantan";

    const locLower = (p.location || "").toLowerCase();
    if (locLower.includes("pekan")) {
      district = "Pekan";
      x = 65 + (idx % 3) * 6;
      y = 75 + (idx % 3) * 5;
    } else if (locLower.includes("gebeng")) {
      district = "Gebeng";
      x = 75 + (idx % 3) * 4;
      y = 20 + (idx % 3) * 5;
    } else if (locLower.includes("gambang")) {
      district = "Gambang";
      x = 38 + (idx % 3) * 5;
      y = 50 + (idx % 3) * 5;
    } else if (locLower.includes("temerloh")) {
      district = "Temerloh";
      x = 25 + (idx % 3) * 5;
      y = 60 + (idx % 3) * 5;
    }

    if (p.coordinates?.lat && p.coordinates?.lng) {
      // Map lat/lng bounded around Pahang Timur (3.5 - 4.0 N, 103.0 - 103.6 E)
      const normX = Math.min(Math.max(((p.coordinates.lng - 103.0) / 0.6) * 70 + 20, 15), 85);
      const normY = Math.min(Math.max((1 - (p.coordinates.lat - 3.5) / 0.5) * 70 + 15, 15), 85);
      x = Math.round(normX);
      y = Math.round(normY);
    }

    return {
      id: `proj-pin-${p.id}`,
      name: p.location || p.title,
      district,
      coords: { x, y },
      projectId: p.id,
      client: p.client || "Pelanggan BFG",
      title: p.title,
      category: p.category || "Electrical & M&E",
      status: (p.status as "Completed" | "In Progress") || "In Progress",
      value: p.value || "RM --",
      completionDate: p.completionDate || "Dalam Pelaksanaan",
    };
  });

  // Combine and deduplicate
  const allLocations = [...DEFAULT_LOCATIONS, ...dynamicProjectPins];

  const [activePin, setActivePin] = useState<MapLocationPin | null>(allLocations[0] || DEFAULT_LOCATIONS[0]);

  const filteredLocations = allLocations.filter((loc) => {
    if (selectedDistrict === "All") return true;
    if (selectedDistrict === "Kuantan") return loc.district === "Kuantan" || loc.district === "Gebeng" || loc.district === "Gambang";
    if (selectedDistrict === "Pekan") return loc.district === "Pekan";
    return loc.district === selectedDistrict;
  });

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2">
            <MapPin className="w-3.5 h-3.5 animate-bounce" />
            <span>Peta Interaktif Kuantan & Pekan, Pahang</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white font-heading tracking-tight">
            Tepatan Lokasi & Tapak Projek BFG PLT
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Klik pada pin lokasi di bawah untuk melihat butiran projek M&E, Aircond, dan Solar di kawasan Kuantan, Pekan & Pahang.
          </p>
        </div>

        {/* District Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: "All", label: "Semua Lokasi" },
            { id: "Kuantan", label: "Kuantan & Gebeng" },
            { id: "Pekan", label: "Pekan & Bandar" },
            { id: "Gambang", label: "Gambang" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedDistrict(item.id)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedDistrict === item.id
                  ? "bg-[#D4AF37] text-slate-950 shadow-md font-extrabold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Details Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-center">
        {/* Map Canvas (Left Column) */}
        <div className="lg:col-span-7 bg-slate-950/90 rounded-2xl border border-slate-800 p-4 sm:p-6 relative min-h-[360px] sm:min-h-[420px] flex flex-col justify-between overflow-hidden shadow-inner">
          {/* Stylized Pahang Map SVG Backdrop */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full opacity-20 text-slate-700 pointer-events-none"
            fill="currentColor"
          >
            {/* Outline representing Pahang East Coast */}
            <path d="M 15 20 Q 35 10 70 15 Q 90 30 85 60 Q 80 90 50 95 Q 20 85 10 50 Z" />
            <path d="M 60 15 C 75 25 85 45 80 80" stroke="#D4AF37" strokeWidth="0.5" fill="none" strokeDasharray="1,1" />
          </svg>

          {/* Compass Rose */}
          <div className="absolute top-4 right-4 bg-slate-900/80 border border-slate-800 p-2 rounded-xl text-[9px] font-mono text-slate-400 text-center flex flex-col items-center select-none">
            <span className="font-bold text-[#D4AF37]">U</span>
            <span className="text-[10px]">↑</span>
            <span>KUANTAN / PEKAN</span>
          </div>

          {/* Interactive Pins overlay */}
          <div className="relative w-full h-[320px] sm:h-[360px] my-auto">
            {filteredLocations.map((pin) => {
              const isActive = activePin?.id === pin.id;
              return (
                <div
                  key={pin.id}
                  style={{ left: `${pin.coords.x}%`, top: `${pin.coords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                  onClick={() => setActivePin(pin)}
                >
                  {/* Ping Animation for Active Pin */}
                  {isActive && (
                    <span className="absolute -inset-2 rounded-full bg-[#D4AF37]/40 animate-ping" />
                  )}

                  {/* Pin Icon Button */}
                  <button
                    className={`relative px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-extrabold shadow-lg transition-all duration-300 transform group-hover:scale-110 cursor-pointer ${
                      isActive
                        ? "bg-[#D4AF37] text-slate-950 ring-4 ring-[#D4AF37]/30 scale-110 z-30"
                        : "bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-[#D4AF37]"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        pin.status === "Completed"
                          ? "bg-emerald-400 animate-pulse"
                          : pin.status === "In Progress"
                            ? "bg-amber-400 animate-pulse"
                            : "bg-blue-400 animate-pulse"
                      }`}
                    />
                    <MapPin className={`w-3.5 h-3.5 ${isActive ? "text-slate-950" : "text-[#D4AF37]"}`} />
                    <span className="hidden sm:inline whitespace-nowrap max-w-[110px] truncate">
                      {pin.district}
                    </span>
                  </button>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                    <div className="bg-slate-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-slate-700 shadow-xl whitespace-nowrap">
                      {pin.name}
                    </div>
                    <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45 -mt-1" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Footer Legend */}
          <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-3 border-t border-slate-800/80 gap-2 relative z-10">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                Kawasan Aktif
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Projek Disiapkan
              </span>
            </div>
            <span className="text-slate-500 font-mono">Liputan: Pahang Timur (Kuantan & Pekan)</span>
          </div>
        </div>

        {/* Selected Location Card (Right Column) */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {activePin ? (
              <motion.div
                key={activePin.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-wider bg-[#D4AF37]/10 px-2.5 py-1 rounded-md border border-[#D4AF37]/20">
                    {activePin.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 ${
                      activePin.status === "Completed"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {activePin.status === "Completed" ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> SIAP
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 animate-spin" /> DALAM PELAKSANAAN
                      </>
                    )}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-white mb-2 leading-snug">
                  {activePin.title}
                </h4>

                <div className="space-y-2.5 text-xs text-slate-300 border-t border-b border-slate-800/80 py-3.5 my-3">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 font-bold min-w-[70px]">Klien:</span>
                    <span className="font-semibold text-white">{activePin.client}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 font-bold min-w-[70px]">Lokasi:</span>
                    <span className="text-amber-200 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0" />
                      {activePin.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Nilai Projek</span>
                      <span className="font-mono text-emerald-400 font-bold">{activePin.value || "Tender Sah"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Tarikh Siap</span>
                      <span className="text-slate-200 font-semibold">{activePin.completionDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Bena Flash Global PLT (CIDB G2 M&E)
                  </span>
                  {onSelectProject && (
                    <button
                      onClick={() => {
                        const matched = projects.find((p) => p.title.toLowerCase().includes(activePin.title.toLowerCase().slice(0, 10)));
                        if (matched) onSelectProject(matched);
                      }}
                      className="bg-[#D4AF37] hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      Lihat Foto <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                Sila klik sebarang pin lokasi di peta untuk memaparkan ringkasan projek BFG.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
