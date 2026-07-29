import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Award,
  Gift,
  Ticket,
  CheckCircle2,
  Copy,
  Sparkles,
  Zap,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Clock
} from "lucide-react";

interface LoyaltyRewardsProps {
  customerName?: string;
  customerPhoneOrEmail?: string;
  bookingCount?: number;
  onApplyVoucherCode?: (code: string, discountAmount: number) => void;
}

interface Voucher {
  id: string;
  title: string;
  pointsRequired: number;
  discountVal: number; // RM
  code: string;
  description: string;
}

export const LoyaltyRewardsPortal: React.FC<LoyaltyRewardsProps> = ({
  customerName = "Pelanggan Setia BFG",
  customerPhoneOrEmail = "pelanggan@bfgplt.com",
  bookingCount = 2,
  onApplyVoucherCode,
}) => {
  // Store loyalty points in localStorage for persistence
  const storageKey = `bfg_loyalty_points_${customerPhoneOrEmail.replace(/[^a-zA-Z0-9]/g, "")}`;

  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      return parseInt(saved, 10);
    }
    // Calculate initial points based on booking count (120 points per booking + 50 welcome bonus)
    return Math.max(150, bookingCount * 120 + 50);
  });

  const [redeemedVouchers, setRedeemedVouchers] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${storageKey}_vouchers`);
    return saved ? JSON.parse(saved) : [];
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, points.toString());
  }, [points, storageKey]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}_vouchers`, JSON.stringify(redeemedVouchers));
  }, [redeemedVouchers, storageKey]);

  // Determine Tier Level
  const getTierInfo = (pts: number) => {
    if (pts >= 500) {
      return {
        name: "Ahli Emas VIP (Gold)",
        color: "from-[#D4AF37] to-amber-600 text-[#0F172A]",
        badge: "Emas VIP",
        discount: "15% Diskaun Servis",
        nextTier: null,
        ptsNeeded: 0,
      };
    } else if (pts >= 200) {
      return {
        name: "Ahli Perak (Silver)",
        color: "from-[#0F172A] to-slate-800 text-[#D4AF37]",
        badge: "Perak",
        discount: "10% Diskaun Servis",
        nextTier: "Emas VIP",
        ptsNeeded: 500 - pts,
      };
    } else {
      return {
        name: "Ahli Gangsa (Bronze)",
        color: "from-amber-700 to-amber-900 text-white",
        badge: "Gangsa",
        discount: "5% Diskaun Servis",
        nextTier: "Perak",
        ptsNeeded: 200 - pts,
      };
    }
  };

  const tier = getTierInfo(points);

  const availableVouchers: Voucher[] = [
    {
      id: "vouch-20",
      title: "Baucar RM20 Diskaun Servis Aircond",
      pointsRequired: 100,
      discountVal: 20,
      code: "BFG-AIRCOND-20",
      description: "Potongan RM20 bagi sebarang tempahan Servis Chemical / Inverter Aircond.",
    },
    {
      id: "vouch-50",
      title: "Baucar RM50 Diskaun Pendawaian Elektrik",
      pointsRequired: 200,
      discountVal: 50,
      code: "BFG-WIRING-50",
      description: "Potongan RM50 bagi kerja-kerja pendawaian rumah 1-fasa atau 3-fasa.",
    },
    {
      id: "vouch-[#100]",
      title: "Baucar RM100 Diskaun Projek Solar / M&E",
      pointsRequired: 400,
      discountVal: 100,
      code: "BFG-SOLAR-100",
      description: "Potongan RM100 untuk projek pemasangan Solar PV NEM atau Panel DB.",
    },
  ];

  const handleRedeem = (voucher: Voucher) => {
    if (points < voucher.pointsRequired) {
      setActiveMessage("Mata kesetiaan tidak mencukupi untuk menebus baucar ini.");
      setTimeout(() => setActiveMessage(null), 3000);
      return;
    }

    setPoints((prev) => prev - voucher.pointsRequired);
    setRedeemedVouchers((prev) => [...prev, voucher.code]);
    setActiveMessage(`Tahniah! Baucar ${voucher.code} bernilai RM${voucher.discountVal} telah ditebus.`);
    setTimeout(() => setActiveMessage(null), 4000);

    if (onApplyVoucherCode) {
      onApplyVoucherCode(voucher.code, voucher.discountVal);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-6 text-left shadow-sm relative overflow-hidden">
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-bl-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            Program Ganjaran Kesetiaan Pelanggan BFG
          </span>
          <h3 className="text-lg font-black text-[#0F172A] mt-0.5 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#D4AF37]" />
            Portal Mata Kesetiaan & Baucar
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Kumpul mata untuk setiap tempahan servis aircond & pendawaian elektrik. Tebus diskaun tunai secara langsung!
          </p>
        </div>

        {/* Tier Status Card */}
        <div className={`p-4 rounded-2xl bg-gradient-to-r ${tier.color} shadow-md flex items-center gap-3 shrink-0`}>
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-extrabold opacity-90 block">
              Status Keahlian
            </span>
            <span className="text-sm font-black block tracking-tight">
              {tier.name}
            </span>
            <span className="text-[10px] font-bold opacity-80 block">
              {tier.discount}
            </span>
          </div>
        </div>
      </div>

      {/* Points Counter Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#D4AF37]/30 shadow-inner">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Baki Mata Kesetiaan Anda
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#D4AF37]">
              {points}
            </span>
            <span className="text-xs font-bold text-slate-300">
              Mata BFG
            </span>
          </div>
          {tier.nextTier && (
            <p className="text-[10.5px] text-slate-400">
              Kumpul <strong className="text-[#D4AF37]">{tier.ptsNeeded} mata lagi</strong> untuk naik ke tahap {tier.nextTier}!
            </p>
          )}
        </div>

        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2 shrink-0">
          <Zap className="w-4 h-4 text-[#D4AF37]" />
          <span>Dapatkan 100 Mata bagi setiap tempahan servis baharu!</span>
        </div>
      </div>

      {activeMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{activeMessage}</span>
        </motion.div>
      )}

      {/* Redeemable Vouchers Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Gift className="w-4 h-4 text-[#D4AF37]" />
          Senarai Baucar Diskaun Boleh Ditebus
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableVouchers.map((vouch) => {
            const isRedeemed = redeemedVouchers.includes(vouch.code);
            const canAfford = points >= vouch.pointsRequired;

            return (
              <div
                key={vouch.id}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                  isRedeemed
                    ? "bg-emerald-50/60 border-emerald-300"
                    : canAfford
                    ? "bg-white border-[#D4AF37]/40 shadow-xs hover:border-[#D4AF37]"
                    : "bg-slate-50 border-slate-200 opacity-80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#0F172A] text-[#D4AF37]">
                      RM{vouch.discountVal} OFF
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-600">
                      {vouch.pointsRequired} Mata
                    </span>
                  </div>

                  <h5 className="font-extrabold text-xs text-[#0F172A] tracking-tight">
                    {vouch.title}
                  </h5>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed mt-1">
                    {vouch.description}
                  </p>
                </div>

                {isRedeemed ? (
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-emerald-800">{vouch.code}</span>
                    <button
                      onClick={() => handleCopy(vouch.code)}
                      className="text-slate-500 hover:text-slate-800 text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedCode === vouch.code ? "Disalin!" : "Salin"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRedeem(vouch)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      canAfford
                        ? "bg-[#D4AF37] hover:bg-[#b8952c] text-[#0F172A] shadow-xs"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>{canAfford ? "Tebus Baucar Ini" : "Mata Tak Cukup"}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* History Feed */}
      <div className="border-t border-slate-100 pt-4">
        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          Sejarah Mata Kesetiaan
        </h4>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800 block text-[11px]">
                Bonus Pendaftaran & Tempahan Servis
              </span>
              <span className="text-[10px] text-slate-400">Pendaftaran Portak Pelanggan BFG</span>
            </div>
            <span className="font-mono font-black text-emerald-600 text-xs">
              +150 Mata
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyRewardsPortal;
