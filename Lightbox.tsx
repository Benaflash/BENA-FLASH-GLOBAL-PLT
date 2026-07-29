import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Wrench,
  Calculator,
  ShoppingBag,
  ExternalLink,
  LogOut,
  Mail,
  User,
  Clock,
  Calendar,
  CheckCircle,
  Search,
  Plus,
  TrendingUp,
  FileText,
  AlertCircle,
  Check,
  BellRing,
  MessageSquare,
  Phone,
  HelpCircle,
  Star,
} from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { db, auth, googleProvider } from "../lib/firebase";
import { LeadQuote, FAQItem } from "../types";
import { initialFaqs } from "../data";

export const mainkanBunyiBenaFlash = () => {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();

      // Chime note 1 (E5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);

      // Chime note 2 (A5) slightly delayed
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880.0, ctx.currentTime);
        gain2.gain.setValueAtTime(0.12, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.45);
      }, 140);
    }
  } catch (audioErr) {
    console.warn("Web Audio chime failed", audioErr);
  }

  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Bena Flash, Bena Flash");
      utterance.lang = "ms-MY";
      utterance.pitch = 1.15;
      utterance.rate = 1.0;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const localVoice =
        voices.find(
          (v) => v.lang.startsWith("ms") || v.lang.startsWith("id"),
        ) || voices.find((v) => v.lang.startsWith("en"));
      if (localVoice) {
        utterance.voice = localVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  } catch (speechErr) {
    console.warn("Speech synthesis failed", speechErr);
  }
};

interface CustomerPortalProps {
  lang: "MS" | "EN";
  onRedirectToContact: () => void;
  customRates?: any[];
}

export default function CustomerPortal({
  lang,
  onRedirectToContact,
  customRates = [],
}: CustomerPortalProps) {
  // Session States
  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("bfg_customer_logged_in") === "true";
  });
  const [customerEmail, setCustomerEmail] = useState<string>(() => {
    return localStorage.getItem("bfg_customer_email") || "";
  });
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");

  // Dashboard states
  const [customerToast, setCustomerToast] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const prevBookingsRef = useRef<LeadQuote[]>([]);
  const prevBookingsLoadedRef = useRef<boolean>(false);
  const prevWarrantiesRef = useRef<any[]>([]);
  const prevWarrantiesLoadedRef = useRef<boolean>(false);

  const [myBookings, setMyBookings] = useState<LeadQuote[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(false);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [isLoadingWarranties, setIsLoadingWarranties] =
    useState<boolean>(false);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<
    | "overview"
    | "bookings"
    | "warranty"
    | "maintenance"
    | "calculator"
    | "ecommerce"
    | "helpdesk"
  >("overview");

  const [warrantyForm, setWarrantyForm] = useState({
    refNo: "",
    itemName: "",
    type: "Aircond",
  });
  const [warrantyMsg, setWarrantyMsg] = useState<string>("");

  // Helpdesk States
  const [helpCategory, setHelpCategory] = useState<string>("Penyelenggaraan Aircond");
  const [helpSubject, setHelpSubject] = useState<string>("");
  const [helpMessage, setHelpMessage] = useState<string>("");
  const [isSubmittingHelp, setIsSubmittingHelp] = useState<boolean>(false);
  const [helpSuccess, setHelpSuccess] = useState<string>("");
  const [helpError, setHelpError] = useState<string>("");
  const [helpdeskMode, setHelpdeskMode] = useState<"ticket" | "chat">("ticket");

  // FAQ Modal States
  const [isFaqModalOpen, setIsFaqModalOpen] = useState<boolean>(false);
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>("");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [faqsList, setFaqsList] = useState<FAQItem[]>(initialFaqs);

  // FCM / Push Notification States
  const [fcmEnabled, setFcmEnabled] = useState<boolean>(() => {
    return localStorage.getItem("bfg_fcm_enabled") !== "false";
  });
  const [fcmToken, setFcmToken] = useState<string>("");
  const [fcmNotifications, setFcmNotifications] = useState<any[]>([]);
  const [activeFcmToast, setActiveFcmToast] = useState<{ id: string; title: string; body: string } | null>(null);

  // Live Chat States
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newChatMessage, setNewChatMessage] = useState<string>("");
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  // Calculator States
  const [calcService, setCalcService] = useState<string>("");
  const [calcQty, setCalcQty] = useState<number>(1);

  // Synchronize Google Auth session on boot
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        localStorage.setItem("bfg_customer_logged_in", "true");
        localStorage.setItem("bfg_customer_email", user.email);
        setCustomerEmail(user.email);
        setIsLoggedIn(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Set default calculator service from customRates if empty
  useEffect(() => {
    if (customRates && customRates.length > 0) {
      if (!calcService || !customRates.some((r) => r.id === calcService)) {
        setCalcService(customRates[0].id);
      }
    }
  }, [customRates]);

  // Real-time lookup of customer's bookings and warranties when logged in
  useEffect(() => {
    if (!isLoggedIn || !customerEmail) return;

    setIsLoadingBookings(true);
    const qLeads = query(
      collection(db, "leads"),
      where("email", "==", customerEmail.trim().toLowerCase()),
    );

    const unsubscribeLeads = onSnapshot(
      qLeads,
      (snapshot) => {
        const list: LeadQuote[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as LeadQuote);
        });
        // Sort by date descending
        list.sort(
          (a, b) =>
            new Date(b.date || b.scheduledDate || 0).getTime() -
            new Date(a.date || a.scheduledDate || 0).getTime(),
        );

        let hasChanges = false;
        let changeMessage = "";

        const isFirstLoad = !prevBookingsLoadedRef.current;
        if (!isFirstLoad && prevBookingsRef.current.length > 0) {
          list.forEach((item) => {
            const prevVal = prevBookingsRef.current.find(
              (p) => p.id === item.id,
            );
            if (prevVal) {
              if (prevVal.status !== item.status) {
                hasChanges = true;
                const statusNameMS =
                  item.status === "Reviewed"
                    ? "Dalam Semakan"
                    : item.status === "Contacted"
                      ? "Dihubungi"
                      : item.status === "Quoted"
                        ? "Sebut Harga Sedia"
                        : item.status === "Completed"
                          ? "Selesai"
                          : item.status;
                changeMessage =
                  lang === "MS"
                    ? `Status tempahan ${item.id} (${item.serviceType}) telah dikemaskini kepada "${statusNameMS}" oleh Admin!`
                    : `Booking status for ${item.id} (${item.serviceType}) has been updated to "${item.status}" by Admin!`;
              } else if (
                prevVal.adminFeedback !== item.adminFeedback &&
                item.adminFeedback
              ) {
                hasChanges = true;
                changeMessage =
                  lang === "MS"
                    ? `Maklum balas baru diterima untuk tempahan ${item.id}: "${item.adminFeedback}"`
                    : `New feedback received for booking ${item.id}: "${item.adminFeedback}"`;
              }
            }
          });
        }

        prevBookingsRef.current = list;
        prevBookingsLoadedRef.current = true;
        setMyBookings(list);
        setIsLoadingBookings(false);

        if (hasChanges && changeMessage) {
          mainkanBunyiBenaFlash();
          setCustomerToast({
            id: `toast-${Date.now()}`,
            message: changeMessage,
          });

          // Fire native HTML5 browser push notification if permission granted
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification("Bena Flash Global", {
                body: changeMessage,
                icon: "/favicon.ico",
              });
            } catch (pushErr) {
              console.warn("Native Notification fire failed:", pushErr);
            }
          }
        }
      },
      (error) => {
        console.error("Error fetching customer bookings:", error);
        setIsLoadingBookings(false);
      },
    );

    setIsLoadingWarranties(true);
    const qWarranties = query(
      collection(db, "warranties"),
      where("email", "==", customerEmail.trim().toLowerCase()),
    );

    const unsubscribeWarranties = onSnapshot(
      qWarranties,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ docId: doc.id, ...doc.data() });
        });
        list.sort(
          (a, b) =>
            new Date(b.startDate || 0).getTime() -
            new Date(a.startDate || 0).getTime(),
        );

        let hasChanges = false;
        let changeMessage = "";

        const isFirstLoad = !prevWarrantiesLoadedRef.current;
        if (!isFirstLoad && prevWarrantiesRef.current.length > 0) {
          if (list.length > prevWarrantiesRef.current.length) {
            hasChanges = true;
            const newW = list[0];
            changeMessage =
              lang === "MS"
                ? `Warranty baru telah didaftarkan: "${newW.title}" (${newW.duration})!`
                : `A new warranty has been registered: "${newW.title}" (${newW.duration})!`;
          } else {
            list.forEach((item) => {
              const prevVal = prevWarrantiesRef.current.find(
                (p) => p.docId === item.docId,
              );
              if (prevVal && prevVal.status !== item.status) {
                hasChanges = true;
                changeMessage =
                  lang === "MS"
                    ? `Status warranty "${item.title}" telah dikemaskini kepada "${item.status}"!`
                    : `Warranty status for "${item.title}" has been updated to "${item.status}"!`;
              }
            });
          }
        }

        prevWarrantiesRef.current = list;
        prevWarrantiesLoadedRef.current = true;
        setWarranties(list);
        setIsLoadingWarranties(false);

        if (hasChanges && changeMessage) {
          mainkanBunyiBenaFlash();
          setCustomerToast({
            id: `toast-${Date.now()}`,
            message: changeMessage,
          });
        }
      },
      (error) => {
        console.error("Error fetching customer warranties:", error);
        setIsLoadingWarranties(false);
      },
    );

    setIsLoadingTickets(true);
    const qTickets = query(
      collection(db, "support_tickets"),
      where("customerEmail", "==", customerEmail.trim().toLowerCase()),
    );

    const unsubscribeTickets = onSnapshot(
      qTickets,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        list.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        );
        setSupportTickets(list);
        setIsLoadingTickets(false);
      },
      (error) => {
        console.error("Error fetching support tickets:", error);
        setIsLoadingTickets(false);
      },
    );

    return () => {
      unsubscribeLeads();
      unsubscribeWarranties();
      unsubscribeTickets();
    };
  }, [isLoggedIn, customerEmail]);

  // Load custom FAQs from Firestore, merging with initialFaqs
  useEffect(() => {
    const unsubscribeFaqs = onSnapshot(
      collection(db, "faqs"),
      (snapshot) => {
        const customFaqs: FAQItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          customFaqs.push({
            id: doc.id,
            question: data.question || "",
            answer: data.answer || "",
          });
        });
        if (customFaqs.length > 0) {
          setFaqsList(customFaqs);
        } else {
          setFaqsList(initialFaqs);
        }
      },
      (err) => {
        console.error("Error loading custom FAQs:", err);
        setFaqsList(initialFaqs);
      }
    );
    return () => unsubscribeFaqs();
  }, []);

  // Synchronize FCM Token subscription and listen for push notifications
  useEffect(() => {
    if (!isLoggedIn || !customerEmail) return;

    let token = localStorage.getItem("bfg_fcm_token");
    if (!token) {
      token = "fcm_token_bfg_" + Math.random().toString(36).substring(2, 8) + "_" + Date.now();
      localStorage.setItem("bfg_fcm_token", token);
    }
    setFcmToken(token);

    // Save/update subscription
    const syncSubscription = async () => {
      try {
        await setDoc(doc(db, "fcm_subscriptions", token!), {
          token,
          email: customerEmail.trim().toLowerCase(),
          active: fcmEnabled,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to sync FCM subscription:", err);
      }
    };
    syncSubscription();

    // Listen for FCM push notifications targeting this user
    const loadTime = Date.now();
    const qFCM = query(
      collection(db, "fcm_push_notifications"),
      where("customerEmail", "==", customerEmail.trim().toLowerCase())
    );

    const unsubscribeFCM = onSnapshot(qFCM, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setFcmNotifications(list);

      // Trigger realistic push alert for most recent unread notification if it's created after loadTime
      const newest = list[0];
      if (newest) {
        const notifTime = new Date(newest.createdAt || 0).getTime();
        if (notifTime > loadTime - 5000) {
          // Play sound
          mainkanBunyiBenaFlash();
          // Trigger banner
          setActiveFcmToast({
            id: newest.id,
            title: newest.title || "Notifikasi Push",
            body: newest.body || "",
          });
          // Also try native notification
          if ("Notification" in window && Notification.permission === "granted") {
            try {
              new Notification(newest.title, {
                body: newest.body,
                icon: "/favicon.ico",
              });
            } catch (e) {
              console.warn("Browser push failed:", e);
            }
          }
        }
      }
    }, (error) => {
      console.warn("Error subscribing to FCM notifications:", error);
    });

    return () => unsubscribeFCM();
  }, [isLoggedIn, customerEmail, fcmEnabled]);

  // Listen for Live Chat messages
  useEffect(() => {
    if (!isLoggedIn || !customerEmail) return;

    const qChat = query(
      collection(db, "live_chats"),
      where("customerEmail", "==", customerEmail.trim().toLowerCase())
    );

    const unsubscribeChat = onSnapshot(qChat, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      // Sort messages ascending by creation time for chat stream
      list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      setChatMessages(list);
    }, (err) => {
      console.error("Error loading live chat:", err);
    });

    return () => unsubscribeChat();
  }, [isLoggedIn, customerEmail]);

  // Auto-dismiss customerToast after 10 seconds
  useEffect(() => {
    if (customerToast) {
      const timer = setTimeout(() => {
        setCustomerToast(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [customerToast]);

  // Dynamic pricing based on active rates updated by admin
  const selectedRate =
    (customRates || []).find((r: any) => r.id === calcService) ||
    (customRates && customRates[0]);
  const minResult = selectedRate ? (selectedRate.minPrice || 0) * calcQty : 0;
  const maxResult = selectedRate ? (selectedRate.maxPrice || 0) * calcQty : 0;

  const hantarMaklumanTelegramKeAdmin = async (
    namaPelanggan: string,
    jenisKemaskini: string,
  ) => {
    try {
      await fetch("/api/telegram-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaPelanggan, jenisKemaskini }),
      });
      console.log("Makluman admin berjaya dihantar ke Telegram.");
    } catch (err) {
      console.error("Gagal menghantar makluman ke Telegram:", err);
    }
  };

  const mintaKebenaranNotifikasi = async () => {
    try {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("Notification permission granted.");
          // TODO: Fetch FCM token and save to database if fully integrated
        }
      }
    } catch (error) {
      console.error("Notification error:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) return;

    try {
      setIsLoggingIn(true);
      setAuthError("");
      const email = emailInput.trim().toLowerCase();
      let result;
      if (isRegisterMode) {
        result = await createUserWithEmailAndPassword(
          auth,
          email,
          passwordInput,
        );
      } else {
        result = await signInWithEmailAndPassword(auth, email, passwordInput);
      }

      const user = result.user;
      if (user && user.email) {
        localStorage.setItem("bfg_customer_logged_in", "true");
        localStorage.setItem("bfg_customer_email", user.email);
        setCustomerEmail(user.email);
        setIsLoggedIn(true);
        setEmailInput("");
        setPasswordInput("");
        mintaKebenaranNotifikasi();
      }
    } catch (error: any) {
      console.error("Email Auth error:", error);
      if (error.code === "auth/email-already-in-use") {
        setAuthError(
          lang === "MS"
            ? "E-mel ini telah didaftarkan. Sila log masuk."
            : "This email is already registered. Please log in.",
        );
      } else if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        setAuthError(
          lang === "MS"
            ? "E-mel atau kata laluan tidak sah."
            : "Invalid email or password.",
        );
      } else if (error.code === "auth/operation-not-allowed") {
        setAuthError(
          lang === "MS"
            ? "Sila aktifkan log masuk Emel/Kata Laluan di Firebase Console, atau guna Google."
            : "Please enable Email/Password login in Firebase Console, or use Google.",
        );
      } else {
        setAuthError(
          lang === "MS"
            ? "Gagal log masuk. Sila cuba lagi."
            : "Login failed. Please try again.",
        );
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Signout error", e);
    }
    localStorage.removeItem("bfg_customer_logged_in");
    localStorage.removeItem("bfg_customer_email");
    setIsLoggedIn(false);
    setCustomerEmail("");
    setMyBookings([]);
    setActiveSubTab("overview");
  };

  const handleRegisterWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warrantyForm.refNo.trim() || !warrantyForm.itemName.trim()) {
      setWarrantyMsg(
        lang === "MS"
          ? "Sila isi semua maklumat!"
          : "Please fill in all fields!",
      );
      return;
    }

    const today = new Date();
    const expiry = new Date();
    expiry.setFullYear(
      today.getFullYear() + (warrantyForm.type === "Aircond" ? 2 : 1),
    );

    const newWarranty = {
      id: "W-" + warrantyForm.refNo.trim().toUpperCase(),
      title: warrantyForm.itemName.trim(),
      type:
        warrantyForm.type === "Aircond"
          ? lang === "MS"
            ? "Warranty Pendingin Hawa"
            : "Aircond Warranty"
          : lang === "MS"
            ? "Warranty Kerja Elektrik"
            : "Electrical Work Warranty",
      duration: warrantyForm.type === "Aircond" ? "24 Bulan" : "12 Bulan",
      startDate: today.toISOString().split("T")[0],
      expiryDate: expiry.toISOString().split("T")[0],
      status: "Active",
      email: customerEmail.trim().toLowerCase(),
    };

    try {
      await addDoc(collection(db, "warranties"), newWarranty);
      setWarrantyForm({ refNo: "", itemName: "", type: "Aircond" });
      setWarrantyMsg(
        lang === "MS"
          ? "Pendaftaran warranty berjaya disahkah!"
          : "Warranty registration successfully verified!",
      );

      // Notify admin
      hantarMaklumanTelegramKeAdmin(
        customerEmail || "Pelanggan Tanpa Nama",
        `Daftar Warranty Baru: ${newWarranty.id} - ${newWarranty.title}`,
      );

      setTimeout(() => setWarrantyMsg(""), 4000);
    } catch (err) {
      console.error("Error registering warranty:", err);
      setWarrantyMsg(
        lang === "MS"
          ? "Gagal mendaftar warranty."
          : "Failed to register warranty.",
      );
    }
  };

  const handleSubmitHelpdesk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpSubject.trim() || !helpMessage.trim()) {
      setHelpError(lang === "MS" ? "Sila isi semua ruangan maklumat!" : "Please fill in all fields!");
      return;
    }

    setIsSubmittingHelp(true);
    setHelpSuccess("");
    setHelpError("");

    try {
      await addDoc(collection(db, "support_tickets"), {
        customerEmail: customerEmail.trim().toLowerCase(),
        category: helpCategory,
        subject: helpSubject.trim(),
        message: helpMessage.trim(),
        status: "Baru", // Baru, Dalam Proses, Selesai
        adminReply: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setHelpSuccess(
        lang === "MS"
          ? "Tiket bantuan anda berjaya dihantar! Pihak pentadbir BFG PLT akan membalas segera."
          : "Your support ticket has been submitted successfully! BFG PLT admin will reply shortly."
      );
      setHelpSubject("");
      setHelpMessage("");

      // Notify admin via telegram
      hantarMaklumanTelegramKeAdmin(
        customerEmail || "Pelanggan Tanpa Nama",
        `Tiket Bantuan Baru [${helpCategory}]: ${helpSubject.trim()}`,
      );

      setTimeout(() => setHelpSuccess(""), 6000);
    } catch (err: any) {
      console.error("Error submitting support ticket:", err);
      setHelpError(
        lang === "MS"
          ? "Ralat semasa menghantar tiket. Sila cuba lagi."
          : "Error submitting ticket. Please try again."
      );
    } finally {
      setIsSubmittingHelp(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !customerEmail) return;

    setIsSendingChat(true);
    try {
      await addDoc(collection(db, "live_chats"), {
        customerEmail: customerEmail.trim().toLowerCase(),
        sender: "customer",
        message: newChatMessage.trim(),
        createdAt: new Date().toISOString(),
      });
      setNewChatMessage("");
    } catch (err) {
      console.error("Failed to send chat message:", err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Render Login view if not authenticated
  if (!isLoggedIn) {
    return (
      <div
        id="customer-login-view"
        className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl mt-8 animate-fade-in"
      >
        <div className="bg-[#0F172A] text-white p-8 text-center relative">
          <div className="w-12 h-12 bg-white/5 mx-auto flex items-center justify-center rounded-xl border border-[#D4AF37]/50 mb-3 rotate-6">
            <User className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <h3 className="text-base font-extrabold tracking-widest font-heading uppercase text-white">
            {lang === "MS" ? "PORTAL KHIDMAT PELANGGAN" : "CUSTOMER PORTAL"}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            BENA FLASH GLOBAL PLT |{" "}
            {lang === "MS"
              ? "REKOD TEMPAHAN & WARRANTY"
              : "BOOKINGS & WARRANTY TRACKER"}
          </p>
        </div>

        <div className="p-8 space-y-6 text-left bg-white">
          <p className="text-xs text-slate-500 leading-relaxed text-center">
            {lang === "MS"
              ? "Sila log masuk menggunakan e-mel dan kata laluan anda. Sekiranya anda belum mempunyai akaun, sila daftar terlebih dahulu untuk memudahkan semakan status tempahan dan warranty."
              : "Please log in using your email and password. If you do not have an account yet, please register first to easily check booking status and warranties."}
          </p>

          {authError && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-[11px] text-red-600 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1 text-[10px]">
                {lang === "MS" ? "Alamat E-mel" : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="cth: amirul@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-slate-50 font-semibold text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1 text-[10px]">
                {lang === "MS" ? "Kata Laluan" : "Password"}
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 flex items-center justify-center">
                  <span className="text-lg leading-none mt-[-4px]">*</span>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-slate-50 font-semibold text-xs text-slate-800"
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold uppercase tracking-wider transition cursor-pointer text-[10px] flex items-center justify-center"
            >
              {isLoggingIn ? (
                <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span>
                  {isRegisterMode
                    ? lang === "MS"
                      ? "Daftar Akaun Baru"
                      : "Register New Account"
                    : lang === "MS"
                      ? "Log Masuk E-mel"
                      : "Email Login"}
                </span>
              )}
            </button>

            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-[10px] text-slate-500 hover:text-[#D4AF37] underline font-bold uppercase"
              >
                {isRegisterMode
                  ? lang === "MS"
                    ? "Sudah ada akaun? Log Masuk"
                    : "Already have an account? Log in"
                  : lang === "MS"
                    ? "Belum ada akaun? Daftar"
                    : "Don't have an account? Register"}
              </button>
            </div>
          </form>

          <div className="text-center border-t border-slate-100 pt-4">
            <span className="text-[9px] text-slate-400 font-medium">
              Akses Selamat & Dilindungi • BENA FLASH GLOBAL PLT
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Active bookings status breakdown helper
  const activeBookingsCount = myBookings.length;
  const activeWarrantiesCount = warranties.filter(
    (w) => w.status === "Active",
  ).length;

  return (
    <div
      id="customer-dashboard-view"
      className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
    >
      {/* Header Info Bar */}
      <div className="bg-[#0F172A] text-white p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#D4AF37] text-slate-900 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
              {lang === "MS"
                ? "Sesi Pelanggan Aktif"
                : "Active Customer Session"}
            </span>
            <span className="text-slate-400 text-xs font-mono">
              {customerEmail}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white">
            {lang === "MS"
              ? "Selamat Datang ke Halaman Anda"
              : "Welcome to Your Portal"}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === "MS"
              ? "Penjejakan Pintar Pemasangan, Penyelenggaraan, & Jaminan"
              : "Smart Tracking of Installations, Maintenance, & Warranty"}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition flex items-center gap-2 self-start md:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{lang === "MS" ? "Log Keluar" : "Logout"}</span>
        </button>
      </div>

      {/* Main Grid: Navigation Tabs left, Content right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Left Side Tab Buttons */}
        <div className="lg:col-span-1 space-y-1.5">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 px-2">
            {lang === "MS" ? "Kategori Menu" : "Menu Categories"}
          </p>
          {[
            {
              id: "overview",
              label: lang === "MS" ? "Ringkasan Portal" : "Portal Overview",
              icon: TrendingUp,
            },
            {
              id: "bookings",
              label: lang === "MS" ? "Tempahan & Status" : "Bookings & Status",
              icon: Clock,
              badge: activeBookingsCount,
            },
            {
              id: "warranty",
              label:
                lang === "MS"
                  ? "Warranty Elektrik/AC"
                  : "Electrical/AC Warranty",
              icon: ShieldCheck,
              badge: activeWarrantiesCount,
            },
            {
              id: "maintenance",
              label: lang === "MS" ? "Jadual Servis M&E" : "M&E Maintenance",
              icon: Wrench,
            },
            {
              id: "calculator",
              label: lang === "MS" ? "Kira Budget Servis" : "Budget Calculator",
              icon: Calculator,
            },
            {
              id: "ecommerce",
              label: lang === "MS" ? "Kedai Bena Store" : "Bena Store Shop",
              icon: ShoppingBag,
            },
            {
              id: "helpdesk",
              label: lang === "MS" ? "Bantuan & Sembang Teknikal" : "Tech Helpdesk & Chat",
              icon: MessageSquare,
            },
          ].map((item) => {
            const IconComponent = item.icon;
            const isSelected = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-xs font-bold uppercase tracking-wider transition ${
                  isSelected
                    ? "bg-[#0F172A] text-[#D4AF37] shadow-sm font-black"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComponent
                    className={`w-4 h-4 ${isSelected ? "text-[#D4AF37]" : "text-slate-400"}`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-[#D4AF37] text-slate-900"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* FAQ Interactive Trigger Button */}
          <div className="pt-4 border-t border-slate-200/60 mt-4">
            <button
              type="button"
              onClick={() => {
                setExpandedFaqId(null);
                setIsFaqModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37] text-slate-800 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm"
            >
              <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
              <span>{lang === "MS" ? "Tanya Soalan (FAQ)" : "Ask Question (FAQ)"}</span>
            </button>
          </div>
        </div>

        {/* Right Side Content Panel */}
        <div className="lg:col-span-3 min-h-[400px]">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
            {/* TAB: OVERVIEW */}
            {activeSubTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                      {lang === "MS" ? "Jumlah Tempahan" : "Total Bookings"}
                    </span>
                    <span className="text-3xl font-extrabold text-[#0F172A] mt-1 block">
                      {activeBookingsCount}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {lang === "MS"
                        ? "Sebut harga & jadual lawatan"
                        : "Quote requests & visit schedules"}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                      {lang === "MS" ? "Warranty Aktif" : "Active Warranties"}
                    </span>
                    <span className="text-3xl font-extrabold text-green-600 mt-1 block">
                      {activeWarrantiesCount}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {lang === "MS"
                        ? "Perkakasan elektrik & aircond"
                        : "Electrical & aircond equipment"}
                    </p>
                  </div>

                  <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-5 rounded-2xl">
                    <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider block">
                      {lang === "MS" ? "Store Member G2" : "G2 Store Member"}
                    </span>
                    <span className="text-base font-extrabold text-slate-800 mt-1 block">
                      {lang === "MS" ? "Kupon 10% Aktif" : "Active 10% Coupon"}
                    </span>
                    <p className="text-[11px] text-[#b8952c] mt-1 font-mono">
                      BFGSTORENEW10
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h3 className="font-extrabold text-sm text-slate-800 mb-4 uppercase tracking-wider">
                    {lang === "MS"
                      ? "Tindakan Pantas Pelanggan"
                      : "Quick Customer Actions"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setActiveSubTab("calculator")}
                      className="border border-slate-200 rounded-2xl p-5 hover:border-[#D4AF37] transition cursor-pointer flex gap-4 items-start"
                    >
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 uppercase">
                          {lang === "MS"
                            ? "Kira Bajet Kerja"
                            : "Estimate Work Budget"}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {lang === "MS"
                            ? "Kira anggaran bajet kos pendawaian dan pendingin hawa anda sebelum membuat tempahan."
                            : "Calculate approximate budget for wiring and aircond works before submitting."}
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={onRedirectToContact}
                      className="border border-slate-200 rounded-2xl p-5 hover:border-[#D4AF37] transition cursor-pointer flex gap-4 items-start"
                    >
                      <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 uppercase">
                          {lang === "MS"
                            ? "Sebut Harga Baru"
                            : "Request New Quote"}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {lang === "MS"
                            ? "Hantar maklumat kerja baru untuk mendapatkan jadual lawatan tapak percuma."
                            : "Send new work requirements to get a free site inspection schedule."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FCM PUSH NOTIFICATIONS CONFIGURATION */}
                <div className="border-t border-slate-100 pt-6">
                  <div className="bg-slate-50 border border-slate-150 p-6 rounded-3xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="bg-blue-100 text-blue-800 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full inline-block">
                          INTEGRASI PUSH NOTIFICATION (FCM)
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 uppercase">
                          {lang === "MS" ? "Notifikasi Tolak Mudah Alih (FCM)" : "Mobile Push Notifications (FCM)"}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                          {lang === "MS"
                            ? "Terima pemberitahuan push secara masa nyata pada peranti mudah alih anda apabila status tempahan atau aduan ditukar oleh admin."
                            : "Receive real-time push alerts on your mobile device when booking or complaint statuses change."}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!("Notification" in window)) {
                              alert("Penyemak imbas anda tidak menyokong Notifikasi Browser.");
                              return;
                            }
                            let perm = Notification.permission;
                            if (perm !== "granted") {
                              perm = await Notification.requestPermission();
                            }
                            if (perm === "granted") {
                              mainkanBunyiBenaFlash();
                              try {
                                if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
                                  const reg = await navigator.serviceWorker.ready;
                                  reg.showNotification("Notifikasi Ujian Bena Flash Global", {
                                    body: "Ujian Berjaya! Anda kini melanggan notifikasi browser secara terus.",
                                    icon: "https://i.ibb.co/6c1Xgxr4/BENA.png",
                                    tag: "bfg-test-notif",
                                  });
                                } else {
                                  new Notification("Notifikasi Ujian Bena Flash Global", {
                                    body: "Ujian Berjaya! Anda kini melanggan notifikasi browser secara terus.",
                                    icon: "https://i.ibb.co/6c1Xgxr4/BENA.png",
                                  });
                                }
                              } catch (e) {
                                console.warn("Direct notification fallback:", e);
                              }
                              setCustomerToast({
                                id: `toast-${Date.now()}`,
                                message: "Notifikasi browser ujian telah dihantar ke peranti anda!",
                              });
                            } else {
                              alert("Sila benarkan akses notifikasi pada tetapan penyemak imbas anda.");
                            }
                          }}
                          className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold uppercase px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <BellRing className="w-3.5 h-3.5 text-[#D4AF37] animate-bounce" />
                          <span>Uji Notifikasi Browser</span>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            const next = !fcmEnabled;
                            setFcmEnabled(next);
                            localStorage.setItem("bfg_fcm_enabled", String(next));
                            if (next) {
                              if ("Notification" in window) {
                                await Notification.requestPermission();
                              }
                            }
                            if (fcmToken) {
                              try {
                                await setDoc(doc(db, "fcm_subscriptions", fcmToken), {
                                  token: fcmToken,
                                  email: customerEmail.trim().toLowerCase(),
                                  active: next,
                                  updatedAt: new Date().toISOString(),
                                });
                              } catch (e) {
                                console.error("Error updating subscription:", e);
                              }
                            }
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
                            fcmEnabled
                              ? "bg-green-100 text-green-800 hover:bg-green-200 animate-pulse"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${fcmEnabled ? "bg-green-600 animate-pulse" : "bg-slate-400"}`}></span>
                          <span>{fcmEnabled ? "LANGGANAN AKTIF" : "NON-AKTIF"}</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px]">
                      <span className="font-bold text-slate-600 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Status Kebenaran Browser:{" "}
                        <span className="font-mono text-slate-800 uppercase font-black">
                          {typeof window !== "undefined" && "Notification" in window
                            ? Notification.permission === "granted"
                              ? "DILULUSKAN (GRANTED)"
                              : Notification.permission === "denied"
                              ? "DIBLOKIR (DENIED)"
                              : "BELUM DISAHKAN"
                            : "TIDAK DISOKONG"}
                        </span>
                      </span>
                      {fcmToken && (
                        <span className="font-mono text-slate-500 text-[10px] bg-white px-2 py-0.5 rounded border truncate max-w-xs">
                          Token: {fcmToken.slice(0, 20)}...
                        </span>
                      )}
                    </div>

                    {/* Notification logs inside the Customer Portal */}
                    <div className="space-y-3 pt-2">
                      <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest block border-b pb-1.5">
                        {lang === "MS" ? "Log Notifikasi Peranti Mudah Alih" : "Mobile Notification Logs"}
                      </span>
                      {fcmNotifications.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          {lang === "MS" ? "Tiada sebarang notifikasi diterima setakat ini." : "No notifications received yet."}
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {fcmNotifications.map((notif) => (
                            <div key={notif.id} className="p-3 bg-white rounded-xl border border-slate-150 flex gap-2.5 text-left shadow-2xs">
                              <span className="text-[#D4AF37] text-xs mt-0.5 font-bold">●</span>
                              <div>
                                <h5 className="font-bold text-xs text-slate-900">{notif.title}</h5>
                                <p className="text-[11px] text-slate-600 mt-0.5">{notif.body}</p>
                                <span className="text-[9px] text-slate-400 block mt-1 font-mono">
                                  {new Date(notif.createdAt).toLocaleString("ms-MY")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Important notices */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 leading-relaxed">
                    <span className="font-bold block uppercase mb-0.5">
                      {lang === "MS"
                        ? "Maklumat Tempoh Servis"
                        : "Maintenance Recommendations"}
                    </span>
                    {lang === "MS"
                      ? "Bagi memastikan pendingin hawa anda sejuk dan menjimatkan bil elektrik, kami mencadangkan anda melakukan chemical servicing sekurang-kurangnya sekali setiap 6 bulan."
                      : "To ensure your air conditioning remains cold and saves electricity, we suggest doing a chemical wash service at least once every 6 months."}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BOOKINGS & STATUS */}
            {activeSubTab === "bookings" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 uppercase">
                    {lang === "MS"
                      ? "Status Tempahan & Jadual"
                      : "Booking Status & Schedules"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === "MS"
                      ? "Senarai sebut harga dan slot lawatan tapak yang dikaitkan dengan e-mel anda."
                      : "List of quotes and site visits linked with your email."}
                  </p>
                </div>

                {isLoadingBookings ? (
                  <div className="text-center py-12 text-xs text-slate-400">
                    {lang === "MS"
                      ? "Memuatkan rekod..."
                      : "Loading records..."}
                  </div>
                ) : myBookings.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">
                      {lang === "MS"
                        ? "Tiada rekod tempahan di bawah e-mel ini."
                        : "No booking records found under this email."}
                    </p>
                    <button
                      onClick={onRedirectToContact}
                      className="mt-3 bg-[#0F172A] text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg"
                    >
                      {lang === "MS"
                        ? "Buat Tempahan Sekarang"
                        : "Make a Booking Now"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myBookings.map((b) => (
                      <div
                        key={b.id}
                        className="border border-slate-150 rounded-2xl p-5 bg-slate-50"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3 mb-3">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400">
                              REF: {b.id}
                            </span>
                            <h4 className="font-bold text-xs text-[#0F172A] uppercase">
                              {b.serviceType}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`self-start sm:self-auto text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                b.status === "New"
                                  ? "bg-blue-100 text-blue-700"
                                  : b.status === "Reviewed"
                                    ? "bg-amber-100 text-amber-700"
                                    : b.status === "Contacted"
                                      ? "bg-purple-100 text-purple-700"
                                      : b.status === "Completed"
                                        ? "bg-emerald-100 text-emerald-850 border border-emerald-200"
                                        : "bg-green-100 text-green-700"
                              }`}
                            >
                              {b.status === "New"
                                ? lang === "MS"
                                  ? "Baru"
                                  : "New"
                                : b.status === "Reviewed"
                                  ? lang === "MS"
                                    ? "Dalam Semakan"
                                    : "Reviewed"
                                : b.status === "Contacted"
                                  ? lang === "MS"
                                    ? "Dihubungi"
                                    : "Contacted"
                                : b.status === "Completed"
                                  ? lang === "MS"
                                    ? "Selesai"
                                    : "Completed"
                                  : lang === "MS"
                                    ? "Selesai Sebutharga"
                                    : "Quoted"}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                try {
                                  const doc = new jsPDF();
                                  doc.setFillColor(15, 23, 42);
                                  doc.rect(0, 0, 210, 40, "F");
                                  doc.setFillColor(212, 175, 55);
                                  doc.rect(0, 38, 210, 2, "F");
                                  doc.setTextColor(212, 175, 55);
                                  doc.setFont("helvetica", "bold");
                                  doc.setFontSize(20);
                                  doc.text("BENA FLASH GLOBAL PLT", 14, 18);
                                  doc.setTextColor(255, 255, 255);
                                  doc.setFont("helvetica", "normal");
                                  doc.setFontSize(9);
                                  doc.text("Kontraktor Elektrikal & M&E Specialist (CIDB G2)", 14, 26);
                                  doc.text("A-15A, Lorong Sungai Soi, Jaya 10, Jalan Kempadang, Kuantan, Pahang", 14, 32);

                                  doc.setTextColor(15, 23, 42);
                                  doc.setFont("helvetica", "bold");
                                  doc.setFontSize(14);
                                  doc.text("RINGKASAN & RESIT DIGITAL PERMOHONAN SERVIS", 14, 52);

                                  doc.setFontSize(10);
                                  doc.setFont("helvetica", "normal");
                                  doc.setTextColor(100, 116, 139);
                                  doc.text(`No. Rujukan: REF-${b.id.toUpperCase()}`, 14, 60);
                                  doc.text(`Tarikh Cetakan: ${new Date().toLocaleDateString("ms-MY")}`, 14, 66);

                                  doc.setDrawColor(226, 232, 240);
                                  doc.setFillColor(248, 250, 252);
                                  doc.roundedRect(14, 72, 182, 38, 3, 3, "FD");

                                  doc.setTextColor(15, 23, 42);
                                  doc.setFont("helvetica", "bold");
                                  doc.setFontSize(11);
                                  doc.text("MAKLUMAT PELANGGAN", 20, 82);

                                  doc.setFontSize(10);
                                  doc.setFont("helvetica", "normal");
                                  doc.text(`Nama Pelanggan : ${b.name || "N/A"}`, 20, 90);
                                  doc.text(`No. Telefon     : ${b.phone || "N/A"}`, 20, 96);
                                  doc.text(`E-mel           : ${b.email || "N/A"}`, 20, 102);

                                  doc.roundedRect(14, 116, 182, 54, 3, 3, "FD");
                                  doc.setFont("helvetica", "bold");
                                  doc.setFontSize(11);
                                  doc.text("BUTIRAN PERKHIDMATAN & TEMUJANJI", 20, 126);

                                  doc.setFontSize(10);
                                  doc.setFont("helvetica", "normal");
                                  doc.text(`Jenis Servis     : ${b.serviceType || "N/A"}`, 20, 134);
                                  doc.text(`Lokasi Tapak     : ${b.location || "N/A"}`, 20, 140);
                                  doc.text(`Tarikh Cadangan : ${b.scheduledDate || b.date || "N/A"}`, 20, 146);
                                  doc.text(`Slot Masa        : ${b.scheduledTimeSlot || "Menunggu Pengesahan"}`, 20, 152);
                                  doc.text(`Status Permohonan: ${b.status.toUpperCase()}`, 20, 158);

                                  doc.setFontSize(9);
                                  doc.setTextColor(148, 163, 184);
                                  doc.setFont("helvetica", "italic");
                                  doc.text("* Resit ini dijana secara digital oleh Sistem Portal Bena Flash Global PLT.", 14, 185);

                                  doc.save(`Resit_BFG_${b.id.slice(-6)}.pdf`);
                                } catch (err) {
                                  alert("Gagal menjana PDF, sila cuba sebentar lagi.");
                                }
                              }}
                              className="bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase transition shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3 h-3" />
                              <span>{lang === "MS" ? "Cetak Ringkasan" : "Print PDF"}</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-600 mb-3">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              <strong>
                                {lang === "MS"
                                  ? "Tarikh Cadangan:"
                                  : "Proposed Date:"}
                              </strong>{" "}
                              {b.scheduledDate || b.date}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              <strong>
                                {lang === "MS" ? "Masa:" : "Slot:"}
                              </strong>{" "}
                              {b.scheduledTimeSlot ||
                                (lang === "MS"
                                  ? "Menunggu Pengesahan"
                                  : "Awaiting Confirmation")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              <strong>
                                {lang === "MS" ? "Kawasan:" : "Area:"}
                              </strong>{" "}
                              {b.location}
                            </span>
                          </div>
                        </div>

                        {b.message && (
                          <div className="bg-white border p-3 rounded-lg text-[11px] text-slate-500 mb-3 italic">
                            "{b.message}"
                          </div>
                        )}

                        {b.adminFeedback ? (
                          <div className="bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-xl text-xs text-slate-700">
                            <span className="font-extrabold text-[#0F172A] block uppercase text-[9px] tracking-wider mb-0.5">
                              {lang === "MS"
                                ? "Maklum Balas Pentadbir"
                                : "Admin Remarks / Confirmation"}
                            </span>
                            {b.adminFeedback}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic">
                            *{" "}
                            {lang === "MS"
                              ? "Sebut harga anda sedang diproses. Juruteknik kami akan menghubungi anda sebentar lagi."
                              : "Your quote is being evaluated. Our technicians will reach you shortly."}
                          </div>
                        )}

                        {/* STAR RATING COMPONENT (CHOSEN WHEN STATUS IS 'Completed') */}
                        {b.status === "Completed" && (
                          <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl text-xs mt-3">
                            <span className="font-extrabold text-[#0F172A] block uppercase text-[9px] tracking-wider mb-1">
                              {lang === "MS" ? "Penilaian Perkhidmatan (Selesai)" : "Service Performance Rating (Completed)"}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              {[1, 2, 3, 4, 5].map((starValue) => {
                                const isSelected = b.rating && b.rating >= starValue;
                                return (
                                  <button
                                    key={starValue}
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        await setDoc(doc(db, "leads", b.id), { rating: starValue }, { merge: true });
                                      } catch (err) {
                                        console.error("Gagal menyimpan rating ke Firestore:", err);
                                      }
                                    }}
                                    className="p-1 hover:scale-115 transition-transform cursor-pointer"
                                  >
                                    <Star
                                      className={`w-5 h-5 ${
                                        isSelected
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-slate-300 hover:text-amber-300"
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                              {b.rating ? (
                                <span className="text-[10px] text-amber-600 font-bold ml-2">
                                  {lang === "MS" ? `Diberi ${b.rating}/5 Bintang` : `Rated ${b.rating}/5 Stars`}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic ml-2">
                                  {lang === "MS" ? "Sila berikan maklum balas penilaian anda" : "Please rate our service"}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* TWO-WAY WHATSAPP ADMIN INTERACTION BUTTON */}
                        <div className="mt-4 pt-3 border-t border-slate-200/40 flex justify-end">
                          <a
                            href={`https://wa.me/601110757515?text=${encodeURIComponent(
                              lang === "MS"
                                ? `Salam Admin BFG PLT, saya ingin bertanya tentang status/perincian tempahan saya dengan ID Rujukan: ${b.id} (${customerEmail})`
                                : `Hello Admin BFG PLT, I would like to inquire about the status/details of my booking with Reference ID: ${b.id} (${customerEmail})`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#25D366] hover:bg-[#128C7E] text-slate-950 font-black px-4 py-2 rounded-xl text-[10px] uppercase transition flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-950" />
                            {lang === "MS" ? "WhatsApp Admin" : "WhatsApp Admin"}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: WARRANTY */}
            {activeSubTab === "warranty" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 uppercase">
                      {lang === "MS"
                        ? "Jaminan Elektrik & Pendingin Hawa"
                        : "Electrical & Aircond Warranties"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lang === "MS"
                        ? "Pantau baki tarikh jaminan pemasangan dan pembaikan anda."
                        : "Track remaining warranty coverage for installation and repairs."}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase self-start sm:self-auto">
                    {lang === "MS"
                      ? "100% Jaminan Tulen"
                      : "100% Genuine Warranty"}
                  </span>
                </div>

                {/* List of active warranties */}
                <div className="space-y-3.5">
                  {warranties.map((w) => (
                    <div
                      key={w.docId || w.id}
                      className="border border-slate-150 rounded-2xl p-5 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50"
                    >
                      <div className="flex gap-4 items-start">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl mt-0.5">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold text-slate-400">
                              {w.id}
                            </span>
                            <span className="bg-green-100 text-green-800 text-[8px] font-black uppercase px-2 py-0.2 rounded">
                              {w.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-800 mt-0.5">
                            {w.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {w.type} • {lang === "MS" ? "Tempoh:" : "Duration:"}{" "}
                            {w.duration}
                          </span>
                        </div>
                      </div>

                      <div className="border-t sm:border-t-0 sm:border-l border-slate-200/60 pt-3 sm:pt-0 sm:pl-5 flex flex-col justify-center text-xs text-slate-500 shrink-0">
                        <span>
                          <strong>{lang === "MS" ? "Mula:" : "Start:"}</strong>{" "}
                          {w.startDate}
                        </span>
                        <span className="text-red-500 font-semibold mt-0.5">
                          <strong>
                            {lang === "MS" ? "Tamat:" : "Expires:"}
                          </strong>{" "}
                          {w.expiryDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Register new warranty manually */}
                <div className="border-t border-slate-100 pt-6">
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase mb-3">
                    {lang === "MS"
                      ? "Daftar Kad Jaminan Baru"
                      : "Register New Warranty Card"}
                  </h4>

                  <form
                    onSubmit={handleRegisterWarranty}
                    className="bg-slate-50 p-5 rounded-2xl space-y-4"
                  >
                    {warrantyMsg && (
                      <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl text-xs text-indigo-700 font-semibold">
                        {warrantyMsg}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          {lang === "MS"
                            ? "No. Rujukan / Invoice"
                            : "Reference / Invoice No."}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="cth: INV-9041"
                          value={warrantyForm.refNo}
                          onChange={(e) =>
                            setWarrantyForm({
                              ...warrantyForm,
                              refNo: e.target.value,
                            })
                          }
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          {lang === "MS"
                            ? "Nama Peralatan / Kerja"
                            : "Equipment / Work Name"}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="cth: Pemasangan Aircond Bilik"
                          value={warrantyForm.itemName}
                          onChange={(e) =>
                            setWarrantyForm({
                              ...warrantyForm,
                              itemName: e.target.value,
                            })
                          }
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          {lang === "MS" ? "Jenis Jaminan" : "Warranty Type"}
                        </label>
                        <select
                          value={warrantyForm.type}
                          onChange={(e) =>
                            setWarrantyForm({
                              ...warrantyForm,
                              type: e.target.value,
                            })
                          }
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs text-slate-800"
                        >
                          <option value="Aircond">
                            {lang === "MS"
                              ? "Pendingin Hawa"
                              : "Air Conditioner"}
                          </option>
                          <option value="Electrical">
                            {lang === "MS"
                              ? "Kerja Elektrikal"
                              : "Electrical Work"}
                          </option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-[#0F172A] text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition"
                    >
                      {lang === "MS" ? "Daftar Warranty" : "Register Warranty"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB: MAINTENANCE */}
            {activeSubTab === "maintenance" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 uppercase">
                    {lang === "MS"
                      ? "Jadual & Cadangan Penyelenggaraan"
                      : "Maintenance Schedules & Suggestions"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === "MS"
                      ? "Pastikan sistem keselamatan elektrikal dan penyejukan anda di tahap optimum."
                      : "Keep your cooling and electrical safety systems in optimal condition."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-150 p-5 rounded-2xl bg-slate-50/40">
                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                      <Wrench className="w-4 h-4" />
                      <h4 className="font-extrabold text-xs uppercase">
                        {lang === "MS"
                          ? "Servis Aircond Berkala"
                          : "Periodic Aircond Servicing"}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {lang === "MS"
                        ? "Penapis kotor mengurangkan kecekapan sebanyak 15% dan membebankan bil elektrik. Servis Normal disyorkan setiap 3-4 bulan, dan Chemical Wash setiap 6-9 bulan."
                        : "Dirty filters reduce efficiency by 15% and inflate power bills. Normal Service is recommended every 3-4 months, and Chemical Wash every 6-9 months."}
                    </p>
                    <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] text-indigo-800 font-bold">
                      {lang === "MS"
                        ? "Cadangan Servis Seterusnya: Selepas 6 Bulan"
                        : "Next Service Suggestion: In 6 Months"}
                    </div>
                  </div>

                  <div className="border border-slate-150 p-5 rounded-2xl bg-slate-50/40">
                    <div className="flex items-center gap-2 text-teal-600 mb-2">
                      <ShieldCheck className="w-4 h-4" />
                      <h4 className="font-extrabold text-xs uppercase">
                        {lang === "MS"
                          ? "Pemeriksaan DB Box Utama"
                          : "Main DB Box Inspections"}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {lang === "MS"
                        ? "Litar pintas sering berlaku disebabkan kelonggaran skru tamatan DB box atau kerosakan RCCB. Pemeriksaan keselamatan elektrikal disyorkan setiap 12 bulan sekali."
                        : "Short circuits are often caused by loose screws in DB box terminations or damaged RCCBs. Electrical safety checks are recommended once every 12 months."}
                    </p>
                    <div className="mt-4 p-3 bg-teal-50 border border-teal-100 rounded-xl text-[11px] text-teal-800 font-bold">
                      {lang === "MS"
                        ? "Cadangan Pemeriksaan: 12 Bulan Sekali"
                        : "Suggested Inspection: Once a Year"}
                    </div>
                  </div>
                </div>

                <div className="bg-[#0F172A] text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs uppercase text-[#D4AF37]">
                      {lang === "MS"
                        ? "Ingin Menjadualkan Penyelenggaraan?"
                        : "Want to Schedule Maintenance?"}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {lang === "MS"
                        ? "Hubungi kami hari ini untuk mengunci slot lawatan juruteknik M&E yang berkelayakan."
                        : "Reach us today to lock a maintenance visit slot with a certified technician."}
                    </p>
                  </div>
                  <button
                    onClick={onRedirectToContact}
                    className="bg-[#D4AF37] text-slate-900 hover:bg-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition"
                  >
                    {lang === "MS"
                      ? "Sembang Dengan Kami"
                      : "Book Maintenance Slot"}
                  </button>
                </div>
              </div>
            )}

            {/* TAB: CALCULATOR */}
            {activeSubTab === "calculator" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 uppercase">
                    {lang === "MS"
                      ? "Kalkulator Anggaran & Bajet Servis"
                      : "Service Budget Calculator"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === "MS"
                      ? "Kira kos anggaran kerja-kerja elektrikal dan aircond Bena Flash secara telus."
                      : "Transparently calculate estimated costs for Bena Flash electrical & aircond works."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl">
                  {/* Left input */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        {lang === "MS"
                          ? "Pilih Jenis Servis"
                          : "Select Service Type"}
                      </label>
                      <select
                        value={calcService}
                        onChange={(e) => setCalcService(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-800"
                      >
                        {(customRates || []).map((rate) => (
                          <option key={rate.id} value={rate.id}>
                            {lang === "MS" ? rate.labelMs : rate.labelEn} (RM{" "}
                            {rate.minPrice} - RM {rate.maxPrice})
                          </option>
                        ))}
                        {(customRates || []).length === 0 && (
                          <option value="">
                            {lang === "MS"
                              ? "Tiada Servis Tersedia"
                              : "No Services Available"}
                          </option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        {lang === "MS"
                          ? "Kuantiti Unit / Point"
                          : "Quantity of Units / Points"}
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCalcQty(Math.max(1, calcQty - 1))}
                          className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-700 active:scale-95 transition cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-extrabold text-sm text-slate-800">
                          {calcQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCalcQty(calcQty + 1)}
                          className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-700 active:scale-95 transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right result */}
                  <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        {lang === "MS"
                          ? "Anggaran Bajet Kasar (M&E)"
                          : "Rough Budget Estimate (M&E)"}
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
                        RM {minResult.toLocaleString()} - RM{" "}
                        {maxResult.toLocaleString()}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                        *{" "}
                        {lang === "MS"
                          ? "Anggaran kos ini adalah untuk panduan sahaja. Kos mutakhir bergantung kepada penilaian fizikal tapak oleh juruteknik kami."
                          : "This budget estimate is for reference only. Final quotation is subject to physical assessment by our technical team."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={onRedirectToContact}
                      className="mt-4 w-full bg-[#0F172A] text-[#D4AF37] hover:bg-slate-800 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {lang === "MS"
                          ? "Hantar Tempahan Ini"
                          : "Submit This Estimate"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ECOMMERCE SHOP */}
            {activeSubTab === "ecommerce" && (
              <div className="space-y-6 text-center">
                <div className="max-w-md mx-auto py-4">
                  <div className="w-14 h-14 bg-amber-50 text-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]/30">
                    <ShoppingBag className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-black text-slate-900 uppercase">
                    {lang === "MS"
                      ? "E-Commerce Utama BFG Store"
                      : "BFG Official E-Commerce Store"}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {lang === "MS"
                      ? "Beli barangan pendingin hawa, alat ganti tulen, DB box, smart switch, dan peralatan elektrik rumah premium terus dari kedai e-commerce rakan niaga rasmi kami dengan gerbang pembayaran selamat."
                      : "Purchase aircond products, genuine spare parts, DB boxes, smart switches, and home electrical components directly from our official shop partner with secure payment checkout."}
                  </p>

                  <div className="my-6 p-4 bg-slate-50 border rounded-2xl text-left space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      <span>
                        {lang === "MS"
                          ? "Penghantaran pantas ke seluruh Pahang"
                          : "Fast delivery throughout Pahang"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      <span>
                        {lang === "MS"
                          ? "Alat ganti 100% tulen & berjaminan"
                          : "100% genuine & warrantied parts"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      <span>
                        {lang === "MS"
                          ? "Invois cukai rasmi dibekalkan"
                          : "Official tax invoices provided"}
                      </span>
                    </div>
                  </div>

                  <a
                    href="https://benaflash.bukku.store"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex bg-[#D4AF37] hover:bg-[#b8952c] text-white font-extrabold uppercase tracking-widest text-xs px-6 py-3.5 rounded-xl transition-all duration-200 items-center gap-2 shadow-sm"
                  >
                    <span>
                      {lang === "MS"
                        ? "Layari Bena Store Sekarang"
                        : "Browse Bena Store Shop"}
                    </span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* TAB: HELPDESK */}
            {activeSubTab === "helpdesk" && (
              <div className="space-y-8 animate-fade-in text-slate-800">
                {/* Header Banner */}
                <div className="bg-[#0F172A] text-white p-6 rounded-2xl border-b-4 border-[#D4AF37] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                  <div className="space-y-1 relative z-10">
                    <span className="bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block">
                      {lang === "MS" ? "Sembang Live & Bantuan Teknikal" : "Live Chat & Technical Helpdesk"}
                    </span>
                    <h3 className="text-base font-black uppercase text-white tracking-tight flex items-center gap-1.5">
                      <HelpCircle className="w-5 h-5 text-[#D4AF37]" />
                      {lang === "MS" ? "Sokongan Pelanggan Cemerlang BFG PLT" : "BFG PLT Excellent Customer Support"}
                    </h3>
                    <p className="text-[11px] text-slate-400 max-w-lg leading-relaxed">
                      {lang === "MS"
                        ? "Ada sebarang kemusykilan teknikal? Hantar tiket bantuan terus kepada pasukan jurutera kami atau mulakan sembang di WhatsApp serta-merta."
                        : "Have any technical inquiries? Submit a support ticket directly to our engineers, or initiate a chat on WhatsApp instantly."}
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/601110757515?text=${encodeURIComponent(
                      `Salam BFG PLT, saya adalah pelanggan berdaftar (${customerEmail}). Ingin bertanya bantuan teknikal...`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] hover:bg-[#128C7E] text-slate-950 font-black px-5 py-3 rounded-xl text-[11px] uppercase transition flex items-center gap-1.5 cursor-pointer shadow-lg shrink-0"
                  >
                    <Phone className="w-4 h-4 text-slate-950" />
                    {lang === "MS" ? "WhatsApp Sokongan Teknikal" : "WhatsApp Tech Support"}
                  </a>
                </div>

                {/* Mode Selector */}
                <div className="flex border-b border-slate-200 gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setHelpdeskMode("ticket")}
                    className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      helpdeskMode === "ticket"
                        ? "border-[#D4AF37] text-slate-900 font-black"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {lang === "MS" ? "Tiket Sokongan & Aduan" : "Support Tickets & Complaints"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setHelpdeskMode("chat")}
                    className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                      helpdeskMode === "chat"
                        ? "border-[#D4AF37] text-slate-900 font-black"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{lang === "MS" ? "Sembang Langsung (Live Chat)" : "Live Chat Inbox"}</span>
                  </button>
                </div>

                {helpdeskMode === "ticket" ? (
                  /* Form and Previous Tickets Layout */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Submit Ticket Form */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b pb-2">
                      <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
                      {lang === "MS" ? "Buka Tiket Bantuan Baru" : "Open New Support Ticket"}
                    </h4>

                    {helpSuccess && (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 font-bold flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        {helpSuccess}
                      </div>
                    )}

                    {helpError && (
                      <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-800 font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        {helpError}
                      </div>
                    )}

                    <form onSubmit={handleSubmitHelpdesk} className="space-y-4 text-left">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                          {lang === "MS" ? "Kategori Bantuan" : "Support Category"}
                        </label>
                        <select
                          value={helpCategory}
                          onChange={(e) => setHelpCategory(e.target.value)}
                          className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:outline-hidden"
                        >
                          <option value="Penyelenggaraan Aircond">
                            {lang === "MS" ? "Penyelenggaraan Aircond" : "Aircond Servicing / Wash"}
                          </option>
                          <option value="Pemeriksaan Elektrikal / DB Box">
                            {lang === "MS" ? "Pemeriksaan Elektrikal / DB Box" : "Electrical / DB Box Inspection"}
                          </option>
                          <option value="Masalah Bil Elektrik Melambung">
                            {lang === "MS" ? "Masalah Bil Elektrik Melambung" : "High Electricity Bill Issues"}
                          </option>
                          <option value="Pertanyaan Sebut Harga">
                            {lang === "MS" ? "Pertanyaan Sebut Harga" : "Quotation Inquiries"}
                          </option>
                          <option value="Aduan Umum">
                            {lang === "MS" ? "Aduan Umum" : "General Complaints"}
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                          {lang === "MS" ? "Tajuk Aduan / Kemusykilan" : "Subject"}
                        </label>
                        <input
                          type="text"
                          required
                          value={helpSubject}
                          onChange={(e) => setHelpSubject(e.target.value)}
                          placeholder={lang === "MS" ? "Contoh: Aircond bilik utama tidak sejuk" : "e.g. Master bedroom AC not cooling"}
                          className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                          {lang === "MS" ? "Penjelasan Butiran (Keterangan)" : "Description / Details"}
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={helpMessage}
                          onChange={(e) => setHelpMessage(e.target.value)}
                          placeholder={lang === "MS" ? "Terangkan masalah secara terperinci untuk memudahkan tindakan juruteknik kami..." : "Explain the problem in detail to help our technicians act quickly..."}
                          className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:outline-hidden"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingHelp}
                        className="w-full bg-[#0F172A] hover:bg-[#D4AF37] hover:text-slate-950 text-white font-black px-4 py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {isSubmittingHelp ? (
                          <span>{lang === "MS" ? "Hantar..." : "Submitting..."}</span>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4" />
                            <span>{lang === "MS" ? "Hantar Tiket Bantuan" : "Submit Support Ticket"}</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Active Tickets & Admin Replies */}
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b pb-2">
                      <Clock className="w-4 h-4 text-[#D4AF37]" />
                      {lang === "MS" ? "Status & Respon Tiket Bantuan" : "Support Ticket Status & Replies"}
                    </h4>

                    {isLoadingTickets ? (
                      <div className="py-12 text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping"></span>
                        {lang === "MS" ? "Memuatkan senarai aduan..." : "Loading support list..."}
                      </div>
                    ) : supportTickets.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400 border border-dashed rounded-2xl bg-slate-50/50">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-200" />
                        {lang === "MS"
                          ? "Tiada sebarang tiket bantuan dibuka buat masa ini."
                          : "No support tickets open currently."}
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                        {supportTickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3 hover:border-[#D4AF37]/55 transition text-left"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <span className="bg-slate-100 text-slate-600 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                                  {ticket.category}
                                </span>
                                <h5 className="font-extrabold text-xs text-slate-900 uppercase">
                                  {ticket.subject}
                                </h5>
                                <p className="text-[10px] text-slate-400">
                                  {new Date(ticket.createdAt).toLocaleString("ms-MY")}
                                </p>
                              </div>

                              <span
                                className={`text-[9.5px] font-black uppercase px-2.5 py-1 rounded-full border tracking-wide shrink-0 ${
                                  ticket.status === "Selesai"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : ticket.status === "Dalam Proses"
                                    ? "bg-blue-50 text-blue-800 border-blue-200"
                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                }`}
                              >
                                {ticket.status || "Baru"}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed whitespace-pre-wrap">
                              {ticket.message}
                            </p>

                            {/* Admin Response section */}
                            <div className="border-t pt-3 mt-1">
                              {ticket.adminReply ? (
                                <div className="p-3 bg-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-xl space-y-1">
                                  <div className="flex items-center gap-1.5 text-[#D4AF37] font-extrabold text-[10px] uppercase tracking-wider">
                                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                                    <span>{lang === "MS" ? "Respon Pentadbir BFG PLT" : "BFG PLT Admin Response"}</span>
                                  </div>
                                  <p className="text-xs text-slate-700 leading-relaxed font-semibold italic">
                                    "{ticket.adminReply}"
                                  </p>
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-400 font-bold italic animate-pulse flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 shrink-0" />
                                  <span>
                                    {lang === "MS"
                                      ? "Menunggu respon teknikal dari pentadbir BFG..."
                                      : "Awaiting technical reply from BFG admin..."}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Live Chat Layout */
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 border-b pb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-950">
                      {lang === "MS" ? "Sembang Serta-merta dengan Pentadbir BFG PLT" : "Instant Live Chat with BFG PLT Admin"}
                    </h4>
                  </div>

                  {/* Chat stream */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 h-96 overflow-y-auto space-y-3 flex flex-col">
                    {chatMessages.length === 0 ? (
                      <div className="m-auto text-center py-12 text-slate-400">
                        <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="text-xs font-semibold">
                          {lang === "MS" 
                            ? "Tiada mesej setakat ini. Mulakan sembang dengan menghantar mesej di bawah!" 
                            : "No messages yet. Start chatting by sending a message below!"}
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isMe = msg.sender === "customer";
                        return (
                          <div
                            key={msg.id}
                            className={`max-w-[70%] p-3 rounded-2xl text-xs space-y-1 ${
                              isMe
                                ? "bg-[#0F172A] text-white rounded-br-none self-end text-left"
                                : "bg-slate-100 text-slate-800 rounded-bl-none self-start text-left font-semibold"
                            }`}
                          >
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            <span className={`text-[8.5px] block font-mono ${isMe ? "text-slate-300" : "text-slate-400"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString("ms-MY", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Form input */}
                  <form onSubmit={handleSendChatMessage} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      placeholder={lang === "MS" ? "Tulis mesej anda..." : "Type your message..."}
                      className="flex-1 text-xs font-semibold px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:outline-hidden text-slate-800"
                    />
                    <button
                      type="submit"
                      disabled={isSendingChat}
                      className="bg-[#0F172A] hover:bg-[#D4AF37] hover:text-slate-950 text-white font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                    >
                      {isSendingChat ? (lang === "MS" ? "Hantar..." : "Sending...") : (lang === "MS" ? "Hantar" : "Send")}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Interactive FAQ Modal */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-left text-slate-800">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="bg-[#D4AF37]/15 text-[#D4AF37] text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block">
                  FAQ PORTAL PELANGGAN
                </span>
                <h3 className="text-base font-extrabold uppercase text-slate-950 tracking-tight flex items-center gap-1.5">
                  <HelpCircle className="w-5 h-5 text-[#D4AF37]" />
                  {lang === "MS" ? "Pusat Soalan Lazim Interaktif" : "Interactive FAQ Center"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFaqModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition text-sm font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Interactive Search Bar & Categories */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={faqSearchQuery}
                  onChange={(e) => {
                    setFaqSearchQuery(e.target.value);
                    setExpandedFaqId(null);
                  }}
                  placeholder={lang === "MS" ? "Cari jawapan pantas... (Contoh: aircond, harga, waranti)" : "Search fast answers... (e.g. aircond, price, warranty)"}
                  className="w-full text-xs font-semibold pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:outline-hidden text-slate-800"
                />
              </div>
            </div>

            {/* FAQ Accordion List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {(() => {
                const filtered = faqsList.filter(faq => {
                  const query = faqSearchQuery.toLowerCase().trim();
                  if (!query) return true;
                  return (
                    faq.question.toLowerCase().includes(query) ||
                    faq.answer.toLowerCase().includes(query) ||
                    (faq.category && faq.category.toLowerCase().includes(query))
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <HelpCircle className="w-12 h-12 text-slate-200 mx-auto" />
                      <p className="text-xs font-bold">
                        {lang === "MS" 
                          ? "Tiada sebarang jawapan ditemui untuk carian anda." 
                          : "No matching answers found for your search."}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {lang === "MS"
                          ? "Anda boleh terus menghubungi pasukan juruteknik kami menggunakan menu Sembang Langsung!"
                          : "You can contact our technical team directly using the Live Chat menu!"}
                      </p>
                    </div>
                  );
                }

                return filtered.map((faq) => {
                  const isOpen = expandedFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="border border-slate-200 hover:border-[#D4AF37]/55 rounded-2xl overflow-hidden bg-white transition-all shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left font-extrabold text-xs text-slate-900 uppercase tracking-tight hover:bg-slate-50/50 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                          <span>{faq.question}</span>
                        </div>
                        <span className={`text-slate-400 font-mono transition-transform duration-200 ${isOpen ? "rotate-180 text-[#D4AF37]" : ""}`}>
                          ▼
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/70 animate-fade-in text-xs text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {lang === "MS" ? "Jumlah:" : "Total:"} {faqsList.length} Soalan Lazim
              </span>
              <button
                type="button"
                onClick={() => setIsFaqModalOpen(false)}
                className="bg-[#0F172A] hover:bg-[#D4AF37] hover:text-slate-950 text-white font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                {lang === "MS" ? "Tutup" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating System Alert Pop-up Toast with golden/brass design and Ringtone indicator */}
      {customerToast && (
        <div
          id="customer-realtime-toast"
          className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl shadow-2xl animate-fade-in flex gap-4 items-start"
        >
          <div className="p-3 bg-[#D4AF37]/15 rounded-xl border border-[#D4AF37]/35 text-[#D4AF37] animate-pulse shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="font-extrabold text-[11px] text-[#D4AF37] tracking-widest uppercase flex items-center gap-1.5">
              <span>MAKLUMAN SISTEM</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] inline-block animate-ping"></span>
            </h4>
            <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
              {customerToast.message}
            </p>
            <div className="pt-2 flex items-center justify-between gap-4">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider bg-slate-850 px-1.5 py-0.5 rounded">
                🎵 Bena Flash Chime
              </span>
              <button
                type="button"
                onClick={() => setCustomerToast(null)}
                className="text-[9px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition"
              >
                {lang === "MS" ? "Tutup" : "Dismiss"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
