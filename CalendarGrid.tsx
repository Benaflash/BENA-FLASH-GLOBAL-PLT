import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  RefreshCw,
  CheckCircle2,
  PhoneCall,
  Calendar
} from "lucide-react";
import { FAQItem } from "../types";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  source?: string;
}

interface AIChatbotProps {
  faqs: FAQItem[];
  onOpenBooking?: () => void;
  onOpenCheckStatus?: () => void;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({
  faqs,
  onOpenBooking,
  onOpenCheckStatus,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Salam & Selamat Datang ke Bena Flash Global PLT! Saya Pembantu AI Rasmi BFG. Boleh saya bantu anda berkaitan Servis Aircond, Pendawaian Elektrik, Solar, atau Semakan Status?",
      timestamp: new Date().toLocaleTimeString("ms-MY", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      source: "BFG AI System",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Berapa harga servis aircond chemical?",
    "Di mana lokasi cawangan BFG?",
    "Cara semak status temujanji tapak?",
    "Adakah BFG berdaftar Lesen CIDB G2?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("ms-MY", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsLoading(true);

    try {
      // Build conversation history format for API
      const history = messages
        .filter((m) => m.id !== "welcome")
        .slice(-6)
        .map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          text: m.text,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          faqs: faqs,
          conversationHistory: history,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botReply = data.reply || "Maaf, sila cuba sebentar lagi.";

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: botReply,
            timestamp: new Date().toLocaleTimeString("ms-MY", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            source: data.source === "gemini_ai" ? "Powered by Gemini AI" : "Pangkalan Data FAQ BFG",
          },
        ]);
      } else {
        throw new Error("Gagal menyambung ke pelayan.");
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      // Smart Client-Side Fallback Search across FAQ dataset
      const lower = query.toLowerCase();
      const match = faqs.find(
        (f) =>
          f.question.toLowerCase().includes(lower) ||
          lower.includes(f.question.toLowerCase().slice(0, 10)) ||
          f.answer.toLowerCase().includes(lower)
      );

      let fallbackReply = match
        ? `[Sistem FAQ BFG]: ${match.answer}`
        : "Terima kasih atas mesej anda! Bena Flash Global PLT sedia menawarkan perkhidmatan Pendawaian Elektrik & Servis Aircond Profesional di Kuantan & Pekan. Anda boleh menggunakan borang sebut harga di laman utama untuk sebut harga segera.";

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString("ms-MY", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          source: "Respons FAQ Tempatan",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Widget Trigger Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] p-4 rounded-full shadow-2xl border-2 border-[#D4AF37]/50 flex items-center gap-2.5 cursor-pointer group"
          aria-label="Tanya AI Support BFG"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-[#D4AF37] group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0F172A] animate-pulse" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider hidden sm:inline text-white">
            Tanya AI BFG
          </span>
          <span className="bg-[#D4AF37] text-[#0F172A] text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
            Live
          </span>
        </motion.button>
      )}

      {/* Interactive AI Chat Modal / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between border-b border-[#D4AF37]/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Bot className="w-6 h-6" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0F172A]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-white tracking-tight">
                      Pembantu AI BFG PLT
                    </h3>
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
                  </div>
                  <p className="text-[10px] text-slate-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Bantuan Automatik FAQ & Servis M&E
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: "welcome",
                        sender: "bot",
                        text: "Sembang telah diset semula. Boleh saya bantu anda berkaitan servis aircond, pendawaian elektrik, atau semakan status?",
                        timestamp: new Date().toLocaleTimeString("ms-MY", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        source: "BFG AI System",
                      },
                    ])
                  }
                  title="Bersihkan Sembang"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  aria-label="Tutup Sembang"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center justify-around text-[10px] font-extrabold text-slate-700 shrink-0">
              <button
                onClick={() => {
                  if (onOpenBooking) onOpenBooking();
                  setIsOpen(false);
                }}
                className="flex items-center gap-1 hover:text-[#D4AF37] transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Tempah Slot Tapak</span>
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => {
                  if (onOpenCheckStatus) onOpenCheckStatus();
                  setIsOpen(false);
                }}
                className="flex items-center gap-1 hover:text-[#D4AF37] transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Semak Status</span>
              </button>
              <span className="text-slate-300">|</span>
              <a
                href="https://wa.me/60179876543"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-emerald-600 transition cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                <span>WhatsApp Admin</span>
              </a>
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.sender === "user"
                        ? "bg-[#0F172A] text-white"
                        : "bg-[#D4AF37] text-slate-900 shadow-sm"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
                      msg.sender === "user"
                        ? "bg-[#0F172A] text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <div className="flex items-center justify-between gap-2 mt-1.5 text-[9px] text-slate-400 border-t border-slate-100/30 pt-1">
                      <span>{msg.timestamp}</span>
                      {msg.source && (
                        <span className="font-extrabold text-[#D4AF37] uppercase tracking-wider">
                          {msg.source}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                  <Bot className="w-4 h-4 text-[#D4AF37] animate-bounce" />
                  <span className="italic font-medium">
                    AI BFG sedang meneliti soalan & FAQ...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Carousel */}
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-[#D4AF37]/15 hover:text-[#0F172A] border border-slate-200 text-slate-600 rounded-full text-[10px] font-extrabold whitespace-nowrap transition cursor-pointer shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tanya soalan mengenai servis aircond, elektrik..."
                className="flex-grow text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-slate-50 text-slate-800"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="bg-[#0F172A] hover:bg-slate-800 disabled:opacity-50 text-[#D4AF37] p-2.5 rounded-xl transition cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
