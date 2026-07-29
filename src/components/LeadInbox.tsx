import React, { useState, useEffect } from "react";
import { LeadQuote, StaffMember } from "../types";
import {
  Trash2,
  Phone,
  Mail,
  MapPin,
  Check,
  Calendar,
  MessageSquare,
  Search,
  Filter,
  XCircle,
  FileSpreadsheet,
  Clock,
  Shield,
  HelpCircle,
  Tag,
  Plus,
  X,
  CheckSquare,
  Square,
  History,
  Send,
  User,
  ChevronDown,
  ChevronUp,
  Layers,
  Activity,
  AlertCircle,
  Eye,
  PhoneCall,
  FileText,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  PieChart as PieChartIcon,
  FileCheck,
  CalendarPlus,
  UserCheck,
  ShieldCheck,
  ExternalLink,
  BookmarkPlus,
  BellRing,
} from "lucide-react";
import { collection, query, onSnapshot, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface LeadInboxProps {
  leads: LeadQuote[];
  onStatusChange: (id: string, nextStatus: LeadQuote["status"]) => void;
  onFeedbackChange: (id: string, feedback: string) => void;
  onUpdateField?: (id: string, field: string, value: any) => void;
  onDelete: (id: string) => void;
}

const PRESET_TAGS = [
  "High Priority",
  "Requires Quote",
  "Urgent",
  "Site Inspection Required",
  "VIP Client",
  "Follow-Up Needed",
  "Contract Signed",
];

export default function LeadInbox({
  leads,
  onStatusChange,
  onFeedbackChange,
  onDelete,
  onUpdateField,
}: LeadInboxProps) {
  const statuses: LeadQuote["status"][] = [
    "New",
    "Reviewed",
    "Contacted",
    "Quoted",
    "Completed",
  ];

  // Filter States
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterService, setFilterService] = useState<string>("");
  const [filterLocation, setFilterLocation] = useState<string>("");
  const [filterTag, setFilterTag] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  // Helper for rendering traffic-light visual status badges with icons
  const renderStatusBadge = (status: LeadQuote["status"]) => {
    switch (status) {
      case "New":
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-2xs">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>New (Baharu)</span>
          </span>
        );
      case "Reviewed":
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300/80 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
            <Eye className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Reviewed</span>
          </span>
        );
      case "Contacted":
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-900 border border-blue-300/80 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
            <PhoneCall className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Contacted</span>
          </span>
        );
      case "Quoted":
        return (
          <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-900 border border-purple-300/80 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0"></span>
            <FileText className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>Quoted</span>
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300/80 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Completed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-300 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
            <span>{status}</span>
          </span>
        );
    }
  };

  // Bulk Actions & Checkbox States
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [bulkTagInput, setBulkTagInput] = useState<string>("");

  // Per-Lead Interactive States
  const [openTagInputForLead, setOpenTagInputForLead] = useState<string | null>(null);
  const [customTagInput, setCustomTagInput] = useState<{ [leadId: string]: string }>({});
  const [expandedTimelineLeads, setExpandedTimelineLeads] = useState<{ [leadId: string]: boolean }>({});
  const [newTimelineNote, setNewTimelineNote] = useState<{ [leadId: string]: string }>({});

  // Summary Chart View Toggle
  const [showSummaryChart, setShowSummaryChart] = useState<boolean>(true);

  // Audit Note Modal / Dialog States
  const [auditNoteModalLead, setAuditNoteModalLead] = useState<LeadQuote | null>(null);
  const [auditCategory, setAuditCategory] = useState<string>("Semakan Dokumen & Permohonan");
  const [auditNoteContent, setAuditNoteContent] = useState<string>("");
  const [auditAdminName, setAuditAdminName] = useState<string>("Admin (admin@bfgplt.com)");

  // Schedule Follow-Up Modal / Dialog States
  const [followUpModalLead, setFollowUpModalLead] = useState<LeadQuote | null>(null);
  const [followUpDate, setFollowUpDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [followUpTime, setFollowUpTime] = useState<string>("10:00 AM");
  const [followUpAgenda, setFollowUpAgenda] = useState<string>("Panggilan Susulan Sebut Harga & Semakan Tapak");
  const [followUpNotes, setFollowUpNotes] = useState<string>("");
  const [followUpAdminName, setFollowUpAdminName] = useState<string>("Admin BFG");

  // Customer Helpdesk Ticket States
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [hasLoadedTickets, setHasLoadedTickets] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"leads" | "tickets">("leads");
  const [replyText, setReplyText] = useState<{ [ticketId: string]: string }>({});

  // Staff/Technicians List
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  useEffect(() => {
    const q = query(collection(db, "staff"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: StaffMember[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as StaffMember);
        });
        setStaffList(list);
      },
      (error) => {
        console.warn("Error subscribing to staff:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "support_tickets"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        list.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setSupportTickets(list);
        setHasLoadedTickets(true);
      },
      (error) => {
        console.warn("Error subscribing to support_tickets:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Format timestamp helper
  const formatISOToLocale = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleString("ms-MY", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  // Safe getter for Lead Timeline
  const getLeadTimeline = (lead: LeadQuote) => {
    if (lead.timeline && lead.timeline.length > 0) {
      return lead.timeline;
    }
    // Default initial event if timeline is not initialized
    let initDate = lead.date || new Date().toISOString();
    if (initDate.includes("/")) {
      const parts = initDate.split("/");
      if (parts.length === 3) {
        initDate = `${parts[2]}-${parts[1]}-${parts[0]}T08:00:00.000Z`;
      }
    }
    return [
      {
        id: `init-${lead.id}`,
        timestamp: initDate,
        title: "Permohonan Sebut Harga Diterima",
        note: `Permohonan perkhidmatan '${lead.serviceType}' lokasi '${lead.location}'. Bajet: ${
          lead.budget || "Belum Ditentukan"
        }.`,
        author: lead.name || "Pelanggan",
        type: "system" as const,
      },
    ];
  };

  // Add timeline event helper
  const addTimelineEvent = (
    lead: LeadQuote,
    title: string,
    note?: string,
    type: "status_change" | "note" | "tag" | "system" = "note",
    author: string = "Admin BFG"
  ) => {
    const currentTimeline = getLeadTimeline(lead);
    const newEvent = {
      id: `tl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      title,
      note,
      type,
      author,
    };

    const updatedTimeline = [newEvent, ...currentTimeline];
    if (onUpdateField) {
      onUpdateField(lead.id, "timeline", updatedTimeline);
    }
  };

  // Save Audit Note Handler
  const handleSaveAuditNote = () => {
    if (!auditNoteModalLead) return;
    if (!auditNoteContent.trim()) {
      alert("Sila masukkan butiran nota audit terlebih dahulu.");
      return;
    }
    const lead = auditNoteModalLead;
    const now = new Date();
    const timeStr = now.toLocaleString("ms-MY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const formattedNote = `[NOTA AUDIT RASMI - ${auditCategory}]\n${auditNoteContent.trim()}\n\n📌 Audit oleh: ${auditAdminName} pada ${timeStr}`;

    addTimelineEvent(
      lead,
      `📋 Audit Note: ${auditCategory}`,
      formattedNote,
      "note",
      auditAdminName
    );

    setAuditNoteModalLead(null);
    setAuditNoteContent("");
    alert("Nota audit berjaya direkodkan dalam timeline sejarah permohonan!");
  };

  // Schedule Follow-Up Handler
  const handleSaveFollowUp = async (openGoogleCalendar: boolean = true) => {
    if (!followUpModalLead) return;
    const lead = followUpModalLead;

    const followUpString = `${followUpDate} (${followUpTime})`;

    // Update lead via callback
    if (onUpdateField) {
      onUpdateField(lead.id, "scheduledFollowUpDate", followUpString);
      onUpdateField(lead.id, "scheduledFollowUpAgenda", followUpAgenda);
    }

    // Save to Firestore 'calendar_reminders'
    try {
      await addDoc(collection(db, "calendar_reminders"), {
        leadId: lead.id,
        leadName: lead.name,
        phone: lead.phone,
        email: lead.email,
        serviceType: lead.serviceType,
        followUpDate,
        followUpTime,
        agenda: followUpAgenda,
        notes: followUpNotes,
        adminName: followUpAdminName,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Could not write to calendar_reminders collection:", e);
    }

    // Add event to lead's timeline
    addTimelineEvent(
      lead,
      `📅 Follow-up Dijadualkan: ${followUpString}`,
      `Agenda: ${followUpAgenda}\nTelefon: ${lead.phone} | E-mel: ${lead.email}\nCatatan Admin: ${
        followUpNotes || "Tiada"
      }`,
      "system",
      followUpAdminName
    );

    if (openGoogleCalendar) {
      // Create Google Calendar event link
      const startDate = new Date(`${followUpDate}T10:00:00`);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      const formatGDate = (d: Date) => d.toISOString().replace(/-|:|.\d+/g, "");

      const dates = `${formatGDate(startDate)}/${formatGDate(endDate)}`;
      const text = encodeURIComponent(`BFG Follow-up: ${lead.name} (${lead.serviceType})`);
      const details = encodeURIComponent(
        `Panggilan / Tindakan Susulan Admin BFG\n\nPelanggan: ${lead.name}\nTelefon: ${lead.phone}\nE-mel: ${lead.email}\nID Permohonan: ${lead.id}\nAgenda: ${followUpAgenda}\nCatatan: ${followUpNotes}`
      );
      const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
      window.open(calUrl, "_blank");
    }

    setFollowUpModalLead(null);
    setFollowUpNotes("");
    alert("Jadual Panggilan Susulan berjaya disimpan & dikemaskini dalam rekod!");
  };

  // Status Change with Timeline Logging
  const handleStatusChangeWithTimeline = (
    id: string,
    nextStatus: LeadQuote["status"]
  ) => {
    const targetLead = leads.find((l) => l.id === id);
    if (!targetLead) return;
    const prevStatus = targetLead.status;
    if (prevStatus === nextStatus) return;

    onStatusChange(id, nextStatus);

    addTimelineEvent(
      targetLead,
      `Status Dikemaskini: ${nextStatus}`,
      `Status permohonan bertukar daripada '${prevStatus}' kepada '${nextStatus}'.`,
      "status_change"
    );
  };

  // Feedback Change with Timeline Logging
  const handleFeedbackWithTimeline = (id: string, feedback: string) => {
    const targetLead = leads.find((l) => l.id === id);
    if (!targetLead) return;

    onFeedbackChange(id, feedback);

    if (feedback.trim()) {
      addTimelineEvent(
        targetLead,
        "Maklum Balas Admin Dikemaskini",
        feedback.trim(),
        "note"
      );
    }
  };

  // Tag Add Helper
  const handleAddTag = (id: string, tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    const targetLead = leads.find((l) => l.id === id);
    if (!targetLead) return;

    const currentTags = targetLead.tags || [];
    if (currentTags.includes(trimmed)) return;

    const updatedTags = [...currentTags, trimmed];
    if (onUpdateField) {
      onUpdateField(id, "tags", updatedTags);
    }

    addTimelineEvent(
      targetLead,
      `Tag Ditambah: ${trimmed}`,
      `Tag '${trimmed}' telah ditambah pada projek ini.`,
      "tag"
    );
  };

  // Tag Remove Helper
  const handleRemoveTag = (id: string, tagToRemove: string) => {
    const targetLead = leads.find((l) => l.id === id);
    if (!targetLead) return;

    const currentTags = targetLead.tags || [];
    const updatedTags = currentTags.filter((t) => t !== tagToRemove);
    if (onUpdateField) {
      onUpdateField(id, "tags", updatedTags);
    }

    addTimelineEvent(
      targetLead,
      `Tag Dibuang: ${tagToRemove}`,
      `Tag '${tagToRemove}' telah dikeluarkan daripada permohonan.`,
      "tag"
    );
  };

  // Add Custom Timeline Note
  const handleAddCustomTimelineNote = (id: string) => {
    const text = newTimelineNote[id]?.trim();
    if (!text) {
      alert("Sila tulis mesej / catatan aktiviti sebelum menyimpan!");
      return;
    }
    const targetLead = leads.find((l) => l.id === id);
    if (!targetLead) return;

    addTimelineEvent(
      targetLead,
      "Catatan Aktiviti Projek",
      text,
      "note"
    );

    setNewTimelineNote((prev) => ({ ...prev, [id]: "" }));
  };

  // Support Ticket Handlers
  const handleReplyTicket = async (ticketId: string) => {
    const text = replyText[ticketId]?.trim();
    if (!text) {
      alert("Sila tulis mesej balasan sebelum hantar!");
      return;
    }

    try {
      const ticketRef = doc(db, "support_tickets", ticketId);
      await updateDoc(ticketRef, {
        adminReply: text,
        status: "Dalam Proses",
        updatedAt: new Date().toISOString(),
      });
      alert("Mesej balasan berjaya dihantar ke Portal Pelanggan!");
      setReplyText((prev) => ({ ...prev, [ticketId]: "" }));
    } catch (err: any) {
      alert("Gagal menghantar balasan: " + err.message);
    }
  };

  const handleUpdateTicketStatus = async (
    ticketId: string,
    nextStatus: string
  ) => {
    try {
      const ticketRef = doc(db, "support_tickets", ticketId);
      await updateDoc(ticketRef, {
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      alert("Gagal mengemaskini status tiket: " + err.message);
    }
  };

  // CSV Export Handler
  const handleExportToCSV = () => {
    if (filteredLeads.length === 0) {
      alert("Tiada data tempahan untuk dieksport.");
      return;
    }

    const headers = [
      "ID Tempahan",
      "Nama Pelanggan",
      "Syarikat/GLC",
      "Talian Hubungi",
      "E-mel",
      "Kawasan Tapak",
      "Perkhidmatan",
      "Status",
      "Bajet",
      "Tag",
      "Tarikh Sesi",
      "Slot Masa",
      "Mesej Pelanggan",
      "Maklumbalas Admin",
    ];

    const escapeCSVCell = (val: string) => {
      if (val === undefined || val === null) return '""';
      const clean = String(val).replace(/"/g, '""').replace(/\r?\n/g, " ");
      return `"${clean}"`;
    };

    const rows = filteredLeads.map((lead) => [
      escapeCSVCell(lead.id),
      escapeCSVCell(lead.name),
      escapeCSVCell(lead.companyName || "Persendirian"),
      escapeCSVCell(lead.phone),
      escapeCSVCell(lead.email),
      escapeCSVCell(lead.location),
      escapeCSVCell(lead.serviceType),
      escapeCSVCell(lead.status),
      escapeCSVCell(lead.budget || "N/A"),
      escapeCSVCell((lead.tags || []).join(", ")),
      escapeCSVCell(lead.scheduledDate || lead.date || ""),
      escapeCSVCell(lead.scheduledTimeSlot || ""),
      escapeCSVCell(lead.message || ""),
      escapeCSVCell(lead.adminFeedback || ""),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `BenaFlash_Global_Tempahan_Export_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract unique services & tags
  const uniqueServices = Array.from(
    new Set(leads.map((l) => l.serviceType).filter(Boolean))
  );

  const allAvailableTags = Array.from(
    new Set([
      ...PRESET_TAGS,
      ...leads.flatMap((l) => l.tags || []),
    ])
  );

  // Filter logic
  const filteredLeads = leads.filter((lead) => {
    let matchDate = true;
    if (filterDate) {
      const parts = filterDate.split("-");
      const formattedFilterDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      matchDate =
        lead.date === formattedFilterDate ||
        lead.scheduledDate === filterDate;
    }

    const matchService = !filterService || lead.serviceType === filterService;
    const matchLocation =
      !filterLocation ||
      lead.location.toLowerCase().includes(filterLocation.toLowerCase());
    const matchTag =
      !filterTag || (lead.tags && lead.tags.includes(filterTag));
    const matchStatus =
      !filterStatus || lead.status === filterStatus;

    return matchDate && matchService && matchLocation && matchTag && matchStatus;
  });

  const clearFilters = () => {
    setFilterDate("");
    setFilterService("");
    setFilterLocation("");
    setFilterTag("");
    setFilterStatus("");
  };

  const isFilterActive =
    filterDate || filterService || filterLocation || filterTag || filterStatus;

  // Bulk Selection Handlers
  const isAllSelected =
    filteredLeads.length > 0 &&
    filteredLeads.every((l) => selectedLeadIds.includes(l.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const handleToggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusApply = () => {
    if (!bulkStatus) {
      alert("Sila pilih status sasaran untuk dikemaskini.");
      return;
    }
    if (selectedLeadIds.length === 0) return;

    selectedLeadIds.forEach((id) => {
      handleStatusChangeWithTimeline(id, bulkStatus as LeadQuote["status"]);
    });

    alert(
      `Status bagi ${selectedLeadIds.length} permohonan yang dipilih telah dikemaskini kepada '${bulkStatus}'.`
    );
    setBulkStatus("");
  };

  const handleBulkTagApply = (tagToAdd?: string) => {
    const tag = (tagToAdd || bulkTagInput).trim();
    if (!tag) {
      alert("Sila masukkan atau pilih tag untuk ditambah.");
      return;
    }
    if (selectedLeadIds.length === 0) return;

    selectedLeadIds.forEach((id) => {
      handleAddTag(id, tag);
    });

    alert(
      `Tag '${tag}' berjaya ditambah kepada ${selectedLeadIds.length} permohonan.`
    );
    setBulkTagInput("");
  };

  const handleBulkDelete = () => {
    if (selectedLeadIds.length === 0) return;
    if (
      !window.confirm(
        `Adakah anda pasti untuk MEMADAM ${selectedLeadIds.length} permohonan sebut harga yang dipilih? Tindakan ini tidak boleh diundur.`
      )
    ) {
      return;
    }

    selectedLeadIds.forEach((id) => onDelete(id));
    setSelectedLeadIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border-b pb-4">
        <h3 className="font-bold text-[#0F172A] text-lg">
          Peti Masuk Sebut Harga & Bantuan
        </h3>
        <p className="text-xs text-slate-500">
          Uruskan permohonan sebut harga, jadual temujanji, tag keutamaan, garis masa aktiviti dan tiket aduan pelanggan secara berpusat.
        </p>
      </div>

      {/* Sub tabs selector */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("leads")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "leads"
              ? "border-[#D4AF37] text-slate-900 font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Sebut Harga / Tempahan ({filteredLeads.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tickets")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "tickets"
              ? "border-[#D4AF37] text-slate-900 font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Tiket Bantuan Pelanggan</span>
          {supportTickets.filter((t) => t.status === "Baru").length > 0 && (
            <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
              {supportTickets.filter((t) => t.status === "Baru").length} BARU
            </span>
          )}
        </button>
      </div>

      {activeTab === "leads" && (
        <>
          {/* WORKLOAD SUMMARY RECHARTS CHART */}
          {leads.length > 0 && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-3xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#0F172A] rounded-xl text-[#D4AF37]">
                    <PieChartIcon className="w-4.5 h-4.5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      Analisis Ringkasan Status & Beban Kerja Lead
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Pecahan visual bagi {leads.length} permohonan mengikut status semasa. Tekan pada mana-mana status untuk menapis senarai.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSummaryChart(!showSummaryChart)}
                  className="text-[10.5px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition self-start sm:self-center cursor-pointer"
                >
                  {showSummaryChart ? "Sembunyikan Carta" : "Papar Carta Breakdown"}
                </button>
              </div>

              {showSummaryChart && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2">
                  {/* Recharts Pie Chart (Left 5 Cols) */}
                  <div className="md:col-span-5 h-[200px] w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "New (Baharu)",
                              value: leads.filter((l) => l.status === "New").length,
                              color: "#E11D48",
                              statusKey: "New",
                            },
                            {
                              name: "Reviewed",
                              value: leads.filter((l) => l.status === "Reviewed").length,
                              color: "#F59E0B",
                              statusKey: "Reviewed",
                            },
                            {
                              name: "Contacted",
                              value: leads.filter((l) => l.status === "Contacted").length,
                              color: "#3B82F6",
                              statusKey: "Contacted",
                            },
                            {
                              name: "Quoted",
                              value: leads.filter((l) => l.status === "Quoted").length,
                              color: "#9333EA",
                              statusKey: "Quoted",
                            },
                            {
                              name: "Completed",
                              value: leads.filter((l) => l.status === "Completed").length,
                              color: "#10B981",
                              statusKey: "Completed",
                            },
                          ].filter((d) => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {[
                            {
                              name: "New (Baharu)",
                              value: leads.filter((l) => l.status === "New").length,
                              color: "#E11D48",
                              statusKey: "New",
                            },
                            {
                              name: "Reviewed",
                              value: leads.filter((l) => l.status === "Reviewed").length,
                              color: "#F59E0B",
                              statusKey: "Reviewed",
                            },
                            {
                              name: "Contacted",
                              value: leads.filter((l) => l.status === "Contacted").length,
                              color: "#3B82F6",
                              statusKey: "Contacted",
                            },
                            {
                              name: "Quoted",
                              value: leads.filter((l) => l.status === "Quoted").length,
                              color: "#9333EA",
                              statusKey: "Quoted",
                            },
                            {
                              name: "Completed",
                              value: leads.filter((l) => l.status === "Completed").length,
                              color: "#10B981",
                              statusKey: "Completed",
                            },
                          ]
                            .filter((d) => d.value > 0)
                            .map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() =>
                                  setFilterStatus(
                                    filterStatus === entry.statusKey ? "" : entry.statusKey
                                  )
                                }
                              />
                            ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(val: any, name: any) => [
                            `${val} Permohonan (${((Number(val) / leads.length) * 100).toFixed(1)}%)`,
                            name,
                          ]}
                          contentStyle={{
                            backgroundColor: "#0F172A",
                            borderRadius: "12px",
                            border: "1px solid #D4AF37",
                            color: "#FFFFFF",
                            fontSize: "12px",
                            fontWeight: "bold",
                            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-slate-900">{leads.length}</span>
                      <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">
                        Jumlah Lead
                      </span>
                    </div>
                  </div>

                  {/* Status Breakdown Progress Bars & Click Filters (Right 7 Cols) */}
                  <div className="md:col-span-7 space-y-2">
                    {[
                      {
                        name: "New (Baharu)",
                        value: leads.filter((l) => l.status === "New").length,
                        color: "#E11D48",
                        statusKey: "New",
                      },
                      {
                        name: "Reviewed",
                        value: leads.filter((l) => l.status === "Reviewed").length,
                        color: "#F59E0B",
                        statusKey: "Reviewed",
                      },
                      {
                        name: "Contacted",
                        value: leads.filter((l) => l.status === "Contacted").length,
                        color: "#3B82F6",
                        statusKey: "Contacted",
                      },
                      {
                        name: "Quoted",
                        value: leads.filter((l) => l.status === "Quoted").length,
                        color: "#9333EA",
                        statusKey: "Quoted",
                      },
                      {
                        name: "Completed",
                        value: leads.filter((l) => l.status === "Completed").length,
                        color: "#10B981",
                        statusKey: "Completed",
                      },
                    ].map((item) => {
                      const pct = leads.length > 0 ? (item.value / leads.length) * 100 : 0;
                      const isSelected = filterStatus === item.statusKey;

                      return (
                        <div
                          key={item.statusKey}
                          onClick={() =>
                            setFilterStatus(isSelected ? "" : item.statusKey)
                          }
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                            isSelected
                              ? "bg-slate-900 border-[#D4AF37] text-white shadow-sm"
                              : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/80 text-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                              ></span>
                              <span className="font-extrabold">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="font-black text-xs">{item.value}</span>
                              <span className="text-[10px] opacity-75 font-semibold">
                                ({pct.toFixed(0)}%)
                              </span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full transition-all duration-500 rounded-full"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: item.color,
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VISUAL STATUS TRAFFIC LIGHT SUMMARY CARDS */}
          {leads.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* NEW STATUS CARD */}
              <button
                type="button"
                onClick={() => setFilterStatus(filterStatus === "New" ? "" : "New")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between shadow-3xs ${
                  filterStatus === "New"
                    ? "bg-rose-50/90 border-rose-400 ring-2 ring-rose-400/40 shadow-sm"
                    : "bg-white border-slate-200 hover:border-rose-300 hover:bg-rose-50/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                  </span>
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="mt-2">
                  <span className="block text-2xl font-black text-rose-950">
                    {leads.filter((l) => l.status === "New").length}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-rose-700 tracking-wider">
                    🔴 New (Baharu)
                  </span>
                </div>
              </button>

              {/* REVIEWED STATUS CARD */}
              <button
                type="button"
                onClick={() => setFilterStatus(filterStatus === "Reviewed" ? "" : "Reviewed")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between shadow-3xs ${
                  filterStatus === "Reviewed"
                    ? "bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/40 shadow-sm"
                    : "bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  <Eye className="w-4 h-4 text-amber-600" />
                </div>
                <div className="mt-2">
                  <span className="block text-2xl font-black text-amber-950">
                    {leads.filter((l) => l.status === "Reviewed").length}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider">
                    🟡 Reviewed
                  </span>
                </div>
              </button>

              {/* CONTACTED STATUS CARD */}
              <button
                type="button"
                onClick={() => setFilterStatus(filterStatus === "Contacted" ? "" : "Contacted")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between shadow-3xs ${
                  filterStatus === "Contacted"
                    ? "bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/40 shadow-sm"
                    : "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                  <PhoneCall className="w-4 h-4 text-blue-600" />
                </div>
                <div className="mt-2">
                  <span className="block text-2xl font-black text-blue-950">
                    {leads.filter((l) => l.status === "Contacted").length}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-blue-800 tracking-wider">
                    🔵 Contacted
                  </span>
                </div>
              </button>

              {/* QUOTED STATUS CARD */}
              <button
                type="button"
                onClick={() => setFilterStatus(filterStatus === "Quoted" ? "" : "Quoted")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between shadow-3xs ${
                  filterStatus === "Quoted"
                    ? "bg-purple-50/90 border-purple-400 ring-2 ring-purple-400/40 shadow-sm"
                    : "bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-3 h-3 rounded-full bg-purple-600 inline-block"></span>
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <div className="mt-2">
                  <span className="block text-2xl font-black text-purple-950">
                    {leads.filter((l) => l.status === "Quoted").length}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-purple-800 tracking-wider">
                    🟣 Quoted
                  </span>
                </div>
              </button>

              {/* COMPLETED STATUS CARD */}
              <button
                type="button"
                onClick={() => setFilterStatus(filterStatus === "Completed" ? "" : "Completed")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between shadow-3xs ${
                  filterStatus === "Completed"
                    ? "bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/40 shadow-sm"
                    : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-2">
                  <span className="block text-2xl font-black text-emerald-950">
                    {leads.filter((l) => l.status === "Completed").length}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider">
                    🟢 Completed
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* FILTER BAR PANEL */}
          {leads.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-3xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-[#D4AF37]" />
                  <span>Penapis Carian & Label Tag Tempahan:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {filterStatus && (
                    <span className="text-[10px] bg-[#0F172A] text-[#D4AF37] px-2.5 py-0.5 rounded-full font-extrabold border border-[#D4AF37]">
                      Status: {filterStatus}
                    </span>
                  )}
                  {filterTag && (
                    <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-0.5 rounded-full font-extrabold border border-[#D4AF37]/30">
                      Tag: {filterTag}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Filter 1: Status */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    Status Permohonan
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#D4AF37] font-semibold text-slate-700 h-[34px]"
                  >
                    <option value="">Semua Status</option>
                    <option value="New">🔴 New (Baharu)</option>
                    <option value="Reviewed">🟡 Reviewed</option>
                    <option value="Contacted">🔵 Contacted</option>
                    <option value="Quoted">🟣 Quoted</option>
                    <option value="Completed">🟢 Completed</option>
                  </select>
                </div>

                {/* Filter 2: Tarikh */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    Tarikh Tempahan
                  </label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#D4AF37] font-semibold text-slate-700 h-[34px]"
                  />
                </div>

                {/* Filter 3: Jenis Perkhidmatan */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    Jenis Perkhidmatan
                  </label>
                  <select
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#D4AF37] font-semibold text-slate-700 h-[34px]"
                  >
                    <option value="">Semua Perkhidmatan</option>
                    {uniqueServices.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter 4: Kawasan / Tapak */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    Kawasan Tapak Projek
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari kawasan (e.g. Kajang)"
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="w-full text-xs p-2 pl-7 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#D4AF37] font-semibold text-slate-700 h-[34px]"
                    />
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Filter 5: Custom Tag Filter */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    Penapis Tag Khas
                  </label>
                  <div className="relative">
                    <select
                      value={filterTag}
                      onChange={(e) => setFilterTag(e.target.value)}
                      className="w-full text-xs p-2 pl-7 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#D4AF37] font-semibold text-slate-700 h-[34px]"
                    >
                      <option value="">Semua Tag</option>
                      {allAvailableTags.map((tag) => (
                        <option key={tag} value={tag}>
                          🏷️ {tag}
                        </option>
                      ))}
                    </select>
                    <Tag className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#D4AF37]" />
                  </div>
                </div>
              </div>

              {/* Tag Quick Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 mr-1">
                  Pilihan Tag Pantas:
                </span>
                {PRESET_TAGS.map((ptag) => {
                  const isActive = filterTag === ptag;
                  return (
                    <button
                      key={ptag}
                      type="button"
                      onClick={() => setFilterTag(isActive ? "" : ptag)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-all cursor-pointer border ${
                        isActive
                          ? "bg-[#0F172A] text-[#D4AF37] border-[#D4AF37]"
                          : "bg-white text-slate-600 border-slate-200 hover:border-[#D4AF37]"
                      }`}
                    >
                      #{ptag}
                    </button>
                  );
                })}
              </div>

              {/* Filter Status Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 text-xs">
                <span className="font-bold text-slate-500">
                  Menunjukkan{" "}
                  <strong className="text-slate-800">{filteredLeads.length}</strong>{" "}
                  daripada <strong className="text-slate-800">{leads.length}</strong>{" "}
                  permohonan.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportToCSV}
                    className="flex items-center gap-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/40 hover:bg-[#D4AF37] hover:text-slate-950 text-amber-700 px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer text-[10.5px] uppercase tracking-wider"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Eksport ke CSV
                  </button>

                  {isFilterActive && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer text-[10.5px] uppercase tracking-wider"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Padam Penapis
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BULK ACTIONS BAR */}
          {filteredLeads.length > 0 && (
            <div className="bg-[#0F172A] border border-[#D4AF37]/40 rounded-2xl p-4 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] hover:text-white transition cursor-pointer"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Pilih Semua ({filteredLeads.length})</span>
                </button>

                {selectedLeadIds.length > 0 && (
                  <span className="bg-[#D4AF37] text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    {selectedLeadIds.length} Dipilih
                  </span>
                )}
              </div>

              {selectedLeadIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Bulk Status Update */}
                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <select
                      value={bulkStatus}
                      onChange={(e) => setBulkStatus(e.target.value)}
                      className="bg-slate-900 text-white text-[11px] font-bold p-1.5 rounded-lg focus:outline-none"
                    >
                      <option value="">-- Tukar Status Pukal --</option>
                      {statuses.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleBulkStatusApply}
                      className="bg-[#D4AF37] hover:bg-amber-400 text-slate-950 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition cursor-pointer"
                    >
                      Kemaskini
                    </button>
                  </div>

                  {/* Bulk Tag Add */}
                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <select
                      value={bulkTagInput}
                      onChange={(e) => setBulkTagInput(e.target.value)}
                      className="bg-slate-900 text-white text-[11px] font-bold p-1.5 rounded-lg focus:outline-none"
                    >
                      <option value="">-- Tambah Tag Pukal --</option>
                      {PRESET_TAGS.map((pt) => (
                        <option key={pt} value={pt}>
                          {pt}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleBulkTagApply()}
                      className="bg-[#D4AF37] hover:bg-amber-400 text-slate-950 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition cursor-pointer"
                    >
                      + Tag
                    </button>
                  </div>

                  {/* Bulk Delete */}
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl font-bold transition text-[11px] uppercase tracking-wider cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Padam ({selectedLeadIds.length})
                  </button>

                  {/* Clear Selection */}
                  <button
                    type="button"
                    onClick={() => setSelectedLeadIds([])}
                    className="text-slate-400 hover:text-white text-[10px] uppercase font-bold underline px-2 cursor-pointer"
                  >
                    Nyahpilih
                  </button>
                </div>
              )}
            </div>
          )}

          {/* LEADS LIST */}
          <div className="grid grid-cols-1 gap-6">
            {leads.length === 0 ? (
              <div className="bg-white border rounded-2xl p-12 text-center text-slate-400">
                <Mail className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">
                  Tiada permohonan sebut harga diterima buat masa sekarang.
                </p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="bg-white border rounded-2xl p-12 text-center text-slate-400">
                <Filter className="w-12 h-12 mx-auto mb-3 text-[#D4AF37]/55" />
                <p className="text-sm font-bold text-slate-700">Tiada carian sepadan.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Sila tukar tetapan penapis atau padankan kata kunci carian yang lain.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] hover:text-white rounded-xl text-xs font-bold uppercase transition"
                >
                  Reset Semua Penapis
                </button>
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);
                const leadTags = lead.tags || [];
                const timelineItems = getLeadTimeline(lead);
                const isTimelineExpanded = !!expandedTimelineLeads[lead.id];
                const isTagInputOpen = openTagInputForLead === lead.id;

                return (
                  <div
                    key={lead.id}
                    className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 transition-all ${
                      isSelected
                        ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30 bg-amber-50/20"
                        : "border-slate-200"
                    }`}
                  >
                    {/* Card Header & Checkbox */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggleSelectLead(lead.id)}
                          className="mt-1 text-slate-400 hover:text-[#D4AF37] transition cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-[#D4AF37]" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300" />
                          )}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            {renderStatusBadge(lead.status)}
                            <span className="text-slate-400 text-[10px] flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3" />
                              {lead.date}
                            </span>
                            <span className="text-slate-400 text-[10px] font-mono">
                              ID: #{lead.id.substring(0, 8)}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                            {lead.name}
                          </h4>
                          <p className="text-xs font-semibold text-[#0F172A]">
                            {lead.companyName || "Syarikat Persendirian"}
                          </p>

                          {/* CUSTOM TAGS BADGES DISPLAY */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {leadTags.map((t) => (
                              <span
                                key={t}
                                className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300/80 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-3xs"
                              >
                                <Tag className="w-2.5 h-2.5 text-[#D4AF37]" />
                                {t}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(lead.id, t)}
                                  className="text-amber-700 hover:text-rose-600 ml-0.5 cursor-pointer"
                                  title="Buang Tag"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            ))}

                            {/* Add Tag Toggle Button */}
                            <button
                              type="button"
                              onClick={() =>
                                setOpenTagInputForLead(
                                  isTagInputOpen ? null : lead.id
                                )
                              }
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-0.5 rounded-full transition cursor-pointer"
                            >
                              <Plus className="w-2.5 h-2.5 text-[#D4AF37]" />
                              <span>+ Tag</span>
                            </button>
                          </div>

                          {/* Add Tag Inline Form */}
                          {isTagInputOpen && (
                            <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-fade-in max-w-md">
                              <span className="text-[10px] font-extrabold uppercase text-slate-600 block">
                                Pilih Tag Pra-isi atau Taip Tag Khas:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {PRESET_TAGS.map((pt) => (
                                  <button
                                    key={pt}
                                    type="button"
                                    onClick={() => {
                                      handleAddTag(lead.id, pt);
                                      setOpenTagInputForLead(null);
                                    }}
                                    className="text-[9.5px] font-bold bg-white hover:bg-[#D4AF37] hover:text-slate-950 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md transition cursor-pointer"
                                  >
                                    + {pt}
                                  </button>
                                ))}
                              </div>

                              <div className="flex gap-2 pt-1">
                                <input
                                  type="text"
                                  placeholder="Taip nama tag khas..."
                                  value={customTagInput[lead.id] || ""}
                                  onChange={(e) =>
                                    setCustomTagInput((prev) => ({
                                      ...prev,
                                      [lead.id]: e.target.value,
                                    }))
                                  }
                                  className="text-xs p-1.5 border border-slate-300 rounded-lg bg-white flex-1 focus:outline-none focus:border-[#D4AF37]"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleAddTag(
                                        lead.id,
                                        customTagInput[lead.id] || ""
                                      );
                                      setCustomTagInput((prev) => ({
                                        ...prev,
                                        [lead.id]: "",
                                      }));
                                      setOpenTagInputForLead(null);
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleAddTag(
                                      lead.id,
                                      customTagInput[lead.id] || ""
                                    );
                                    setCustomTagInput((prev) => ({
                                      ...prev,
                                      [lead.id]: "",
                                    }));
                                    setOpenTagInputForLead(null);
                                  }}
                                  className="bg-[#0F172A] text-[#D4AF37] text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase cursor-pointer"
                                >
                                  Simpan
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Header Controls: Status, Audit Note, Schedule Follow-Up & Delete */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAuditNoteModalLead(lead);
                            setAuditNoteContent("");
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] border border-[#D4AF37]/40 text-[10.5px] font-extrabold uppercase rounded-xl transition-all shadow-2xs cursor-pointer"
                          title="Tambah Nota Audit Rasmi ke Sejarah Lead"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Audit Note</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFollowUpModalLead(lead);
                            setFollowUpAgenda(`Follow-up Sebut Harga: ${lead.serviceType}`);
                            setFollowUpNotes("");
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 text-[10.5px] font-extrabold uppercase rounded-xl transition-all shadow-2xs cursor-pointer"
                          title="Jadualkan Peringatan Follow-up Kalendar"
                        >
                          <CalendarPlus className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Schedule Follow-up</span>
                        </button>

                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleStatusChangeWithTimeline(
                              lead.id,
                              e.target.value as LeadQuote["status"]
                            )
                          }
                          className="text-xs border p-2 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-slate-50 font-bold"
                        >
                          {statuses.map((st) => (
                            <option key={st} value={st}>
                              {st === "New"
                                ? "🔴 New (Baharu)"
                                : st === "Reviewed"
                                ? "🟡 Reviewed"
                                : st === "Contacted"
                                ? "🔵 Contacted"
                                : st === "Quoted"
                                ? "🟣 Quoted"
                                : "🟢 Completed"}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => onDelete(lead.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Padam Permohonan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* DISPLAY SCHEDULED FOLLOW-UP BADGE / REMINDER BANNER */}
                    {lead.scheduledFollowUpDate && (
                      <div className="p-3 bg-indigo-950 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs border border-indigo-700">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-indigo-800 rounded-lg text-[#D4AF37] shrink-0">
                            <BellRing className="w-4 h-4 animate-bounce" />
                          </div>
                          <div>
                            <span className="text-[9px] font-extrabold uppercase text-[#D4AF37] tracking-wider block">
                              🔔 Follow-up Reminder Aktif:
                            </span>
                            <span className="text-xs font-bold text-indigo-50">
                              {lead.scheduledFollowUpDate} — {lead.scheduledFollowUpAgenda || "Tindakan Susulan Admin"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              const text = encodeURIComponent(`BFG Follow-up: ${lead.name} (${lead.serviceType})`);
                              const details = encodeURIComponent(
                                `Panggilan / Tindakan Susulan Admin BFG\n\nPelanggan: ${lead.name}\nTelefon: ${lead.phone}\nE-mel: ${lead.email}\nID Permohonan: ${lead.id}\nAgenda: ${lead.scheduledFollowUpAgenda || "Tindakan Susulan"}`
                              );
                              const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}`;
                              window.open(calUrl, "_blank");
                            }}
                            className="px-2.5 py-1 bg-indigo-800 hover:bg-indigo-700 text-[#D4AF37] text-[10px] font-extrabold uppercase rounded-lg border border-[#D4AF37]/30 flex items-center gap-1 transition cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Google Calendar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdateField) {
                                onUpdateField(lead.id, "scheduledFollowUpDate", "");
                                alert("Follow-up ditanda sebagai selesai.");
                              }
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold uppercase rounded-lg transition cursor-pointer flex items-center gap-1"
                            title="Tanda Selesai"
                          >
                            <Check className="w-3 h-3" />
                            Selesai
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Detail Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="block font-bold text-slate-400 uppercase text-[9px] mb-0.5">
                          Perkhidmatan
                        </span>
                        <p className="font-semibold text-slate-800">
                          {lead.serviceType}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="block font-bold text-slate-400 uppercase text-[9px] mb-0.5">
                          Talian Hubungi
                        </span>
                        <a
                          href={`tel:${lead.phone}`}
                          className="font-semibold text-slate-800 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-[#D4AF37]" />
                          {lead.phone}
                        </a>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="block font-bold text-slate-400 uppercase text-[9px] mb-0.5">
                          Alamat E-mel
                        </span>
                        <a
                          href={`mailto:${lead.email}`}
                          className="font-semibold text-slate-800 hover:underline flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3 text-slate-400" />
                          {lead.email}
                        </a>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="block font-bold text-[#D4AF37] uppercase text-[9px] mb-0.5">
                          Cadangan Bajet
                        </span>
                        <p className="font-extrabold text-[#0F172A]">
                          {lead.budget || "Belum Ditentukan"}
                        </p>
                      </div>
                    </div>

                    {/* Message Text Block */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Mesej Utama / Skop Keperluan:
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                        {lead.message}
                      </p>
                    </div>

                    {/* Attachment Link if Present */}
                    {lead.attachmentUrl && (
                      <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white shadow-xs">
                        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-700 uppercase">
                              Lampiran Pelanggan (Rujukan)
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {lead.attachmentName || "Dokumen Lampiran"}
                            </span>
                          </div>
                        </div>
                        <a
                          href={lead.attachmentUrl}
                          download={lead.attachmentName || "Lampiran_BFG"}
                          className="text-[10px] font-bold uppercase px-3 py-1.5 bg-[#0F172A] text-[#D4AF37] rounded hover:bg-slate-800 transition shadow-sm"
                        >
                          Muat Turun Fail
                        </a>
                      </div>
                    )}

                    {/* Display Visit Scheduling Slot */}
                    {lead.scheduledDate && (
                      <div className="p-3.5 bg-yellow-50/60 border border-[#D4AF37]/30 rounded-xl flex items-center gap-2.5 text-xs">
                        <Calendar className="w-4 h-4 text-[#D4AF37]" />
                        <div>
                          <span className="font-extrabold text-[#D4AF37] uppercase text-[9px] tracking-widest block">
                            SLOT TEMUJANJI SERVIS (AIRCOND/MEK)
                          </span>
                          <span className="font-bold text-slate-800">
                            Tarikh:{" "}
                            <span className="underline">{lead.scheduledDate}</span> | Slot Masa:{" "}
                            <span className="underline">
                              {lead.scheduledTimeSlot || "Sesi Penuh"}
                            </span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Admin Feedback Input Block */}
                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                      <label className="block text-[9px] font-extrabold text-[#0F172A] uppercase tracking-wider">
                        Tindakan & Pengesahan Admin (Masa Nyata ke Pelanggan):
                      </label>

                      {/* Templates Selector */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 mb-2">
                        <span className="text-[9.5px] font-bold text-amber-950 uppercase tracking-wider block">
                          📋 Gunakan Templat WhatsApp/E-mel:
                        </span>
                        <select
                          id={`template-selector-${lead.id}`}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            let prefilled = "";
                            if (val === "peringatan") {
                              prefilled = `Peringatan Temujanji: Slot temujanji lawatan tapak anda dijadualkan pada ${
                                lead.scheduledDate || "tarikh dipersetujui"
                              } pukul ${
                                lead.scheduledTimeSlot || "jam yang sedia"
                              }. Sila sahkan kehadiran anda. Terima kasih!`;
                            } else if (val === "sebutharga") {
                              prefilled = `Sebut Harga Sedia: Kami dengan sukacitanya mengumumkan bahawa sebut harga bagi permohonan ${
                                lead.serviceType
                              } anda telah sedia. Anggaran bajet: ${
                                lead.budget || "Hubungi kami"
                              }. Sila balas jika setuju. Terima kasih!`;
                            } else if (val === "selesai") {
                              prefilled = `Selesai & Testimonial: Terima kasih kerana memilih BenaFlash Global PLT! Sesi ${lead.serviceType} anda telah selesai sepenuhnya. Sila layari Portal Pelanggan kami untuk memberikan ulasan & bintang. Terima kasih!`;
                            } else if (val === "status_semasa") {
                              prefilled = `Kemaskini Status: Status tempahan anda dengan ID ${lead.id} telah dikemaskini ke status baru: '${lead.status}'. Pasukan kami sedang menyegerakan tindakan susulan. Terima kasih!`;
                            } else if (val === "aircond_30day") {
                              prefilled = `Salam ${lead.name}, PERINGATAN MESRA BENA FLASH GLOBAL PLT: Servis pembersihan & semakan gas aircond anda (${lead.serviceType}) dijadualkan berlangsung dalam masa 30 hari lagi. Penyelenggaraan berkala memastikan aircond anda kekal sejuk, jimat tenaga & tahan lama. Sila balas Mesej ini atau layari bfgplt.com untuk pengesahan tarikh/slot pilihan anda!`;
                            }

                            const input = document.getElementById(
                              `feedback-input-${lead.id}`
                            ) as HTMLInputElement;
                            if (input) {
                              input.value = prefilled;
                            }
                            handleFeedbackWithTimeline(lead.id, prefilled);
                          }}
                          className="text-[10px] p-1 border border-slate-300 rounded-lg bg-white text-slate-700 font-bold focus:outline-none"
                        >
                          <option value="">-- Pilih Templat Pra-isi --</option>
                          <option value="peringatan">Peringatan Slot Temujanji</option>
                          <option value="sebutharga">Quotation / Sebut Harga Sedia</option>
                          <option value="selesai">Selesai & Minta Rating Bintang</option>
                          <option value="status_semasa">Kemaskini Status Kerja</option>
                          <option value="aircond_30day">
                            🔔 Peringatan Servis Aircond 30 Hari
                          </option>
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          id={`feedback-input-${lead.id}`}
                          defaultValue={lead.adminFeedback || ""}
                          placeholder="Masukkan maklum balas (e.g. 'Jadual disahkan, teknisyen sedia datang jam 11:30 AM')"
                          className="flex-grow text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#D4AF37] bg-white text-slate-800 font-semibold shadow-2xs"
                          onBlur={(e) => {
                            handleFeedbackWithTimeline(lead.id, e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleFeedbackWithTimeline(
                                lead.id,
                                (e.target as HTMLInputElement).value
                              );
                              alert("Maklum balas dikemaskini dalam sistem.");
                            }
                          }}
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            const input = document.getElementById(
                              `feedback-input-${lead.id}`
                            ) as HTMLInputElement;
                            const msg = input.value;
                            handleFeedbackWithTimeline(lead.id, msg);

                            let phoneFormat = lead.phone.replace(/[^0-9]/g, "");
                            if (phoneFormat.startsWith("0"))
                              phoneFormat = "6" + phoneFormat;

                            const waText = encodeURIComponent(
                              `Salam sejahtera ${lead.name}, kami dari BenaFlash Global merujuk permohonan anda (Ruj: ${lead.id}).\n\nMaklum Balas: ${msg}\n\nTerima kasih.`
                            );
                            window.open(
                              `https://wa.me/${phoneFormat}?text=${waText}`,
                              "_blank"
                            );
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase px-3 py-2 rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1.5"
                        >
                          Hantar & Buka WhatsApp
                        </button>

                        <button
                          onClick={() => {
                            const input = document.getElementById(
                              `feedback-input-${lead.id}`
                            ) as HTMLInputElement;
                            const msg = input.value;
                            handleFeedbackWithTimeline(lead.id, msg);

                            const emailSubject = encodeURIComponent(
                              `Maklum Balas BenaFlash Global / Temujanji (Ruj: ${lead.id})`
                            );
                            const emailBody = encodeURIComponent(
                              `Salam sejahtera ${lead.name},\n\nKami merujuk kepada permohonan anda bersama BenaFlash Global.\n\nStatus/Tindakan: ${msg}\n\nSila simpan rujukan tiket anda: ${lead.id}\n\nTerima kasih atas sokongan berterusan anda.\n\nBenaFlash Global PLT`
                            );
                            window.location.href = `mailto:${lead.email}?subject=${emailSubject}&body=${emailBody}`;
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase px-3 py-2 rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1.5"
                        >
                          Hantar & Automasikan E-mel
                        </button>

                        <button
                          onClick={() => {
                            const input = document.getElementById(
                              `feedback-input-${lead.id}`
                            ) as HTMLInputElement;
                            handleFeedbackWithTimeline(lead.id, input.value);
                            alert(
                              "Maklum balas berjaya dikemaskini dalam sistem sahaja."
                            );
                          }}
                          className="bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] text-[10px] font-bold uppercase px-3 py-2 rounded-lg transition shrink-0 cursor-pointer"
                        >
                          Sistem Sahaja
                        </button>
                      </div>
                      {lead.adminFeedback ? (
                        <p className="text-[10px] text-green-700 font-bold flex items-center gap-1 mt-2">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          Status Semasa: "{lead.adminFeedback}"
                        </p>
                      ) : (
                        <p className="text-[9px] text-slate-400 mt-2">
                          Sediakan maklum balas jawapan untuk mengesahkan slot masa lawatan atau memberi keputusan sebut harga.
                        </p>
                      )}
                    </div>

                    {/* Technical Staff Assignment Dropdown */}
                    <div className="p-3.5 bg-indigo-50/50 border border-indigo-200/50 rounded-xl space-y-2 text-xs">
                      <span className="block font-extrabold text-indigo-950 uppercase text-[9px] tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                        👷 Penjadualan Teknikal (Penugasan Ahli Pasukan):
                      </span>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="flex-grow">
                          <select
                            value={lead.assignedStaffId || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (onUpdateField) {
                                onUpdateField(lead.id, "assignedStaffId", val);
                                const staffName =
                                  staffList.find((s) => s.id === val)?.name ||
                                  "Teknisi";
                                addTimelineEvent(
                                  lead,
                                  `Penugasan Teknisi: ${staffName}`,
                                  `Permohonan ini telah ditugaskan kepada ${staffName}.`,
                                  "system"
                                );
                                alert("Penugasan teknisyen berjaya disimpan.");
                              }
                            }}
                            className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:outline-hidden text-slate-800"
                          >
                            <option value="">-- Tiada Teknisi Ditugaskan --</option>
                            {staffList.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.name} ({st.role})
                              </option>
                            ))}
                          </select>
                        </div>
                        {lead.assignedStaffId ? (
                          <div className="flex items-center gap-1 text-emerald-700 font-extrabold text-[10px] uppercase bg-emerald-100/80 px-2.5 py-1.5 rounded-lg border border-emerald-200 shrink-0">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              Ditugaskan kepada:{" "}
                              {staffList.find((s) => s.id === lead.assignedStaffId)
                                ?.name || "Teknisi"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 italic shrink-0">
                            Menunggu penugasan jadual teknik...
                          </span>
                        )}
                      </div>
                    </div>

                    {/* VISUAL TIMELINE SECTION */}
                    <div className="border-t border-slate-200 pt-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedTimelineLeads((prev) => ({
                            ...prev,
                            [lead.id]: !prev[lead.id],
                          }))
                        }
                        className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition text-xs font-bold text-slate-800 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <History className="w-4 h-4 text-[#D4AF37]" />
                          <span>Garis Masa & Rekod Aktiviti Projek</span>
                          <span className="bg-[#0F172A] text-[#D4AF37] text-[9.5px] font-black px-2 py-0.5 rounded-full">
                            {timelineItems.length} Peristiwa
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                          <span>
                            {isTimelineExpanded ? "Sembunyikan" : "Lihat Rekod"}
                          </span>
                          {isTimelineExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </button>

                      {isTimelineExpanded && (
                        <div className="mt-3 p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-4 animate-fade-in">
                          {/* Timeline Node List */}
                          <div className="relative pl-6 border-l-2 border-slate-300 space-y-4 ml-2">
                            {timelineItems.map((item) => {
                              const isStatus = item.type === "status_change";
                              const isTag = item.type === "tag";
                              const isNote = item.type === "note";

                              return (
                                <div
                                  key={item.id}
                                  className="relative group transition-all"
                                >
                                  {/* Node Bullet Icon */}
                                  <div
                                    className={`absolute -left-[35px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${
                                      isStatus
                                        ? "bg-amber-100 border-amber-500 text-amber-800"
                                        : isTag
                                        ? "bg-purple-100 border-purple-500 text-purple-800"
                                        : isNote
                                        ? "bg-blue-100 border-blue-500 text-blue-800"
                                        : "bg-emerald-100 border-emerald-500 text-emerald-800"
                                    }`}
                                  >
                                    {isStatus ? (
                                      <Activity className="w-3 h-3" />
                                    ) : isTag ? (
                                      <Tag className="w-3 h-3" />
                                    ) : isNote ? (
                                      <MessageSquare className="w-3 h-3" />
                                    ) : (
                                      <Shield className="w-3 h-3" />
                                    )}
                                  </div>

                                  {/* Event Content */}
                                  <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs space-y-1">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <h5 className="font-bold text-xs text-slate-900">
                                        {item.title}
                                      </h5>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {formatISOToLocale(item.timestamp)}
                                      </span>
                                    </div>
                                    {item.note && (
                                      <p className="text-xs text-slate-600 leading-relaxed font-sans">
                                        {item.note}
                                      </p>
                                    )}
                                    {item.author && (
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block pt-0.5">
                                        Oleh: {item.author}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Add Custom Timeline Note Form */}
                          <div className="pt-2 border-t border-slate-200 space-y-2">
                            <span className="text-[10px] font-extrabold uppercase text-slate-700 flex items-center gap-1">
                              <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                              Tambah Catatan Aktiviti / Minit Lawatan Baru:
                            </span>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Contoh: Lawatan tapak disahkan selesai, sebut harga dihantar..."
                                value={newTimelineNote[lead.id] || ""}
                                onChange={(e) =>
                                  setNewTimelineNote((prev) => ({
                                    ...prev,
                                    [lead.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleAddCustomTimelineNote(lead.id);
                                  }
                                }}
                                className="flex-1 text-xs p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 font-semibold focus:outline-none focus:border-[#D4AF37]"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddCustomTimelineNote(lead.id)}
                                className="bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] px-3 py-2 rounded-xl text-[10px] font-black uppercase transition cursor-pointer flex items-center gap-1.5 shrink-0"
                              >
                                <Send className="w-3 h-3" /> Tambah Record
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {activeTab === "tickets" && (
        <div className="space-y-6 animate-fade-in text-slate-800">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-3xs flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="w-4.5 h-4.5 text-[#D4AF37]" />
                Senarai Tiket Bantuan Pelanggan
              </h4>
              <p className="text-[11px] text-slate-500">
                Balas kemusykilan dan aduan teknikal dari Portal Pelanggan BFG PLT.
              </p>
            </div>
            <span className="text-[11px] font-extrabold bg-slate-900 text-[#D4AF37] px-3 py-1 rounded-full border border-[#D4AF37]/35">
              Jumlah Tiket: {supportTickets.length}
            </span>
          </div>

          {!hasLoadedTickets ? (
            <div className="py-12 text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping"></span>
              Memuatkan rekod aduan...
            </div>
          ) : supportTickets.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed rounded-2xl bg-white">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-200" />
              Tiada tiket bantuan atau aduan dibuka oleh pelanggan buat masa ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {supportTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-[#D4AF37]/45 transition"
                >
                  {/* Header info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#D4AF37]/15 text-[#D4AF37] text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md border border-[#D4AF37]/30">
                          {ticket.category}
                        </span>
                        <span className="text-slate-400 text-[10px] flex items-center gap-1 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(ticket.createdAt || 0).toLocaleString(
                            "ms-MY"
                          )}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase">
                        {ticket.subject}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        Pelanggan:{" "}
                        <strong className="text-slate-700 font-bold">
                          {ticket.customerEmail}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">
                        Status Tiket:
                      </label>
                      <select
                        value={ticket.status || "Baru"}
                        onChange={(e) =>
                          handleUpdateTicketStatus(ticket.id, e.target.value)
                        }
                        className="text-[11px] font-extrabold px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                      >
                        <option value="Baru">Baru</option>
                        <option value="Dalam Proses">Dalam Proses</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </div>
                  </div>

                  {/* Message detail */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {ticket.message}
                  </div>

                  {/* Reply UI */}
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                      <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Hantar Balasan Pentadbir BFG PLT:</span>
                    </div>

                    {ticket.adminReply && (
                      <div className="p-3 bg-[#D4AF37]/5 border border-[#D4AF37]/35 rounded-lg space-y-1">
                        <span className="block text-[9px] font-extrabold text-[#D4AF37] uppercase">
                          Balasan Semasa Anda:
                        </span>
                        <p className="text-xs text-slate-700 font-semibold italic">
                          "{ticket.adminReply}"
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <textarea
                        rows={2}
                        value={replyText[ticket.id] || ""}
                        onChange={(e) =>
                          setReplyText((prev) => ({
                            ...prev,
                            [ticket.id]: e.target.value,
                          }))
                        }
                        placeholder="Tulis maklum balas jawapan atau arahan untuk pelanggan di sini..."
                        className="flex-1 text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleReplyTicket(ticket.id)}
                        className="bg-slate-900 hover:bg-[#D4AF37] hover:text-slate-950 text-white font-black uppercase text-[10px] px-4 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
                      >
                        Kirim Respon
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AUDIT NOTE MODAL */}
      {auditNoteModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden text-slate-800">
            {/* Modal Header */}
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between border-b border-[#D4AF37]/30">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#D4AF37]/20 rounded-xl text-[#D4AF37]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
                    Tambah Audit Note Rasmi
                  </h3>
                  <p className="text-[10px] text-slate-300 font-medium">
                    ID Permohonan: #{auditNoteModalLead.id.substring(0, 8)} | Pelanggan: {auditNoteModalLead.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuditNoteModalLead(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Admin Pengendali (Username)
                  </label>
                  <input
                    type="text"
                    value={auditAdminName}
                    onChange={(e) => setAuditAdminName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-slate-50 focus:bg-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Kategori / Jenis Audit
                  </label>
                  <select
                    value={auditCategory}
                    onChange={(e) => setAuditCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Semakan Dokumen & Permohonan">Semakan Dokumen & Permohonan</option>
                    <option value="Kelayakan Kredit & Bajet">Kelayakan Kredit & Bajet</option>
                    <option value="Pemeriksaan Tapak & Teknikal">Pemeriksaan Tapak & Teknikal</option>
                    <option value="Pengesahan Invois & Deposit">Pengesahan Invois & Deposit</option>
                    <option value="Aduan Kualiti / Pematuhan">Aduan Kualiti / Pematuhan</option>
                    <option value="Audit Am Pentadbiran">Audit Am Pentadbiran</option>
                  </select>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="block text-[9.5px] font-bold text-slate-400 uppercase mb-1">
                  ⚡ Templat Catatan Pantas Audit:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Dokumen permohonan disemak & lengkap.",
                    "Lawatan tapak teknikal disahkan tiada halangan.",
                    "Deposit permohonan telah diterima dalam akaun BFG PLT.",
                    "Sebut harga dikeluarkan mengikut spesifikasi disemak.",
                    "Aduan pelanggan disiasat dan selesai sepenuhnya.",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAuditNoteContent(preset)}
                      className="text-[9.5px] font-semibold bg-slate-100 hover:bg-[#D4AF37]/15 text-slate-700 hover:text-slate-900 px-2 py-1 rounded-md border border-slate-200 transition text-left cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                  Kandungan Nota Audit (Catatan Rasmi Timeline)
                </label>
                <textarea
                  rows={4}
                  value={auditNoteContent}
                  onChange={(e) => setAuditNoteContent(e.target.value)}
                  placeholder="Masukkan hasil audit, rekod semakan atau ulasan rasmi teknikal di sini..."
                  className="w-full p-3 border border-slate-300 rounded-xl font-semibold bg-white focus:outline-none focus:border-[#D4AF37] leading-relaxed"
                ></textarea>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[10.5px] text-amber-900 font-medium">
                ⏱️ <span className="font-bold">Automasi Masa & Admin:</span> Cap masa semasa (Timestamp) & nama admin pengendali akan dicatat secara automatik ke dalam garis masa sejarah permohonan secara kekal.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAuditNoteModalLead(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAuditNote}
                className="px-5 py-2 bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] font-extrabold text-xs uppercase rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-[#D4AF37]" />
                Simpan Audit Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE FOLLOW-UP MODAL */}
      {followUpModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden text-slate-800">
            {/* Modal Header */}
            <div className="bg-indigo-950 p-4 text-white flex items-center justify-between border-b border-indigo-700">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-800 rounded-xl text-[#D4AF37]">
                  <CalendarPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
                    Jadualkan Follow-Up & Peringatan Kalendar
                  </h3>
                  <p className="text-[10px] text-indigo-200 font-medium">
                    Pelanggan: {followUpModalLead.name} | Tel: {followUpModalLead.phone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFollowUpModalLead(null)}
                className="text-indigo-300 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Tarikh Panggilan Susulan
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Masa / Slot Pilihan
                  </label>
                  <select
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-white focus:outline-none focus:border-indigo-600"
                  >
                    <option value="09:00 AM">09:00 AM (Pagi)</option>
                    <option value="10:00 AM">10:00 AM (Pagi)</option>
                    <option value="11:30 AM">11:30 AM (Tengah Hari)</option>
                    <option value="02:30 PM">02:30 PM (Petang)</option>
                    <option value="04:30 PM">04:30 PM (Petang)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                  Tajuk / Agenda Follow-Up
                </label>
                <input
                  type="text"
                  value={followUpAgenda}
                  onChange={(e) => setFollowUpAgenda(e.target.value)}
                  placeholder="Contoh: Panggilan Susulan Sebut Harga Aircond BFG"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                  Catatan Tambahan untuk Admin (Peringatan)
                </label>
                <textarea
                  rows={3}
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="Contoh: Pastikan semak bajet RM15,000 dan jadual teknisyen sebelum membuat panggilan..."
                  className="w-full p-3 border border-slate-300 rounded-xl font-semibold bg-white focus:outline-none focus:border-indigo-600"
                ></textarea>
              </div>

              <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200 text-[10.5px] text-indigo-950 font-medium space-y-1">
                <span className="font-bold block flex items-center gap-1 text-indigo-900">
                  <BellRing className="w-3.5 h-3.5 text-indigo-600" />
                  Maklumat Automatik Terhubung:
                </span>
                <p>• ID Permohonan: #{followUpModalLead.id}</p>
                <p>• Talian Telefon: {followUpModalLead.phone} | E-mel: {followUpModalLead.email}</p>
                <p>• Acara peringatan kalendar akan terus dipautkan dengan pautan Google Calendar acuan rasmi.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setFollowUpModalLead(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveFollowUp(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs uppercase rounded-xl transition cursor-pointer"
                >
                  Simpan Sistem Sahaja
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveFollowUp(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4 text-[#D4AF37]" />
                  Simpan & Buka Google Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
