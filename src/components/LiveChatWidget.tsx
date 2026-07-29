import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, User, Bot, CheckCheck, Minimize2, Sparkles, Phone, Mail } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

interface ChatMessage {
  id?: string;
  sender: "customer" | "admin";
  senderName: string;
  text: string;
  createdAt: any;
}

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatId, setChatId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Restore existing chat session from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("bfg_chat_name");
    const savedContact = localStorage.getItem("bfg_chat_contact");
    const savedChatId = localStorage.getItem("bfg_chat_id");

    if (savedName && savedChatId) {
      setCustomerName(savedName);
      setCustomerContact(savedContact || "");
      setChatId(savedChatId);
      setIsRegistered(true);
    }
  }, []);

  // Firestore Real-Time listener for messages
  useEffect(() => {
    if (!chatId) return;

    try {
      const q = query(
        collection(db, "live_chats", chatId, "messages"),
        orderBy("createdAt", "asc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedMsgs: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          loadedMsgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
        });

        if (loadedMsgs.length > 0) {
          setMessages(loadedMsgs);
        }
      }, (error) => {
        console.warn("Live chat Firestore snapshot fallback:", error.message);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn("Firestore live chat query error:", e);
    }
  }, [chatId]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    const newChatId = `chat_${Date.now()}`;
    setChatId(newChatId);
    setIsRegistered(true);

    localStorage.setItem("bfg_chat_name", customerName);
    localStorage.setItem("bfg_chat_contact", customerContact);
    localStorage.setItem("bfg_chat_id", newChatId);

    // Initial greeting message from BFG Admin
    const initialGreeting: ChatMessage = {
      sender: "admin",
      senderName: "Bena Flash Support",
      text: `Salam Sejahtera ${customerName}! Terima kasih berhubung dengan Bena Flash Global PLT. Bagaimanakah kami boleh membantu anda hari ini (Servis Aircond / Pendawaian Elektrik / Sebut Harga)?`,
      createdAt: new Date(),
    };

    setMessages([initialGreeting]);

    try {
      await addDoc(collection(db, "live_chats", newChatId, "messages"), {
        sender: "admin",
        senderName: "Bena Flash Support",
        text: initialGreeting.text,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn("Could not save initial chat greeting to Firestore:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !chatId) return;

    const userMsgText = inputText.trim();
    setInputText("");

    const newMsg: ChatMessage = {
      sender: "customer",
      senderName: customerName || "Pelanggan",
      text: userMsgText,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, newMsg]);

    try {
      await addDoc(collection(db, "live_chats", chatId, "messages"), {
        sender: "customer",
        senderName: customerName || "Pelanggan",
        text: userMsgText,
        createdAt: serverTimestamp(),
      });

      // Simulate automated AI/Admin response if first time asking
      if (messages.length <= 2) {
        setTimeout(async () => {
          const autoReply: ChatMessage = {
            sender: "admin",
            senderName: "Bena Flash Duty Technician",
            text: `Mesej anda telah diterima oleh Juruteknik Bertugas BFG. Kami akan memberikan maklum balas segera melalui ruangan sembang ini atau talian ${customerContact || "WhatsApp"}.`,
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, autoReply]);
          try {
            await addDoc(collection(db, "live_chats", chatId, "messages"), {
              sender: "admin",
              senderName: "Bena Flash Duty Technician",
              text: autoReply.text,
              createdAt: serverTimestamp(),
            });
          } catch (e) {}
        }, 1200);
      }
    } catch (err) {
      console.warn("Failed to send message to Firestore:", err);
    }
  };

  return (
    <div className="fixed bottom-6 left-4 sm:left-6 z-50 flex flex-col items-start pointer-events-none">
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="pointer-events-auto mb-4 w-[92vw] max-w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* HEADER */}
          <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between border-b-2 border-[#D4AF37]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#0F172A] font-extrabold flex items-center justify-center text-sm shadow-md">
                  BFG
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0F172A] rounded-full animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs tracking-tight text-white flex items-center gap-1.5">
                  BFG Live Support
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                    ONLINE
                  </span>
                </h4>
                <p className="text-[10px] text-slate-300 font-medium">
                  Sembang Langsung Bena Flash Global
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CHAT BODY */}
          <div className="flex-1 p-4 bg-slate-50/70 overflow-y-auto flex flex-col gap-3">
            {!isRegistered ? (
              <form onSubmit={handleStartChat} className="m-auto w-full space-y-4 p-2">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 bg-[#0F172A] text-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm border border-[#D4AF37]/30">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h5 className="font-extrabold text-slate-900 text-sm">
                    Mula Sembang Langsung
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Sila masukkan nama dan nombor telefon untuk berhubung terus dengan admin/juruteknik bertugas.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Nama Anda *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="cth: Ahmad Zulkifli"
                      className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37]/30 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    No. Telefon / WhatsApp (Opsional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                      placeholder="cth: 011-62995904"
                      className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37]/30 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0F172A] text-[#D4AF37] hover:bg-slate-800 font-extrabold text-xs uppercase py-3 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Sertai Sembang Live</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <>
                <div className="text-center py-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                    Sesi Diwujudkan • Ref: {chatId.slice(-6)}
                  </span>
                </div>

                {messages.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className={`flex flex-col ${
                      m.sender === "customer" ? "items-end" : "items-start"
                    }`}
                  >
                    <span className="text-[9px] text-slate-400 font-bold px-1 mb-0.5">
                      {m.senderName}
                    </span>
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                        m.sender === "customer"
                          ? "bg-[#0F172A] text-white rounded-tr-none border border-slate-800"
                          : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* INPUT BAR */}
          {isRegistered && (
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tulis mesej di sini..."
                className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37]/30 bg-slate-50"
              />
              <button
                type="submit"
                className="bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] p-2.5 rounded-xl transition shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-3 rounded-full shadow-2xl border-2 border-[#D4AF37] flex items-center gap-2.5 transition-transform transform active:scale-95 cursor-pointer group"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 text-[#D4AF37] group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0F172A]" />
        </div>
        <span className="tracking-wide">Sembang Live BFG</span>
      </button>
    </div>
  );
}
