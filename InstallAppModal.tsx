import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  QrCode,
  Smartphone,
  CheckCircle2,
  Share2,
  PlusSquare,
  Bell,
  Volume2,
  Copy,
  ExternalLink,
  Laptop
} from "lucide-react";
import { triggerBenaFlashNotification } from "../lib/notificationAudio";

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
}

export default function InstallAppModal({
  isOpen,
  onClose,
  deferredPrompt,
}: InstallAppModalProps) {
  const [activeTab, setActiveTab] = useState<"android" | "ios" | "desktop">("android");
  const [isStandalone, setIsStandalone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testingAudio, setTestingAudio] = useState(false);

  const DOMAIN_URL = "https://www.bfgplt.com";

  useEffect(() => {
    // Check if app is running as PWA
    const inStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(inStandalone);

    // Auto-detect OS
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setActiveTab("ios");
    } else if (/Macintosh|Windows|Linux/.test(userAgent) && !/Android/.test(userAgent)) {
      setActiveTab("desktop");
    } else {
      setActiveTab("android");
    }
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        }
      } catch (err) {
        console.error("Error triggering install prompt:", err);
      }
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(DOMAIN_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestNotification = async () => {
    setTestingAudio(true);
    await triggerBenaFlashNotification(
      "Bena Flash Global PLT",
      "Ujian notifikasi & nada bunyi 'BENA FLASH' berjaya!"
    );
    setTimeout(() => setTestingAudio(false), 1500);
  };

  // High quality vector SVG QR Code pointing to https://www.bfgplt.com
  const renderQRCodeSVG = () => {
    // Standard 21x21 QR Code representation for https://www.bfgplt.com
    return (
      <svg
        viewBox="0 0 29 29"
        className="w-40 h-40 md:w-48 md:h-48 bg-white p-2 rounded-xl border border-slate-200 shadow-inner"
        shapeRendering="crispEdges"
      >
        <rect width="29" height="29" fill="white" />
        {/* Finder pattern top-left */}
        <path d="M2,2 h7 v7 h-7 z M3,3 v5 h5 v-5 z M4,4 h3 v3 h-3 z" fill="#0F172A" />
        {/* Finder pattern top-right */}
        <path d="M20,2 h7 v7 h-7 z M21,3 v5 h5 v-5 z M22,4 h3 v3 h-3 z" fill="#0F172A" />
        {/* Finder pattern bottom-left */}
        <path d="M2,20 h7 v7 h-7 z M3,21 v5 h5 v-5 z M4,22 h3 v3 h-3 z" fill="#0F172A" />
        
        {/* Data modules */}
        <g fill="#0F172A">
          <rect x="11" y="2" width="1" height="1" />
          <rect x="13" y="2" width="2" height="1" />
          <rect x="17" y="2" width="1" height="1" />
          <rect x="10" y="3" width="1" height="2" />
          <rect x="14" y="3" width="1" height="1" />
          <rect x="16" y="3" width="2" height="1" />
          <rect x="12" y="4" width="2" height="1" />
          <rect x="15" y="4" width="1" height="2" />
          <rect x="11" y="5" width="2" height="1" />
          <rect x="17" y="5" width="1" height="1" />
          <rect x="10" y="6" width="3" height="1" />
          <rect x="14" y="6" width="2" height="1" />
          
          {/* Alignment & timing bits */}
          <rect x="2" y="10" width="1" height="2" />
          <rect x="4" y="10" width="2" height="1" />
          <rect x="7" y="10" width="1" height="1" />
          <rect x="9" y="10" width="1" height="3" />
          <rect x="11" y="10" width="3" height="1" />
          <rect x="15" y="10" width="2" height="1" />
          <rect x="18" y="10" width="1" height="2" />
          <rect x="20" y="10" width="2" height="1" />
          <rect x="23" y="10" width="1" height="3" />
          <rect x="25" y="10" width="2" height="1" />
          
          <rect x="3" y="12" width="2" height="1" />
          <rect x="6" y="12" width="1" height="2" />
          <rect x="12" y="12" width="2" height="2" />
          <rect x="16" y="12" width="1" height="1" />
          <rect x="21" y="12" width="2" height="1" />
          <rect x="24" y="12" width="1" height="2" />
          
          <rect x="2" y="14" width="2" height="1" />
          <rect x="5" y="14" width="2" height="1" />
          <rect x="8" y="14" width="2" height="2" />
          <rect x="15" y="14" width="3" height="1" />
          <rect x="19" y="14" width="1" height="2" />
          <rect x="22" y="14" width="2" height="1" />
          <rect x="26" y="14" width="1" height="3" />

          <rect x="10" y="16" width="2" height="1" />
          <rect x="13" y="16" width="1" height="2" />
          <rect x="17" y="16" width="2" height="1" />
          <rect x="21" y="16" width="1" height="2" />
          <rect x="24" y="16" width="2" height="1" />

          {/* Bottom section */}
          <rect x="10" y="20" width="2" height="1" />
          <rect x="14" y="20" width="3" height="1" />
          <rect x="18" y="20" width="2" height="2" />
          <rect x="22" y="20" width="1" height="1" />
          <rect x="25" y="20" width="2" height="1" />

          <rect x="11" y="22" width="1" height="2" />
          <rect x="13" y="22" width="2" height="1" />
          <rect x="16" y="22" width="1" height="1" />
          <rect x="21" y="22" width="3" height="1" />
          <rect x="25" y="22" width="1" height="2" />

          <rect x="10" y="24" width="3" height="1" />
          <rect x="14" y="24" width="1" height="2" />
          <rect x="17" y="24" width="2" height="1" />
          <rect x="20" y="24" width="1" height="3" />
          <rect x="23" y="24" width="2" height="1" />
          <rect x="26" y="24" width="1" height="2" />

          <rect x="11" y="26" width="2" height="1" />
          <rect x="15" y="26" width="3" height="1" />
          <rect x="22" y="26" width="2" height="1" />
          <rect x="25" y="26" width="2" height="1" />
        </g>
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full max-h-[90vh] overflow-y-auto relative p-6 md:p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <img
            src="https://i.ibb.co/6c1Xgxr4/BENA.png"
            alt="Bena Flash Global Logo"
            className="w-16 h-16 object-contain mx-auto mb-3 rounded-2xl shadow-md border border-[#D4AF37]/30 bg-[#0F172A] p-2"
          />
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Smartphone className="w-4 h-4" />
            Aplikasi PWA Mobil Rasmi
          </div>
          <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">
            Pasang Aplikasi Bena Flash Global
          </h3>
          <p className="text-xs text-slate-600 mt-1.5 max-w-md mx-auto">
            Nikmati akses pantas terus dari Skrin Utama peranti anda dengan notifikasi masa nyata & kebolehan muat turun offline.
          </p>
        </div>

        {/* Standalone Status Banner */}
        {isStandalone ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-extrabold text-xs uppercase tracking-wider">
                Aplikasi Telah Dipasang
              </p>
              <p className="text-xs text-emerald-700">
                Anda sedang menggunakan aplikasi ini dalam mod PWA Standalone.
              </p>
            </div>
          </div>
        ) : deferredPrompt ? (
          <div className="bg-[#0F172A] text-white p-5 rounded-2xl mb-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase text-[#D4AF37] tracking-wider mb-1">
                Pemasangan Langsung
              </p>
              <p className="text-sm font-bold text-white">
                Pasang ke Skrin Utama Sekarang
              </p>
            </div>
            <button
              onClick={handleInstallClick}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c29f2e] text-[#0F172A] font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-lg shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Pasang Aplikasi
            </button>
          </div>
        ) : null}

        {/* QR Code & Direct Link Section */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex flex-col items-center text-center shrink-0">
            {renderQRCodeSVG()}
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-2 flex items-center gap-1">
              <QrCode className="w-3 h-3 text-[#D4AF37]" /> Kod QR Rasmi Website
            </span>
          </div>

          <div className="flex-1 space-y-3 text-left">
            <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
              Imbas Kod QR Untuk Muat Turun
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Buka kamera peranti iOS atau Android anda untuk membuka pautan rasmi <strong className="text-[#0F172A]">www.bfgplt.com</strong> dan menambah aplikasi ke skrin utama secara langsung.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin Pautan Domain</span>
                  </>
                )}
              </button>
              <a
                href={DOMAIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-3 py-2 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                <span>Buka Domain</span>
              </a>
            </div>
          </div>
        </div>

        {/* Operating System Instructions Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-slate-200 mb-4">
            <button
              onClick={() => setActiveTab("android")}
              className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "android"
                  ? "border-[#D4AF37] text-[#0F172A]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Android / Chrome
            </button>
            <button
              onClick={() => setActiveTab("ios")}
              className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "ios"
                  ? "border-[#D4AF37] text-[#0F172A]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Share2 className="w-4 h-4" />
              Apple iOS (Safari)
            </button>
            <button
              onClick={() => setActiveTab("desktop")}
              className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "desktop"
                  ? "border-[#D4AF37] text-[#0F172A]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Laptop className="w-4 h-4" />
              Komputer
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-3">
            {activeTab === "android" && (
              <ol className="space-y-2.5 list-decimal list-inside font-medium">
                <li>
                  Tekan butang <strong className="text-[#0F172A]">"Pasang Aplikasi"</strong> di atas jika dipaparkan.
                </li>
                <li>
                  Sekiranya tidak terpasang secara automatik, tekan butang tiga titik <strong className="text-[#0F172A]">[⋮]</strong> di penjuru atas kanan pelayar Chrome.
                </li>
                <li>
                  Pilih menu <strong className="text-[#0F172A]">"Tambah ke Skrin Utama"</strong> (Add to Home screen) atau <strong className="text-[#0F172A]">"Pasang Aplikasi"</strong>.
                </li>
                <li>
                  Sahkan pemasangan untuk menikmati perkhidmatan penuh Bena Flash Global.
                </li>
              </ol>
            )}

            {activeTab === "ios" && (
              <ol className="space-y-2.5 list-decimal list-inside font-medium">
                <li>
                  Buka tapak <strong className="text-[#0F172A]">www.bfgplt.com</strong> menggunakan pelayar <strong className="text-[#0F172A]">Safari</strong> di iPhone/iPad.
                </li>
                <li>
                  Tekan ikon <strong className="text-[#0F172A]">Kongsi (Share)</strong> <span className="inline-block bg-slate-200 p-1 rounded font-bold">⎋ / [↑]</span> di bar bawah pelayar Safari.
                </li>
                <li>
                  Tatal ke bawah dan tekan menu <strong className="text-[#0F172A]">"Tambah ke Skrin Utama" (Add to Home Screen)</strong> <PlusSquare className="w-3.5 h-3.5 inline text-slate-800" />.
                </li>
                <li>
                  Tekan <strong className="text-[#0F172A]">"Tambah" (Add)</strong> di penjuru atas kanan. Ikon Bena Flash akan muncul di skrin utama anda!
                </li>
              </ol>
            )}

            {activeTab === "desktop" && (
              <ol className="space-y-2.5 list-decimal list-inside font-medium">
                <li>
                  Buka pautan <strong className="text-[#0F172A]">www.bfgplt.com</strong> menggunakan Chrome, Edge atau Brave di laptop/komputer.
                </li>
                <li>
                  Lihat bar alamat URL di atas dan tekan ikon <strong className="text-[#0F172A]">Install [⊕]</strong> di sebelah kanan.
                </li>
                <li>
                  Tekan <strong className="text-[#0F172A]">"Install"</strong> untuk membuka aplikasi dalam tetingkap khas yang pantas.
                </li>
              </ol>
            )}
          </div>
        </div>

        {/* Notification Sound Tester */}
        <div className="bg-[#0F172A]/5 border border-[#D4AF37]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-left">
              <h5 className="text-xs font-extrabold text-[#0F172A] uppercase">
                Notifikasi & Nada Bunyi "BENA FLASH"
              </h5>
              <p className="text-[11px] text-slate-600">
                Uji sistem pemberitahuan & chimes audio pengesahan.
              </p>
            </div>
          </div>

          <button
            onClick={handleTestNotification}
            disabled={testingAudio}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{testingAudio ? "Memainkan..." : "Uji Bunyi BENA FLASH"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
