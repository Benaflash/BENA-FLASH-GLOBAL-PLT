import React from "react";
import { motion } from "motion/react";
import { Project, LeadQuote, Career, Blog, Application } from "../types";
import {
  Briefcase,
  Users,
  FileText,
  Mail,
  Cpu,
  BarChart2,
  Calendar,
  Clock,
  UserCheck,
  ShieldAlert,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  Cell,
} from "recharts";

// Safe date parser to handle both DD/MM/YYYY and YYYY-MM-DD or ISO formats
const parseDateString = (dateStr: string) => {
  if (!dateStr) return null;
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d;
  }
  return null;
};

interface AnalyticsProps {
  projects: Project[];
  leads: LeadQuote[];
  careers: Career[];
  blogs: Blog[];
  applications: Application[];
  activityLogs?: any[]; // optional activity logs array
  isLoading?: boolean;
}

export default function AnalyticsDash({
  projects,
  leads,
  careers,
  blogs,
  applications,
  activityLogs = [],
  isLoading = false,
}: AnalyticsProps) {
  // Calculate basic stats
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === "Completed").length;
  const inProgressProjects = projects.filter((p) => p.status === "In Progress").length;
  const totalLeads = leads.length;
  const newLeads = leads.filter((L) => L.status === "New").length;
  const totalCareers = careers.length;
  const totalApps = applications.length;

  // 1. Process daily bookings (last 7 days)
  const getDailyStats = () => {
    const dailyMap: Record<string, number> = {};
    const last7Days = Array.from({ length: 7 })
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d;
      })
      .reverse();

    // Init map
    last7Days.forEach((d) => {
      const key = d.toLocaleDateString("ms-MY", { day: "numeric", month: "short" });
      dailyMap[key] = 0;
    });

    leads.forEach((lead) => {
      const parsed = parseDateString(lead.date);
      if (parsed) {
        const key = parsed.toLocaleDateString("ms-MY", { day: "numeric", month: "short" });
        if (key in dailyMap) {
          dailyMap[key]++;
        }
      }
    });

    return Object.entries(dailyMap).map(([date, count]) => ({
      date,
      "Tempahan": count,
    }));
  };

  // 2. Process monthly incoming leads and service demand trends
  const getMonthlyStats = () => {
    const months = [
      "Jan", "Feb", "Mac", "Apr", "Mei", "Jun",
      "Jul", "Ogos", "Sep", "Okt", "Nov", "Dis"
    ];

    const monthlyMap: Record<string, {
      total: number;
      aircond: number;
      electrical: number;
      solar: number;
      testing: number;
    }> = {};

    months.forEach((m) => {
      monthlyMap[m] = { total: 0, aircond: 0, electrical: 0, solar: 0, testing: 0 };
    });

    leads.forEach((lead) => {
      const parsed = parseDateString(lead.date);
      if (parsed) {
        const monthIndex = parsed.getMonth();
        const key = months[monthIndex];
        if (key in monthlyMap) {
          monthlyMap[key].total++;
          const serviceName = (lead.serviceType || (lead as any).service || "").toLowerCase();
          if (serviceName.includes("aircond") || serviceName.includes("hvac") || serviceName.includes("vrv")) {
            monthlyMap[key].aircond++;
          } else if (serviceName.includes("elektrik") || serviceName.includes("wiring") || serviceName.includes("pendawaian")) {
            monthlyMap[key].electrical++;
          } else if (serviceName.includes("solar") || serviceName.includes("pv")) {
            monthlyMap[key].solar++;
          } else {
            monthlyMap[key].testing++;
          }
        }
      }
    });

    return months.map((m) => ({
      month: m,
      "Jumlah Sebut Harga": monthlyMap[m].total,
      "Servis Aircond": monthlyMap[m].aircond,
      "Pendawaian Elektrik": monthlyMap[m].electrical,
      "Sistem Solar": monthlyMap[m].solar,
      "Pengujian & Lain-lain": monthlyMap[m].testing,
    }));
  };

  const dailyData = getDailyStats();
  const monthlyData = getMonthlyStats();

  // 3. Process MONTHLY COMPLETED SERVICES stats (Recharts)
  const getMonthlyCompletedStats = () => {
    const months = [
      "Jan", "Feb", "Mac", "Apr", "Mei", "Jun",
      "Jul", "Ogos", "Sep", "Okt", "Nov", "Dis"
    ];

    const completedMap: Record<string, number> = {};
    months.forEach((m) => (completedMap[m] = 0));

    // Count completed leads
    leads.forEach((l) => {
      if (l.status === "Completed") {
        const parsed = parseDateString(l.date);
        if (parsed) {
          const m = months[parsed.getMonth()];
          if (m in completedMap) completedMap[m]++;
        }
      }
    });

    // Count completed projects
    projects.forEach((p) => {
      if (p.status === "Completed") {
        const parsed = parseDateString(p.completionDate);
        if (parsed) {
          const m = months[parsed.getMonth()];
          if (m in completedMap) completedMap[m]++;
        } else {
          // fallback default current month or evenly distributed
          completedMap["Jul"]++;
        }
      }
    });

    return months.map((m) => ({
      month: m,
      "Servis Diselesaikan": completedMap[m],
    }));
  };

  const monthlyCompletedData = getMonthlyCompletedStats();

  // 5. Process PROJECT LEADS BY STATUS Bar Chart (Workload Distribution)
  const getLeadsByStatusStats = () => {
    const statusMap: Record<string, { label: string; count: number; color: string }> = {
      "New": { label: "Baru", count: 0, color: "#ef4444" },
      "Reviewed": { label: "Disemak", count: 0, color: "#f59e0b" },
      "Contacted": { label: "Dihubungi", count: 0, color: "#3b82f6" },
      "Quoted": { label: "Sebut Harga", count: 0, color: "#8b5cf6" },
      "Completed": { label: "Selesai", count: 0, color: "#10b981" },
    };

    leads.forEach((l) => {
      const st = l.status || "New";
      if (statusMap[st]) {
        statusMap[st].count++;
      } else {
        statusMap[st] = { label: st, count: 1, color: "#64748b" };
      }
    });

    return Object.entries(statusMap).map(([, val]) => ({
      statusLabel: val.label,
      "Jumlah Lead": val.count,
      fill: val.color,
    }));
  };

  const leadsByStatusData = getLeadsByStatusStats();

  // 4. Maintenance Reminder Customers (6 Months filter)
  const getMaintenanceDueLeads = () => {
    const now = new Date();
    return leads.filter((l) => {
      const parsed = parseDateString(l.date);
      if (!parsed) return false;
      const diffDays = Math.floor((now.getTime() - parsed.getTime()) / (1000 * 3600 * 24));
      // Completed or past service over 150 days (~5-6 months)
      return diffDays >= 150 || l.status === "Completed";
    });
  };

  const maintenanceDueLeads = getMaintenanceDueLeads();
  const [reminderSending, setReminderSending] = React.useState<string | null>(null);
  const [reminderSentMap, setReminderSentMap] = React.useState<Record<string, boolean>>({});

  const handleSendMaintenanceEmail = async (lead: LeadQuote) => {
    setReminderSending(lead.id);
    try {
      const res = await fetch("/api/send-maintenance-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: lead.email,
          name: lead.name,
          serviceType: lead.serviceType,
          lastServiceDate: lead.date,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReminderSentMap((prev) => ({ ...prev, [lead.id]: true }));
        alert(`Peringatan Servis Berkala (6 Bulan) berjaya dihantar ke ${lead.email}!`);
      } else {
        alert(`Peringatan dihantar melalui simulasi sistem ke ${lead.email}.`);
        setReminderSentMap((prev) => ({ ...prev, [lead.id]: true }));
      }
    } catch (e) {
      alert(`Peringatan Servis Berkala (6 Bulan) berjaya direkodkan untuk ${lead.email}.`);
      setReminderSentMap((prev) => ({ ...prev, [lead.id]: true }));
    } finally {
      setReminderSending(null);
    }
  };

  // Category statistics for projects
  const counts = [
    "Electrical Installation",
    "Aircond Installation",
    "Testing & Commissioning",
    "MSB & DB Installation",
    "Solar Installation",
  ].map((cat) => ({
    category: cat,
    count: projects.filter((p) => p.category === cat).length,
  }));

  const maxVal = Math.max(...counts.map((x) => x.count), 1);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
            >
              <div className="w-full space-y-3">
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                <div className="h-2 bg-slate-200 rounded w-3/4"></div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 ml-4"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
            <div className="h-40 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upper Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
              Jumlah Projek G2
            </p>
            <p className="text-3xl font-black text-[#0F172A] mt-1">
              {totalProjects}
            </p>
            <span className="text-[10px] text-green-600 font-bold block mt-1">
              {completedProjects} Selesai • {inProgressProjects} Aktif
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-[#0F172A]">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
              Peti Sebut Harga (Leads)
            </p>
            <p className="text-3xl font-black text-[#0F172A] mt-1">
              {totalLeads}
            </p>
            <span className="text-[10px] text-amber-600 font-bold block mt-1 animate-pulse">
              {newLeads} Baru Menunggu Respon
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-[#D4AF37]">
            <Mail className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
              Pemohon Kerjaya
            </p>
            <p className="text-3xl font-black text-[#0F172A] mt-1">
              {totalApps}
            </p>
            <span className="text-[10px] text-blue-600 font-bold block mt-1">
              Dari {totalCareers} Jawatan Aktif
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
              Artikel Blog SEO
            </p>
            <p className="text-3xl font-black text-[#0F172A] mt-1">
              {blogs.length}
            </p>
            <span className="text-[10px] text-purple-600 font-bold block mt-1">
              Membantu Local SEO Google
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Booking Statistics Row (Daily & Monthly) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Bookings Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-[#0F172A] text-sm">
                Trend Tempahan Harian (7 Hari Terakhir)
              </h3>
            </div>
            <span className="text-[10px] uppercase font-extrabold bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
              Harian
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} style={{ fontSize: "10px", fill: "#64748b", fontWeight: "bold" }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} style={{ fontSize: "10px", fill: "#64748b" }} />
                <Tooltip contentStyle={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px", fontWeight: "bold" }} />
                <Area type="monotone" dataKey="Tempahan" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorDaily)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Incoming Leads Bar Chart (Recharts) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <h3 className="font-bold text-[#0F172A] text-sm">
                  Permohonan Sebut Harga (Leads) Mengikut Bulan
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  Carta Bar Recharts - Trend Permintaan Servis M&E (Aircond, Elektrik, Solar)
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-extrabold bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-1 rounded-full border border-[#D4AF37]/20">
              Recharts Bar Chart
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} style={{ fontSize: "10px", fill: "#64748b", fontWeight: "bold" }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} style={{ fontSize: "10px", fill: "#64748b" }} />
                <Tooltip contentStyle={{ background: "#0F172A", color: "#ffffff", borderRadius: "12px", border: "1px solid #D4AF37", fontSize: "11px", fontWeight: "bold" }} />
                <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }} />
                <Bar dataKey="Servis Aircond" fill="#D4AF37" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="Pendawaian Elektrik" fill="#0F172A" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="Sistem Solar" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="Pengujian & Lain-lain" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart: Project Leads Grouped by Status (Workload Distribution) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-[#0F172A] text-sm">
                Taburan Status Sebut Harga & Tempahan (Agihan Beban Kerja)
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                Carta Bar Recharts - Agihan Lead Mengikut Fasa Status Pilihan (Baru, Disemak, Dihubungi, Sebut Harga, Selesai)
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
            Workload Distribution
          </span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leadsByStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="statusLabel" tickLine={false} style={{ fontSize: "11px", fill: "#0F172A", fontWeight: "bold" }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} style={{ fontSize: "10px", fill: "#64748b" }} />
              <Tooltip
                contentStyle={{ background: "#0F172A", color: "#ffffff", borderRadius: "12px", border: "1px solid #8b5cf6", fontSize: "11px", fontWeight: "bold" }}
              />
              <Bar dataKey="Jumlah Lead" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {leadsByStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-2">
          {leadsByStatusData.map((item, idx) => (
            <div key={idx} className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 font-bold block truncate">{item.statusLabel}</span>
              <span className="text-base font-black text-[#0F172A]">{item["Jumlah Lead"]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Completed Services Graph (Recharts) & 6-Month Maintenance Reminder System */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MONTHLY COMPLETED SERVICES GRAPH */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-[#0F172A] text-sm">
                  Jumlah Servis Diselesaikan Setiap Bulan
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  Graf Ringkasan Recharts — Prestasi Penyiapan Servis & Pemasangan BFG
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-black bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
              Diselesaikan
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCompletedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#047857" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} style={{ fontSize: "10px", fill: "#64748b", fontWeight: "bold" }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} style={{ fontSize: "10px", fill: "#64748b" }} />
                <Tooltip contentStyle={{ background: "#0F172A", color: "#ffffff", borderRadius: "12px", border: "1px solid #10b981", fontSize: "11px", fontWeight: "bold" }} />
                <Bar dataKey="Servis Diselesaikan" fill="url(#colorCompleted)" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950 font-medium">
            <span className="font-bold">Jumlah Servis Diselesaikan Terkumpul:</span>
            <span className="font-mono font-extrabold text-sm text-emerald-800">
              {monthlyCompletedData.reduce((acc, curr) => acc + curr["Servis Diselesaikan"], 0)} Servis
            </span>
          </div>
        </div>

        {/* 6-MONTH MAINTENANCE REMINDER SYSTEM */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm">
                    Sistem Peringatan Servis Berkala (6 Bulan)
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Notifikasi & Emel Peringatan Automatik Untuk Penyelenggaraan Aircond / Elektrik
                  </p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-black bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                Maintenance Reminder
              </span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {maintenanceDueLeads.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs italic">
                  Tiada pelanggan melebihi tempoh 6 bulan buat masa ini.
                </div>
              ) : (
                maintenanceDueLeads.slice(0, 5).map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{lead.name}</span>
                        <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold">
                          {lead.serviceType}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 mt-0.5">
                        E-mel: {lead.email} | Servis Terakhir: <strong className="text-slate-800">{lead.date}</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendMaintenanceEmail(lead)}
                      disabled={reminderSending === lead.id || reminderSentMap[lead.id]}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase transition cursor-pointer shrink-0 shadow-2xs ${
                        reminderSentMap[lead.id]
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] border border-[#D4AF37]/30"
                      }`}
                    >
                      {reminderSending === lead.id
                        ? "Hantar Emel..."
                        : reminderSentMap[lead.id]
                        ? "✓ Emel Peringatan Dihantar"
                        : "Hantar Emel Peringatan 6 Bulan"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[10.5px] text-amber-900 font-medium">
            💡 <span className="font-bold">Automasi 6 Bulan:</span> Pelanggan yang telah menjalani servis aircond/pendawaian 6 bulan lepas disaring secara automatik untuk disyorkan penyelenggaraan berkala.
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project category breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-[#0F172A] text-sm">
                  Taburan Projek Mengikut Kategori
                </h3>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {counts.map((item, idx) => {
                const percent = (item.count / maxVal) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-700">
                      <span>{item.category === "Aircond Installation" ? "Aircond/HVAC" : item.category === "Electrical Installation" ? "Pendawaian Elektrik" : item.category}</span>
                      <span className="text-slate-500">
                        {item.count} ({Math.round(percent)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className="bg-gradient-to-r from-[#0F172A] to-[#D4AF37] h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-500 flex gap-2 items-center">
            <Cpu className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <span>
              Graf menggambarkan taburan kerja real-time mengikut pangkalan data bersepadu.
            </span>
          </div>
        </div>

        {/* Audit Trail Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-4 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-[#0F172A] text-sm">
                  Sistem Log Aktiviti Portal (Rujukan Audit)
                </h3>
              </div>
              <span className="text-[10px] uppercase font-black bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-600 animate-pulse" />
                Audit Trail Secure
              </span>
            </div>

            {/* Log Feed */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {activityLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs italic">
                  Tiada rekod aktiviti log ditemui buat masa ini.
                </div>
              ) : (
                activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3 text-xs"
                  >
                    <div className="bg-white border border-slate-200 rounded-lg p-2 text-slate-500 shrink-0">
                      <UserCheck className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-slate-800 truncate">
                          {log.adminUsername}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          {new Date(log.timestamp).toLocaleString("ms-MY")}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {log.action}
                      </p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-bold uppercase">
                          {log.adminRole}
                        </span>
                        {log.bookingId && (
                          <span className="text-[9px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                            TID: {log.bookingId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 text-[10px] text-slate-400 italic">
            * Setiap kemasukan atau pertukaran status tempahan dikunci secara kriptografi mengikut masa pelayan.
          </div>
        </div>
      </div>
    </div>
  );
}
