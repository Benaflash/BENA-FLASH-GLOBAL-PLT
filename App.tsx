import { WorkspaceIntegrations } from "./components/WorkspaceIntegrations";
import InventoryManage from "./components/InventoryManage";
import BackupDashboard from "./components/BackupDashboard";
import LiveChatWidget from "./components/LiveChatWidget";
import WelcomeVoiceGreeting from "./components/WelcomeVoiceGreeting";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  initialCompanyInfo,
  initialProjects,
  initialCareers,
  initialBlogs,
  initialLeads,
  initialApplications,
  initialCertifications,
  initialClientLogos,
  initialStaff,
  initialDocuments,
  initialServices,
  initialAircondRates,
  initialTestimonials,
  initialFaqs,
  optWebp,
} from "./data";
import {
  CompanyInfo,
  Project,
  LeadQuote,
  Career,
  Application,
  Blog,
  Certification,
  UserRole,
  ClientLogo,
  StaffMember,
  CorporateDocument,
  ServiceInfo,
  AircondRate,
  Testimonial,
  FAQItem,
  AdminNotification,
  BlogReaderLog,
} from "./types";

// Import Custom Firebase & Dynamic Auth Integrations
import {
  db,
  auth,
  googleProvider,
  handleFirestoreError,
  OperationType,
  setCachedAccessToken,
} from "./lib/firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  RecaptchaVerifier,
  getMultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  collection,
  onSnapshot,
  addDoc,
  orderBy,
  limit,
  setDoc as _setDoc,
  deleteDoc as _deleteDoc,
  updateDoc as _updateDoc,
  getDoc as _getDoc,
  query,
  where,
  getDocs as _getDocs,
} from "firebase/firestore";
const getDocs = async (queryRef: any) => { return _getDocs(queryRef); };

const setDoc = async (docRef: any, data: any, options?: any) => {
  return options ? _setDoc(docRef, data, options) : _setDoc(docRef, data);
};
const updateDoc = async (docRef: any, data: any) => {
  return _updateDoc(docRef, data);
};
const deleteDoc = async (docRef: any) => {
  return _deleteDoc(docRef);
};
const getDoc = async (docRef: any) => {
  return _getDoc(docRef);
};

const cleanForFirestore = <T extends object>(obj: T): T =>
  JSON.parse(JSON.stringify(obj));

// Import custom admin widgets lazily to improve PageSpeed Insights
const OrganizationChart = React.lazy(
  () => import("./components/OrganizationChart"),
);
const AnalyticsDash = React.lazy(() => import("./components/AnalyticsDash"));
const CompanyProfileEdit = React.lazy(
  () => import("./components/CompanyProfileEdit"),
);
const ProjectManage = React.lazy(() => import("./components/ProjectManage"));
const LeadInbox = React.lazy(() => import("./components/LeadInbox"));
const CareerManage = React.lazy(() => import("./components/CareerManage"));
const BlogManage = React.lazy(() => import("./components/BlogManage"));
const FAQManage = React.lazy(() => import("./components/FAQManage"));
const CalendarGrid = React.lazy(() => import("./components/CalendarGrid"));
const CustomerPortal = React.lazy(() => import("./components/CustomerPortal"));
const CertificationManage = React.lazy(
  () => import("./components/CertificationManage"),
);
const QRScannerModal = React.lazy(() => import("./components/QRScannerModal"));
import DocReader from "./components/DocReader";
import CareerApplicationModal from "./components/CareerApplicationModal";
import InstallAppModal from "./components/InstallAppModal";
import FinancialSummary from "./components/FinancialSummary";
import LoyaltyRewardsPortal from "./components/LoyaltyRewardsPortal";
import { ServiceManage } from "./components/ServiceManage";
import { AircondRatesManage } from "./components/AircondRatesManage";
import { CorporateLanding } from "./components/CorporateLanding";
import { Lightbox } from "./components/Lightbox";
import { ServiceCalculator } from "./components/ServiceCalculator";
import TestimonialSection from "./components/TestimonialSection";
import TestimonialManage from "./components/TestimonialManage";
import { HeaderNavigation } from "./components/HeaderNavigation";
import { ProjectMapVisualization } from "./components/ProjectMapVisualization";
import { translations } from "./translations";
import { SheetsIntegrationControl } from "./components/SheetsIntegrationControl";

// Import Lucide Icons
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Briefcase,
  Layers,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Download,
  CheckCircle2,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Settings,
  ChevronDown,
  Building,
  HelpCircle,
  Copy,
  ExternalLink,
  Users,
  ShoppingBag,
  MessageCircle,
  Globe,
  Menu,
  X,
  Calendar, Printer, Share2, CalendarPlus,
  Facebook,
  Instagram,
  Twitter,
  Music,
  Youtube,
  BellRing,
  Smartphone,
  QrCode,
  ChevronUp,
  Sun,
  Moon,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Filter,
} from "lucide-react";

export default function App() {
  // Navigation & Page Tabs
  // Public tabs: "home" | "about" | "services" | "projects" | "certificates" | "blog" | "career" | "downloads" | "contact"
  const [activeTab, setActiveTab] = useState<string>("home");
  const [isPageTransitioning, setIsPageTransitioning] = useState<boolean>(false);
  const [lang, setLang] = useState<"MS" | "EN">("MS");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleTabChange = (tabId: string) => {
    setIsPageTransitioning(true);
    setActiveTab(tabId);
    if (tabId === "admin") {
      setIsAdminMode(true);
    } else {
      setIsAdminMode(false);
    }
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      setIsPageTransitioning(false);
    }, 450);
  };

  // Theme Switcher State (Light / Dark Mode)
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("bfg_theme") as "light" | "dark") || "light"
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("bfg_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // PWA Install & QR Modal State
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // GPS Geolocation & Loyalty Voucher States
  const [siteLocation, setSiteLocation] = useState<string>("");
  const [isGettingGPS, setIsGettingGPS] = useState<boolean>(false);
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string>("");

  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("Penyemak imbas anda tidak menyokong fungsi Geolocation.");
      return;
    }
    setIsGettingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.display_name || `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)} (Pahang)`;
            setSiteLocation(addr);
          } else {
            setSiteLocation(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)} (Kuantan/Pekan, Pahang)`);
          }
        } catch {
          setSiteLocation(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)} (Pahang)`);
        } finally {
          setIsGettingGPS(false);
        }
      },
      (err) => {
        console.error("GPS location error:", err);
        setIsGettingGPS(false);
        alert("Sila beri kebenaran lokasi (Location Permission) pada peranti anda untuk mengesan GPS tapak.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Floating Scroll to Top State
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Admin Mode & Credentials
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState({
    username: "",
    password: "",
    role: UserRole.SUPER_ADMIN,
  });
  const [loggedInRole, setLoggedInRole] = useState<UserRole>(
    UserRole.SUPER_ADMIN,
  );
  const [loginError, setLoginError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Application State
  const [companyInfo, setCompanyInfo] =
    useState<CompanyInfo>(initialCompanyInfo);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [leads, setLeads] = useState<LeadQuote[]>(initialLeads);
  const [careers, setCareers] = useState<Career[]>(initialCareers);
  const [applications, setApplications] =
    useState<Application[]>(initialApplications);
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [blogReaderLogs, setBlogReaderLogs] = useState<BlogReaderLog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [copiedBlogId, setCopiedBlogId] = useState<string | null>(null);

  const logBlogActivity = async (blog: Blog, action: "read" | "share", platform?: string) => {
    if (!blog) return;
    const readerEmail =
      currentUser?.email ||
      customerEmail ||
      (adminUser?.username ? `${adminUser.username}@bfgplt.com` : "") ||
      localStorage.getItem("bfg_customer_email") ||
      "tetamu@bfgplt.com";

    const newLog: Omit<BlogReaderLog, "id"> = {
      blogId: blog.id,
      blogTitle: blog.title,
      readerEmail: readerEmail,
      action: action,
      platform: platform || "Web Browser",
      timestamp: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "blog_reader_logs"), newLog);
    } catch (e) {
      console.warn("Firestore write fallback for blog_reader_logs", e);
    }

    const currentViews = blog.viewsCount || 0;
    const currentShares = blog.sharesCount || 0;
    const updatedFields = {
      viewsCount: action === "read" ? currentViews + 1 : currentViews,
      sharesCount: action === "share" ? currentShares + 1 : currentShares,
    };

    handleEditBlog(blog.id, updatedFields);
  };

  const handleOpenBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    logBlogActivity(blog, "read", "Web Browser Reader");
  };

  const handleShare = (platform: string, blog: Blog, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    logBlogActivity(blog, "share", platform.toUpperCase());

    const shareUrl = `https://www.bfgplt.com/?tab=blog&id=${blog.id}`;
    const shareText = `Jom baca artikel menarik ini dari Bena Flash Global PLT: "${blog.title}"`;
    
    let url = "";
    switch (platform) {
      case "whatsapp":
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl).then(() => {
          setCopiedBlogId(blog.id);
          setTimeout(() => setCopiedBlogId(null), 2000);
        });
        return;
    }
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [documents, setDocuments] = useState<CorporateDocument[]>([]);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [aircondRates, setAircondRates] = useState<AircondRate[]>([]);
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>(initialTestimonials);
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFaqs);
  const [clientLogos, setClientLogos] =
    useState<ClientLogo[]>(initialClientLogos);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Real-time notification states
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [ratingMap, setRatingMap] = useState<Record<string, number>>({});
  const [submittedReviews, setSubmittedReviews] = useState<Record<string, boolean>>({});
  const [activeToast, setActiveToast] = useState<{
    id: string;
    title: string;
    message: string;
    type: string;
  } | null>(null);

  // Multi-Factor Authentication (MFA) States
  const [mfaResolver, setMfaResolver] = useState<any>(null);
  const [mfaVerificationId, setMfaVerificationId] = useState<string>("");
  const [mfaCode, setMfaCode] = useState<string>("");
  const [mfaError, setMfaError] = useState<string>("");
  const [mfaHints, setMfaHints] = useState<any[]>([]);
  const [selectedMfaHint, setSelectedMfaHint] = useState<any>(null);
  const [isSendingMfaCode, setIsSendingMfaCode] = useState<boolean>(false);

  // PERFORMANCE FIX: Replace brittle loadedCount with a simple timeout
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Customer Portal Session States
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("bfg_customer_logged_in") === "true";
  });
  const [customerEmail, setCustomerEmail] = useState<string>(() => {
    return localStorage.getItem("bfg_customer_email") || "";
  });

  // Client Status Checker
  const [bookingDate, setBookingDate] = useState<string>("");
  const [bookingTimeSlot, setBookingTimeSlot] = useState<string>("");

  const [checkerId, setCheckerId] = useState<string>(() => {
    return localStorage.getItem("bfg_last_lead_id") || "";
  });
  const [checkedLeads, setCheckedLeads] = useState<LeadQuote[]>([]);
  const [checkerKawasan, setCheckerKawasan] = useState<string>("");
  const [checkerError, setCheckerError] = useState<string>("");
  const [isChecking, setIsChecking] = useState<boolean>(false);

  
  const handleCetak = (lead: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        `https://www.bfgplt.com/?status_id=${lead.id}&name=${encodeURIComponent(lead.name)}`
      )}`;
      printWindow.document.write(`
        <html>
          <head>
            <title>Salinan Temujanji & Status - ${lead.id}</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #0F172A; background: #fff; }
              .card { border: 2px solid #D4AF37; padding: 25px; border-radius: 12px; max-width: 520px; margin: 0 auto; box-shadow: 0 4px 15px rgba(0,0,0,0.06); }
              .header { text-align: center; border-bottom: 2px solid #0F172A; padding-bottom: 12px; margin-bottom: 18px; }
              .header h2 { color: #0F172A; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
              .header p { color: #D4AF37; font-weight: bold; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase; }
              .row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px; font-size: 13px; }
              .label { font-weight: bold; color: #64748b; font-size: 11px; text-transform: uppercase; }
              .val { font-weight: bold; color: #0f172a; }
              .status { font-weight: bold; background: #0F172A; color: #D4AF37; padding: 3px 10px; border-radius: 20px; font-size: 11px; }
              .qr-box { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0; }
              .qr-box img { width: 120px; height: 120px; border: 1px solid #cbd5e1; padding: 4px; border-radius: 8px; }
              .footer { margin-top: 20px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <h2>BENA FLASH GLOBAL PLT</h2>
                <p>M&E Engineering G2 • Salinan Resit & Temujanji Rasmi</p>
              </div>
              <div class="row"><span class="label">ID Rujukan:</span> <span class="val" style="font-family: monospace;">${lead.id}</span></div>
              <div class="row"><span class="label">Nama Pelanggan:</span> <span class="val">${lead.name}</span></div>
              <div class="row"><span class="label">Sesi Servis:</span> <span class="val">${lead.serviceType}</span></div>
              <div class="row"><span class="label">Pilihan Tarikh:</span> <span class="val">${lead.scheduledDate || "Tidak Terjadual"}</span></div>
              <div class="row"><span class="label">Slot Masa:</span> <span class="val">${lead.scheduledTimeSlot || "N/A"}</span></div>
              <div class="row"><span class="label">Status Semasa:</span> <span class="status">${lead.status === "New" ? "Menunggu Maklumbalas" : lead.status}</span></div>
              ${lead.adminFeedback ? `<div style="margin-top:12px; padding:10px; background:#fffbe8; border:1px solid #fde047; border-radius:8px;"><span class="label" style="color:#a16207;">Nota Jurutera / Admin:</span><p style="margin:4px 0 0 0; font-weight:bold; color:#1e293b; font-size:12px;">${lead.adminFeedback}</p></div>` : ''}
              
              <div class="qr-box">
                <img src="${qrUrl}" alt="Kod QR Tempahan" />
                <p style="font-size:10px; color:#64748b; margin-top:6px; font-weight:bold;">Imbas Kod QR Ini Untuk Verifikasi Digital</p>
              </div>

              <div class="footer">
                Cetakan automatik dari Sistem Temujanji Rasmi Bena Flash Global PLT • bfgplt.com
              </div>
            </div>
            <script>
              window.onload = () => { setTimeout(() => { window.print(); }, 400); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleKongsi = (lead: any) => {
    const statusTxt = lead.status === "New" ? "Menunggu Maklumbalas" : lead.status;
    const text = `Sila semak status permohonan sebut harga BFG saya!\n\nID Rujukan: ${lead.id}\nStatus Semasa: ${statusTxt}\n\nSemak secara langsung di: ${window.location.origin}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddCalendar = (lead: any) => {
    if (!lead.scheduledDate) return;
    
    const [year, month, day] = lead.scheduledDate.split("-");
    if (!year || !month || !day) return;
    
    let hour = 9;
    let min = 0;
    if (lead.scheduledTimeSlot) {
      const match = lead.scheduledTimeSlot.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/);
      if (match) {
        let h = parseInt(match[1]);
        const m = parseInt(match[2]);
        const ampm = match[3] ? match[3].toLowerCase() : null;
        if (ampm === 'pm' && h < 12) h += 12;
        if (ampm === 'am' && h === 12) h = 0;
        hour = h;
        min = m;
      }
    }
    
    const startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, min);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const formatGoogleDate = (d: Date) => {
      return d.toISOString().replace(/-|:|.\d+/g, "");
    };
    
    const dates = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;
    const text = encodeURIComponent(`Temujanji Lawatan Tapak BFG - ${lead.serviceType}`);
    const details = encodeURIComponent(`Sesi lawatan tapak oleh pasukan Bena Flash Global.\n\nID Rujukan: ${lead.id}\nPelanggan: ${lead.name}\nServis: ${lead.serviceType}\n\nSila hubungi BFG untuk sebarang pindaan.`);
    
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
    window.open(calUrl, '_blank');
  };

  const renderStepper = (status: string) => {
    const steps = [
      { label: "Diterima", match: ["New", "Reviewed", "Contacted", "Completed"], currentOf: ["New"] },
      { label: "Semakan", match: ["Reviewed", "Contacted", "Completed"], currentOf: ["Reviewed"] },
      { label: "Lawatan", match: ["Contacted", "Completed"], currentOf: ["Contacted"] },
      { label: "Selesai", match: ["Completed"], currentOf: ["Completed"] }
    ];
    
    return (
      <div className="flex items-center justify-between w-full mt-4 mb-5 relative px-1">
        <div className="absolute left-4 right-4 top-2.5 h-0.5 bg-slate-200 z-0 rounded-full"></div>
        {steps.map((step, idx) => {
          const isActive = step.match.includes(status);
          const isCurrent = step.currentOf.includes(status);
          return (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300 ${isActive ? 'bg-[#0F172A] border-[#0F172A] text-[#D4AF37] shadow-sm scale-110' : 'bg-white border-slate-300 text-slate-300'} ${isCurrent ? 'animate-pulse ring-2 ring-[#D4AF37] ring-offset-1' : ''}`}>
                {isActive ? '✓' : (idx + 1)}
              </div>
              <span className={`text-[8px] font-bold uppercase mt-1.5 text-center leading-tight ${isActive ? 'text-[#0F172A]' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    );
  };

    const handleCheckStatus = async (overrideId?: string) => {
    const targetId = (overrideId || checkerId).trim();
    if (!targetId && !checkerKawasan) {
      setCheckerError("Sila masukkan ID Rujukan / No. Telefon atau pilih kawasan.");
      return;
    }
    setIsChecking(true);
    setCheckerError("");
    setCheckedLeads([]);

    try {
      const cleanTerm = targetId.toLowerCase();
      const cleanDigits = targetId.replace(/[^0-9]/g, "");

      const matchesMap = new Map<string, LeadQuote>();

      // 1. Search in local state (leads already loaded)
      leads.forEach((l) => {
        const normPhone = l.phone.replace(/[^0-9]/g, "");
        const matchId =
          l.id.toLowerCase() === cleanTerm ||
          l.id.toLowerCase() === `lead-${cleanTerm}` ||
          l.id.toLowerCase().endsWith(cleanTerm) ||
          cleanTerm.includes(l.id.toLowerCase());
        const matchPhone =
          cleanDigits.length >= 6 &&
          (normPhone.includes(cleanDigits) || cleanDigits.includes(normPhone));
        const matchEmail = l.email && l.email.toLowerCase() === cleanTerm;
        const matchName = l.name && l.name.toLowerCase().includes(cleanTerm);
        const matchKawasan =
          !checkerKawasan ||
          l.location.toLowerCase().includes(checkerKawasan.toLowerCase());

        if ((matchId || matchPhone || matchEmail || matchName) && matchKawasan) {
          matchesMap.set(l.id, l);
        }
      });

      // 2. Query Firestore directly if online/connected
      if (db) {
        // Direct ID lookup
        const idVariations = [targetId, `lead-${targetId}`, targetId.replace(/^lead-/, "")];
        for (const testId of idVariations) {
          try {
            const docSnap = await getDoc(doc(db, "leads", testId));
            if (docSnap.exists()) {
              const data = docSnap.data() as LeadQuote;
              const matchKawasan =
                !checkerKawasan ||
                data.location.toLowerCase().includes(checkerKawasan.toLowerCase());
              if (matchKawasan) {
                matchesMap.set(docSnap.id, { id: docSnap.id, ...data });
              }
            }
          } catch (e) {
            // safe fallback
          }
        }

        // Phone query in Firestore
        if (targetId) {
          try {
            const leadsRef = collection(db, "leads");
            const qPhone = query(leadsRef, where("phone", "==", targetId));
            const querySnapshot = await getDocs(qPhone);
            querySnapshot.docs.forEach((docSnap) => {
              const data = docSnap.data() as LeadQuote;
              const matchKawasan =
                !checkerKawasan ||
                data.location.toLowerCase().includes(checkerKawasan.toLowerCase());
              if (matchKawasan) {
                matchesMap.set(docSnap.id, { id: docSnap.id, ...data });
              }
            });
          } catch (e) {
            // safe fallback
          }
        }
      }

      const results = Array.from(matchesMap.values());

      if (results.length === 0) {
        setCheckerError(
          "Tiada rekod dijumpai untuk No. Rujukan atau No. Telefon ini. Sila pastikan nombor yang dimasukkan adalah tepat."
        );
      } else {
        setCheckedLeads(results);
        if (results[0]?.id) {
          localStorage.setItem("bfg_last_lead_id", results[0].id);
        }
      }
    } catch (err: any) {
      console.error("Status Search Error:", err);
      setCheckerError("Ralat talian atau carian tidak sah. Sila cuba seketika lagi.");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Simple SEO Path Router
  useEffect(() => {
    const path = window.location.pathname.replace(/^\/|\/$/g, "");
    if (path === "kontraktor-elektrik-kuantan")
      setActiveTab("elektrik-kuantan");
    else if (path === "kontraktor-elektrik-pekan")
      setActiveTab("elektrik-pekan");
    else if (path === "servis-aircond-kuantan") setActiveTab("aircond-kuantan");
    else if (path === "servis-aircond-pekan") setActiveTab("aircond-pekan");
    else if (path === "upgrade-db-box-kuantan") setActiveTab("db-box");
    else if (path === "troubleshoot-blackout-kuantan") setActiveTab("blackout");
    else if (path === "permohonan-meter-tnb-pahang") setActiveTab("meter-tnb");
    else if (path === "hubungi-kami") setActiveTab("contact");
  }, []);

  // Listen for query parameters to auto-select tab on startup
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  // Auto-select shared blog when blogs list finishes loading
  useEffect(() => {
    if (blogs && blogs.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get("tab");
      const idParam = searchParams.get("id");
      if (tabParam === "blog" && idParam) {
        const found = blogs.find(b => b.id === idParam);
        if (found) {
          setSelectedBlog(found);
          setActiveTab("blog");
        }
      }
    }
  }, [blogs]);

  // Sync address bar URL with active blog modal selection
  useEffect(() => {
    if (selectedBlog) {
      const newUrl = `${window.location.origin}${window.location.pathname}?tab=blog&id=${selectedBlog.id}`;
      if (window.location.search !== `?tab=blog&id=${selectedBlog.id}`) {
        window.history.replaceState(null, "", newUrl);
      }
    } else if (activeTab === "blog") {
      const newUrl = `${window.location.origin}${window.location.pathname}?tab=blog`;
      if (window.location.search !== `?tab=blog`) {
        window.history.replaceState(null, "", newUrl);
      }
    }
  }, [selectedBlog, activeTab]);

  // Update SEO Meta
  useEffect(() => {
    let title =
      "Kontraktor Elektrik & Servis Aircond Kuantan, Pekan, Pahang | Bena Flash Global";
    let desc =
      "BENA FLASH GLOBAL PLT - Kontraktor Elektrik dan Aircond No 1 di Kuantan & Pekan Pahang. Pakar pendawaian, M&E, dan servis penghawa dingin berdaftar CIDB Gred G2 & ST.";
    let pageSlug = "";

    switch (activeTab) {
      case "elektrik-kuantan":
        title =
          "Kontraktor Elektrik Kuantan Berdaftar CIDB & ST | Bena Flash Global";
        desc =
          "Pakar perkhidmatan Kontraktor Elektrik di Kuantan untuk rumah dan premis perniagaan. Kami sedia membantu menyelesaikan masalah pendawaian anda dengan mematuhi piawaian Suruhanjaya Tenaga.";
        pageSlug = "kontraktor-elektrik-kuantan";
        break;
      case "elektrik-pekan":
        title = "Kontraktor Elektrik Pekan Berpengalaman | Bena Flash Global";
        desc =
          "Perkhidmatan kontraktor elektrik profesional di Pekan. Pakar dalam membaikpulih litar elektrik dan pemasangan baru untuk kawasan Pekan dan sekitarnya.";
        pageSlug = "kontraktor-elektrik-pekan";
        break;
      case "aircond-kuantan":
        title =
          "Servis Aircond Kuantan: Pasang, Cuci & Chemical Wash | Bena Flash Global";
        desc =
          "Pakar perkhidmatan servis penghawa dingin Kuantan. Menyediakan pemasangan, cuci dan pembaikan yang berkualiti untuk pelanggan kediaman dan komersial.";
        pageSlug = "servis-aircond-kuantan";
        break;
      case "aircond-pekan":
        title =
          "Servis Aircond Pekan untuk Rumah & Komersial | Bena Flash Global";
        desc =
          "Perkhidmatan pemasangan dan penyelenggaraan aircond untuk kediaman komersial di kawasan sekitar Pekan, Pahang.";
        pageSlug = "servis-aircond-pekan";
        break;
      case "db-box":
        title =
          "Upgrade DB Box Kuantan untuk Rumah & Kedai | Bena Flash Global";
        desc =
          "Servis naik taraf DB Box elektrik di Kuantan. Penyelesaian masalah litar pintas dan blackout dengan sistem MSB berprestasi cemerlang.";
        pageSlug = "upgrade-db-box-kuantan";
        break;
      case "blackout":
        title =
          "Troubleshoot Blackout & Litar Pintas Kuantan | Bena Flash Global";
        desc =
          "Troubleshooting masalah elektrik kecemasan. Rawatan masalah litar pintas (blackout) untuk di Kuantan cepat dan selamat.";
        pageSlug = "troubleshoot-blackout-kuantan";
        break;
      case "meter-tnb":
        title = "Permohonan Meter TNB di Kuantan & Pahang | Bena Flash Global";
        desc =
          "Urusan pendawaian baru dan permohonan meter TNB satu fasa / tiga fasa melalui kontraktor ST diluluskan di Kuantan Pahang.";
        pageSlug = "permohonan-meter-tnb-pahang";
        break;
      case "contact":
        title = "Hubungi Kami - Servis Elektrik & Aircond | Bena Flash Global";
        pageSlug = "hubungi-kami";
        break;
      case "home":
        pageSlug = "";
        break;
    }

    if (selectedBlog) {
      title = `${selectedBlog.title} | Bena Flash Global`;
      desc = selectedBlog.snippet || selectedBlog.content.slice(0, 150);
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", desc);
    }

    if (activeTab && activeTab !== "admin" && !isAdminMode) {
      // Soft update URL for HubSpot and standard SEO without full refresh
      const newUrl = pageSlug ? `/${pageSlug}` : "/";
      if (window.location.pathname !== newUrl) {
        window.history.replaceState(null, "", newUrl);
      }
    }
  }, [activeTab, isAdminMode, selectedBlog]);

  // Active sub-item overlays / modals
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [lightboxState, setLightboxState] = useState<{ images: string[], index: number } | null>(null);

  const [activeJobApply, setActiveJobApply] = useState<Career | null>(null);
  const [activeDocReader, setActiveDocReader] = useState<{
    title: string;
    sub: string;
    sections: { title: string; bullets: string[] }[];
    imageUrl?: string;
    pdfUrl?: string;
  } | null>(null);

  // Before-After Slider State (for a nice portfolio interaction)
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // Administrative Section inside Admin Portal
  const [adminActiveSection, setAdminActiveSection] =
    useState<string>("dashboard");

  const APPROVED_ADMIN_EMAILS = [
    "admin@bfgplt.com",
  ];

  const isApprovedEmail = (email: string | null | undefined) => {
    if (!email) return false;
    const lower = email.toLowerCase().trim();
    return lower === "admin@bfgplt.com";
  };

  const getUserRole = async (email: string | null, uid: string): Promise<UserRole | null> => {
    if (!email) return null;
    if (isApprovedEmail(email)) return UserRole.SUPER_ADMIN;
    
    try {
      const docSnap = await getDoc(doc(db, "admins", uid));
      if (docSnap.exists()) {
        return (docSnap.data() as any).role as UserRole;
      }
    } catch (e) {
      console.error("Gagal semak peranan:", e);
    }
    return null;
  };

  // Load state from localStorage on init and establish Firestore Synchronization
  useEffect(() => {
    // 1. Initial Local Storage Fallback Loading
    try {
      const storedCompany = localStorage.getItem("bfg_companyInfo");
      const storedProjects = localStorage.getItem("bfg_projects");
      const storedLeads = localStorage.getItem("bfg_leads");
      const storedCareers = localStorage.getItem("bfg_careers");
      const storedApps = localStorage.getItem("bfg_applications");
      const storedBlogs = localStorage.getItem("bfg_blogs");
      const storedCerts = localStorage.getItem("bfg_certifications");
      const storedLogos = localStorage.getItem("bfg_clientLogos");
      const storedStaff = localStorage.getItem("bfg_staff");
      const storedDocuments = localStorage.getItem("bfg_documents");
      const storedServices = localStorage.getItem("bfg_services");
      const storedAircondRates = localStorage.getItem("bfg_aircondRates");
      const storedTestimonials = localStorage.getItem("bfg_testimonials");
      const storedFaqs = localStorage.getItem("bfg_faqs");

      if (storedCompany) setCompanyInfo(JSON.parse(storedCompany));
      if (storedProjects) setProjects(JSON.parse(storedProjects));
      if (storedLeads) setLeads(JSON.parse(storedLeads));
      if (storedCareers) setCareers(JSON.parse(storedCareers));
      if (storedApps) setApplications(JSON.parse(storedApps));
      if (storedBlogs) setBlogs(JSON.parse(storedBlogs));
      if (storedCerts) setCertifications(JSON.parse(storedCerts));
      else setCertifications(initialCertifications);
      if (storedLogos) setClientLogos(JSON.parse(storedLogos));
      else setClientLogos(initialClientLogos);
      if (storedStaff) setStaff(JSON.parse(storedStaff));
      else setStaff(initialStaff);
      if (storedDocuments) setDocuments(JSON.parse(storedDocuments));
      else setDocuments(initialDocuments);
      if (storedServices) setServices(JSON.parse(storedServices));
      else setServices(initialServices);
      if (storedAircondRates) setAircondRates(JSON.parse(storedAircondRates));
      else setAircondRates(initialAircondRates);
      if (storedTestimonials) setTestimonials(JSON.parse(storedTestimonials));
      else setTestimonials(initialTestimonials);
      if (storedFaqs) setFaqs(JSON.parse(storedFaqs));
      else setFaqs(initialFaqs);
    } catch (e) {
      console.warn(e);
    }

    // 2. Real-Time Firestore Synchronization for Public Tables
    const unsubCompany = onSnapshot(
      doc(db, "company", "bfg"),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as CompanyInfo;
          setCompanyInfo(data);
          saveToLocal("bfg_companyInfo", data);
        } else {
          if (auth.currentUser && isApprovedEmail(auth.currentUser.email)) {
            setDoc(
              doc(db, "company", "bfg"),
              cleanForFirestore(initialCompanyInfo),
            ).catch((err) => console.warn(err));
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "company/bfg");
      },
    );

    const unsubProjects = onSnapshot(
      collection(db, "projects"),
      (snapshot) => {
        const items: Project[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as Project);
        });
        if (items.length > 0) {
          setProjects(items);
          saveToLocal("bfg_projects", items);
        } else {
          setProjects(initialProjects);
          if (auth.currentUser && isApprovedEmail(auth.currentUser.email)) {
            initialProjects.forEach((p) => {
              setDoc(doc(db, "projects", p.id), cleanForFirestore(p)).catch(
                (err) => console.warn(err),
              );
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "projects");
      },
    );

    const unsubCareers = onSnapshot(
      collection(db, "careers"),
      (snapshot) => {
        const items: Career[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as Career);
        });
        if (items.length > 0) {
          setCareers(items);
          saveToLocal("bfg_careers", items);
        } else {
          setCareers(initialCareers);
          if (auth.currentUser && isApprovedEmail(auth.currentUser.email)) {
            initialCareers.forEach((c) => {
              setDoc(doc(db, "careers", c.id), cleanForFirestore(c)).catch(
                (err) => console.warn(err),
              );
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "careers");
      },
    );

    const unsubBlogs = onSnapshot(
      collection(db, "blogs"),
      (snapshot) => {
        const items: Blog[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as Blog);
        });
        if (items.length > 0) {
          setBlogs(items);
          saveToLocal("bfg_blogs", items);
        } else {
          setBlogs(initialBlogs);
          if (auth.currentUser && isApprovedEmail(auth.currentUser.email)) {
            initialBlogs.forEach((b) => {
              setDoc(doc(db, "blogs", b.id), cleanForFirestore(b)).catch(
                (err) => console.warn(err),
              );
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "blogs");
      },
    );

    const unsubBlogLogs = onSnapshot(
      query(collection(db, "blog_reader_logs"), orderBy("timestamp", "desc"), limit(200)),
      (snapshot) => {
        const items: BlogReaderLog[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as BlogReaderLog);
        });
        setBlogReaderLogs(items);
        saveToLocal("bfg_blog_reader_logs", items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "blog_reader_logs");
      }
    );

    const unsubCerts = onSnapshot(
      collection(db, "certifications"),
      (snapshot) => {
        const items: Certification[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as Certification);
        });
        if (items.length > 0) {
          setCertifications(items);
          saveToLocal("bfg_certifications", items);
        } else {
          setCertifications(initialCertifications);
          if (auth.currentUser && isApprovedEmail(auth.currentUser.email)) {
            initialCertifications.forEach((c) => {
              setDoc(
                doc(db, "certifications", c.id),
                cleanForFirestore(c),
              ).catch((err) => console.warn(err));
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "certifications");
      },
    );

    const unsubLogos = onSnapshot(
      collection(db, "clientLogos"),
      (snapshot) => {
        const items: ClientLogo[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as ClientLogo);
        });
        if (items.length > 0) {
          setClientLogos(items);
          saveToLocal("bfg_clientLogos", items);
        } else {
          setClientLogos(initialClientLogos);
          if (auth.currentUser && isApprovedEmail(auth.currentUser.email)) {
            initialClientLogos.forEach((logo) => {
              setDoc(
                doc(db, "clientLogos", logo.id),
                cleanForFirestore(logo),
              ).catch((err) => console.warn(err));
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "clientLogos");
      },
    );

    const unsubStaff = onSnapshot(
      collection(db, "staff"),
      (snapshot) => {
        const items: StaffMember[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as StaffMember);
        });

        // Ensure all initialStaff are present
        if (auth.currentUser && isApprovedEmail(auth.currentUser.email)) {
          initialStaff.forEach((s) => {
            if (!items.find((i) => i.id === s.id)) {
              setDoc(doc(db, "staff", s.id), cleanForFirestore(s)).catch(
                (err) => console.warn(err),
              );
            }
          });
        }

        if (items.length > 0) {
          setStaff(items);
          saveToLocal("bfg_staff", items);
        } else {
          setStaff(initialStaff);
          if (auth.currentUser && isApprovedEmail(auth.currentUser.email)) {
            initialStaff.forEach((m) => {
              setDoc(doc(db, "staff", m.id), cleanForFirestore(m)).catch(
                (err) => console.warn(err),
              );
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "staff");
      },
    );

    const unsubDocuments = onSnapshot(
      collection(db, "documents"),
      (snapshot) => {
        const items: CorporateDocument[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as CorporateDocument);
        });
        if (items.length > 0) {
          setDocuments(items);
          saveToLocal("bfg_documents", items);
        } else {
          setDocuments(initialDocuments);
          if (auth.currentUser && isApprovedEmail(auth.currentUser.email)) {
            initialDocuments.forEach((d) => {
              setDoc(doc(db, "documents", d.id), cleanForFirestore(d)).catch(
                (err) => console.warn(err),
              );
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "documents");
      },
    );

    const unsubServices = onSnapshot(
      collection(db, "services"),
      (snapshot) => {
        const items: ServiceInfo[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as ServiceInfo);
        });
        if (items.length > 0) {
          setServices(items);
          saveToLocal("bfg_services", items);
        } else {
          setServices(initialServices);
          if (auth.currentUser && isApprovedEmail(auth.currentUser.email)) {
            initialServices.forEach((s) => {
              setDoc(doc(db, "services", s.id), cleanForFirestore(s)).catch(
                (err) => console.warn(err),
              );
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "services");
      },
    );

    const unsubAircondRates = onSnapshot(
      collection(db, "calculatorRates"),
      (snapshot) => {
        const items: AircondRate[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as AircondRate);
        });
        const sorted = items.sort((a, b) => (a.order || 0) - (b.order || 0));
        if (sorted.length > 0) {
          setAircondRates(sorted);
          saveToLocal("bfg_aircondRates", sorted);
        } else {
          setAircondRates(initialAircondRates);
          if (auth.currentUser && isApprovedEmail(auth.currentUser.email)) {
            initialAircondRates.forEach((r) => {
              setDoc(
                doc(db, "calculatorRates", r.id),
                cleanForFirestore(r),
              ).catch((err) => console.warn("Ralat seed calculatorRates", err));
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "calculatorRates");
      },
    );

    // 3. (REMOVED) Firebase Auth Listener is disabled as per requirement to use static username/password
    const unsubTestimonials = onSnapshot(
      collection(db, "testimonials"),
      (snapshot) => {
        const items: Testimonial[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as Testimonial);
        });
        if (items.length > 0) {
          // Sort stably by ID to completely prevent shuffling during updates
          items.sort((a, b) => a.id.localeCompare(b.id));
          setTestimonials(items);
          saveToLocal("bfg_testimonials", items);
        } else {
          setTestimonials(initialTestimonials);
          if (auth.currentUser && isApprovedEmail(auth.currentUser.email)) {
            initialTestimonials.forEach((t) => {
              setDoc(doc(db, "testimonials", t.id), cleanForFirestore(t)).catch(
                (err) => console.warn("Ralat seed testimonial", err),
              );
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "testimonials");
      },
    );

    const unsubFaqs = onSnapshot(
      collection(db, "faqs"),
      (snapshot) => {
        const items: FAQItem[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as FAQItem);
        });
        if (items.length > 0) {
          setFaqs(items);
          saveToLocal("bfg_faqs", items);
        } else {
          setFaqs(initialFaqs);
          if (auth.currentUser && isApprovedEmail(auth.currentUser.email)) {
            initialFaqs.forEach((f) => {
              setDoc(doc(db, "faqs", f.id), cleanForFirestore(f)).catch((err) =>
                console.warn("Ralat seed faqs", err),
              );
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "faqs");
      },
    );

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (
        user &&
        user.email === "admin@bfgplt.com" &&
        localStorage.getItem("bfg_admin_logged_in") === "true"
      ) {
        setIsLoggedIn(true);
        setIsAdminMode(true);
        setLoggedInRole(UserRole.SUPER_ADMIN);
      }
    });

    return () => {
      unsubCompany();
      unsubProjects();
      unsubCareers();
      unsubBlogs();
      unsubBlogLogs();
      unsubCerts();
      unsubLogos();
      unsubStaff();
      unsubDocuments();
      unsubServices();
      unsubAircondRates();
      unsubTestimonials();
      unsubFaqs();
      unsubAuth();
    };
  }, []);

  // Admin-only synchronization
  useEffect(() => {
    let unsubLeads: () => void;
    let unsubApps: () => void;
    let unsubNotifs: () => void;
    let unsubLogs: () => void;

    if (isLoggedIn) {
      // Request notification permission for admin
      if (isApprovedEmail(currentUser?.email)) {
        if ("Notification" in window && Notification.permission === "default") {
          Notification.requestPermission();
        }
      }

      // Leads subscription
      const leadsCol = collection(db, "leads");
      unsubLeads = onSnapshot(
        leadsCol,
        (snapshot) => {
          const items: LeadQuote[] = [];
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as LeadQuote);
          });
          setLeads(items);
          saveToLocal("bfg_leads", items);
        },
        (err) => {
          if (err.code === "permission-denied") {
            console.warn(
              "Leads access denied: User not authorized to view leads.",
            );
            if (unsubLeads) unsubLeads();
          } else {
            console.error("Leads subscription error:", err);
          }
        },
      );

      // Applications subscription
      const appsCol = collection(db, "applications");
      unsubApps = onSnapshot(
        appsCol,
        (snapshot) => {
          const items: Application[] = [];
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as Application);
          });
          setApplications(items);
          saveToLocal("bfg_applications", items);
        },
        (err) => {
          if (err.code === "permission-denied") {
            console.warn(
              "Applications access denied: User not authorized to view applications.",
            );
            if (unsubApps) unsubApps();
          } else {
            console.error("Applications subscription error:", err);
          }
        },
      );

      // Activity logs subscription
      const logsCol = collection(db, "activity_logs");
      unsubLogs = onSnapshot(
        logsCol,
        (snapshot) => {
          const items: any[] = [];
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });
          items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
          setActivityLogs(items);
        },
        (err) => {
          if (err.code === "permission-denied") {
            console.warn("Activity logs access denied.");
            if (unsubLogs) unsubLogs();
          } else {
            console.error("Activity logs subscription error:", err);
          }
        }
      );

      // Notifications subscription
      const notifsCol = collection(db, "notifications");
      unsubNotifs = onSnapshot(
        notifsCol,
        (snapshot) => {
          const items: AdminNotification[] = [];
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as AdminNotification);
          });
          // Newest first
          items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

          setNotifications((prev) => {
            // Trigger toast modal only for new notifications that weren't in prev state
            if (prev.length > 0 && items.length > prev.length) {
              const prevIds = new Set(prev.map((n) => n.id));
              const fresh = items.find((n) => !prevIds.has(n.id) && !n.read);
              if (fresh) {
                // Browser Push Notification
                if (
                  "Notification" in window &&
                  Notification.permission === "granted"
                ) {
                  new Notification("Notifikasi BFG Baru", {
                    body:
                      fresh.title || "Terdapat borang baru dihantar pelanggan.",
                    icon: "https://i.ibb.co/6c1Xgxr4/BENA.png",
                  });
                }

                // Play notification sound
                try {
                  const audioCtx = new (
                    window.AudioContext || (window as any).webkitAudioContext
                  )();
                  const osc = audioCtx.createOscillator();
                  const gain = audioCtx.createGain();
                  osc.type = "sine";
                  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
                  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(
                    0.005,
                    audioCtx.currentTime + 0.35,
                  );
                  osc.connect(gain);
                  gain.connect(audioCtx.destination);
                  osc.start();
                  osc.stop(audioCtx.currentTime + 0.35);
                } catch (audioErr) {
                  console.log("Audio contextual trigger active", audioErr);
                }

                // Activate floating toast popup
                setActiveToast({
                  id: fresh.id,
                  title: fresh.title,
                  message: fresh.message,
                  type: fresh.type,
                });
              }
            }
            return items;
          });
        },
        (err) => {
          console.error("Ralat pendaftaran notifikasi:", err);
        },
      );
    } else {
      // Clean clear sensitive data when signed out - guarantees deleted info cannot persist
      setLeads([]);
      setApplications([]);
      setNotifications([]);
      setActivityLogs([]);
      localStorage.removeItem("bfg_leads");
      localStorage.removeItem("bfg_applications");
    }

    return () => {
      if (unsubLeads) unsubLeads();
      if (unsubApps) unsubApps();
      if (unsubNotifs) unsubNotifs();
      if (unsubLogs) unsubLogs();
    };
  }, [isLoggedIn, currentUser]);

  // Save values to localStorage on state changes
  const saveToLocal = (key: string, data: any) => {
    try {
      let dataToSave = data;
      // Strip heavy base64 files from applications to prevent quota exceeded
      if (key === "bfg_applications" && Array.isArray(data)) {
        dataToSave = data.map((app) => ({
          ...app,
          resumeUrl: app.resumeUrl
            ? "[Base64 Data Removed from Cache]"
            : undefined,
          certificatesUrl: app.certificatesUrl
            ? "[Base64 Data Removed from Cache]"
            : undefined,
          othersUrl: app.othersUrl
            ? "[Base64 Data Removed from Cache]"
            : undefined,
        }));
      }
      localStorage.setItem(key, JSON.stringify(dataToSave));
    } catch (e) {
      console.error(`Gagal menyimpan ${key} ke storan tempatan.`, e);
    }
  };

  const handleSaveCertifications = async (updatedCerts: Certification[]) => {
    setCertifications(updatedCerts);
    saveToLocal("bfg_certifications", updatedCerts);

    try {
      for (const cert of updatedCerts) {
        await setDoc(
          doc(db, "certifications", cert.id),
          cleanForFirestore(cert),
        );
      }
    } catch (e) {
      console.error("Gagal menyelaras sijil ke Firestore", e);
    }
  };

  const handleSaveClientLogos = async (updatedLogos: ClientLogo[]) => {
    // Cari logo yang dipadam
    const currentIds = updatedLogos.map((l) => l.id);
    const toDelete = clientLogos.filter((l) => !currentIds.includes(l.id));

    setClientLogos(updatedLogos);
    saveToLocal("bfg_clientLogos", updatedLogos);

    try {
      if (auth.currentUser) {
        for (const logo of toDelete) {
          await deleteDoc(doc(db, "clientLogos", logo.id));
        }
        for (const logo of updatedLogos) {
          await setDoc(
            doc(db, "clientLogos", logo.id),
            cleanForFirestore(logo),
          );
        }
      }
    } catch (e) {
      console.error("Gagal menyelaras logo ke Firestore", e);
    }
  };

  const handleSaveStaff = async (updatedStaff: StaffMember[]) => {
    // Cari staf yang dipadam
    const currentIds = updatedStaff.map((s) => s.id);
    const toDelete = staff.filter((s) => !currentIds.includes(s.id));

    setStaff(updatedStaff);
    saveToLocal("bfg_staff", updatedStaff);

    try {
      if (auth.currentUser) {
        for (const m of toDelete) {
          await deleteDoc(doc(db, "staff", m.id));
        }
        for (const m of updatedStaff) {
          await setDoc(doc(db, "staff", m.id), cleanForFirestore(m));
        }
      }
    } catch (e) {
      console.error("Gagal menyelaras staff ke Firestore", e);
    }
  };

  // Handle addition & changes
  const handleSaveCompanyInfo = async (updated: CompanyInfo) => {
    setCompanyInfo(updated);
    saveToLocal("bfg_companyInfo", updated);

    // Primary: Sync to Apps Script

    try {
      await setDoc(doc(db, "company", "bfg"), cleanForFirestore(updated));
    } catch (e) {
      console.error("Gagal menyimpan info syarikat ke Firestore", e);

      alert("Ralat kritikal: Gagal mengemaskini data syarikat.");
    }
  };

  const handleAddProject = async (newProj: Omit<Project, "id">) => {
    const proj: Project = { ...newProj, id: `proj-${Date.now()}` };
    const updated = [proj, ...projects];
    setProjects(updated);
    saveToLocal("bfg_projects", updated);

    // Primary: Sync to Apps Script

    try {
      await setDoc(doc(db, "projects", proj.id), cleanForFirestore(proj));
    } catch (e) {
      console.error("Gagal menambah projek ke Firestore", e);
    }
  };

  const handleEditProject = async (id: string, updates: Partial<Project>) => {
    const updated = projects.map((p) =>
      p.id === id ? { ...p, ...updates } : p,
    );
    setProjects(updated);
    saveToLocal("bfg_projects", updated);

    try {
      await updateDoc(doc(db, "projects", id), cleanForFirestore(updates));
    } catch (e) {
      console.warn("Firestore tidak tersedia", e);
    }
  };

  const handleDeleteProject = async (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    saveToLocal("bfg_projects", updated);

    // Primary: Sync to Apps Script

    try {
      await deleteDoc(doc(db, "projects", id));
    } catch (e) {
      console.error("Gagal memadam projek dari Firestore", e);
    }
  };

  const sendCustomerEmail = async (
    lead: LeadQuote,
    adminFeedback: string,
    nextStatus: string,
  ) => {
    if (!lead.email) return;

    try {
      const subject = `[Bena Flash Global] Maklum Balas Untuk Permohonan: ${lead.id}`;
      const htmlContent = `
<div style="font-family:sans-serif; max-width:600px; border:1px solid #e2e8f0; border-radius:12px; padding:24px; color:#1e293b;">
  <h2 style="color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:12px; margin-top:0;">Kemaskini Status Pemohonan</h2>
  <p>Salam sejahtera ${lead.name},</p>
  <p>Terima kasih kerana menghubungi <strong>Bena Flash Global PLT</strong>. Berikut adalah maklumat terkini berkenaan permohonan anda (<strong>${lead.id}</strong>):</p>
  <table style="width:100%; border-collapse:collapse; margin:20px 0;">
    <tr><td style="padding:8px 0; border-bottom:1px solid #f1f5f9; font-weight:bold; width:150px;">Status Semasa:</td><td style="border-bottom:1px solid #f1f5f9;">${nextStatus}</td></tr>
    <tr><td style="padding:8px 0; font-weight:bold; vertical-align:top;">Maklum Balas Admin:</td><td>${adminFeedback || "Tiada maklum balas tambahan buat masa ini."}</td></tr>
  </table>
  <p>Jika anda mempunyai sebarang persoalan tambahan, anda boleh terus membalas e-mel ini atau menghubungi pihak pentadbiran kami.</p>
  <div style="background:#f8fafc; padding:12px; border-radius:8px; font-size:12px; color:#64748b; text-align:center; margin-top:16px;">
    Bena Flash Global PLT | Pakar Kejuruteraan Elektrik & Mekanikal
  </div>
</div>`;

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html: htmlContent, to: lead.email }),
      });

      if (res.ok) {
        console.log(
          `Notifikasi e-mel berjaya dihantar ke pelanggan: ${lead.email}`,
        );
      } else {
        console.error("Gagal menghantar e-mel pelanggan.");
      }
    } catch (e) {
      console.error("Ralat memicu notifikasi e-mel pelanggan:", e);
    }
  };

  const sendGmailNotification = async (lead: LeadQuote) => {
    try {
      const subject = `[BFG NOTIFIKASI] Sebut Harga Baru Daripada ${lead.name}`;
      const htmlContent = `
<div style="font-family:sans-serif; max-width:600px; border:1px solid #e2e8f0; border-radius:12px; padding:24px; color:#1e293b;">
  <h2 style="color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:12px; margin-top:0;">Maklum Balas & Sebut Harga Baru</h2>
  <p>Satu maklum balas pelanggan baru telah masuk secara luar talian/dalam talian bagi syarikat <strong>Bena Flash Global PLT</strong>.</p>
  <table style="width:100%; border-collapse:collapse; margin:20px 0;">
    <tr><td style="padding:8px 0; font-weight:bold; width:150px;">Nama Pengirim:</td><td>${lead.name}</td></tr>
    <tr><td style="padding:8px 0; font-weight:bold;">Syarikat:</td><td>${lead.companyName || "Persendirian"}</td></tr>
    <tr><td style="padding:8px 0; font-weight:bold;">No Telefon:</td><td>${lead.phone}</td></tr>
    <tr><td style="padding:8px 0; font-weight:bold;">E-mel:</td><td>${lead.email}</td></tr>
    <tr><td style="padding:8px 0; font-weight:bold;">Jenis Perkhidmatan:</td><td>${lead.serviceType}</td></tr>
    <tr><td style="padding:8px 0; font-weight:bold;">Lokasi Projek:</td><td>${lead.location}</td></tr>
    <tr><td style="padding:8px 0; font-weight:bold;">Bajet Bersasar:</td><td>${lead.budget || "TIDAK DINYATAKAN"}</td></tr>
    <tr><td style="padding:8px 0; font-weight:bold; vertical-align:top;">Mesej / Deskripsi:</td><td>${lead.message}</td></tr>
  </table>
  <div style="background:#f8fafc; padding:12px; border-radius:8px; font-size:12px; color:#64748b; text-align:center;">
    Notifikasi ini dijana secara automatik menerusi integrasi SMTP. Sila layari Portal Pentadbir BFG untuk memproses data.
  </div>
</div>`;

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html: htmlContent }),
      });

      if (res.ok) {
        console.log("Notifikasi e-mel berjaya dihantar ke admin@bfgplt.com!");
      } else {
        console.error("Gagal menghantar notifikasi e-mel.");
      }
    } catch (e) {
      console.error("Ralat ketika memicu notifikasi e-mel:", e);
    }
  };


  const sendCustomerBookingEmail = async (lead: LeadQuote) => {
    try {
      const subject = `Pengesahan Tempahan BFG PLT - Ruj: ${lead.id}`;
      const htmlContent = `
<div style="font-family:sans-serif; max-width:600px; border:1px solid #e2e8f0; border-radius:12px; padding:24px; color:#1e293b;">
  <h2 style="color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:12px; margin-top:0;">Terima Kasih atas Tempahan Anda</h2>
  <p>Hai ${lead.name},</p>
  <p>Tempahan atau permohonan sebut harga anda telah berjaya diterima oleh pihak Bena Flash Global PLT.</p>
  <div style="background:#f8fafc; padding:16px; border-radius:8px; margin:20px 0; border: 1px dashed #cbd5e1;">
    <p style="margin: 0; font-size: 14px;"><strong>No. Rujukan Booking Anda:</strong></p>
    <h3 style="margin: 5px 0 0 0; color: #D4AF37; font-size: 24px; letter-spacing: 1px;">${lead.id}</h3>
  </div>
  <p>Anda boleh menggunakan No. Rujukan ini untuk menyemak status tempahan anda di portal rasmi kami pada bila-bila masa.</p>
  <p>Pasukan teknikal kami akan menyemak butiran anda dan menghubungi anda sebentar lagi.</p>
  <br/>
  <p>Yang Benar,<br/><strong>Pasukan BFG PLT</strong></p>
</div>`;

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: lead.email, subject, html: htmlContent }),
      });
      if (res.ok) {
        console.log("E-mel pengesahan berjaya dihantar kepada pelanggan!");
      } else {
        console.error("Gagal menghantar e-mel pelanggan.");
      }
    } catch (e) {
      console.error("Ralat e-mel pelanggan:", e);
    }
  };

  const sendGmailApplicationNotification = async (app: Application) => {
    try {
      const subject = `[BFG NOTIFIKASI] Permohonan Jawatan Baru: ${app.careerTitle} - ${app.name}`;
      const htmlContent = `
<div style="font-family:sans-serif; max-width:600px; border:1px solid #e2e8f0; border-radius:12px; padding:24px; color:#1e293b;">
  <h2 style="color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:12px; margin-top:0;">Permohonan Jawatan Baru Diterima</h2>
  <p>Terdapat satu permohonan baru untuk menyertai keluarga <strong>Bena Flash Global PLT</strong>.</p>
  <table style="width:100%; border-collapse:collapse; margin:20px 0;">
    <tr><td style="padding:8px 0; font-weight:bold; width:150px;">Nama Calon:</td><td>${app.name}</td></tr>
    <tr><td style="padding:8px 0; font-weight:bold;">Jawatan Dimohon:</td><td>${app.careerTitle}</td></tr>
    <tr><td style="padding:8px 0; font-weight:bold;">No Telefon:</td><td>${app.phone}</td></tr>
    <tr><td style="padding:8px 0; font-weight:bold;">E-mel:</td><td>${app.email}</td></tr>
    <tr><td style="padding:8px 0; font-weight:bold; vertical-align:top;">Pengalaman & Kekompetenan:</td><td>${app.experienceSummary}</td></tr>
    <tr><td style="padding:8px 0; font-weight:bold;">Resume:</td><td>${app.resumeName ? app.resumeName + " (Dilampirkan dalam portal)" : "Tiada"}</td></tr>
    <tr><td style="padding:8px 0; font-weight:bold;">Sijil Sokongan:</td><td>${app.certificatesName ? app.certificatesName + " (Dilampirkan dalam portal)" : "Tiada"}</td></tr>
    <tr><td style="padding:8px 0; font-weight:bold;">Dokumen Lain:</td><td>${app.othersName ? app.othersName + " (Dilampirkan dalam portal)" : "Tiada"}</td></tr>
  </table>
  <div style="background:#f8fafc; padding:12px; border-radius:8px; font-size:12px; color:#64748b; text-align:center;">
    Maklumat lanjut dan muat turun dokumen boleh dibuat menerusi Dashboard Portal Pentadbir BFG PLT.
  </div>
</div>`;

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html: htmlContent }),
      });

      if (res.ok) {
        console.log("Notifikasi e-mel kerjaya berjaya dihantar ke admin!");
      }
    } catch (e) {
      console.error("Ralat ketika memicu notifikasi e-mel kerjaya:", e);
    }
  };

  const handleAddQuoteRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const data = new FormData(formEl);
    const schedDate = (data.get("scheduledDate") as string) || "";
    const schedTime = (data.get("scheduledTimeSlot") as string) || "";

    // CUSTOM UNIQUE REFERENCE ID BASED ON BOOKING OR QUOTE
    const random4 = Math.floor(1000 + Math.random() * 9000).toString();
    const prefix = schedDate ? "BFG-BOOK-" : "BFG-QUOT-";
    const newLeadId = `${prefix}${random4}`;

    let attachmentUrl = "";
    let attachmentName = "";
    const fileFile = data.get("attachment") as File | null;

    if (fileFile && fileFile.size > 0) {
      if (fileFile.size > 800 * 1024) {
        // 800KB restriction for Firestore limits
        alert(
          "Saiz lampiran terlalu besar (Maksimum 800KB). Sila kecilkan fail anda.",
        );
        return;
      }
      attachmentName = fileFile.name;
      const reader = new FileReader();
      const readPromise = new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
      });
      reader.readAsDataURL(fileFile);
      attachmentUrl = await readPromise;
    }

    const newLead: LeadQuote = {
      id: newLeadId,
      date: new Date().toLocaleDateString("ms-MY"),
      name: data.get("name") as string,
      companyName: data.get("company") as string,
      phone: data.get("phone") as string,
      email: data.get("email") as string,
      serviceType: data.get("serviceType") as string,
      location: data.get("location") as string,
      budget: data.get("budget") as string,
      message: data.get("message") as string,
      status: "New",
      scheduledDate: schedDate,
      scheduledTimeSlot: schedTime,
      attachmentUrl: attachmentUrl || undefined,
      attachmentName: attachmentName || undefined,
    };

    const updated = [newLead, ...leads];
    setLeads(updated);
    saveToLocal("bfg_leads", updated);

    // Primary: Google Sheet

    // Dynamic Real-time Gmail Alert if Oauth Token present
    sendGmailNotification(newLead);
    sendCustomerBookingEmail(newLead);

    // Telegram Admin Notification
    try {
      fetch("/api/telegram-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaPelanggan: newLead.name,
          jenisKemaskini: `Permohonan Tempahan Baru: ${newLead.serviceType} (Ruj: ${newLead.id})`,
        }),
      });
    } catch (e) {
      console.warn("Gagal menghantar Telegram", e);
    }

    try {
      await setDoc(doc(db, "leads", newLead.id), cleanForFirestore(newLead));

      // Real-time direct Google Calendar sync if scheduled date is selected
      if (schedDate) {
        try {
          const oauthDoc = await getDoc(doc(db, "config", "admin_oauth"));
          if (oauthDoc.exists()) {
            const oauthData = oauthDoc.data();
            const adminToken = (oauthData as any)?.accessToken;
            if (adminToken) {
              let startHour = "10:00:00";
              let endHour = "11:00:00";
              const slot = (schedTime || "").toLowerCase();
              if (slot.includes("pagi") || slot.includes("morning")) {
                startHour = "09:00:00";
                endHour = "12:00:00";
              } else if (slot.includes("tengahari") || slot.includes("noon")) {
                startHour = "12:00:00";
                endHour = "15:00:00";
              } else if (
                slot.includes("petang") ||
                slot.includes("afternoon") ||
                slot.includes("evening")
              ) {
                startHour = "15:00:00";
                endHour = "18:00:00";
              }

              const eventPayload = {
                summary: `Tempahan Baru BFG: ${newLead.serviceType} - ${newLead.name}`,
                description: `ID Rujukan Tempahan: ${newLead.id}\nNama Pelanggan: ${newLead.name}\nTelefon: ${newLead.phone}\nE-mel: ${newLead.email}\nLokasi: ${newLead.location || "Pahang"}\nServis Diminta: ${newLead.serviceType}\nSlot Masa: ${schedTime || "Tidak ditetapkan"}\nBajet: RM ${newLead.budget || "Sebut Harga"}\nMesej: ${newLead.message || "-"}`,
                start: {
                  dateTime: `${schedDate}T${startHour}`,
                  timeZone: "Asia/Kuala_Lumpur",
                },
                end: {
                  dateTime: `${schedDate}T${endHour}`,
                  timeZone: "Asia/Kuala_Lumpur",
                },
              };

              const calRes = await fetch(
                "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${adminToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(eventPayload),
                },
              );
              if (calRes.ok) {
                console.log(
                  "Successfully created Google Calendar event on admin calendar.",
                );
              } else {
                console.warn(
                  "Google Calendar API response error:",
                  await calRes.text(),
                );
              }
            }
          }
        } catch (calErr) {
          console.warn("Failed to synchronize with Google Calendar:", calErr);
        }
      }

      // Trigger standard instant notifications inside system for popup & alert
      const notificationId = `notif-${Date.now()}`;
      const schedMsg = schedDate
        ? ` (Pilihan Tarikh: ${schedDate}, Slot Masa: ${schedTime})`
        : "";
      const newNotif = {
        id: notificationId,
        timestamp: new Date().toISOString(),
        type: "booking",
        title: "Booking / Permohonan Baru",
        message: `Pelanggan ${newLead.name} telah menghantar booking servis "${newLead.serviceType}"${schedMsg}.`,
        read: false,
        senderName: newLead.name,
        senderEmail: newLead.email,
      };
      await setDoc(doc(db, "notifications", notificationId), newNotif);
    } catch (err) {
      console.error("Gagal menambah sebut harga ke Firestore", err);

      alert("Ralat kritikal: Gagal menghantar permohonan sebut harga. Detail: " + err.message);
    }

    // Cache the submitted ID for immediate status checking convenience
    localStorage.setItem("bfg_last_lead_id", newLead.id);
    setCheckerId(newLead.id);
    setBookingDate("");
    setBookingTimeSlot("");

    // Auto-fetch to populate the card instantly
    handleCheckStatus(newLead.id);

    setSubmittedQuoteConfirmation(newLead);
    setActiveToast({
      id: `toast-${Date.now()}`,
      title: "Permohonan Sebut Harga Berjaya Dihantar!",
      message: `ID Rujukan: ${newLead.id} - Salinan telah direkodkan. Pasukan BFG akan menghubungi anda dalam masa 24 jam.`,
      type: "lead",
    });
    formEl.reset();
  };

  const handleLeadStatusChange = async (
    id: string,
    nextStatus: LeadQuote["status"],
  ) => {
    const prevStatus = leads.find((L) => L.id === id)?.status || "New";
    let leadToUpdate: LeadQuote | undefined;
    const updated = leads.map((L) => {
      if (L.id === id) {
        leadToUpdate = { ...L, status: nextStatus, updatedAt: new Date().toISOString() };
        return leadToUpdate;
      }
      return L;
    });
    setLeads(updated);
    saveToLocal("bfg_leads", updated);

    try {
      await updateDoc(doc(db, "leads", id), { status: nextStatus, updatedAt: new Date().toISOString() });
      
      // Activity Log entry
      const logId = `log-${Date.now()}`;
      await setDoc(doc(db, "activity_logs", logId), {
        id: logId,
        timestamp: new Date().toISOString(),
        adminUsername: adminUser.username || currentUser?.email || "Admin",
        adminRole: loggedInRole || "SUPER_ADMIN",
        action: `Mengubah status tempahan daripada "${prevStatus}" kepada "${nextStatus}"`,
        bookingId: id,
        oldStatus: prevStatus,
        newStatus: nextStatus,
      });

      if (leadToUpdate) {
        sendCustomerEmail(
          leadToUpdate,
          leadToUpdate.adminFeedback || "",
          nextStatus,
        );
      }
    } catch (e) {
      console.error("Gagal mengemaskini status di Firestore", e);
    }
  };

  
  const handleUpdateLeadField = async (id: string, field: string, value: any) => {
    let leadToUpdate: any = undefined;
    const updated = leads.map((L) => {
      if (L.id === id) {
        leadToUpdate = { ...L, [field]: value, updatedAt: new Date().toISOString() };
        return leadToUpdate;
      }
      return L;
    });
    setLeads(updated as any);
    saveToLocal("bfg_leads", updated);

    try {
      if (db) {
        await updateDoc(doc(db, "leads", id), { [field]: value, updatedAt: new Date().toISOString() });
      }
    } catch (e) {
      console.error(`Gagal mengemaskini ${field} di Firestore`, e);
    }
  };

  const handleLeadFeedbackChange = async (id: string, feedback: string) => {
    let leadToUpdate: LeadQuote | undefined;
    const updated = leads.map((L) => {
      if (L.id === id) {
        leadToUpdate = { ...L, adminFeedback: feedback, updatedAt: new Date().toISOString() };
        return leadToUpdate;
      }
      return L;
    });
    setLeads(updated);
    saveToLocal("bfg_leads", updated);

    try {
      await updateDoc(doc(db, "leads", id), { adminFeedback: feedback, updatedAt: new Date().toISOString() });
      
      // Activity Log entry
      const logId = `log-${Date.now()}-${Math.floor(Math.random() * 100)}`;
      await setDoc(doc(db, "activity_logs", logId), {
        id: logId,
        timestamp: new Date().toISOString(),
        adminUsername: adminUser.username || currentUser?.email || "Admin",
        adminRole: loggedInRole || "SUPER_ADMIN",
        action: `Mengemaskini maklum balas admin: "${feedback}"`,
        bookingId: id,
      });

      if (leadToUpdate) {
        sendCustomerEmail(leadToUpdate, feedback, leadToUpdate.status);
      }
    } catch (e) {
      console.error("Gagal mengemaskini maklum balas di Firestore", e);
    }
  };

  const handleDeleteLead = async (id: string) => {
    const updated = leads.filter((L) => L.id !== id);
    setLeads(updated);
    saveToLocal("bfg_leads", updated);

    try {
      await deleteDoc(doc(db, "leads", id));

      // Activity Log entry
      const logId = `log-${Date.now()}`;
      await setDoc(doc(db, "activity_logs", logId), {
        id: logId,
        timestamp: new Date().toISOString(),
        adminUsername: adminUser.username || currentUser?.email || "Admin",
        adminRole: loggedInRole || "SUPER_ADMIN",
        action: `Memadam tempahan sebut harga pelanggan`,
        bookingId: id,
      });
    } catch (e) {
      console.error("Gagal memadam sebut harga dari Firestore", e);
    }
  };

  const handleAddCareer = async (newJob: Omit<Career, "id">) => {
    const job: Career = { ...newJob, id: `job-${Date.now()}` };
    const updated = [job, ...careers];
    setCareers(updated);
    saveToLocal("bfg_careers", updated);

    // Primary

    try {
      await setDoc(doc(db, "careers", job.id), cleanForFirestore(job));
    } catch (e) {
      console.error("Gagal menambah kerjaya ke Firestore", e);
    }
  };

  const handleDeleteCareer = async (id: string) => {
    const updated = careers.filter((c) => c.id !== id);
    setCareers(updated);
    saveToLocal("bfg_careers", updated);

    // Primary

    try {
      await deleteDoc(doc(db, "careers", id));
    } catch (e) {
      console.error("Gagal memadam kerjaya dari Firestore", e);
    }
  };

  const handleEditCareer = async (id: string, updates: Partial<Career>) => {
    const existingJob = careers.find((c) => c.id === id);
    if (!existingJob) return;
    const merged = { ...existingJob, ...updates };
    const updated = careers.map((c) => (c.id === id ? merged : c));
    setCareers(updated);
    saveToLocal("bfg_careers", updated);

    try {
      await setDoc(doc(db, "careers", id), cleanForFirestore(merged));
    } catch (e) {
      console.error("Gagal mengemaskini kerjaya di Firestore", e);
    }
  };

  const handleAddApplication = async (data: {
    careerId: string;
    careerTitle: string;
    name: string;
    email: string;
    phone: string;
    experienceSummary: string;
    resumeUrl?: string;
    resumeName?: string;
    certificatesUrl?: string;
    certificatesName?: string;
    othersUrl?: string;
    othersName?: string;
  }) => {
    const random4 = Math.floor(1000 + Math.random() * 9000).toString();
    const newApp: Application = {
      id: `BFG-JOB-${random4}`,
      date: new Date().toLocaleDateString("ms-MY"),
      status: "New",
      ...data,
    };
    const updated = [newApp, ...applications];
    setApplications(updated);
    saveToLocal("bfg_applications", updated);

    // Dynamic Real-time Gmail Alert if Oauth Token present
    sendGmailApplicationNotification(newApp);

    // Primary

    try {
      await setDoc(
        doc(db, "applications", newApp.id),
        cleanForFirestore(newApp),
      );

      // Trigger standard instant notifications inside system for popup & alert
      const notificationId = `notif-${Date.now()}`;
      const newNotif = {
        id: notificationId,
        timestamp: new Date().toISOString(),
        type: "career",
        title: "Permohonan Jawatan Baru",
        message: `Calon ${newApp.name} telah menghantar permohonan untuk jawatan "${newApp.careerTitle}".`,
        read: false,
        senderName: newApp.name,
        senderEmail: newApp.email,
      };
      await setDoc(doc(db, "notifications", notificationId), newNotif);
    } catch (e) {
      console.error("Gagal menghantar permohonan ke Firestore", e);
    }
  };

  const handleEditApplication = async (
    id: string,
    updates: Partial<Application>,
  ) => {
    const existingApp = applications.find((a) => a.id === id);
    if (!existingApp) return;
    const merged = { ...existingApp, ...updates };
    const updated = applications.map((a) => (a.id === id ? merged : a));
    setApplications(updated);
    saveToLocal("bfg_applications", updated);

    try {
      await setDoc(doc(db, "applications", id), cleanForFirestore(merged));
    } catch (e) {
      console.error("Gagal mengemaskini permohonan di Firestore", e);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    const updated = applications.filter((a) => a.id !== id);
    setApplications(updated);
    saveToLocal("bfg_applications", updated);

    try {
      await deleteDoc(doc(db, "applications", id));
    } catch (e) {
      console.error("Gagal memadam permohonan dari Firestore", e);
    }
  };

  const handleAddFaq = async (newFaq: Omit<FAQItem, "id">) => {
    const faq: FAQItem = { ...newFaq, id: `faq-${Date.now()}` };
    const updated = [faq, ...faqs];
    setFaqs(updated);
    saveToLocal("bfg_faqs", updated);
    try {
      await setDoc(doc(db, "faqs", faq.id), cleanForFirestore(faq));
      setActiveToast({
        id: Date.now().toString(),
        title: "FAQ Ditambah",
        message: "Rekod FAQ berjaya diterbitkan",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      handleFirestoreError(e, OperationType.CREATE, "faqs");
    }
  };

  const handleEditFaq = async (id: string, updates: Partial<FAQItem>) => {
    const existing = faqs.find((f) => f.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    const updated = faqs.map((f) => (f.id === id ? merged : f));
    setFaqs(updated);
    saveToLocal("bfg_faqs", updated);
    try {
      await setDoc(doc(db, "faqs", id), cleanForFirestore(merged));
      setActiveToast({
        id: Date.now().toString(),
        title: "FAQ Dikemaskini",
        message: "Rekod FAQ berjaya dikemaskini",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      handleFirestoreError(e, OperationType.UPDATE, "faqs");
    }
  };

  const handleDeleteFaq = async (id: string) => {
    const updated = faqs.filter((f) => f.id !== id);
    setFaqs(updated);
    saveToLocal("bfg_faqs", updated);
    try {
      await deleteDoc(doc(db, "faqs", id));
      setActiveToast({
        id: Date.now().toString(),
        title: "FAQ Dipadam",
        message: "Rekod FAQ berjaya dibuang",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      handleFirestoreError(e, OperationType.DELETE, "faqs");
    }
  };

  // ---- End FAQ Handlers ----

  const handleAddBlog = async (newBlog: Omit<Blog, "id">) => {
    const b: Blog = { ...newBlog, id: `blog-${Date.now()}` };
    const updated = [b, ...blogs];
    setBlogs(updated);
    saveToLocal("bfg_blogs", updated);

    // Primary: Google Sheet

    try {
      await setDoc(doc(db, "blogs", b.id), cleanForFirestore(b));
    } catch (e) {
      console.error("Gagal merakam artikel ke Firestore", e);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    const updated = blogs.filter((b) => b.id !== id);
    setBlogs(updated);
    saveToLocal("bfg_blogs", updated);

    // Primary: Google Sheet

    try {
      await deleteDoc(doc(db, "blogs", id));
    } catch (e) {
      console.error("Gagal memadam artikel dari Firestore", e);
    }
  };

  const handleEditBlog = async (id: string, updates: Partial<Blog>) => {
    const existingBlog = blogs.find((b) => b.id === id);
    if (!existingBlog) return;
    const merged = { ...existingBlog, ...updates };
    const updated = blogs.map((b) => (b.id === id ? merged : b));
    setBlogs(updated);
    saveToLocal("bfg_blogs", updated);

    try {
      await setDoc(doc(db, "blogs", id), cleanForFirestore(merged));
    } catch (e) {
      console.error("Gagal mengemaskini artikel di Firestore", e);
    }
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser.username.trim() || !adminUser.password.trim()) {
      setLoginError("Sila masukkan pengguna e-mel dan kata laluan!");
      return;
    }

    const username = adminUser.username.trim();
    const password = adminUser.password.trim();
    const normUser = username.toLowerCase();

    const emailToAuth = normUser === "admin" ? "admin@bfgplt.com" : normUser.includes("@") ? normUser : `${normUser}@bfgplt.com`;

    if (!isApprovedEmail(emailToAuth)) {
      setLoginError(
        "Akses Ditolak: Hanya e-mel rasmi syarikat (admin@bfgplt.com) dibenarkan mengakses portal pentadbir.",
      );
      return;
    }

    // Check master default credentials
    const isMasterAdminPass = password === "Benaflash@23**";
    const isMasterAdminUser = normUser === "admin@bfgplt.com" || normUser === "admin";

    if (isMasterAdminUser && isMasterAdminPass) {
      try {
        await signInWithEmailAndPassword(auth, "admin@bfgplt.com", password);
      } catch (err: any) {
        if (
          err.code === "auth/user-not-found" ||
          err.code === "auth/invalid-credential" ||
          err.code === "auth/invalid-login-credentials"
        ) {
          try {
            await createUserWithEmailAndPassword(
              auth,
              "admin@bfgplt.com",
              password,
            );
          } catch (e) {
            console.error("Gagal daftar admin baru: ", e);
          }
        }
      }
      setIsLoggedIn(true);
      setLoggedInRole(UserRole.SUPER_ADMIN);
      setLoginError("");
      localStorage.setItem("bfg_admin_logged_in", "true");
      return;
    }

    // Try direct Firebase Authentication with entered credentials
    try {
      await signInWithEmailAndPassword(auth, emailToAuth, password);
      setIsLoggedIn(true);
      setLoggedInRole(UserRole.SUPER_ADMIN);
      setLoginError("");
      localStorage.setItem("bfg_admin_logged_in", "true");
    } catch (firebaseErr: any) {
      console.error("Firebase Login Error:", firebaseErr);
      setLoginError(
        "Nama pengguna / e-mel atau kata laluan tidak sah! Sila semak semula kredensial anda.",
      );
    }
  };

  const handleSendMfaSms = async (resolverToUse?: any, hintToUse?: any) => {
    const resolver = resolverToUse || mfaResolver;
    const hint = hintToUse || selectedMfaHint;
    if (!resolver || !hint) {
      setMfaError("Gagal mematangkan proses MFA - data tidak lengkap.");
      return;
    }

    setIsSendingMfaCode(true);
    setMfaError("");
    try {
      let container = document.getElementById("mfa-recaptcha-container");
      if (container) {
        if ((window as any).recaptchaVerifier) {
          try {
            (window as any).recaptchaVerifier.clear();
          } catch (e) {}
        }
        container.remove();
      }

      container = document.createElement("div");
      container.id = "mfa-recaptcha-container";
      container.style.position = "absolute";
      container.style.top = "-9999px";
      container.style.left = "-9999px";
      container.style.width = "1px";
      container.style.height = "1px";
      container.style.overflow = "hidden";
      document.body.appendChild(container);

      const recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "mfa-recaptcha-container",
        {
          size: "invisible",
        },
      );
      (window as any).recaptchaVerifier = recaptchaVerifier;

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const tempVerificationId = await phoneAuthProvider.verifyPhoneNumber(
        { multiFactorHint: hint, session: resolver.session },
        recaptchaVerifier,
      );

      setMfaVerificationId(tempVerificationId);
      setIsSendingMfaCode(false);
    } catch (err: any) {
      console.error("Gagal menghantar SMS MFA:", err);
      setIsSendingMfaCode(false);
      const errMsg = err.message || err.toString();
      if (errMsg.includes("unauthorized-domain")) {
        setMfaError(
          `Gagal menghantar kod: Domain ini (${window.location.hostname}) belum dibenarkan. Sila tambah domain ini dalam 'Authorized domains' di Firebase Console.`,
        );
      } else {
        setMfaError(`Gagal menghantar kod: ${errMsg}`);
      }
    }
  };

  const handleVerifyMfaCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode.trim()) {
      setMfaError("Sila masukkan kod pengesahan SMS yang sah.");
      return;
    }
    if (!mfaResolver || !mfaVerificationId) {
      setMfaError("Penyelesaian MFA tamat tempoh. Sila cuba lagi.");
      return;
    }

    setMfaError("");
    try {
      const cred = PhoneAuthProvider.credential(
        mfaVerificationId,
        mfaCode.trim(),
      );
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      const result = await mfaResolver.resolveSignIn(multiFactorAssertion);

      const user = result.user;
      if (user?.email) {
        const approved = isApprovedEmail(user.email);
        if (approved) {
          setIsLoggedIn(true);
          setLoggedInRole(UserRole.SUPER_ADMIN);
          setAdminUser({
            username: user.email,
            password: "••••••••",
            role: UserRole.SUPER_ADMIN,
          });
          setMfaResolver(null);
          setMfaVerificationId("");
          setMfaCode("");
          setLoginError("");
        } else {
          await signOut(auth);
          setMfaResolver(null);
          setMfaVerificationId("");
          setMfaCode("");
          setLoginError(
            `Akses ditolak! Slogan keselamatan melarang emel Google (${user.email}) daripada mendaftar sistem BFG.`,
          );
        }
      }
    } catch (err: any) {
      console.error("Gagal menyelesaikan login MFA:", err);
      setMfaError(
        `Gagal menyelesaikan login: ${err.message || err.toString()}`,
      );
    }
  };

    const handleGoogleOneTapLogin = async () => {
    setLoginError("");
    setMfaError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) { setCachedAccessToken(credential.accessToken); }

      const user = result.user;
      if (user?.email) {
        if (isApprovedEmail(user.email)) {
          setIsLoggedIn(true);
          setLoggedInRole(UserRole.SUPER_ADMIN);
          setAdminUser({
            username: user.email,
            password: "••••••••",
            role: UserRole.SUPER_ADMIN,
          });
          setLoginError("");
          localStorage.setItem("bfg_admin_logged_in", "true");
        } else {
          await signOut(auth);
          setLoginError(`Akses Ditolak: Hanya e-mel rasmi syarikat (admin@bfgplt.com) dibenarkan mengakses portal pentadbir.`);
        }
      }
    } catch (err: any) {
      console.error("Gagal log masuk Google:", err);
      if (err.code === "auth/multi-factor-auth-required") {
        setMfaResolver(getMultiFactorResolver(auth, err));
      } else {
        const errMsg = err.message || err.toString();
        if (errMsg.includes("API key not valid") || errMsg.includes("Requests to this API")) {
          setLoginError("Kekunci API (API Key) Firebase projek ini belum aktif sepenuhnya di Console. Sila semak tetapan Firebase anda.");
        } else if (errMsg.includes("unauthorized-domain")) {
          setLoginError(`Domain ini (${window.location.hostname}) belum dibenarkan. Sila tambah domain ini dalam 'Authorized domains' di Firebase Console (Authentication > Settings).`);
        } else if (err.code !== "auth/popup-closed-by-user") {
          setLoginError(errMsg);
        }
      }
    }
  };

  // Helper trigger to preview cert
  const handleOpenDoc = (certType: string) => {
    const dynamicCert = certifications.find(
      (c) =>
        c.id === certType ||
        c.logoText.toLowerCase().replace(/\s+/g, "") ===
          certType.toLowerCase().replace(/\s+/g, "") ||
        c.name.toLowerCase().includes(certType.toLowerCase()),
    );
    if (dynamicCert) {
      setActiveDocReader({
        title: dynamicCert.name,
        sub: dynamicCert.issuingBody,
        sections: [
          {
            title: "BUTIRAN SIJIL / LESEN",
            bullets: [
              `Nama Rasmi: ${dynamicCert.name}`,
              `Badan Penerbit: ${dynamicCert.issuingBody}`,
              `No Pendaftaran: ${dynamicCert.registrationNo || "TIDAK DINYATAKAN"}`,
              `Tempoh Sah Laku: ${dynamicCert.validity || "AKTIF / SEPANJANG HAYAT"}`,
            ],
          },
          {
            title: "PENGKHUSUSAN BIDANG & DESKRIPSI",
            bullets:
              dynamicCert.specialties && dynamicCert.specialties.length > 0
                ? dynamicCert.specialties
                : [dynamicCert.description || "Tiada perincian tambahan."],
          },
        ],
        imageUrl: dynamicCert.imageUrl,
        pdfUrl: dynamicCert.pdfUrl,
      });
      return;
    }

    if (certType === "cidb") {
      setActiveDocReader({
        title: "Perakuan Pendaftaran CIDB Gred G2",
        sub: "Lembaga Pembangunan Industri Pembinaan Malaysia",
        sections: [
          {
            title: "BUTIRAN SYARIKAT",
            bullets: [
              "Nama Berdaftar: BENA FLASH GLOBAL PLT",
              "No Pendaftaran CIDB: 0120230308-PH115139",
              "Gred Pelesenan: G2 (Kapasiti Kerja sehingga RM 500,000)",
            ],
          },
          {
            title: "PENGKHUSUSAN BIDANG KERJA",
            bullets: [
              "B04: Kerja Am Bangunan",
              "CE21: Kejuruteraan Awam",
              "ME01: Sistem Penyaman Udara",
              "ME21: Sistem Pendawaian Elektrikal",
            ],
          },
          {
            title: "TEMPOH SAH LAKU",
            bullets: [
              "Dikeluarkan: 20 Januari 2025",
              "Tamat Tempoh: 06 Mac 2028 (Pembaharuan Aktif)",
            ],
          },
        ],
      });
    } else if (certType === "st") {
      setActiveDocReader({
        title: "Perakuan Kontraktor Elektrik Kelas C",
        sub: "Suruhanjaya Tenaga (ST)",
        sections: [
          {
            title: "PENILAIAN KOMPETENSI",
            bullets: [
              "Jenis Kontraktor: Kelas C Berlesen",
              "Pihak Berkuasa Melulus: Suruhanjaya Tenaga Negeri Pahang/Terengganu",
              "No Rujukan ST: ST(PKN)PHG/C/KE/00864/2024",
            ],
          },
          {
            title: "KEPAKARAN MANDATORI",
            bullets: [
              "Penyeliaan oleh Penjaga Jentera / Chargeman ST di tapak.",
              "Menjalankan kerja-kerja reka bentuk sistem litar voltan rendah fasa tunggal dan tiga fasa.",
              "Pematuhan keselamatan di bawah Akta Bekalan Elektrik 1990.",
            ],
          },
        ],
      });
    } else if (certType === "mof") {
      setActiveDocReader({
        title: "Sijil Pendaftaran Kementerian Kewangan (MOF)",
        sub: "Syarikat Bumiputera G2 Berdaftar",
        sections: [
          {
            title: "AKREDITASI PERBENDAHARAAN",
            bullets: [
              "Status Pembekal: Bumiputera Sah",
              "No Pendaftaran MOF: 357-000237078",
              "Kelayakan: Menyediakan bekalan am dan penyelenggaraan M&E bagi agensi kerajaan.",
            ],
          },
          {
            title: "KOD BIDANG JALUR",
            bullets: [
              "Kategori 020301: Perabot & Perkakas Elektrik Pejabat",
              "Kategori 140301/2: Kabel, Wayar Elektrik & Aksesori",
              "Kategori 220301: Penyelenggaraan Alat Hawa Dingin",
            ],
          },
        ],
      });
    } else if (certType === "profile") {
      setActiveDocReader({
        title: "Profil Syarikat Lengkap (Company Profile)",
        sub: "BENA FLASH GLOBAL PLT Capabiliti & Portfolio",
        sections: [
          {
            title: "PROFIL OPERASI",
            bullets: [
              "Ditubuhkan: 29 Ogos 2022 (Sebagai PLT pada 2023)",
              "Visi: Menjadi kontraktor utiliti M&E utama yang berintegriti tinggi di Malaysia.",
              "Kekuatan Pasukan: 10+ Kakitangan mahir merangkumi Pengarah Syarikat, Pengarah Operasi, Site Supervisor, Chargeman Suruhanjaya Tenaga, dan M&E Wireman.",
            ],
          },
          {
            title: "REKOD INTEGRITI PROJEK",
            bullets: [
              "Projek berjaya diselesaikan untuk Kelab Polo Pahang, Yayasan Tenun, JKR Raub, dll.",
              "Sifar insiden keselamatan (LTI) di tapak operasi sejak penubuhan.",
              "Peluang Pelaksanaan Pintar menggunakan pemantauan visual Google Sheet.",
            ],
          },
        ],
      });
    }
  };

  // Filters for current page
  const [projectFilter, setProjectFilter] = useState<string>("All");
  const [projectYearFilter, setProjectYearFilter] = useState<string>("All");
  const [projectLayoutMode, setProjectLayoutMode] = useState<"slider" | "grid">("slider");
  const [submittedQuoteConfirmation, setSubmittedQuoteConfirmation] = useState<LeadQuote | null>(null);

  const projectCarouselRef = React.useRef<HTMLDivElement>(null);

  const scrollProjects = (direction: "left" | "right") => {
    if (projectCarouselRef.current) {
      const scrollAmount = direction === "left" ? -420 : 420;
      projectCarouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const availableProjectYears = Array.from(
    new Set(
      projects
        .map((p) => {
          const match = p.completionDate?.match(/\b(20\d\d)\b/);
          return match ? match[1] : null;
        })
        .filter(Boolean) as string[],
    ),
  ).sort((a, b) => Number(b) - Number(a));

  const filteredProjects = projects.filter((p) => {
    const matchCategory =
      projectFilter === "All" || p.category === projectFilter;
    const matchYear =
      projectYearFilter === "All" ||
      (p.completionDate && p.completionDate.includes(projectYearFilter));
    return matchCategory && matchYear;
  });

  // Before & after image drag interaction handlers
  const handleSliderMove = (
    clientX: number,
    boundingWidth: number,
    boundingLeft: number,
  ) => {
    const x = clientX - boundingLeft;
    let position = (x / boundingWidth) * 100;
    if (position < 0) position = 0;
    if (position > 100) position = 100;
    setSliderPosition(position);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const container = e.currentTarget.getBoundingClientRect();
    handleSliderMove(e.touches[0].clientX, container.width, container.left);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return; // Only if mouse is pressed
    const container = e.currentTarget.getBoundingClientRect();
    handleSliderMove(e.clientX, container.width, container.left);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 font-sans tracking-normal selection:bg-[#D4AF37]/30">
      <title>
        {selectedBlog
          ? `${selectedBlog.title} | Bena Flash Global`
          : "Bena Flash Global - Kontraktor Elektrik & Aircond"}
      </title>
      {selectedBlog && (
        <meta name="description" content={selectedBlog.snippet} />
      )}

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
        </div>
      )}
      {companyInfo.isPromoActive && companyInfo.promoText && (
        <div className="bg-[#D4AF37] text-[#0F172A] py-1.5 px-4 text-center text-xs font-bold uppercase tracking-wider relative group">
          <p className="flex justify-center items-center gap-2">
            <span className="animate-pulse">✨</span>
            {companyInfo.promoText}
            {companyInfo.promoLink && (
              <a
                href={companyInfo.promoLink}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-white transition-colors ml-2"
              >
                Lihat Lanjut
              </a>
            )}
          </p>
        </div>
      )}
      {/* HEADER NAVIGATION COMPONENT */}
      <HeaderNavigation
        companyInfo={companyInfo}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        lang={lang}
        setLang={setLang}
        theme={theme}
        toggleTheme={toggleTheme}
        isScrolled={isScrolled}
        isAdminMode={isAdminMode}
        setIsAdminMode={setIsAdminMode}
        isLoggedIn={isLoggedIn}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        setShowInstallModal={setShowInstallModal}
        isPageTransitioning={isPageTransitioning}
        isLoading={isLoading}
      />

      {/* 2. CHIEF CONTENT PANEL (PUBLIC SCREEN INTERFACES & BACKEND CMS) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <React.Suspense
          fallback={
            <div className="h-96 flex flex-col items-center justify-center font-bold text-slate-400 gap-4">
              <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              Memuatkan... / Loading...
            </div>
          }
        >
          <AnimatePresence mode="wait">
            {/* PUBLIC NAVIGATION TARGET: HOME (UTAMA) + SEO LOCATIONS */}
            {(activeTab === "home" ||
              activeTab === "elektrik-kuantan" ||
              activeTab === "elektrik-pekan" ||
              activeTab === "aircond-kuantan" ||
              activeTab === "aircond-pekan" ||
              activeTab === "db-box" ||
              activeTab === "blackout" ||
              activeTab === "meter-tnb") &&
              !isAdminMode && (
                <div className="space-y-0">
                  <CorporateLanding
                    services={services}
                    clientLogos={clientLogos}
                    companyInfo={companyInfo}
                    lang={lang}
                  />
                  <TestimonialSection testimonials={testimonials} />
                </div>
              )}

            {/* PUBLIC NAVIGATION TARGET: ABOUT (TENTANG KAMI + ORGANISASI) */}
            {activeTab === "about" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7 }}
                  className="bg-white border rounded-2xl p-6 sm:p-8 lg:p-12 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
                >
                  <div className="space-y-4">
                    <div className="inline-block px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/35 rounded-sm">
                      <span className="font-extrabold text-[10px] uppercase tracking-wider">
                        {lang === "MS"
                          ? "Profil Syarikat Bumiputera"
                          : "Bumiputera Company Profile"}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] leading-tight font-heading">
                      {lang === "MS" ? (
                        <>
                          Mempelopori Standard Pengurusan <br /> & Operasi
                          Teknikal M&E Malaysia
                        </>
                      ) : (
                        <>
                          Pioneering Mechanical & <br /> Electrical Engineering
                          Standards in Malaysia
                        </>
                      )}
                    </h2>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">
                      {lang === "MS"
                        ? companyInfo.aboutText ||
                          "Bena Flash Global PLT ditubuhkan dengan visi membekalkan servis kejuruteraan terbaik..."
                        : "Bena Flash Global PLT was incorporated with a vision to deliver premium mechanical, electrical and air-conditioning solutions throughout Malaysia. Backed by CIDB Grade G2 accreditation and registered with the Energy Commission (Suruhanjaya Tenaga), we guarantee safety, technical compliance, and customer satisfaction."}
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-semibold">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="block text-slate-400 text-[10px] uppercase">
                          {lang === "MS"
                            ? "Pejabat Urusan Utama"
                            : "Main Operational Office"}
                        </span>
                        <span className="text-[#0F172A]">Kuantan, Pahang</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="block text-slate-400 text-[10px] uppercase">
                          {lang === "MS"
                            ? "Pendaftaran CIDB Utama"
                            : "CIDB License Registration"}
                        </span>
                        <span className="text-green-600">
                          {lang === "MS"
                            ? "Maksimum RM 500,000 (G2)"
                            : "Maximum RM 500,000 (G2)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <img
                      src={optWebp(
                        companyInfo.aboutImgUrl ||
                          "https://picsum.photos/800/600",
                      )}
                      alt="Engineering team review"
                      className="rounded-2xl shadow-md border w-full h-[280px] object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute -bottom-6 -right-4 bg-[#0F172A] text-white p-4 rounded-xl border border-[#D4AF37]/50 shadow-md flex items-center gap-3">
                      <span className="text-2xl font-extrabold text-[#D4AF37]">
                        98%
                      </span>
                      <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-300">
                        {lang === "MS" ? (
                          <>
                            Kadar Puas <br /> Hati Client
                          </>
                        ) : (
                          <>
                            Client <br /> Satisfaction Rate
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* ORGANIZATIONAL CHART SECTION */}
                <motion.section
                  id="org-chart"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7 }}
                  className="bg-white border rounded-2xl p-6 sm:p-8 shadow-xs"
                >
                  <OrganizationChart staff={staff} />
                </motion.section>
              </motion.div>
            )}

            {/* PUBLIC NAVIGATION TARGET: SERVICES (PERKHIDMATAN) */}
            {activeTab === "services" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6 }}
                  className="text-center max-w-xl mx-auto space-y-2"
                >
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block">
                    Akreditasi & Kepakaran G2
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
                    Kepakaran Sektor Penyelenggaraan M&E
                  </h2>
                  <p className="text-sm text-slate-500">
                    Dilesenkan di bawah Suruhanjaya Tenaga bagi kejuruteraan
                    litar voltan rendah ke sederhana, perlindungan kilang, dan
                    pembekalan solar lestari.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    {
                      level: "L1",
                      title: "Kejuruteraan Elektrikal & Pemasangan Kabel L7",
                      desc: "Sistem bekalan kuasa komprehensif bagi bangunan tinggi, stesen penapisan air, dan depot logistik keretapi. Membekalkan Main Switch Board (MSB), sub-board (DB), pemasangan dulang kabel tray, penyambungan cable jointing, lukisan reka letak AutoCAD, dan pembaikan litar pintas voltan tinggi.",
                      items: [
                        "Reka Letak Bilik MSB & Papan Pembahagi Litar DB",
                        "Sistem Perlindungan Kilat (Copper Spike & Faraday Cage)",
                        "Pendawaian Tiga Fasa Komersial & Industri Pasangan Sivil",
                        "Pemasangan Lampu Limpah Limpahan Voltan Solar",
                      ],
                      imgUrl: "https://picsum.photos/800/600",
                    },
                    {
                      level: "L2",
                      title: "Sistem Pendingin Chiller & Penyaman Udara VRV",
                      desc: "Hawa dingin komersil yang menjimatkan tenaga tinggi. Kami mengendalikan kerja perancangan sistem Variable Refrigerant Volume (VRV-Daikin) / VRF, aircond salur ducting berpusat, water chiller, cooling tower ventilasi AHU, pembasmian kulat kimia, serta pelan penyelenggaraan kontrak berkala.",
                      items: [
                        "Penyenggaraan Kontrak Chiller Sektor Hospital & Pusat Beli Belah",
                        "Pemasangan Sistem Kaset Ducting Unit Luar Multi-VRF",
                        "Penaiktarafan Saluran Ekzos Kecemasan Bomba",
                        "Ujian Tekanan Kebocoran Gas R410A & R32",
                      ],
                      imgUrl: "https://picsum.photos/800/600",
                    },
                    {
                      level: "L3",
                      title: "Sistem Fotovoltan Solar Hibrid (Solar PV)",
                      desc: "Pembekalan tenaga lestari dan pengurangan bil elektrik syarikat. Menguruskan pendaftaran Net Energy Metering (NEM) dengan Pihak Berkuasa Pembangunan Tenaga Lestari (SEDA), pembekalan panel solar fotovoltan gred industri (monocrystalline), sistem inverter pintar, dan meter dwi-arah hibrid.",
                      items: [
                        "Reka Letak Pelan Struktur Atas Bumbung Solar",
                        "Suntikan Inverter Pintar Huawei / Sungrow",
                        "Pengkabelan Solar Kalis UV XLPE AC/DC",
                        "Integrasi Pemantauan Cloud IoT Digital",
                      ],
                      imgUrl: "https://picsum.photos/800/600",
                    },
                    {
                      level: "L4",
                      title:
                        "Pengujian Perlindungan Breaker & Pentauliahan Rasmi",
                      desc: "Kerja-kerja pengauditan keselamatan mandatori mengikut peraturan Suruhanjaya Tenaga. Menyediakan khidmat ujian suntikan arus utama (primary injection), suntikan arus sekunder (secondary injection test), pengujian penebatan minyak transformer, ujian rintangan tanah (earth-leakage relay calibration), serta pengeluaran Borang G/H perakuan sah.",
                      items: [
                        "Penaiktarafan Air Circuit Breaker (ACB) & Vacuum Circuit Breaker (VCB)",
                        "Penilaian Kesihatan Minyak Transformer & Isian Kerangka Bumi",
                        "Ujian Gegeran Busbar Megger Grounding",
                        "Pengeluaran Laporan Audit Jurutera Elektrik Kompeten Bertauliah",
                      ],
                      imgUrl: "https://picsum.photos/800/600",
                    },
                  ].map((svc, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.02] hover:border-slate-300 transition-all duration-300 ease-out flex flex-col"
                    >
                      <div className="h-48 w-full bg-slate-100 relative">
                        <img
                          src={optWebp(svc.imgUrl)}
                          alt={svc.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        <div className="absolute top-4 left-4 w-10 h-10 bg-[#0F172A]/90 backdrop-blur text-[#D4AF37] flex items-center justify-center rounded-lg font-bold shadow-lg">
                          {svc.level}
                        </div>
                      </div>
                      <div className="p-6 sm:p-8 space-y-4 flex-1">
                        <h3 className="text-lg font-bold text-[#0F172A] font-heading">
                          {svc.title}
                        </h3>
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                          {svc.desc}
                        </p>
                        <ul className="list-disc pl-5 text-xs text-slate-500 space-y-1">
                          {svc.items.map((item, id) => (
                            <li key={id}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7 }}
                >
                  <ServiceCalculator lang={lang} customRates={aircondRates} />
                </motion.div>
              </motion.div>
            )}

            {/* PUBLIC NAVIGATION TARGET: PROJECTS (PROJEK PORTFOLIO + BEFORE-AFTER) */}
            {activeTab === "projects" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#0F172A] border-l-4 border-[#D4AF37] pl-3 font-heading">
                      Galeri & Rekod Projek Kejuruteraan Terkini
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Papar mengikut kategori servis atau selaring tahun siap. BFG PLT beroperasi di seluruh Kuantan, Pekan dan Pahang.
                    </p>
                  </div>

                  {/* Desktop Slider Navigation Arrows & View Toggle */}
                  <div className="flex items-center gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => setProjectLayoutMode("slider")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          projectLayoutMode === "slider"
                            ? "bg-[#0F172A] text-[#D4AF37] shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                        <span>Slaid</span>
                      </button>
                      <button
                        onClick={() => setProjectLayoutMode("grid")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          projectLayoutMode === "grid"
                            ? "bg-[#0F172A] text-[#D4AF37] shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Grid className="w-3.5 h-3.5" />
                        <span>Jubin Grid</span>
                      </button>
                    </div>

                    {projectLayoutMode === "slider" && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => scrollProjects("left")}
                          className="p-2 bg-slate-900 hover:bg-[#D4AF37] text-white hover:text-slate-950 rounded-xl transition shadow-sm cursor-pointer"
                          title="Slaid ke Kiri"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => scrollProjects("right")}
                          className="p-2 bg-slate-900 hover:bg-[#D4AF37] text-white hover:text-slate-950 rounded-xl transition shadow-sm cursor-pointer"
                          title="Slaid ke Kanan"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Filter Controls Bar (Category + Year) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 select-none">
                    {[
                      "All",
                      "Electrical",
                      "Aircond",
                      "Solar PV",
                      "Testing",
                      "M&E Works",
                    ].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setProjectFilter(cat)}
                        className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                          projectFilter === cat
                            ? "bg-[#0F172A] text-[#D4AF37] font-black shadow-xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {cat === "All" ? "Semua Servis" : cat}
                      </button>
                    ))}
                  </div>

                  {/* Year Filter Dropdown */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Tahun:
                    </span>
                    <select
                      value={projectYearFilter}
                      onChange={(e) => setProjectYearFilter(e.target.value)}
                      className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer shadow-2xs"
                    >
                      <option value="All">Semua Tahun (Keseluruhan)</option>
                      {availableProjectYears.map((year) => (
                        <option key={year} value={year}>
                          Tahun {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Professional Carousel / Slider representation */}
                <div className="relative group">
                  {/* Left & Right Floating Overlay Arrows for Desktop Hover */}
                  {projectLayoutMode === "slider" && (
                    <>
                      <button
                        onClick={() => scrollProjects("left")}
                        className="hidden md:flex absolute top-1/2 -left-4 -translate-y-1/2 z-20 w-10 h-10 bg-slate-900/90 hover:bg-[#D4AF37] text-white hover:text-slate-950 rounded-full items-center justify-center shadow-xl transition-all cursor-pointer border border-slate-700 hover:scale-110"
                        aria-label="Previous Project"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => scrollProjects("right")}
                        className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 z-20 w-10 h-10 bg-slate-900/90 hover:bg-[#D4AF37] text-white hover:text-slate-950 rounded-full items-center justify-center shadow-xl transition-all cursor-pointer border border-slate-700 hover:scale-110"
                        aria-label="Next Project"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {filteredProjects.length === 0 ? (
                    <div className="bg-slate-50 rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
                      Tiada rekod projek dijumpai untuk kriteria tapisan semasa. Sila pilih tapisan lain.
                    </div>
                  ) : projectLayoutMode === "slider" ? (
                    <div
                      ref={projectCarouselRef}
                      className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 pb-8 pt-2 px-1 scroll-smooth"
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                      {filteredProjects.map((proj, i) => (
                        <motion.div
                          key={proj.id}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: (i % 4) * 0.05 }}
                          className="bg-white min-w-[300px] md:min-w-[380px] max-w-[420px] snap-start shrink-0 border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.02] hover:border-[#D4AF37] transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between"
                          onClick={() => setSelectedProject(proj)}
                        >
                          <div>
                            <div className="relative h-52 bg-slate-100 overflow-hidden group">
                              <img
                                src={optWebp(proj.img)}
                                alt={proj.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                              />
                              {proj.imgBefore && (
                                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm text-[#D4AF37] text-[9px] uppercase font-black px-2 py-1 rounded-md shadow-sm border border-[#D4AF37]/30">
                                  Before & After
                                </div>
                              )}
                              <span className="absolute bottom-3 left-3 bg-[#0F172A] text-[#D4AF37] text-[9px] uppercase font-extrabold px-2.5 py-1 rounded-md shadow-xs">
                                {proj.category}
                              </span>
                            </div>
                            <div className="p-5 space-y-3">
                              <div className="flex justify-between items-center text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">
                                <span className="truncate max-w-[150px]">{proj.client}</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {proj.location}
                                </span>
                              </div>
                              <h4 className="font-bold text-[#0F172A] text-base leading-snug line-clamp-2">
                                {proj.title}
                              </h4>
                              <div className="grid grid-cols-3 gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                                <div>
                                  <span className="block text-[8px] uppercase font-bold text-slate-400">
                                    Nilai Projek
                                  </span>{" "}
                                  <span className="font-semibold text-slate-800 text-[10px] sm:text-xs">
                                    {proj.value || "Tender Sah"}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[8px] uppercase font-bold text-slate-400">
                                    Siap / Tarikh
                                  </span>{" "}
                                  <span className="font-semibold text-slate-800 text-[10px] sm:text-xs">
                                    {proj.completionDate}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[8px] uppercase font-bold text-slate-400">
                                    Status
                                  </span>{" "}
                                  <span className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded ${
                                    proj.status === "Completed" || proj.status === "Siap"
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                                  }`}>
                                    {proj.status || "Siap"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    /* Grid Layout Mode */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                      {filteredProjects.map((proj) => (
                        <motion.div
                          key={proj.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#D4AF37] transition-all duration-300 cursor-pointer flex flex-col justify-between"
                          onClick={() => setSelectedProject(proj)}
                        >
                          <div>
                            <div className="relative h-48 bg-slate-100 overflow-hidden">
                              <img
                                src={optWebp(proj.img)}
                                alt={proj.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                              />
                              <span className="absolute bottom-3 left-3 bg-[#0F172A] text-[#D4AF37] text-[9px] uppercase font-bold px-2 py-1 rounded">
                                {proj.category}
                              </span>
                            </div>
                            <div className="p-5 space-y-2.5">
                              <div className="flex justify-between items-center text-[10px] text-[#D4AF37] font-semibold uppercase">
                                <span>{proj.client}</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {proj.location}
                                </span>
                              </div>
                              <h4 className="font-bold text-[#0F172A] text-sm leading-snug line-clamp-2">
                                {proj.title}
                              </h4>
                              <div className="grid grid-cols-3 gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                                <div>
                                  <span className="block text-[8px] uppercase font-bold text-slate-400">Nilai</span>
                                  <span className="font-semibold text-slate-700 text-[10px] sm:text-xs">{proj.value || 'Tender'}</span>
                                </div>
                                <div>
                                  <span className="block text-[8px] uppercase font-bold text-slate-400">Siap</span>
                                  <span className="font-semibold text-slate-700 text-[10px] sm:text-xs">{proj.completionDate}</span>
                                </div>
                                <div>
                                  <span className="block text-[8px] uppercase font-bold text-slate-400">Status</span>
                                  <span className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded ${
                                    proj.status === "Completed" || proj.status === "Siap"
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                                  }`}>
                                    {proj.status || "Siap"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <style>{`
                    .hide-scrollbar::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                </div>

                {/* Interactive Map Component in Projects Section */}
                <div className="pt-6">
                  <ProjectMapVisualization projects={projects} onSelectProject={setSelectedProject} />
                </div>

              </motion.div>
            )}

            {/* PUBLIC NAVIGATION TARGET: CERTIFICATES & LICENSES (SIJIL & LESEN) */}
            {activeTab === "certificates" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block">
                    Integriti Pelesenan Sah
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
                    Akreditasi & Sijil Kekompetenan
                  </h2>
                  <p className="text-sm text-slate-500">
                    Sebagai pemegang sijil pendaftaran Gred G2 CIDB, Bena Flash
                    Global mematuhi segala peruntukan undang-undang pembinaan
                    mekanikal dan elektrikal negara.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {cert.imageUrl ? (
                          <div className="w-full h-32 mx-auto rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-2 relative shadow-inner">
                            <img
                              src={optWebp(cert.imageUrl)}
                              alt={cert.name}
                              className="max-w-full max-h-full object-contain select-none"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-24 bg-slate-50 border-2 border-[#D4AF37]/40 rounded-lg mx-auto flex flex-col items-center justify-center p-2">
                            <span className="text-[10px] font-black text-slate-400 block border-b pb-1 w-full text-center uppercase">
                              {cert.logoText.split(" ")[0]}
                            </span>
                            <span className="text-[13px] font-black text-[#0F172A] block mt-1.5 tracking-tight uppercase leading-tight whitespace-normal max-w-full">
                              {cert.logoText.split(" ").slice(1).join(" ") ||
                                "INFO"}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-[#0F172A] text-sm uppercase">
                            {cert.name}
                          </h3>
                          <p className="text-slate-400 text-[10px] mt-1 font-mono">
                            {cert.registrationNo
                              ? `No: ${cert.registrationNo}`
                              : cert.issuingBody}
                          </p>
                          <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                            {cert.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenDoc(cert.id)}
                        className="w-full bg-[#0F172A] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition mt-4"
                      >
                        Lihat Urusan Sah
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PUBLIC NAVIGATION TARGET: BLOG (M&E EDUCATION CENTER) */}
            {activeTab === "blog" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="border-b pb-4">
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block">
                    Pusat M&E Komprehensif
                  </span>
                  <h2 className="text-2xl font-bold text-[#0F172A] font-heading mt-1">
                    Artikel Pendidikan Kejuruteraan & Panduan Teknikal
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pelajari piawaian keselamatan sistem elektrik, tips
                    pemeliharaan chiller komersil, dan audit kuasa dari pakar
                    kami.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogs.map((blog) => {
                    const blogReads = blogReaderLogs.filter((l) => l.blogId === blog.id && l.action === "read").length || (blog.viewsCount || 0);
                    const blogShares = blogReaderLogs.filter((l) => l.blogId === blog.id && l.action === "share").length || (blog.sharesCount || 0);

                    return (
                      <div
                        key={blog.id}
                        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between cursor-pointer group"
                        onClick={() => handleOpenBlog(blog)}
                      >
                        <div>
                          <div className="relative h-44 bg-slate-100 overflow-hidden">
                            <img
                              src={optWebp(blog.img)}
                              alt={blog.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                            />
                            <span className="absolute bottom-3 left-3 bg-[#0F172A] text-[#D4AF37] text-[9px] uppercase font-bold px-2.5 py-1 rounded shadow-md">
                              {blog.category}
                            </span>
                          </div>

                          <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between text-slate-400 text-[10px]">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{blog.readTime}</span>
                                <span>•</span>
                                <span>{blog.date}</span>
                              </div>
                            </div>

                            <h4 className="font-bold text-[#0F172A] text-sm leading-snug line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
                              {blog.title}
                            </h4>
                            <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">
                              {blog.snippet}
                            </p>

                            {/* Live Views & Shares Badges */}
                            <div className="pt-2 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                                {blogReads} Membaca
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg">
                                <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                                {blogShares} Perkongsian
                              </span>
                            </div>

                            {blog.websiteUrl && (
                              <div className="pt-1">
                                <a
                                  href={blog.websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0F172A] bg-amber-50 border border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-white px-3 py-1.5 rounded-lg transition-all"
                                >
                                  <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                                  <span>Pautan Website Rasmi</span>
                                  <ExternalLink className="w-3 h-3 opacity-70" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                      <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          Oleh:{" "}
                          <strong className="text-slate-600 font-bold">
                            {blog.author}
                          </strong>
                        </span>
                        
                        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleShare("whatsapp", blog, e)}
                            title="Kongsi ke WhatsApp"
                            className="p-1.5 hover:bg-[#25D366]/10 text-[#25D366] rounded-full transition cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleShare("facebook", blog, e)}
                            title="Kongsi ke Facebook"
                            className="p-1.5 hover:bg-[#1877F2]/10 text-[#1877F2] rounded-full transition cursor-pointer"
                          >
                            <Facebook className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleShare("copy", blog, e)}
                            title="Salin Pautan"
                            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-full transition cursor-pointer relative"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {copiedBlogId === blog.id && (
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap z-10 animate-fade-in">
                                Disalin!
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </motion.div>
            )}

            {/* PUBLIC NAVIGATION TARGET: CAREERS (KERJAYA PORTAL) */}
            {activeTab === "career" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="border-b pb-4 text-center max-w-xl mx-auto space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block">
                    Menyertai Pasukan Kami
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
                    Kekosongan Jawatan Teknikal M&E
                  </h2>
                  <p className="text-xs text-slate-500">
                    Bina laluan kerjaya professional bersama BENA FLASH GLOBAL
                    PLT. Kami sentiasa mencari bakat bertauliah (Chargeman,
                    Wireman, Internship dan Juruteknik Senior) untuk menyertai
                    projek G2 bertaraf tinggi.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {careers.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-1 roundeduppercase">
                            {job.jobType}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {job.salary}
                          </span>
                        </div>

                        <h4 className="font-bold text-[#0F172A] text-base mt-2">
                          {job.title}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {job.department} • {job.location}
                        </p>

                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block mb-1">
                            Syarat Kelayakan:
                          </span>
                          <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                            {job.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveJobApply(job)}
                        className="w-full bg-[#0F172A] text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl transition shadow-xs block text-center"
                      >
                        Mohon Sekarang
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PUBLIC NAVIGATION TARGET: DOWNLOAD CENTER (MUAT TURUN DETAILED PROFILE & DOCS) */}
            {activeTab === "downloads" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="border-b pb-4">
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block">
                    Dokumentasi Korporat
                  </span>
                  <h2 className="text-2xl font-bold text-[#0F172A] font-heading mt-1">
                    Peti Fail Rujukan Rasmi Sumpah & Profil
                  </h2>
                  <p className="text-xs text-slate-500">
                    Dapatkan rujukan pautan dokumen-dokumen mandatori Bena Flash
                    Global untuk penyediaan kertas pelan bidaan sebut harga
                    anda.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-44 bg-slate-100">
                          <img
                            src={optWebp(doc.imgUrl)}
                            alt={doc.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          <span className="absolute bottom-3 left-3 bg-[#0F172A] text-[#D4AF37] text-[9px] uppercase font-bold px-2.5 py-1 rounded">
                            {doc.cat}
                          </span>
                        </div>

                        <div className="p-5 space-y-3">
                          <h4 className="font-bold text-[#0F172A] text-sm leading-snug">
                            {doc.title}
                          </h4>
                          <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">
                            {doc.desc}
                          </p>
                        </div>
                      </div>

                      <div className="p-5 border-t border-slate-50 bg-slate-50/50 flex gap-4 items-center justify-between text-xs">
                        {doc.isDownload ? (
                          <>
                            <button
                              onClick={() => handleOpenDoc(doc.id)}
                              className="font-bold text-[#0F172A] hover:underline"
                            >
                              Pratonton Digital
                            </button>
                            <a
                              href="data:text/plain;charset=utf-8,BENA FLASH GLOBAL CORPORATE FILE"
                              download={`BFG_${doc.id}.txt`}
                              className="font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </a>
                          </>
                        ) : (
                          <a
                            href={doc.link}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full text-center bg-[#0F172A] hover:bg-slate-800 text-white py-2 rounded-lg font-bold uppercase tracking-wider"
                          >
                            Lawati E-Store
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PUBLIC NAVIGATION TARGET: CONTACT & QUOTATION FORM (HUBUNGI KAMI) */}
            {activeTab === "contact" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <div className="border-b pb-4">
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block">
                    Permohonan Tender & Sebut Harga
                  </span>
                  <h2 className="text-2xl font-bold text-[#0F172A] border-l-4 border-[#D4AF37] pl-3 font-heading mt-1">
                    Sebut Harga Pantas & Talian Hubungi
                  </h2>
                  <p className="text-xs text-slate-500">
                    Hubungi jurutera M&E kami hari ini bermula dengan langkah
                    mudah menghantar keperluan skop kerja.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Form column */}
                  <div className="lg:col-span-3 bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        Borang Pertanyaan Sebut Harga Perkhidmatan
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Sila lengkapkan maklumat tapak kerja dan sertakan
                        cadangan bajet anda.
                      </p>
                    </div>

                    <form
                      onSubmit={handleAddQuoteRequest}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                            Nama Individu / Wakil
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            placeholder="cth: Mohamad Hanafi"
                            className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                            Nama Agensi / Syarikat Pembeli
                          </label>
                          <input
                            type="text"
                            name="company"
                            placeholder="cth: JKR Negeri Sembilan / Persendirian"
                            className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                            Sebut Talian Hubungi (No. Tel)
                          </label>
                          <input
                            type="text"
                            name="phone"
                            required
                            placeholder="cth: 013-9087654"
                            className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                            Alamat E-mel Koresponden
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="nama@alamat.com"
                            className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                            Pilihan Perkhidmatan Utama
                          </label>
                          <select
                            name="serviceType"
                            className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50 font-semibold"
                          >
                            <option value="Electrical Service">
                              Pendawaian & Pemasangan Elektrik Industri
                            </option>
                            <option value="Aircond / HVAC">
                              Servis & Penyenggaraan Chiller / VRV
                            </option>
                            <option value="Solar Energy">
                              Penyelesaian Panel Solar PV (NEM)
                            </option>
                            <option value="Testing & Calibration">
                              Pengujian ACB, VCB & Transformer
                            </option>
                            <option value="M&E Project Tender">
                              Tender Am Kejuruteraan Mekanikal
                            </option>
                          </select>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-bold text-slate-700 uppercase">
                              Lokasi Tapak Pembinaan
                            </label>
                            <button
                              type="button"
                              onClick={handleGetGPSLocation}
                              disabled={isGettingGPS}
                              className="text-[9.5px] font-extrabold text-[#0F172A] bg-[#D4AF37]/20 hover:bg-[#D4AF37] hover:text-[#0F172A] px-2 py-0.5 rounded-md transition flex items-center gap-1 cursor-pointer"
                              title="Guna Lokasi GPS Penyemak Imbas"
                            >
                              <Navigation className="w-3 h-3 text-[#D4AF37]" />
                              <span>{isGettingGPS ? "Mengesan GPS..." : "📍 Kesan Lokasi GPS"}</span>
                            </button>
                          </div>
                          <input
                            type="text"
                            name="location"
                            required
                            value={siteLocation}
                            onChange={(e) => setSiteLocation(e.target.value)}
                            placeholder="cth: Indera Mahkota, Kuantan, Pahang"
                            className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50 font-medium"
                          />
                        </div>
                      </div>

                      {appliedVoucherCode && (
                        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between">
                          <span>🎟️ Baucar Diskaun Kesetiaan: <strong>{appliedVoucherCode}</strong></span>
                          <button
                            type="button"
                            onClick={() => setAppliedVoucherCode("")}
                            className="text-xs text-rose-600 font-bold hover:underline"
                          >
                            Padam
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                          Cadangan Had Bajet Disediakan
                        </label>
                        <input
                          type="text"
                          name="budget"
                          placeholder="Cth: RM 50,000"
                          className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                          Huraian Skop Keperluan / Mesej Khas
                        </label>
                        <textarea
                          name="message"
                          rows={4}
                          required
                          placeholder="Butiran skop pemasangan, bilangan tingkat, keperluan lukisan litar..."
                          className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37] bg-slate-50 leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                          Lampiran Resolusi / Dokumen Rujukan (Max: 800KB)
                        </label>
                        <input
                          type="file"
                          name="attachment"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 bg-white"
                        />
                      </div>

                      {/* SEPA SLOT JADUAL TEMUJANJI SERVIS (AIRCOND/ELEKTRIK) */}
                      <div className="bg-slate-50 border border-[#D4AF37]/20 p-5 rounded-2xl space-y-4 shadow-2xs">
                        <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                          <Calendar className="w-4 h-4 text-[#D4AF37]" />
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Pilih Slot Jadual Servis Temujanji (Real-time
                            Booking)
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          Pilih tarikh dan slot masa lawatan fizikal juruteknik
                          kami di bawah untuk tindakan dan pengesahan segera.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-extrabold text-slate-600 uppercase mb-1">
                              Pilih Tarikh Lawatan
                            </label>
                            <input
                              type="date"
                              name="scheduledDate"
                              value={bookingDate}
                              onChange={(e) => setBookingDate(e.target.value)}
                              min={new Date().toISOString().split("T")[0]}
                              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-white font-semibold text-slate-700 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-extrabold text-slate-600 uppercase mb-1">
                              Pilih Slot Masa Lawatan
                            </label>
                            <select
                              name="scheduledTimeSlot"
                              value={bookingTimeSlot}
                              onChange={(e) =>
                                setBookingTimeSlot(e.target.value)
                              }
                              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-white text-slate-700 font-semibold cursor-pointer"
                            >
                              <option value="">
                                -- Tiada temujanji (Pertanyaan am sahaja) --
                              </option>
                              <option value="09:00 AM - 11:00 AM">
                                09:00 AM - 11:00 AM (Pagi Awal)
                              </option>
                              <option value="11:30 AM - 01:30 PM">
                                11:30 AM - 01:30 PM (Tengah Hari)
                              </option>
                              <option value="02:30 PM - 04:30 PM">
                                02:30 PM - 04:30 PM (Lepas Zohor)
                              </option>
                              <option value="05:00 PM - 07:00 PM">
                                05:00 PM - 07:00 PM (Petang Akhir)
                              </option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center bg-white border border-[#D4AF37]/10 p-3 rounded-xl">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping shrink-0" />
                          <span className="text-[10px] text-slate-500 font-bold">
                            Ketersediaan slot dipantau secara langsung
                            (Mengekang pertindihan jadual)
                          </span>
                        </div>
                      </div>

                      {/* SYSTEM & BROWSER PUSH NOTIFICATION ENABLE SWITCH */}
                      <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex items-start gap-3 shadow-3xs">
                        <input
                          type="checkbox"
                          id="enable-status-notifications"
                          name="enableNotifications"
                          className="mt-1 w-4 h-4 rounded text-[#D4AF37] border-slate-300 focus:ring-[#D4AF37] cursor-pointer"
                          onChange={async (e) => {
                            if (e.target.checked) {
                              try {
                                if ("Notification" in window) {
                                  const permission =
                                    await Notification.requestPermission();
                                  if (permission === "granted") {
                                    new Notification("Bena Flash Global", {
                                      body: "Notifikasi browser berjaya diaktifkan! Anda akan menerima makluman langsung sekiranya status sebut harga / tempahan anda dikemaskini.",
                                      icon: "/favicon.ico",
                                    });
                                    // Play sound effect
                                    try {
                                      const AudioContextClass =
                                        window.AudioContext ||
                                        (window as any).webkitAudioContext;
                                      if (AudioContextClass) {
                                        const ctx = new AudioContextClass();
                                        const osc = ctx.createOscillator();
                                        const gain = ctx.createGain();
                                        osc.type = "sine";
                                        osc.frequency.setValueAtTime(
                                          880,
                                          ctx.currentTime,
                                        );
                                        gain.gain.setValueAtTime(
                                          0.12,
                                          ctx.currentTime,
                                        );
                                        gain.gain.exponentialRampToValueAtTime(
                                          0.001,
                                          ctx.currentTime + 0.35,
                                        );
                                        osc.connect(gain);
                                        gain.connect(ctx.destination);
                                        osc.start();
                                        osc.stop(ctx.currentTime + 0.35);
                                      }
                                    } catch (soundErr) {}
                                  } else if (permission === "denied") {
                                    alert(
                                      "Kebenaran notifikasi telah disekat. Sila benarkan notifikasi di tetapan browser anda.",
                                    );
                                  }
                                } else {
                                  alert(
                                    "Browser anda tidak menyokong notifikasi sistem.",
                                  );
                                }
                              } catch (err) {
                                console.error(
                                  "Error requesting notification permission:",
                                  err,
                                );
                              }
                            }
                          }}
                        />
                        <div className="space-y-1 text-left">
                          <label
                            htmlFor="enable-status-notifications"
                            className="block text-[10px] font-extrabold text-slate-800 uppercase tracking-wide cursor-pointer flex items-center gap-1.5"
                          >
                            <BellRing className="w-4 h-4 text-[#D4AF37] shrink-0 animate-bounce" />
                            <span>
                              Dayakan Notifikasi Browser (Enable Notifications)
                            </span>
                          </label>
                          <p className="text-[9px] text-slate-500 leading-normal">
                            Dapatkan makluman push secara langsung ke
                            peranti/browser anda apabila status tempahan anda
                            dikemaskini kepada{" "}
                            <strong className="text-slate-700">
                              "Dihubungi" (Contacted)
                            </strong>{" "}
                            atau{" "}
                            <strong className="text-slate-700">
                              "Selesai" (Completed)
                            </strong>{" "}
                            oleh Admin.
                          </p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                      >
                        Hantar Borang Sebut Harga & Jadual
                      </button>
                    </form>
                  </div>

                  {/* Contact detail sidebar */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* PUBLIC CALENDAR - FOR CUSTOMERS TO CHECK AVAILABILITY */}
                    <div className="rounded-3xl shadow-sm relative overflow-hidden">
                      <CalendarGrid
                        leads={leads}
                        isAdmin={false}
                        onSelectSlot={(date, slot) => {
                          setBookingDate(date);
                          if (slot) setBookingTimeSlot(slot);
                        }}
                        selectedDate={bookingDate}
                        selectedSlot={bookingTimeSlot}
                      />
                    </div>

                    {/* REAL-TIME BOOKING & APPOINTMENT STATUS RETRIEVER CHECKER */}
                    <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm relative overflow-hidden text-left">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#D4AF37] tracking-widest block">
                          Sistem Semakan Tapak
                        </span>
                        <h4 className="font-bold text-sm text-[#0F172A] flex items-center gap-2 mt-0.5">
                          <Calendar className="w-4 h-4 text-[#D4AF37]" />
                          Semak Status & Jadual Temujanji
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                          Masukkan ID Rujukan (e.g. <code>lead-1718919...</code>
                          ) untuk melihat status temujanji dan maklum balas
                          admin seketika.
                        </p>
                      </div>

                      <div className="space-y-3">
                                                <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={checkerId}
                            onChange={(e) => setCheckerId(e.target.value)}
                            placeholder="Masukkan ID Rujukan / No. Telefon"
                            className="flex-grow text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-slate-50 font-mono text-slate-700"
                          />
                          <div className="flex gap-2">
                            <select
                              value={checkerKawasan}
                              onChange={(e) => setCheckerKawasan(e.target.value)}
                              className="flex-grow text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-slate-50 text-slate-700"
                            >
                              <option value="">Semua Kawasan (Pilihan)</option>
                              <option value="Kuantan">Kuantan</option>
                              <option value="Pekan">Pekan</option>
                              <option value="Gambang">Gambang</option>
                              <option value="Kemaman">Kemaman</option>
                              <option value="Maran">Maran</option>
                              <option value="Temerloh">Temerloh</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => setIsQRScannerOpen(true)}
                              className="bg-[#D4AF37] hover:bg-[#b8952c] text-[#0F172A] text-[10px] font-extrabold uppercase px-3 py-2 rounded-xl transition shadow-2xs shrink-0 cursor-pointer flex items-center gap-1.5"
                              title="Imbas Kod QR / Barcode Label"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Imbas QR</span>
                            </button>
                            <button
                              onClick={() => handleCheckStatus()}
                              disabled={isChecking}
                              className="bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] hover:text-white text-[10px] font-bold uppercase px-4 rounded-xl transition shadow-2xs shrink-0 cursor-pointer disabled:opacity-55"
                            >
                              {isChecking ? "Carian..." : "Semak"}
                            </button>
                          </div>
                        </div>

                        {checkerError && (
                          <p className="p-2.5 bg-rose-50 border border-rose-105 text-rose-700 rounded-lg text-[10.5px] font-semibold leading-relaxed">
                            ⚠️ {checkerError}
                          </p>
                        )}

                        {checkedLeads.length > 0 && checkedLeads.map((checkedLead, _idx) => (
                          <motion.div
                            key={checkedLead.id}
                            initial={{ opacity: 0, y: 25, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                            className="p-4 bg-slate-50/60 border border-[#D4AF37]/35 rounded-2xl space-y-3.5 text-[11px] shadow-xs"
                          >
                            <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
                              <span className="font-bold text-slate-500 uppercase text-[8px] tracking-widest">
                                ID Rujukan:
                              </span>
                              <span className="font-mono font-bold text-[#0F172A] bg-zinc-200/50 px-2 py-0.5 rounded text-[10px]">
                                {checkedLead.id}
                              </span>
                            </div>

                            {/* Stepper Progress Bar */}
                            {renderStepper(checkedLead.status)}
                            {checkedLead.updatedAt && (
                              <div className="text-center mt-0 mb-3">
                                <span className="text-[8px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full inline-block">
                                  Dikemaskini pada: {new Date(checkedLead.updatedAt).toLocaleString('ms-MY')}
                                </span>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                              <div>
                                <span className="text-slate-400 font-bold block text-[8px] uppercase">
                                  Pelanggan:
                                </span>
                                <span className="font-bold text-slate-800">
                                  {checkedLead.name}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-bold block text-[8px] uppercase">
                                  Sesi Servis:
                                </span>
                                <span className="font-bold text-slate-800">
                                  {checkedLead.serviceType}
                                </span>
                              </div>
                            </div>

                            <div className="border-t border-dashed border-slate-200 pt-2 grid grid-cols-2 gap-2 text-[10.5px]">
                              <div>
                                <span className="text-slate-400 font-bold block text-[8px] uppercase">
                                  Pilihan Tarikh:
                                </span>
                                <span className="font-bold text-slate-800">
                                  {checkedLead.scheduledDate ||
                                    "Tidak Terjadual"}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-bold block text-[8px] uppercase">
                                  Masa Slot:
                                </span>
                                <span className="font-bold text-slate-800">
                                  {checkedLead.scheduledTimeSlot || "N/A"}
                                </span>
                              </div>
                            </div>

                            <div className="border-t border-slate-200/60 pt-2.5 space-y-1 bg-white p-3 rounded-xl border border-slate-100">
                              <span className="text-[8px] font-extrabold text-[#D4AF37] uppercase tracking-wider block">
                                Status Tindakan Admin:
                              </span>
                              <div className="pb-1">
                                <span
                                  className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                    checkedLead.status === "New"
                                      ? "bg-rose-100 text-rose-800"
                                      : checkedLead.status === "Reviewed"
                                        ? "bg-amber-100 text-amber-800"
                                        : checkedLead.status === "Contacted"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {checkedLead.status === "New"
                                    ? "Menunggu Maklumbalas"
                                    : checkedLead.status}
                                </span>
                              </div>

                              <div className="mt-1">
                                <span className="text-[8px] font-bold text-slate-400 uppercase block mt-1">
                                  Nota Khas Daripada Jurutera / Admin:
                                </span>
                                {checkedLead.adminFeedback ? (
                                  <p className="font-semibold text-slate-800 leading-relaxed bg-yellow-50/50 p-2 border border-yellow-250/30 rounded-lg mt-1 text-[11px] whitespace-pre-wrap">
                                    💬 {checkedLead.adminFeedback}
                                  </p>
                                ) : (
                                  <p className="text-slate-400 italic mt-0.5 text-[10px]">
                                    Pegawai sedang memperincikan dokumen. Sila
                                    lawati seketika lagi untuk menerima
                                    pengesahan.
                                  </p>
                                )}
                              </div>
                              {checkedLead.estimatedCompletionDate && (
                                <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                                  <span className="text-[9px] font-bold text-blue-800 uppercase tracking-wider">Tarikh Dijangka Selesai:</span>
                                  <span className="font-mono text-[10px] font-bold text-blue-900 bg-white px-2 py-1 rounded shadow-sm border border-blue-100">{checkedLead.estimatedCompletionDate}</span>
                                </div>
                              )}

                              {/* Completed Status Rating and Feedback Section */}
                              {checkedLead.status === "Completed" && (
                                <div className="border-t border-[#D4AF37]/25 pt-3 mt-3 space-y-2.5 bg-gradient-to-r from-amber-500/5 to-orange-500/10 p-3 rounded-2xl border border-amber-100/50 text-left">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9.5px] font-extrabold text-[#D4AF37] uppercase tracking-wider block">
                                      ⭐ Nilaikan Perkhidmatan Kami (Selesai!)
                                    </span>
                                  </div>
                                  <p className="text-[9px] text-slate-500 leading-relaxed">
                                    Tempahan ini telah selesai dijalankan. Sila kongsikan maklum balas ikhlas anda untuk membantu kami mengekalkan mutu kerja G2 terbaik.
                                  </p>

                                  {submittedReviews[checkedLead.id] || checkedLead.reviewed ? (
                                    <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9.5px] font-bold rounded-xl text-center">
                                      ✓ Maklum balas anda telah selamat disimpan dalam sistem Testimonial BFG. Terima kasih!
                                    </div>
                                  ) : (
                                    <div className="space-y-2.5">
                                      {/* Star rating picker */}
                                      <div className="flex items-center gap-1">
                                        <span className="text-[9.5px] font-bold text-slate-600 mr-1">Penilaian Bintang:</span>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <button
                                            key={star}
                                            type="button"
                                            onClick={() => {
                                              setRatingMap(prev => ({ ...prev, [checkedLead.id]: star }));
                                            }}
                                            className="text-base focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                                          >
                                            {star <= (ratingMap[checkedLead.id] || 5) ? "★" : "☆"}
                                          </button>
                                        ))}
                                        <span className="text-[9.5px] font-extrabold text-[#D4AF37] ml-1">
                                          ({ratingMap[checkedLead.id] || 5} / 5)
                                        </span>
                                      </div>

                                      {/* Text area */}
                                      <div>
                                        <textarea
                                          id={`review-msg-${checkedLead.id}`}
                                          rows={2}
                                          placeholder="Tulis ulasan ringkas mengenai kerja pendawaian, kebersihan, atau kepantasan teknisyen kami..."
                                          className="w-full text-[10.5px] p-2 border border-slate-300 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#D4AF37]"
                                        />
                                      </div>

                                      {/* Submit */}
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          const textarea = document.getElementById(`review-msg-${checkedLead.id}`) as HTMLTextAreaElement;
                                          const feedbackText = textarea?.value?.trim() || "Perkhidmatan BenaFlash Global sangat cemerlang, pantas, dan profesional!";
                                          const ratingVal = ratingMap[checkedLead.id] || 5;

                                          try {
                                            const testimonialId = `test-${Date.now()}`;
                                            const newTestimonial = {
                                              id: testimonialId,
                                              clientName: checkedLead.name,
                                              clientCompany: checkedLead.companyName || "Pelanggan Kediaman",
                                              feedback: feedbackText,
                                              rating: ratingVal,
                                              date: new Date().toLocaleDateString("ms-MY"),
                                              userId: checkedLead.email,
                                              verified: true, // Auto-verified to make it show in Testimonial immediately
                                            };

                                            // Save to Firestore 'testimonials' collection
                                            await setDoc(doc(db, "testimonials", testimonialId), newTestimonial);

                                            // Mark lead as reviewed in Firestore
                                            await updateDoc(doc(db, "leads", checkedLead.id), { reviewed: true });

                                            // Update local state
                                            setSubmittedReviews(prev => ({ ...prev, [checkedLead.id]: true }));
                                            
                                            // Append to local testimonials state
                                            setTestimonials(prev => [newTestimonial, ...prev]);

                                            alert("Ribuan terima kasih! Maklum balas anda telah direkodkan.");
                                          } catch (err) {
                                            console.error("Gagal menghantar testimoni", err);
                                            alert("Ralat: Tidak dapat menghantar maklum balas.");
                                          }
                                        }}
                                        className="w-full py-1.5 bg-[#D4AF37] hover:bg-amber-600 text-slate-950 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition cursor-pointer"
                                      >
                                        Hantar Ulasan Servis
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* KOD QR STATIK & MUAT TURUN PDF */}
                            <div className="bg-white p-3 rounded-xl border border-amber-200/80 space-y-2 text-center mt-3">
                              <div className="flex items-center justify-center gap-1.5 text-[#D4AF37]">
                                <QrCode className="w-4 h-4" />
                                <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#0F172A]">
                                  Kod QR Salinan Resit & Temujanji (PDF)
                                </span>
                              </div>
                              <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-200/80">
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                                    `https://www.bfgplt.com/?status_id=${checkedLead.id}&name=${encodeURIComponent(checkedLead.name)}&service=${encodeURIComponent(checkedLead.serviceType)}`
                                  )}`}
                                  alt="Kod QR Tempahan"
                                  className="w-24 h-24 object-contain rounded-md border border-slate-200 bg-white p-1 shadow-2xs"
                                  loading="lazy"
                                />
                                <span className="text-[8.5px] font-mono text-slate-500 mt-1 font-bold">
                                  ID: {checkedLead.id}
                                </span>
                              </div>
                              <p className="text-[9px] text-slate-500 leading-tight">
                                Imbas kod QR di atas melalui peranti pintar anda untuk memuat turun salinan dokumen rasmi BFG.
                              </p>
                              <button
                                onClick={() => handleCetak(checkedLead)}
                                className="w-full py-2 bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] hover:text-white rounded-xl text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Muat Turun Salinan PDF Tempahan
                              </button>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[#D4AF37]/20">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleCetak(checkedLead)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border border-slate-200 hover:border-[#D4AF37] text-slate-600 hover:text-[#0F172A] rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                                  title="Cetak Salinan PDF"
                                >
                                  <Printer className="w-3.5 h-3.5" /> Cetak PDF
                                </button>
                                <button
                                  onClick={() => handleKongsi(checkedLead)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                                  title="Kongsi Pautan"
                                >
                                  <Share2 className="w-3.5 h-3.5" /> Kongsi
                                </button>
                              </div>
                              <button
                                onClick={() => {
                                  const text = encodeURIComponent(`Hai admin BFG, saya ingin bertanya tentang status permohonan sebut harga saya.\n\nID Rujukan: ${checkedLead.id}\nStatus: ${checkedLead.status}`);
                                  window.open(`https://api.whatsapp.com/send?phone=60136269226&text=${text}`, '_blank');
                                }}
                                className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                                title="Tanya Admin di WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> Tanya Status di WhatsApp
                              </button>
                              {checkedLead.scheduledDate && (
                                <button
                                  onClick={() => handleAddCalendar(checkedLead)}
                                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                                  title="Simpan Tarikh ke Google Calendar"
                                >
                                  <CalendarPlus className="w-3.5 h-3.5" /> Simpan Ke Kalendar
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Loyalty Points & Rewards System */}
                      <LoyaltyRewardsPortal
                        customerName={checkedLeads[0]?.name}
                        customerPhoneOrEmail={checkedLeads[0]?.email || checkedLeads[0]?.id}
                        bookingCount={checkedLeads.length}
                        onApplyVoucherCode={(code) => {
                          setAppliedVoucherCode(code);
                          alert(`Baucar ${code} berjaya ditebus! Sila gunakan kod ini pada borang sebut harga/tempahan.`);
                        }}
                      />
                    </div>

                    {/* Quick Card info */}
                    <div className="bg-[#0F172A] p-6 rounded-2xl text-white border border-slate-800 space-y-4">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-[#D4AF37]">
                        Komunikasi Terbuka
                      </span>
                      <h4 className="font-bold text-lg font-heading">
                        Pejabat Urusan Utama
                      </h4>

                      <div className="space-y-3 pt-2 text-xs">
                        <div className="flex gap-3">
                          <MapPin className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                          <span className="text-slate-350 font-normal leading-relaxed">
                            {companyInfo.address}
                          </span>
                        </div>
                        <div className="flex gap-3 items-center">
                          <Phone className="w-4 h-4 text-[#D4AF37]" />
                          <a
                            href={`tel:${companyInfo.phone}`}
                            className="hover:underline font-bold text-white"
                          >
                            {companyInfo.phone}
                          </a>
                        </div>
                        <div className="flex gap-3 items-center">
                          <Mail className="w-4 h-4 text-[#D4AF37]" />
                          <a
                            href={`mailto:${companyInfo.email}`}
                            className="hover:underline text-slate-350"
                          >
                            {companyInfo.email}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Interactive floating FAQ */}
                    <div className="bg-white border rounded-2xl p-6 shadow-xs space-y-4">
                      <h4 className="font-bold text-slate-900 text-sm border-l-4 border-[#D4AF37] pl-2">
                        Soalan Lazim (FAQ)
                      </h4>

                      <div className="space-y-3 text-xs">
                        {faqs.map((faq) => (
                          <div
                            key={faq.id}
                            className="p-3 bg-slate-50 rounded-lg"
                          >
                            <span className="font-bold block text-slate-700">
                              S: {faq.question}
                            </span>
                            <p className="text-slate-500 mt-1">
                              J: {faq.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CUSTOMER PORTAL TAB VIEW */}
            {activeTab === "customer-portal" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <CustomerPortal
                  lang={lang}
                  onRedirectToContact={() => setActiveTab("contact")}
                  customRates={aircondRates}
                />
              </motion.div>
            )}

            {/* ADMIN PORTAL PANEL TARGET (CMS & REAL TIME DATA MANAGER) */}
            {activeTab === "admin" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {!isLoggedIn ? (
                  /* LOGIN FORM CASE */
                  <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl mt-12">
                    <div className="bg-[#0F172A] text-white p-8 text-center relative">
                      <div className="w-12 h-12 bg-white/5 mx-auto flex items-center justify-center rounded-xl border border-[#D4AF37]/50 mb-3 rotate-6">
                        <Lock className="w-6 h-6 text-[#D4AF37]" />
                      </div>
                      <h3 className="text-base font-extrabold tracking-widest font-heading uppercase text-white">
                        SISTEM KAWALAN HALAMAN ADMIN
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">
                        BENA FLASH GLOBAL | M&E G2 PENGURUSAN DATA
                      </p>
                    </div>

                    <div className="p-8 space-y-5 text-xs">
                      {loginError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center justify-between gap-2">
                          <span>{loginError}</span>
                        </div>
                      )}

                      {/* Secure Login Header Notice */}
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-[#D4AF37] flex items-center justify-center flex-shrink-0">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div className="text-[11px] text-slate-600">
                          <p className="font-bold text-slate-900">Portal Akses Terkawal</p>
                          <p className="text-[10px] text-slate-500">Masukkan nama pengguna / e-mel dan kata laluan pengurusan yang sah.</p>
                        </div>
                      </div>

                      <form
                        onSubmit={handleLoginSubmit}
                        className="space-y-4 text-left mt-2"
                      >
                        <div>
                          <label className="block font-bold text-slate-700 uppercase mb-1 text-[10px]">
                            Nama Pengguna / E-mel
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="E-mel Rasmi Syarikat (admin@bfgplt.com)"
                            value={adminUser.username}
                            onChange={(e) =>
                              setAdminUser((prev) => ({
                                ...prev,
                                username: e.target.value,
                              }))
                            }
                            className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-slate-50 font-semibold text-xs text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 uppercase mb-1 text-[10px]">
                            Kata Laluan
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              placeholder="••••••••••••"
                              value={adminUser.password}
                              onChange={(e) =>
                                setAdminUser((prev) => ({
                                  ...prev,
                                  password: e.target.value,
                                }))
                              }
                              className="w-full p-3 pr-10 border border-slate-300 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-slate-50 font-mono text-xs text-slate-800"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                              title={showPassword ? "Sembunyikan Kata Laluan" : "Tunjukkan Kata Laluan"}
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-[#0F172A] text-[#D4AF37] hover:bg-slate-800 py-3.5 rounded-xl font-bold uppercase tracking-wider transition shadow-sm cursor-pointer text-[11px] mt-2 flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4 text-[#D4AF37]" />
                          <span>Log Masuk Sistem Admin</span>
                        </button>

                        <div className="relative my-4 flex py-2 items-center">
                          <div className="flex-grow border-t border-slate-200"></div>
                          <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            Atau
                          </span>
                          <div className="flex-grow border-t border-slate-200"></div>
                        </div>

                        <button
                          type="button"
                          onClick={handleGoogleOneTapLogin}
                          className="w-full bg-white border border-slate-300 hover:border-slate-800 text-slate-700 hover:text-slate-900 py-3 rounded-xl font-bold uppercase tracking-wider transition shadow-2xs flex items-center justify-center gap-2 text-[11px] cursor-pointer"
                        >
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                            <path
                              fill="#EA4335"
                              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                            ></path>
                            <path
                              fill="#4285F4"
                              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                            ></path>
                            <path
                              fill="#FBBC05"
                              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                            ></path>
                            <path
                              fill="#34A853"
                              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                            ></path>
                          </svg>
                          <span>Log Masuk dengan Google Workspace</span>
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  /* LOGGED IN VIEW */
                  <div className="space-y-6">
                    {/* Top Welcome Title Banner */}
                    <div className="bg-[#0F172A] text-white p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#D4AF37]">
                            Sistem Pengurusan Kandungan
                          </span>
                          <span className="bg-green-600 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase antialiased">
                            {loggedInRole} AUTHORIZED
                          </span>
                        </div>
                        <h2 className="text-xl font-bold mt-1">
                          Selamat Datang, Pegawai Pengurus BFG
                        </h2>
                        <p className="text-xs text-slate-300">
                          Gred G2 Kejuruteraan • Status Sambungan Pintar Google
                          Sheet
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={async () => {
                            try {
                              await signOut(auth);
                            } catch (e) {
                              console.warn(e);
                            }
                            setIsLoggedIn(false);
                            setIsAdminMode(false);
                            localStorage.removeItem("bfg_admin_logged_in");
                            setActiveTab("home");
                          }}
                          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition"
                        >
                          Keluar Portal
                        </button>
                      </div>
                    </div>

                    {/* Real-time Notifications Bar */}
                    {(leads.filter((l) => l.status === "New").length > 0 ||
                      applications.length > 0) && (
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-600 shrink-0 animate-pulse">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              Peti Notifikasi Masuk (Real-time M&E Hub)
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {leads.filter((l) => l.status === "New").length >
                                0 &&
                                `● ${leads.filter((l) => l.status === "New").length} Sebut Harga Baru `}
                              {applications.length > 0 &&
                                `● ${applications.length} Calon Kerjaya Diterima`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {leads.filter((l) => l.status === "New").length >
                            0 && (
                            <button
                              onClick={() => setAdminActiveSection("leads")}
                              className="bg-rose-600 text-white hover:bg-rose-700 text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg transition"
                            >
                              Semak Sebut Harga
                            </button>
                          )}
                          {applications.length > 0 && (
                            <button
                              onClick={() => setAdminActiveSection("careers")}
                              className="bg-[#0F172A] text-[#D4AF37] hover:bg-slate-800 text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg transition"
                            >
                              Semak Calon
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Role-Based restrictions indicator warning warning */}
                    {loggedInRole !== UserRole.SUPER_ADMIN && (
                      <div className="bg-amber-100 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs flex gap-2 items-center font-medium">
                        <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
                        <span>
                          Nota: Anda masuk sebagai {loggedInRole}. Hak istimewa
                          pengauditan dilaraskan melainkan Super Admin
                          mengaktifkan selarasan penuh Google Sheet.
                        </span>
                      </div>
                    )}

                    {/* CMS Horizontal Tab Selector */}
                    <div className="flex flex-wrap items-center gap-2 select-none border-b border-slate-200 pb-3">
                      {[
                        {
                          id: "dashboard",
                          label: "Analitis & Apps-Script",
                          roles: [
                            UserRole.SUPER_ADMIN,
                            UserRole.ADMIN,
                            UserRole.PROJECT_MANAGER,
                          ],
                        },
                        {
                          id: "financial",
                          label: "Ringkasan Kewangan",
                          roles: [
                            UserRole.SUPER_ADMIN,
                            UserRole.ADMIN,
                            UserRole.FINANCE,
                            UserRole.PROJECT_MANAGER,
                          ],
                        },
                        {
                          id: "info",
                          label: "Slogan & Profil",
                          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
                        },
                        {
                          id: "services",
                          label: "Pengurusan Servis",
                          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
                        },
                        {
                          id: "calculator",
                          label: "Kalkulator Aircond",
                          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
                        },
                        {
                          id: "projects",
                          label: "Halaman Projek G2",
                          roles: [
                            UserRole.SUPER_ADMIN,
                            UserRole.ADMIN,
                            UserRole.PROJECT_MANAGER,
                          ],
                        },
                        {
                          id: "certifications",
                          label: "Sijil & Lesen G2",
                          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
                        },
                        {
                          id: "calendar",
                          label: "Jadual Temujanji",
                          roles: [
                            UserRole.SUPER_ADMIN,
                            UserRole.ADMIN,
                            UserRole.PROJECT_MANAGER,
                          ],
                        },
                        {
                          id: "leads",
                          label: "Peti Sebut Harga",
                          roles: [
                            UserRole.SUPER_ADMIN,
                            UserRole.ADMIN,
                            UserRole.FINANCE,
                          ],
                        },
                        {
                          id: "careers",
                          label: "Kerjaya & Calon",
                          roles: [
                            UserRole.SUPER_ADMIN,
                            UserRole.ADMIN,
                            UserRole.HR,
                          ],
                        },
                        {
                          id: "blogs",
                          label: "SEO Blog M&E",
                          roles: [
                            UserRole.SUPER_ADMIN,
                            UserRole.ADMIN,
                            UserRole.TECHNICIAN,
                          ],
                        },
                        {
                          id: "faqs",
                          label: "Soalan Lazim (FAQ)",
                          roles: [
                            UserRole.SUPER_ADMIN,
                            UserRole.ADMIN,
                            UserRole.PROJECT_MANAGER,
                          ],
                        },
                        {
                          id: "testimonials",
                          label: "Maklum Balas (Testimonials)",
                          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
                        },
                        {
                          id: "inventory",
                          label: "Inventori Bahan",
                          roles: [
                            UserRole.SUPER_ADMIN,
                            UserRole.ADMIN,
                            UserRole.PROJECT_MANAGER,
                            UserRole.TECHNICIAN,
                          ],
                        },
                        {
                          id: "backups",
                          label: "Durable Backups",
                          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
                        },
                        {
                          id: "workspace",
                          label: "Google Workspace",
                          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
                        },
                        {
                          id: "sheets",
                          label: "Sistem Google Sheets",
                          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
                        },
                      ]
                        .filter((item) => item.roles.includes(loggedInRole))
                        .map((tab) => {
                          const isLeads = tab.id === "leads";
                          const isCareers = tab.id === "careers";
                          const newLeadsCount = leads.filter(
                            (l) => (l.status || "New") === "New",
                          ).length;
                          const totalAppsCount = applications.length;
                          const newAppsCount = applications.filter(
                            (app) => (app.status || "New") === "New",
                          ).length;

                          return (
                            <button
                              key={tab.id}
                              onClick={() => setAdminActiveSection(tab.id)}
                              className={`text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                                adminActiveSection === tab.id
                                  ? "bg-[#D4AF37] text-slate-900 border border-[#D4AF37]"
                                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              <span>{tab.label}</span>
                              {isLeads && newLeadsCount > 0 && (
                                <span className="bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                                  {newLeadsCount} BARU
                                </span>
                              )}
                              {isCareers && totalAppsCount > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="bg-[#0F172A] text-[#D4AF37] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center justify-center shadow-xs">
                                    {totalAppsCount} CALON
                                  </span>
                                  {newAppsCount > 0 && (
                                    <span className="bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                                      {newAppsCount} BARU
                                    </span>
                                  )}
                                </div>
                              )}
                            </button>
                          );
                        })}
                    </div>

                    {/* ACTIVE SECTION RENDERER */}
                    <div className="pt-2">
                      {isLoading ? (
                        <div className="animate-pulse space-y-6">
                          <div className="h-12 bg-slate-200 rounded-2xl w-1/3 mb-6"></div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="h-40 bg-slate-200 rounded-2xl"></div>
                            <div className="h-40 bg-slate-200 rounded-2xl"></div>
                            <div className="h-40 bg-slate-200 rounded-2xl"></div>
                          </div>
                          <div className="h-64 bg-slate-200 rounded-2xl w-full mt-6"></div>
                        </div>
                      ) : (
                        <>
                          {adminActiveSection === "calendar" && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6"
                            >
                              <div className="border-b border-slate-100 pb-4">
                                <h3 className="font-bold text-[#0F172A] text-lg">
                                  Jadual Temujanji Pasukan M&E
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                  Paparan kesemua slot temujanji yang telah
                                  ditempah. Slot yang dipilih akan dikemaskini
                                  secara automatik.
                                </p>
                              </div>
                              <CalendarGrid leads={leads} isAdmin={true} />
                            </motion.div>
                          )}

                          {adminActiveSection === "financial" && (
                            <FinancialSummary leads={leads} projects={projects} />
                          )}

                          {adminActiveSection === "dashboard" && (
                            <AnalyticsDash
                              projects={projects}
                              leads={leads}
                              careers={careers}
                              blogs={blogs}
                              applications={applications}
                              activityLogs={activityLogs}
                              isLoading={isLoading}
                            />
                          )}

                          {adminActiveSection === "info" && (
                            <CompanyProfileEdit
                              info={companyInfo}
                              onSave={handleSaveCompanyInfo}
                              clientLogos={clientLogos}
                              onSaveClientLogos={handleSaveClientLogos}
                              staff={staff}
                              onSaveStaff={handleSaveStaff}
                            />
                          )}

                          {adminActiveSection === "services" && (
                            <ServiceManage services={services} />
                          )}

                          {adminActiveSection === "calculator" && (
                            <AircondRatesManage rates={aircondRates} />
                          )}

                          {adminActiveSection === "projects" && (
                            <ProjectManage
                              projects={projects}
                              onAdd={handleAddProject}
                              onEdit={handleEditProject}
                              onDelete={handleDeleteProject}
                            />
                          )}

                          {adminActiveSection === "certifications" && (
                            <CertificationManage
                              certifications={certifications}
                              onSave={handleSaveCertifications}
                            />
                          )}

                          {adminActiveSection === "leads" && (
                            <LeadInbox
                              leads={leads}
                              onStatusChange={handleLeadStatusChange}
                              onFeedbackChange={handleLeadFeedbackChange}
                              onUpdateField={handleUpdateLeadField}
                              onDelete={handleDeleteLead}
                            />
                          )}

                          {adminActiveSection === "careers" && (
                            <CareerManage
                              careers={careers}
                              applications={applications}
                              onAddCareer={handleAddCareer}
                              onEditCareer={handleEditCareer}
                              onDeleteCareer={handleDeleteCareer}
                              onAddApplication={handleAddApplication}
                              onEditApplication={handleEditApplication}
                              onDeleteApplication={handleDeleteApplication}
                            />
                          )}

                          {adminActiveSection === "testimonials" && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8"
                            >
                              <TestimonialManage
                                testimonials={testimonials}
                                onUpdate={async (id, data) => {
                                  const docRef = doc(db, "testimonials", id);
                                  if (auth.currentUser)
                                    await _updateDoc(docRef, data);
                                }}
                                onDelete={async (id) => {
                                  const docRef = doc(db, "testimonials", id);
                                  if (auth.currentUser)
                                    await _deleteDoc(docRef);
                                }}
                              />
                            </motion.div>
                          )}

                          {adminActiveSection === "blogs" && (
                            <BlogManage
                              blogs={blogs}
                              readerLogs={blogReaderLogs}
                              onAdd={handleAddBlog}
                              onEdit={handleEditBlog}
                              onDelete={handleDeleteBlog}
                            />
                          )}

                          {adminActiveSection === "workspace" && (
                            <WorkspaceIntegrations />
                          )}

                          {adminActiveSection === "inventory" && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8"
                            >
                              <InventoryManage projects={projects} />
                            </motion.div>
                          )}

                          {adminActiveSection === "backups" && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8"
                            >
                              <BackupDashboard />
                            </motion.div>
                          )}

                          {adminActiveSection === "sheets" && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8"
                            >
                              <SheetsIntegrationControl
                                projects={projects}
                                testimonials={testimonials}
                                leads={leads}
                                careers={careers}
                                blogs={blogs}
                                applications={applications}
                              />
                            </motion.div>
                          )}

                          {adminActiveSection === "faqs" && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8"
                            >
                              <FAQManage
                                faqs={faqs}
                                onAdd={handleAddFaq}
                                onEdit={handleEditFaq}
                                onDelete={handleDeleteFaq}
                              />
                            </motion.div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </React.Suspense>
      </main>

      {/* 3. FOOTER CORNER SECTION (HAK CIPTA & STATUS INTEGRASI & WHATSAPP) */}
      <footer className="mt-24 bg-[#0F172A] border-t-4 border-[#D4AF37] pt-16 pb-8 px-6 text-slate-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-slate-800 pb-12">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <div className="w-auto h-12 flex items-center justify-start rounded">
              <img
                src="https://i.ibb.co/6c1Xgxr4/BENA.png"
                alt="Bena Flash Global Logo"
                className="h-full w-auto object-contain brightness-0 invert"
                width="120"
                height="48"
                loading="lazy"
                decoding="async"
              />
            </div>
            <p className="text-xs leading-relaxed text-slate-400 font-medium">
              Syarikat perkongsian liabiliti terhad bumiputera yang komited
              dalam memberikan perkhidmatan bertaraf tinggi berasaskan
              keselamatan, kebolehgunaan, dan kualiti optimum bagi litar
              elektrik serta sistem pendingin hawa.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">
                LIVE SINKRONISASI APPS SCRIPT
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-6">
            <h4 className="text-white font-bold tracking-wider uppercase text-sm border-b border-[#D4AF37]/30 pb-3 inline-block">
              Pautan Pantas
            </h4>
            <ul className="space-y-3 text-xs font-semibold tracking-wide">
              <li>
                <button
                  onClick={() => {
                    setActiveTab("home");
                    window.scrollTo(0, 0);
                  }}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Utama
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("about");
                    window.scrollTo(0, 0);
                  }}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Tentang Kami
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("services");
                    window.scrollTo(0, 0);
                  }}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Perkhidmatan
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("projects");
                    window.scrollTo(0, 0);
                  }}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Projek Lulus CIDB
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("blog");
                    window.scrollTo(0, 0);
                  }}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Artikel M&E
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("contact");
                    window.scrollTo(0, 0);
                  }}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Hubungi Kami
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2.5: SEO Local Service Links */}
          <div className="space-y-6">
            <h4 className="text-white font-bold tracking-wider uppercase text-sm border-b border-[#D4AF37]/30 pb-3 inline-block">
              Kawasan & Servis Tumpuan
            </h4>
            <ul className="space-y-3 text-xs font-semibold tracking-wide">
              <li>
                <button
                  onClick={() => {
                    setActiveTab("elektrik-kuantan");
                    window.scrollTo(0, 0);
                  }}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Kontraktor Elektrik Kuantan
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("aircond-kuantan");
                    window.scrollTo(0, 0);
                  }}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Servis Aircond Kuantan
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("elektrik-pekan");
                    window.scrollTo(0, 0);
                  }}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Kontraktor Elektrik Pekan
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("aircond-pekan");
                    window.scrollTo(0, 0);
                  }}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Servis Aircond Pekan
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("db-box");
                    window.scrollTo(0, 0);
                  }}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Upgrade DB Box Kuantan
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("blackout");
                    window.scrollTo(0, 0);
                  }}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Troubleshoot Blackout
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("meter-tnb");
                    window.scrollTo(0, 0);
                  }}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Permohonan Meter TNB Pahang
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Location Map */}
          <div className="space-y-6">
            <h4 className="text-white font-bold tracking-wider uppercase text-sm border-b border-[#D4AF37]/30 pb-3 inline-block">
              Lokasi & Hubungan
            </h4>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyInfo.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center w-full h-24 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-all mb-4 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <MapPin className="w-6 h-6 text-[#D4AF37] mb-2 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Buka di Google Maps
              </span>
              <span className="text-[9px] text-slate-400 mt-1">
                Lihat lokasi pejabat kami
              </span>
            </a>

            <ul className="space-y-4 text-xs">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">
                  {companyInfo.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="font-medium">{companyInfo.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="font-medium">{companyInfo.email}</span>
              </li>
              <li className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href={companyInfo.ecommerceLink}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:text-white transition-colors"
                >
                  Portal E-Commerce Bukku
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Accreditation */}
          <div className="space-y-6">
            <h4 className="text-white font-bold tracking-wider uppercase text-sm border-b border-[#D4AF37]/30 pb-3 inline-block">
              Perakuan & Lesen
            </h4>
            <div className="grid grid-cols-2 gap-3 opacity-80">
              <div className="bg-white/5 border border-white/10 p-3 rounded text-center">
                <Award className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
                <span className="text-[9px] font-bold uppercase tracking-wider block">
                  CIDB G2
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded text-center">
                <Award className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
                <span className="text-[9px] font-bold uppercase tracking-wider block">
                  ST Kelas C
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded text-center">
                <Award className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
                <span className="text-[9px] font-bold uppercase tracking-wider block">
                  MOF
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded text-center items-center flex justify-center flex-col">
                <ShieldCheck className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
                <span className="text-[9px] font-bold uppercase tracking-wider block">
                  Bumiputera
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-500">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <span>
              Copyright &copy; {new Date().getFullYear()} {companyInfo.name}
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span>NO PENDAFTARAN SSM: 202304002617 (LLP0036568-LGN)</span>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <a href="#" className="hover:text-white transition-colors">
              Terma Syarat
            </a>
            <span className="text-slate-700">|</span>
            <a href="#" className="hover:text-white transition-colors">
              Polisi Privasi
            </a>
          </div>
        </div>
      </footer>

      {/* FLOATING ACTION TRIGGER (BOTTOM RIGHT corner WHATSAPP FAB & SCROLL TO TOP) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-end select-none">
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 15 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              whileHover={{ scale: 1.1, translateY: -2 }}
              whileTap={{ scale: 0.9 }}
              className="bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] border-2 border-[#D4AF37]/60 p-3.5 rounded-full shadow-2xl transition duration-200 cursor-pointer flex items-center justify-center group"
              title="Kembali Ke Atas"
              aria-label="Scroll to top"
            >
              <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>

        <motion.a
          href="https://wa.me/601162995904?text=Salam%20Bena%20Flash%20Global%20PLT%20M%26E%20Engineering%20G2%2C%20saya%20berminat%20untuk%20lawatan%20tapak%20dan%20sebut%20harga."
          target="_blank"
          rel="noreferrer"
          initial={{ scale: 0, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.3,
          }}
          whileHover={{ scale: 1.1, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#25D366] text-white font-extrabold uppercase text-xs tracking-wider px-5 py-3.5 rounded-full flex items-center gap-2 shadow-2xl hover:bg-[#20ba5a] transition duration-200 border border-[#1ebd53]"
        >
          {/* High-fidelity custom WhatsApp SVG */}
          <svg
            className="w-5 h-5 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
          </svg>
          <span>Mesej WhatsApp</span>
        </motion.a>
      </div>

      {/* OVERLAY MODAL: PROJECT DETAIL VISUALIZER */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 bg-[#0F172A]/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border"
            >
                            <div className="relative h-64 bg-slate-100 cursor-pointer" onClick={() => setLightboxState({ images: [selectedProject.img, ...(selectedProject.imgBefore ? [selectedProject.imgBefore] : []), ...(selectedProject.images || [])], index: 0 })}>
                <img
                  src={optWebp(selectedProject.img)}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  width="800"
                  height="400"
                />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 p-2 bg-[#0F172A] text-[#D4AF37] hover:text-white rounded-full shadow-md font-bold transition"
                >
                  ✕
                </button>
                <span className="absolute bottom-4 left-4 bg-[#0F172A] text-[#D4AF37] text-[10px] font-extrabold px-3 py-1.5 rounded uppercase">
                  {selectedProject.category}
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Client: {selectedProject.client}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] font-heading">
                    {selectedProject.title}
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold py-2">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="block text-slate-400 text-[9px] uppercase">
                      Lokasi Projek
                    </span>
                    <span className="text-slate-700">
                      {selectedProject.location}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="block text-slate-400 text-[9px] uppercase">
                      Nilai Kontrak
                    </span>
                    <span className="text-[#0F172A] font-extrabold">
                      {selectedProject.value || "Tender G7"}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="block text-slate-400 text-[9px] uppercase">
                      Tarikh Siap
                    </span>
                    <span className="text-slate-700">
                      {selectedProject.completionDate}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="block text-slate-400 text-[9px] uppercase">
                      Status Projek
                    </span>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 mt-0.5 rounded ${
                      selectedProject.status === "Completed" || selectedProject.status === "Siap"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                    }`}>
                      {selectedProject.status || "Siap"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-extrabold text-slate-400 uppercase tracking-widest text-[9px]">
                    Ulasan Skop Teknikal
                  </span>
                  <p className="text-slate-600 leading-relaxed font-sans font-medium">
                    {selectedProject.description}
                  </p>
                </div>

                
                {selectedProject.images &&
                  selectedProject.images.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-[13px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-4 border-l-4 border-[#D4AF37] pl-3">
                        {lang === "MS" ? "Galeri Projek" : "Project Gallery"}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedProject.images.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-100 rounded-lg overflow-hidden aspect-video border border-slate-200 hover:shadow-lg transition cursor-pointer"
                            onClick={() => setLightboxState({ images: [selectedProject.img, ...(selectedProject.imgBefore ? [selectedProject.imgBefore] : []), ...(selectedProject.images || [])], index: (selectedProject.imgBefore ? 2 : 1) + idx })}
                          >
                            <img
                              src={optWebp(imgUrl)}
                              alt={`${selectedProject.title} ${idx + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedProject.documents &&
                  selectedProject.documents.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <span className="font-extrabold text-slate-400 uppercase tracking-widest text-[9px]">
                        Dokumen / Laporan Tapak (Site Diary)
                      </span>
                      <div className="flex flex-col gap-2">
                        {selectedProject.documents.map((docUrl, idx) => (
                          <a
                            key={idx}
                            href={docUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-[#0F172A] font-bold underline truncate"
                          >
                            &#128196; Buka Fail Laporan {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="pt-4 border-t flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="border border-slate-200 text-slate-600 hover:bg-slate-100 px-4 py-2 text-xs font-bold uppercase rounded-lg transition"
                  >
                    Tutup Maklumat
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProject(null);
                      setActiveTab("contact");
                    }}
                    className="bg-[#D4AF37] hover:bg-[#b8952c] text-white px-5 py-2 rounded-lg text-xs font-bold uppercase transition"
                  >
                    Pertanyaan Serupa
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY MODAL: EDUCATIONAL BLOG ARTICLE READER */}
      <AnimatePresence>
        {selectedBlog && (
          <div className="fixed inset-0 bg-[#0F172A]/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto overflow-x-hidden shadow-2xl border"
            >
              <div className="relative h-56 bg-slate-100">
                <img
                  src={optWebp(selectedBlog.img)}
                  alt={selectedBlog.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  width="800"
                  height="400"
                />
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="absolute top-4 right-4 p-2 bg-[#0F172A] text-white hover:text-[#D4AF37] rounded-full shadow-md font-bold transition"
                >
                  ✕
                </button>
                <span className="absolute bottom-4 left-4 bg-[#0F172A] text-[#D4AF37] text-[10px] font-extrabold px-3 py-1.5 rounded uppercase">
                  {selectedBlog.category}
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Clock className="w-4 h-4" />
                    <span>Masa Membaca: {selectedBlog.readTime}</span>
                    <span>•</span>
                    <span>Diterbitkan: {selectedBlog.date}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] font-heading leading-snug">
                    {selectedBlog.title}
                  </h3>
                </div>

                <div className="text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed font-sans text-justify">
                  {/* Parse content into paragraphs */}
                  {selectedBlog.content.split("\n\n").map((para, pIdx) => (
                    <p key={pIdx} className="font-medium">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Extra Images */}
                {selectedBlog.images && selectedBlog.images.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {selectedBlog.images.map((imgUrl, i) => (
                      <img
                        key={i}
                        src={optWebp(imgUrl)}
                        alt={`${selectedBlog.title} - Imej Tambahan ${i + 1}`}
                        className="w-full h-48 object-cover rounded-xl shadow-sm border"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        width="400"
                        height="300"
                      />
                    ))}
                  </div>
                )}

                {/* Website Link Banner */}
                {selectedBlog.websiteUrl && (
                  <div className="bg-amber-50/80 border border-[#D4AF37]/50 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#D4AF37]/20 rounded-xl text-[#0F172A]">
                        <Globe className="w-5 h-5 text-[#0F172A]" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#0F172A] uppercase">
                          Pautan Website Rujukan Artikel
                        </p>
                        <p className="text-[11px] text-slate-600 font-mono truncate max-w-xs">
                          {selectedBlog.websiteUrl}
                        </p>
                      </div>
                    </div>
                    <a
                      href={selectedBlog.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                    >
                      <span>Lawati Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Social Share Bar */}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#D4AF37]" />
                    Kongsikan Artikel Ini:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleShare("whatsapp", selectedBlog)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-bold rounded-lg shadow-xs hover:shadow-sm transition cursor-pointer"
                    >
                      <span className="font-extrabold">WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleShare("telegram", selectedBlog)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0088cc] hover:bg-[#0077b3] text-white text-[11px] font-bold rounded-lg shadow-xs hover:shadow-sm transition cursor-pointer"
                    >
                      <span className="font-extrabold">Telegram</span>
                    </button>
                    <button
                      onClick={() => handleShare("facebook", selectedBlog)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white text-[11px] font-bold rounded-lg shadow-xs hover:shadow-sm transition cursor-pointer"
                    >
                      <span className="font-extrabold">Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare("twitter", selectedBlog)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1DA1F2] hover:bg-[#1a94e0] text-white text-[11px] font-bold rounded-lg shadow-xs hover:shadow-sm transition cursor-pointer"
                    >
                      <span className="font-extrabold">X / Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare("copy", selectedBlog)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg border border-slate-200 transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>{copiedBlogId === selectedBlog.id ? "Telah Disalin!" : "Salin Pautan"}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-xs text-slate-400 font-semibold">
                    Penulis Bertauliah:{" "}
                    <strong className="text-slate-600 font-bold">
                      {selectedBlog.author}
                    </strong>
                  </span>

                  <button
                    onClick={() => setSelectedBlog(null)}
                    className="bg-[#0F172A] text-white hover:bg-slate-800 px-5 py-2.5 text-xs font-bold uppercase rounded-lg transition"
                  >
                    Selesai Membaca
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY MODAL: DOCUMENT READER / VIEWER */}
      <AnimatePresence>
        {activeDocReader && (
          <React.Suspense
            fallback={
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/75 backdrop-blur-xs text-white">
                Memuatkan...
              </div>
            }
          >
            <DocReader
              title={activeDocReader.title}
              sub={activeDocReader.sub}
              sections={activeDocReader.sections}
              imageUrl={activeDocReader.imageUrl}
              pdfUrl={activeDocReader.pdfUrl}
              onClose={() => setActiveDocReader(null)}
            />
          </React.Suspense>
        )}
      </AnimatePresence>

      {/* OVERLAY MODAL: CAREER APPLY SUBMISSION */}
      <AnimatePresence>
        {activeJobApply && (
          <React.Suspense
            fallback={
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/75 backdrop-blur-xs text-white">
                Memuatkan...
              </div>
            }
          >
            <CareerApplicationModal
              job={activeJobApply}
              onClose={() => setActiveJobApply(null)}
              onSubmit={handleAddApplication}
            />
          </React.Suspense>
        )}
      </AnimatePresence>

      {/* REAL-TIME TOAST POPUP NOTIFICATION (FOR ADMINS / RELEASES) */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, x: 120, y: -20, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, y: -20, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed top-6 right-6 z-50 w-full max-w-sm bg-white/95 backdrop-blur-md border border-slate-200/85 rounded-2xl shadow-2xl p-5 text-xs flex flex-col gap-2.5 border-l-4 border-l-[#D4AF37]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping shrink-0" />
                Notifikasi Baharu (Nyata)
              </span>
              <button
                onClick={() => setActiveToast(null)}
                className="text-slate-400 hover:text-slate-600 font-bold transition text-[11px] p-0.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs tracking-tight">
                {activeToast.title}
              </h4>
              <p className="text-slate-600 font-medium leading-relaxed mt-1 text-[11px]">
                {activeToast.message}
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => {
                  setActiveTab("admin");
                  setAdminActiveSection(
                    activeToast.type === "career"
                      ? "careers"
                      : activeToast.type === "feedback"
                        ? "testimonials"
                        : "leads",
                  );
                  setActiveToast(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold uppercase text-[9px] tracking-widest px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
              >
                Buka Panel Kawalan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA INSTALL & QR CODE MODAL */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        deferredPrompt={deferredPrompt}
      />

      {/* QR & BARCODE SCANNER MODAL */}
      <React.Suspense fallback={null}>
        <QRScannerModal
          isOpen={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
          onScanSuccess={(scannedId) => {
            setCheckerId(scannedId);
            setIsQRScannerOpen(false);
            handleCheckStatus(scannedId);
          }}
        />
      </React.Suspense>
      {/* WELCOME VOICE GREETING & LIVE CHAT FIRESTORE WIDGET */}
      <WelcomeVoiceGreeting />
      <LiveChatWidget />
    </div>
  );
}
