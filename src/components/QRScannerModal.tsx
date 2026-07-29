import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { X, Camera, Upload, QrCode, AlertCircle, CheckCircle2 } from "lucide-react";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [scanMode, setScanMode] = useState<"camera" | "file">("camera");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isOpen || scanMode !== "camera") return;

    let isMounted = true;

    // Small timeout to allow modal animation DOM element to mount
    const timer = setTimeout(() => {
      const element = document.getElementById("qr-reader");
      if (!element) return;

      try {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
          },
          /* verbose= */ false
        );

        scannerRef.current = scanner;

        scanner.render(
          (decodedText) => {
            if (!isMounted) return;
            setScannedResult(decodedText);
            
            // Clean ID if URL was scanned
            let finalId = decodedText;
            if (decodedText.includes("status_id=")) {
              try {
                const url = new URL(decodedText);
                const statusId = url.searchParams.get("status_id");
                if (statusId) finalId = statusId;
              } catch (e) {
                // Ignore URL parse error
              }
            }

            onScanSuccess(finalId);
            if (scannerRef.current) {
              scannerRef.current.clear().catch(console.error);
            }
          },
          (error) => {
            // Ignore frame-by-frame parse errors
          }
        );
      } catch (err: any) {
        console.error("Failed to initialize QR camera scanner:", err);
        setErrorMessage("Tidak dapat mengakses kamera. Sila pastikan kebenaran kamera diberikan.");
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [isOpen, scanMode]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const html5Qrcode = new Html5Qrcode("file-qr-reader");
    try {
      const decodedText = await html5Qrcode.scanFile(file, true);
      setScannedResult(decodedText);

      let finalId = decodedText;
      if (decodedText.includes("status_id=")) {
        try {
          const url = new URL(decodedText);
          const statusId = url.searchParams.get("status_id");
          if (statusId) finalId = statusId;
        } catch (e) {
          // Ignore
        }
      }

      onScanSuccess(finalId);
    } catch (err) {
      console.error("Failed to scan QR image file:", err);
      setErrorMessage("Kod QR / Barcode tidak ditemui dalam imej. Sila cuba imej yang lebih jelas.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden relative p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10 cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 bg-[#D4AF37]/10 text-[#D4AF37] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <QrCode className="w-4 h-4" />
            Pengimbas Kod QR & Barcode Label
          </div>
          <h3 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
            Imbas Label Peranti / Resit
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Imbas kod QR pada resit, pelekat pendingin hawa, atau label pendawaian BFG.
          </p>
        </div>

        {/* Scan Mode Toggle Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 mb-5">
          <button
            onClick={() => {
              setScanMode("camera");
              setErrorMessage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
              scanMode === "camera"
                ? "bg-[#0F172A] text-[#D4AF37] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Kamera Live</span>
          </button>
          <button
            onClick={() => {
              setScanMode("file");
              setErrorMessage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
              scanMode === "file"
                ? "bg-[#0F172A] text-[#D4AF37] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Muat Naik Imej</span>
          </button>
        </div>

        {/* Camera Scanner View */}
        {scanMode === "camera" && (
          <div className="space-y-3">
            <div
              id="qr-reader"
              className="w-full overflow-hidden rounded-2xl border-2 border-dashed border-[#D4AF37]/60 bg-slate-900 text-white min-h-[260px]"
            />
            <p className="text-[11px] text-slate-400 text-center">
              Halakan kamera belakang anda ke arah Kod QR atau Barcode Bena Flash.
            </p>
          </div>
        )}

        {/* File Upload Scanner View */}
        {scanMode === "file" && (
          <div className="space-y-4">
            <div id="file-qr-reader" className="hidden" />
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#D4AF37] rounded-2xl p-8 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer transition-colors text-center">
              <Upload className="w-8 h-8 text-[#D4AF37] mb-2" />
              <span className="text-xs font-extrabold text-[#0F172A] uppercase">
                Pilih Foto Kod QR Dari Peranti
              </span>
              <span className="text-[10px] text-slate-500 mt-1">
                Sokongan PNG, JPG, WEBP atau tangkapan skrin resit
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Scanned Banner */}
        {scannedResult && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-extrabold uppercase text-[10px] text-emerald-700 block">
                Kod QR Berjaya Diimbas!
              </span>
              <span className="font-mono text-xs font-bold text-slate-900">
                {scannedResult}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScannerModal;
