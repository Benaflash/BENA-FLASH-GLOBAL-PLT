import React, { useState, useEffect } from "react";
import {
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  ExternalLink,
  Sun,
  Moon,
  Lock,
  Unlock,
  Menu,
  X,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  Briefcase,
  Award,
  FileText,
  UserCheck,
  Home,
  Info,
  Wrench,
  FolderGit2,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { translations } from "../translations";

interface HeaderNavigationProps {
  companyInfo: any;
  activeTab: string;
  handleTabChange: (tabId: string) => void;
  lang: "MS" | "EN";
  setLang: (lang: "MS" | "EN") => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  isScrolled: boolean;
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
  isLoggedIn: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
  setShowInstallModal: (val: boolean) => void;
  isPageTransitioning: boolean;
  isLoading: boolean;
}

export const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  companyInfo,
  activeTab,
  handleTabChange,
  lang,
  setLang,
  theme,
  toggleTheme,
  isScrolled,
  isAdminMode,
  setIsAdminMode,
  isLoggedIn,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  setShowInstallModal,
  isPageTransitioning,
  isLoading,
}) => {
  const t = translations[lang];

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  const navigationItems = [
    { id: "home", label: t.home, icon: Home, badge: null, category: "Utama" },
    { id: "about", label: t.about, icon: Info, badge: null, category: "Utama" },
    { id: "services", label: t.services, icon: Wrench, badge: "M&E", category: "Perkhidmatan" },
    { id: "projects", label: t.projects, icon: FolderGit2, badge: "Pahang", category: "Perkhidmatan" },
    { id: "certificates", label: t.certificates, icon: Award, badge: "CIDB G2", category: "Aplikasi & Perakuan" },
    { id: "customer-portal", label: t.customerPortal || "Portal Pelanggan", icon: UserCheck, badge: "Sistem Live", category: "Aplikasi & Perakuan" },
    { id: "blog", label: t.blog, icon: BookOpen, badge: null, category: "Info & Sumber" },
    { id: "career", label: t.career, icon: Briefcase, badge: "Kerjaya", category: "Info & Sumber" },
    { id: "downloads", label: t.documents, icon: FileText, badge: "Muat Turun", category: "Info & Sumber" },
    { id: "contact", label: t.contact, icon: Phone, badge: null, category: "Hubungi" },
  ];

  const categories = ["Utama", "Perkhidmatan", "Aplikasi & Perakuan", "Info & Sumber", "Hubungi"];

  const onSelectTab = (tabId: string) => {
    handleTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="w-full relative z-40 select-none">
      {/* 1. TOP ANNOUNCEMENT BAR (Desktop & Tablet) */}
      <div className="bg-[#0F172A] text-slate-300 text-[11px] py-1.5 border-b border-slate-800/90 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <a
              href={`tel:${companyInfo.phone}`}
              className="flex items-center gap-1.5 text-slate-300 hover:text-[#D4AF37] transition font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{companyInfo.phone}</span>
            </a>
            <a
              href={`mailto:${companyInfo.email}`}
              className="hidden md:flex items-center gap-1.5 text-slate-300 hover:text-[#D4AF37] transition font-medium"
            >
              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{companyInfo.email}</span>
            </a>
            <span className="hidden xl:flex items-center gap-1.5 text-amber-300/90 font-semibold bg-slate-800/90 px-2.5 py-0.5 rounded-full border border-slate-700">
              <MapPin className="w-3 h-3 text-[#D4AF37]" />
              <span>Kuantan, Pekan & Seluruh Pahang</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://benaflash.bukku.store"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#D4AF37] hover:text-amber-200 font-extrabold uppercase tracking-wider transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>BFG E-Store Bukku</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="h-3.5 w-px bg-slate-800 hidden sm:block" />

            {/* Language Switcher Pill */}
            <div className="flex items-center gap-1 bg-slate-800/90 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setLang("MS")}
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all cursor-pointer ${
                  lang === "MS"
                    ? "bg-[#D4AF37] text-slate-950 font-bold shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                MS
              </button>
              <button
                onClick={() => setLang("EN")}
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all cursor-pointer ${
                  lang === "EN"
                    ? "bg-[#D4AF37] text-slate-950 font-bold shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. COMPACT FIXED HEADER BAR */}
      <header
        id="main-navigation"
        className={`sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 flex items-center transition-all duration-300 ${
          isScrolled ? "h-16 shadow-lg shadow-slate-900/5" : "h-20 shadow-md"
        }`}
      >
        {/* Progress Bar during page loading/transition */}
        {(isPageTransitioning || isLoading) && (
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-amber-300 to-[#0F172A] shadow-sm z-50"
          />
        )}

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => onSelectTab("home")}
          >
            <div className="w-auto h-11 sm:h-12 flex items-center justify-center rounded transition-transform scale-100 group-hover:scale-105">
              <img
                src="https://i.ibb.co/6c1Xgxr4/BENA.png"
                alt="Bena Flash Global Logo"
                className="h-full w-auto object-contain"
                width="120"
                height="48"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-[#0F172A] dark:text-white font-heading group-hover:text-[#D4AF37] transition-colors leading-tight">
                  {companyInfo.name}
                </h1>
                <span className="hidden sm:inline-block bg-[#0F172A] text-[#D4AF37] text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-[#D4AF37]/30">
                  CIDB G2
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-[0.18em] font-extrabold text-slate-400 dark:text-slate-400">
                M&E Engineering • Aircond • Solar
              </p>
            </div>
          </div>

          {/* Active Tab Indicator Badge in Header (Clean status display) */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              {navigationItems.find((n) => n.id === activeTab)?.label || "Utama"}
            </span>
          </div>

          {/* Right Action Controls + SIDE HEADER MENU BUTTON */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Sebut Harga CTA */}
            <button
              onClick={() => onSelectTab("contact")}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-[#D4AF37] to-amber-400 hover:from-amber-400 hover:to-[#D4AF37] text-slate-950 text-xs font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Sebut Harga</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center justify-center shadow-2xs"
              title={theme === "light" ? "Mod Gelap" : "Mod Terang"}
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Admin CMS Gate Button */}
            <button
              onClick={() => {
                setIsAdminMode(true);
                onSelectTab("admin");
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-extrabold uppercase tracking-wider transition-all duration-200 shadow-xs cursor-pointer ${
                isLoggedIn && isAdminMode
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] border border-[#D4AF37]/50"
              }`}
              title="Akses Portal Login Admin BFG"
            >
              {isLoggedIn ? (
                <Unlock className="w-3.5 h-3.5 text-[#D4AF37]" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              )}
              <span>{isLoggedIn ? "CMS" : "Admin"}</span>
            </button>

            {/* PROMINENT SIDE HEADER MENU TRIGGER BUTTON (FOR ALL VIEWS: Desktop, Tablet, Mobile) */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center gap-2 bg-[#0F172A] hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#D4AF37] border border-[#D4AF37]/50 px-3.5 py-2 rounded-xl shadow-md transition-all cursor-pointer font-black text-xs uppercase tracking-wider"
              aria-label="Open Side Header Menu"
            >
              <Menu className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden sm:inline">MENU SIDE</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* 3. PREMIUM SIDE HEADER DRAWER (SLIDE-OVER FROM RIGHT FOR DESKTOP, TABLET & MOBILE) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 cursor-pointer"
            />

            {/* Slide-over Side Drawer Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-slate-900 text-white z-50 shadow-2xl flex flex-col justify-between border-l border-slate-800 overflow-y-auto"
            >
              {/* Drawer Top Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 sticky top-0 z-10 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <img
                    src="https://i.ibb.co/6c1Xgxr4/BENA.png"
                    alt="Bena Flash Global Logo"
                    className="h-10 w-auto object-contain"
                  />
                  <div>
                    <h3 className="text-sm font-extrabold text-white font-heading">
                      Bena Flash Global PLT
                    </h3>
                    <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">
                      M&E CIDB G2 • Kuantan / Pekan
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content Body */}
              <div className="p-6 space-y-6 flex-1">
                {/* Search / Quick Sebut Harga Card */}
                <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-[#D4AF37]/30 rounded-2xl p-4 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]">
                      Permohonan Pantas
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Respon 24 jam
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Dapatkan sebut harga rasmi projek M&E, pemasangan Aircond VRV/Chiller, dan Solar PV.
                  </p>
                  <button
                    onClick={() => onSelectTab("contact")}
                    className="w-full bg-[#D4AF37] hover:bg-amber-400 text-slate-950 text-xs font-black uppercase py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Dapatkan Sebut Harga Projek</span>
                  </button>
                </div>

                {/* Categorized Navigation Links */}
                <div className="space-y-5">
                  {categories.map((cat) => {
                    const catItems = navigationItems.filter((item) => item.category === cat);
                    return (
                      <div key={cat} className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1 block">
                          {cat}
                        </span>
                        <div className="space-y-1">
                          {catItems.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = activeTab === item.id && !isAdminMode;
                            return (
                              <button
                                key={item.id}
                                onClick={() => onSelectTab(item.id)}
                                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-between group cursor-pointer ${
                                  isActive
                                    ? "bg-[#D4AF37] text-slate-950 font-black shadow-md"
                                    : "bg-slate-950/60 text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-800/80"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <IconComponent
                                    className={`w-4 h-4 ${
                                      isActive ? "text-slate-950" : "text-[#D4AF37] group-hover:scale-110 transition-transform"
                                    }`}
                                  />
                                  <span>{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {item.badge && (
                                    <span
                                      className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                                        isActive
                                          ? "bg-slate-950 text-[#D4AF37]"
                                          : "bg-slate-800 text-amber-300 border border-amber-500/30"
                                      }`}
                                    >
                                      {item.badge}
                                    </span>
                                  )}
                                  <ChevronRight
                                    className={`w-4 h-4 opacity-50 ${
                                      isActive ? "text-slate-950" : "text-slate-400 group-hover:translate-x-1 transition-transform"
                                    }`}
                                  />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Additional Quick Action Portals */}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1 block">
                    Pautan Pantas E-Commerce & Portal
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="https://benaflash.bukku.store"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-300 text-[11px] font-extrabold px-3 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>BFG Bukku Store</span>
                    </a>
                    <button
                      onClick={() => {
                        setShowInstallModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-[11px] font-extrabold px-3 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Muat Turun App</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Details */}
              <div className="p-6 border-t border-slate-800 bg-slate-950 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#D4AF37]" />
                    <span>Bahasa Sistem:</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setLang("MS")}
                      className={`px-3 py-1 rounded text-[10px] font-black uppercase cursor-pointer ${
                        lang === "MS" ? "bg-[#D4AF37] text-slate-950" : "text-slate-400"
                      }`}
                    >
                      BM
                    </button>
                    <button
                      onClick={() => setLang("EN")}
                      className={`px-3 py-1 rounded text-[10px] font-black uppercase cursor-pointer ${
                        lang === "EN" ? "bg-[#D4AF37] text-slate-950" : "text-slate-400"
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsAdminMode(true);
                    onSelectTab("admin");
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 text-xs font-bold uppercase py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isLoggedIn ? "Akses Portal CMS Admin" : "Log Masuk Admin BFG"}</span>
                </button>

                <p className="text-[10px] text-slate-500 text-center font-mono">
                  © 2026 BENA FLASH GLOBAL PLT (LLP0009823-LGN)
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

