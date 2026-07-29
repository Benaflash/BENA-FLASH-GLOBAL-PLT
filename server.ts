import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";

// Initialize Firebase SDK on Server-Side
let db: any = null;
let projectId: string = "";
let dbId: string = "";
let apiKey: string = "";

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    projectId = firebaseConfig.projectId;
    dbId = firebaseConfig.firestoreDatabaseId;
    apiKey = firebaseConfig.apiKey;
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app, dbId);
  }
} catch (err) {
  console.error("[Firebase Init] Failed to initialize Firebase SDK:", err);
}

// Helper to convert Firestore REST JSON response fields to standard JS objects
function parseFirestoreFields(fields: any) {
  const obj: any = {};
  if (!fields) return obj;
  for (const key of Object.keys(fields)) {
    const valObj = fields[key];
    if (valObj.stringValue !== undefined) {
      obj[key] = valObj.stringValue;
    } else if (valObj.booleanValue !== undefined) {
      obj[key] = valObj.booleanValue;
    } else if (valObj.integerValue !== undefined) {
      obj[key] = parseInt(valObj.integerValue);
    } else if (valObj.doubleValue !== undefined) {
      obj[key] = parseFloat(valObj.doubleValue);
    } else if (valObj.arrayValue !== undefined) {
      obj[key] = (valObj.arrayValue.values || []).map(
        (v: any) => v.stringValue || "",
      );
    }
  }
  return obj;
}

// Function to run a full backup of all Firestore collections
async function runDatabaseBackup() {
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
      console.warn("[Backup Job] Configuration not found. Skipping.");
      return { success: false, error: "config_not_found" };
    }
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const { projectId, apiKey, firestoreDatabaseId: dbId } = firebaseConfig;
    if (!projectId || !dbId || !apiKey) {
      console.warn("[Backup Job] Incomplete config. Skipping.");
      return { success: false, error: "incomplete_config" };
    }

    const collections = [
      "leads",
      "testimonials",
      "projects",
      "careers",
      "blogs",
      "applications",
      "inventory",
      "inventory_transactions",
      "support_tickets"
    ];

    const backupData: any = {
      timestamp: new Date().toISOString(),
      projectId,
      dbId,
      collections: {}
    };

    if (db) {
      for (const coll of collections) {
        try {
          const snap = await getDocs(collection(db, coll));
          const docs: any[] = [];
          snap.forEach((docSnap) => {
            docs.push({
              id: docSnap.id,
              ...docSnap.data()
            });
          });
          backupData.collections[coll] = docs;
        } catch (e: any) {
          console.warn(`[Backup Job] Failed to read collection '${coll}':`, e.message);
          backupData.collections[coll] = [];
        }
      }
    } else {
      console.warn("[Backup Job] Firestore SDK not initialized. Using empty lists.");
      for (const coll of collections) {
        backupData.collections[coll] = [];
      }
    }

    // 1. Write locally
    const backupsDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    const timestampStr = new Date().toISOString().replace(/[:.]/g, "-");
    const localFileName = `backup_${timestampStr}.json`;
    const localFilePath = path.join(backupsDir, localFileName);
    fs.writeFileSync(localFilePath, JSON.stringify(backupData, null, 2), "utf8");
    console.log(`[Backup Job] Backup saved locally to ${localFilePath}`);

    // 2. Try to write to Firestore 'backups' collection using SDK (optional best effort)
    const backupId = `backup-${Date.now()}`;
    const firestorePayload = {
      id: backupId,
      timestamp: backupData.timestamp,
      fileName: localFileName,
      jsonData: JSON.stringify(backupData),
      sizeBytes: Buffer.byteLength(JSON.stringify(backupData))
    };

    if (db) {
      try {
        await setDoc(doc(db, "backups", backupId), firestorePayload);
        console.log(`[Backup Job] Registered in Firestore backups (ID: ${backupId}).`);
      } catch (e: any) {
        console.warn(`[Backup Job] Note: Could not register in Firestore (security rules). Saved locally.`);
      }
    }

    return {
      success: true,
      backupId,
      timestamp: backupData.timestamp,
      fileName: localFileName,
      sizeBytes: Buffer.byteLength(JSON.stringify(backupData))
    };
  } catch (err) {
    console.error("[Backup Job] Error:", err);
    return { success: false, error: String(err) };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Setup Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Automated 24h Scheduled Service Reminders Checker
  async function checkAndSendReminders() {
    try {
      if (!db) {
        console.warn(
          "[Reminder Job] Firestore SDK not initialized. Skipping reminders check.",
        );
        return { success: false, message: "Firestore not initialized", sent: [] };
      }

      // Get tomorrow's date string in YYYY-MM-DD in Malaysia timezone
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kuala_Lumpur",
      });

      console.log(
        `[Reminder Job] Checking for active bookings scheduled for: ${tomorrowStr}`,
      );

      // Read leads collection via JS SDK
      const snap = await getDocs(collection(db, "leads"));
      const sentEmails: string[] = [];

      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      if (!smtpUser || !smtpPass) {
        console.warn(
          "[Reminder Job] SMTP credentials not configured. Skipping automated reminders email.",
        );
        return {
          success: false,
          message: "SMTP credentials not configured",
          sent: [],
        };
      }

      for (const docSnap of snap.docs) {
        const docId = docSnap.id;
        const fields = docSnap.data();

        const leadDate = fields.scheduledDate || "";
        const email = fields.email || "";
        const name = fields.name || "Pelanggan";
        const serviceType = fields.serviceType || "Servis Teknikal";
        const timeSlot = fields.scheduledTimeSlot || "Tidak ditetapkan";
        const reminderSent = !!fields.reminderSent;
        const status = fields.status || "New";

        // Criteria: scheduled date is tomorrow, email exists, reminder not sent yet, and status is active (not completed/rejected)
        if (
          leadDate === tomorrowStr &&
          email &&
          !reminderSent &&
          status !== "Completed" &&
          status !== "Rejected"
        ) {
          console.log(
            `[Reminder Job] Sending automated 24h reminder to: ${email} for lead ID: ${docId}`,
          );

          const mailHtml = `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #0F172A; padding: 24px; text-align: center; border-bottom: 4px solid #D4AF37;">
                <h2 style="color: #D4AF37; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">BENA FLASH GLOBAL</h2>
                <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">M&E Engineering & Aircond Specialist</p>
              </div>
              <div style="padding: 32px; background-color: #ffffff; color: #1e293b;">
                <h3 style="margin-top: 0; color: #0F172A; font-size: 18px; font-weight: 700;">Salam Sejahtera / Hello ${name},</h3>
                <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                  Ini adalah peringatan mesra bagi temujanji perkhidmatan/servis anda bersama <strong>Bena Flash Global (BFG)</strong> yang dijadualkan esok hari.
                </p>
                
                <div style="margin: 24px 0; background-color: #f8fafc; border-left: 4px solid #D4AF37; padding: 20px; border-radius: 8px;">
                  <h4 style="margin-top: 0; margin-bottom: 12px; color: #0F172A; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Butiran Temujanji:</h4>
                  <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 6px 0; font-weight: bold; color: #475569; width: 130px;">Jenis Servis:</td>
                      <td style="padding: 6px 0; color: #0F172A; font-weight: 600;">${serviceType}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-weight: bold; color: #475569;">Tarikh Temujanji:</td>
                      <td style="padding: 6px 0; color: #0F172A; font-weight: 600;">${leadDate} (Esok)</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-weight: bold; color: #475569;">Slot Masa:</td>
                      <td style="padding: 6px 0; color: #0F172A; font-weight: 600;">${timeSlot}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-weight: bold; color: #475569;">Lokasi Tapak:</td>
                      <td style="padding: 6px 0; color: #0F172A; font-weight: 600;">${fields.location || "Pahang"}</td>
                    </tr>
                  </table>
                </div>
                
                <p style="font-size: 13px; line-height: 1.6; color: #475569;">
                  Sila pastikan wakil atau pemilik premis berada di lokasi dan kawasan kerja bersedia untuk memudahkan juruteknik/pakar kami menjalankan pemeriksaan atau pemasangan dengan selamat dan lancar.
                </p>
                <p style="font-size: 13px; line-height: 1.6; color: #475569;">
                  Sekiranya anda perlu menukar atau menjadualkan semula temujanji ini, sila maklumkan kepada kami sekurang-kurangnya 12 jam sebelum waktu temujanji dengan menghubungi talian khidmat pelanggan kami.
                </p>
                
                <div style="margin-top: 32px; text-align: center;">
                  <a href="${process.env.BASE_URL || "https://www.bfgplt.com"}" style="background-color: #0F172A; color: #D4AF37; text-decoration: none; padding: 12px 24px; font-size: 12px; font-weight: bold; border-radius: 8px; border: 1px solid #D4AF37; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">Akses Portal Pelanggan BFG</a>
                </div>
              </div>
              <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 8px 0; font-weight: bold; color: #475569;">BENA FLASH GLOBAL PLT</p>
                <p style="margin: 0;">Sesi Google & M&E Engineering Dikawal Selia Secara Stabil</p>
                <p style="margin: 4px 0 0 0;">Emel ini dihantar secara automatik. Sila jangan balas emel ini.</p>
              </div>
            </div>
          `;

          await transporter.sendMail({
            from: `"Bena Flash Global" <${smtpUser}>`,
            to: email,
            subject: `Peringatan Temujanji Servis BFG Esok Hari (${serviceType})`,
            html: mailHtml,
          });

          // Update Firestore to set reminderSent = true using JS SDK
          try {
            await updateDoc(doc(db, "leads", docId), {
              reminderSent: true
            });
            console.log(
              `[Reminder Job] Updated Firestore document ${docId} successfully: reminderSent = true`,
            );
          } catch (updateErr: any) {
            console.warn(
              `[Reminder Job] Failed to update Firestore document ${docId}:`,
              updateErr.message
            );
          }

          sentEmails.push(email);
        }
      }

      return { success: true, sent: sentEmails };
    } catch (err: any) {
      console.error("[Reminder Job] Error in automated reminders job:", err);
      return { success: false, error: err.message || err, sent: [] };
    }
  }

  // Trigger reminders immediately 15 seconds after booting, then run every 4 hours
  setTimeout(() => {
    console.log(
      "[Reminder Job] Running initial startup check for 24h reminders...",
    );
    checkAndSendReminders();
  }, 15000);

  setInterval(
    () => {
      console.log(
        "[Reminder Job] Running scheduled interval check for 24h reminders...",
      );
      checkAndSendReminders();
    },
    1000 * 60 * 60 * 4,
  ); // every 4 hours

  // API routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, faqs = [], conversationHistory = [] } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ success: false, error: "Mesej dikehendaki" });
      }

      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        // Smart fallback search across FAQ items
        const lowerMsg = message.toLowerCase();
        const matchingFaq = faqs.find((f: any) =>
          f.question?.toLowerCase().includes(lowerMsg) ||
          lowerMsg.includes(f.question?.toLowerCase().slice(0, 12) || "") ||
          f.answer?.toLowerCase().includes(lowerMsg)
        );
        if (matchingFaq) {
          return res.json({
            success: true,
            reply: `[Rujukan FAQ BFG]: ${matchingFaq.answer}`,
            source: "faq_match"
          });
        }
        return res.json({
          success: true,
          reply: "Salam! Terima kasih kerana menghubungi Bena Flash Global PLT. Pasukan kejuruteraan & servis kami sedia membantu anda bagi sebarang perkhidmatan Pendawaian Elektrik, Pemasangan & Servis Aircond, Panel Solar PV dan Tender G2 di Pahang. Sila nyatakan keperluan anda atau buat tempahan temujanji tapak!",
          source: "default_fallback"
        });
      }

      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const faqContext = faqs.map((f: any) => `S: ${f.question}\nJ: ${f.answer}`).join("\n\n");

      const systemInstruction = `Anda adalah Pembantu Maya AI Rasmi Bena Flash Global PLT (BFG PLT), kontraktor elektrik, HVAC/aircond, dan kejuruteraan M&E berdaftar CIDB G2 di Pahang (Cawangan Kuantan & Pekan).
Tugas anda adalah memberi maklum balas yang mesra, profesional, tepat dan ringkas kepada soalan pelanggan dalam Bahasa Melayu (atau Bahasa Inggeris jika pelanggan bertanya dalam bahasa Inggeris).

Rujukan Maklumat FAQ Syarikat BFG PLT:
${faqContext}

Maklumat Tambahan:
- Alamat Kuantan: Indera Mahkota, Kuantan, Pahang
- Alamat Pekan: Bandar Pekan, Pahang
- No Telefon / WhatsApp: +6017-987 6543 / +6013-912 3456
- Waktu Operasi: Isnin - Sabtu (8:30 AM - 5:30 PM)
- Perkhidmatan Utama: Servis Aircond (Chemical Washing, Semakan Gas R32/R410a/R22), Pemasangan Aircond Inverter, Pendawaian Rumah/Kilang (3-Phase & 1-Phase), Panel Solar NEM, Pengujian ACB/VCB Transformer, Permohonan Lesen ST/TNB.

Pastikan jawapan anda ringkas, mesra, padat, dan menyertakan panduan bertindak jika pelanggan ingin membuat tempahan atau semakan status.`;

      const contents = [
        ...conversationHistory.map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        })),
        { role: "user", parts: [{ text: message }] }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "Terima kasih atas pertanyaan anda. Sila hubungi talian mesra BFG di +6017-987 6543 untuk maklumat lanjut.";
      res.json({ success: true, reply: replyText, source: "gemini_ai" });
    } catch (error: any) {
      // Handle quota limit or API errors gracefully with smart FAQ search
      const { message, faqs = [] } = req.body || {};
      const lowerMsg = (message || "").toLowerCase();
      const matchingFaq = faqs.find((f: any) =>
        f.question?.toLowerCase().includes(lowerMsg) ||
        lowerMsg.includes(f.question?.toLowerCase().slice(0, 12) || "") ||
        f.answer?.toLowerCase().includes(lowerMsg)
      );

      if (matchingFaq) {
        return res.json({
          success: true,
          reply: `[Pembantu FAQ BFG]: ${matchingFaq.answer}`,
          source: "faq_match"
        });
      }

      return res.json({
        success: true,
        reply: "Salam! Terima kasih atas pertanyaan anda. Bena Flash Global PLT sedia menawarkan perkhidmatan Pendawaian Elektrik, Pemasangan & Servis Aircond (Chemical & Inverter), Panel Solar PV, dan Kontraktor M&E G2 di Pahang. Anda boleh menggunakan borang sebut harga percuma atau semak status tempahan di portal kami!",
        source: "faq_fallback"
      });
    }
  });

  app.post("/api/check-reminders", async (req, res) => {
    console.log(
      "[API] Manual trigger received to check scheduled service reminders...",
    );
    const result = await checkAndSendReminders();
    res.json(result);
  });
  app.post("/api/send-email", async (req, res) => {
    try {
      const { subject, html, to } = req.body;
      const adminEmail = process.env.NOTIFICATION_EMAIL || "admin@bfgplt.com";
      const targetEmail = to || adminEmail;
      const user = process.env.SMTP_USER;

      if (!user || !process.env.SMTP_PASS) {
        console.warn("SMTP credentials not configured. Skipping email.");
        return res.json({ success: false, message: "SMTP not configured" });
      }

      await transporter.sendMail({
        from: `"Sistem Notifikasi BFG" <${user}>`,
        to: targetEmail,
        subject: subject,
        html: html,
      });

      console.log(
        `Email sent successfully to ${targetEmail} with subject: ${subject}`,
      );
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, error: "Failed to send email" });
    }
  });

  app.post("/api/telegram-notify", async (req, res) => {
    try {
      const namaPelanggan = String(req.body.namaPelanggan || "Pelanggan BFG").trim();
      const jenisKemaskini = String(req.body.jenisKemaskini || "Aktiviti Baharu").trim();
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (
        !botToken ||
        !chatId ||
        botToken.trim() === "" ||
        chatId.trim() === "" ||
        botToken.includes("YOUR_") ||
        chatId.includes("YOUR_")
      ) {
        console.warn(
          "Telegram credentials not configured or placeholder. Skipping notification.",
        );
        return res.json({ success: false, message: "Telegram not configured" });
      }

      const escapeHtml = (str: string) => {
        return (str || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      };

      const teksMesejHtml =
        `<b>🔔 NOTIFIKASI PORTAL BFG PLT</b>\n\n` +
        `👤 <b>Pelanggan:</b> ${escapeHtml(namaPelanggan)}\n` +
        `🛠️ <b>Tindakan:</b> ${escapeHtml(jenisKemaskini)}\n` +
        `📅 <b>Masa:</b> ${escapeHtml(new Date().toLocaleString("ms-MY"))}\n\n` +
        `Sila semak portal admin untuk tindakan susulan.`;

      // Try sending as HTML first
      let response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: teksMesejHtml,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        },
      );

      let data: any = await response.json();

      // Fallback: If Telegram complains about formatting (e.g., HTML parse error), send plain text
      if (!data.ok) {
        console.warn("Telegram HTML delivery failed, retrying plain text:", data?.description || data);
        const teksMesejPlain =
          `🔔 NOTIFIKASI PORTAL BFG PLT\n\n` +
          `👤 Pelanggan: ${namaPelanggan}\n` +
          `🛠️ Tindakan: ${jenisKemaskini}\n` +
          `📅 Masa: ${new Date().toLocaleString("ms-MY")}\n\n` +
          `Sila semak portal admin untuk tindakan susulan.`;

        response = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: teksMesejPlain,
            }),
          },
        );
        data = await response.json();
      }

      if (!data.ok) {
        console.warn("Telegram notification attempt failed:", data?.description || data);
        return res.json({
          success: false,
          message: data?.description || "Telegram API delivery failed",
        });
      }

      return res.json({ success: true });
    } catch (error: any) {
      console.warn("Error sending Telegram message:", error?.message || error);
      return res.json({ success: false, error: "Failed to send Telegram message" });
    }
  });

  app.post("/api/send-maintenance-reminder", async (req, res) => {
    try {
      const { email, name, serviceType, lastServiceDate } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "E-mel diperlukan" });
      }

      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (!smtpUser || !smtpPass) {
        return res.json({
          success: true,
          simulated: true,
          message: "Simulasi peringatan e-mel berjaya.",
        });
      }

      const mailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #0F172A; padding: 24px; text-align: center; border-bottom: 4px solid #D4AF37;">
            <h2 style="color: #D4AF37; margin: 0;">BENA FLASH GLOBAL PLT</h2>
            <p style="color: #94a3b8; font-size: 11px; margin-top: 4px;">PERINGATAN PENYELENGGARAAN BERKALA 6 BULAN</p>
          </div>
          <div style="padding: 28px; background-color: #ffffff; color: #1e293b;">
            <h3 style="color: #0F172A; margin-top: 0;">Salam Sejahtera ${name || "Pelanggan BFG"},</h3>
            <p style="line-height: 1.6; font-size: 14px;">
              Sudah <strong>6 bulan</strong> berlalu sejak servis <strong>${serviceType || "Aircond / Pendawaian Elektrik"}</strong> anda yang terakhir pada <strong>${lastServiceDate || "6 bulan lalu"}</strong> bersama Bena Flash Global PLT.
            </p>
            <p style="line-height: 1.6; font-size: 14px;">
              Untuk memastikan sistem pendingin hawa dan keselamatan elektrik rumah/premis anda berada pada tahap kecekapan maksimum serta menjimatkan bil elektrik, kami mengesyorkan pemeriksaan dan servis penyenggaraan berkala.
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="https://wa.me/601162995904?text=Salam%20Bena%20Flash%20Global%2C%20saya%20terima%20peringatan%20servis%206%20bulan.%20Saya%20ingin%20tempah%20slot%20servis%20berkala!" style="background-color: #0F172A; color: #D4AF37; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 8px; font-size: 13px; border: 1px solid #D4AF37; display: inline-block;">Tempah Servis Berkala Sekarang</a>
            </div>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Bena Flash Global PLT" <${smtpUser}>`,
        to: email,
        subject: `🔔 Peringatan Servis Berkala (6 Bulan) - Bena Flash Global PLT`,
        html: mailHtml,
      });

      return res.json({ success: true });
    } catch (err: any) {
      console.warn("Maintenance reminder email error:", err?.message || err);
      return res.json({ success: true, simulated: true });
    }
  });

  app.get("/api/google-reviews", async (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_PLACES_API_KEY || "AIzaSyAMzlxEVi5M1QIpY2Q8aip0OiiANik39kY";
      let placeId = process.env.GOOGLE_PLACE_ID || "";

      // If placeId is not hardcoded, let's find it using findplacefromtext
      if (!placeId) {
        const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Bena%20Flash%20Global%20Pahang&inputtype=textquery&fields=place_id,name,rating,user_ratings_total&key=${apiKey}`;
        const findResp = await fetch(findPlaceUrl);
        const findData = await findResp.json();

        if (
          findData.status === "OK" &&
          findData.candidates &&
          findData.candidates.length > 0
        ) {
          placeId = findData.candidates[0].place_id;
        } else {
          placeId = "ChIJ9Ztd7P2xyDERhp6V24En8tk"; // Fallback Place ID
        }
      }

      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total,name&language=ms&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.result) {
        return res.json({
          success: true,
          rating: data.result.rating || 5.0,
          totalReviews: data.result.user_ratings_total || (data.result.reviews ? data.result.reviews.length : 0),
          reviews: data.result.reviews || [],
        });
      } else {
        return res.json({
          success: false,
          message: data.error_message || "Failed to fetch Google Place details",
          reviews: [],
        });
      }
    } catch (err: any) {
      console.warn("Google Reviews API fetch error:", err?.message || err);
      return res.json({
        success: false,
        message: err?.message || "Server error fetching Google reviews",
        reviews: [],
      });
    }
  });

  app.post("/api/quote", (req, res) => {
    const { name, phone, location, skop } = req.body;
    if (!name || !phone || !location || !skop) {
      return res.status(400).json({ error: "Maklumat tidak lengkap" });
    }
    console.log("Permohonan Sebut Harga:", { name, phone, location, skop });
    res.json({
      message: "Permohonan berjaya diterima dan dalam proses.",
      success: true,
    });
  });

  // Database Backup on-demand endpoint
  app.post("/api/backup-now", async (req, res) => {
    console.log("[API] On-demand backup triggered via API");
    const result = await runDatabaseBackup();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  });

  // Get past backups from local file storage
  app.get("/api/backups", async (req, res) => {
    try {
      const backupsDir = path.join(process.cwd(), "backups");
      const backups: any[] = [];
      if (fs.existsSync(backupsDir)) {
        const files = fs.readdirSync(backupsDir);
        for (const file of files) {
          if (file.endsWith(".json")) {
            try {
              const filePath = path.join(backupsDir, file);
              const stats = fs.statSync(filePath);
              const fileContent = fs.readFileSync(filePath, "utf8");
              const parsed = JSON.parse(fileContent);
              backups.push({
                id: file.replace(".json", ""),
                timestamp: parsed.timestamp || stats.mtime.toISOString(),
                fileName: file,
                jsonData: fileContent,
                sizeBytes: stats.size
              });
            } catch (e) {
              console.error(`Error reading local backup ${file}:`, e);
            }
          }
        }
      }

      backups.sort((a: any, b: any) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      res.json({ success: true, backups });
    } catch (err) {
      console.error("[API] Error fetching backups:", err);
      res.status(500).json({ success: false, error: String(err) });
    }
  });

  // Dynamically generate sitemap.xml for SEO indexing
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl =
        process.env.BASE_URL || "https://www.bfgplt.com";

      let blogUrls = "";
      if (db) {
        try {
          const snapshot = await getDocs(collection(db, "blogs"));
          snapshot.forEach((doc) => {
            const blogId = doc.id;
            blogUrls += `  <url>\n    <loc>${baseUrl}/?tab=blog&amp;id=${blogId}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
          });
        } catch (err) {
          console.error("Error fetching blogs for sitemap:", err);
        }
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/?tab=projek</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/?tab=blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
${blogUrls}</urlset>`;

      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (e) {
      res.status(500).end();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Automated 24h backup scheduler
  // Run once after 35 seconds on startup, then every 24 hours
  setTimeout(() => {
    console.log("[Scheduler] Running initial startup backup job...");
    runDatabaseBackup();
  }, 35000);

  setInterval(() => {
    console.log("[Scheduler] Running automatic 24-hour backup job...");
    runDatabaseBackup();
  }, 1000 * 60 * 60 * 24);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
