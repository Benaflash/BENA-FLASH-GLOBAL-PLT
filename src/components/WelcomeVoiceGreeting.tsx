import React, { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX, Sparkles, Play, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const WelcomeVoiceGreeting: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showToast, setShowToast] = useState(true);
  const hasSpokenRef = useRef(false);

  const greetingText =
    "Assalamualaikum dan selamat sejahtera, selamat datang ke Bena Flash Global.";

  const speakGreeting = (force = false) => {
    if (!("speechSynthesis" in window)) return;
    if (hasSpokenRef.current && !force) return;

    try {
      window.speechSynthesis.cancel(); // Stop any active speech

      const utterance = new SpeechSynthesisUtterance(greetingText);
      utterance.lang = "ms-MY"; // Bahasa Melayu Malaysia
      utterance.rate = 0.88; // Tempo lembut dan fasih
      utterance.pitch = 1.15; // Nada wanita mesra/merdu

      // Voice selection algorithm for Malaysian / Indonesian female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find((v) => {
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();
        return (
          (lang.includes("ms") || lang.includes("id")) &&
          (name.includes("female") || name.includes("gadis") || name.includes("yasmin") || name.includes("google") || name.includes("amalia") || name.includes("siti") || name.includes("zira"))
        );
      }) || voices.find((v) => v.lang.startsWith("ms") || v.lang.startsWith("id")) || voices.find((v) => v.name.toLowerCase().includes("female"));

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        hasSpokenRef.current = true;
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis notice:", e);
    }
  };

  useEffect(() => {
    // Chrome requires voiceschanged event to populate voices list
    const handleVoicesChanged = () => {
      window.speechSynthesis.getVoices();
    };
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    }

    // Trigger ONCE after page load with a smooth delay
    const timer = setTimeout(() => {
      speakGreeting();
    }, 1500);

    // Fallback trigger on first user interaction if auto-play was blocked
    const handleFirstInteraction = () => {
      if (!hasSpokenRef.current) {
        speakGreeting();
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, []);

  if (!showToast) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-[92vw] sm:w-[380px] bg-[#0F172A]/95 text-white p-4 rounded-2xl shadow-2xl border border-[#D4AF37]/50 backdrop-blur-md select-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center shrink-0 text-[#D4AF37]">
              {isPlaying ? (
                <Volume2 className="w-5 h-5 animate-pulse" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-[#D4AF37] tracking-widest">
                  Sambutan BFG PLT
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h4 className="text-xs font-bold leading-tight text-white mt-0.5">
                ASSALAMMUALAIKUM DAN SELAMAT SEJAHTERA
              </h4>
            </div>
          </div>

          <button
            onClick={() => setShowToast(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
            title="Tutup Notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-slate-300 mt-2.5 pl-11 font-medium italic border-l-2 border-[#D4AF37]/60 ml-2">
          "SELAMAT DATANG KE BENA FLASH GLOBAL"
        </p>

        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={() => speakGreeting(true)}
            className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-amber-400 text-slate-950 font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-lg transition cursor-pointer shadow-xs"
          >
            {isPlaying ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Sedang Disampaikan...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Ulang Ucapan Suara</span>
              </>
            )}
          </button>

          <span className="text-[9px] text-slate-400 font-semibold">
            Audio Rasmi BFG
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeVoiceGreeting;
