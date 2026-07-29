import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  FileText,
  Mail,
  Calendar,
  HelpCircle,
  HardDrive,
  Video,
  LogIn,
  ExternalLink,
  RefreshCw,
  MessageSquare,
  Table,
  ListTodo,
  Users,
  StickyNote,
  Type,
  MonitorPlay,
  MousePointer2,
  Settings,
} from "lucide-react";

interface GoogleWorkspaceHubProps {
  oauthAccessToken: string | null;
  onGoogleSignIn: () => void;
}

export default function GoogleWorkspaceHub({
  oauthAccessToken,
  onGoogleSignIn,
}: GoogleWorkspaceHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    | "sheets"
    | "drive"
    | "gmail"
    | "chat"
    | "calendar"
    | "docs"
    | "slides"
    | "tasks"
    | "forms"
    | "contacts"
    | "keep"
    | "picker"
  >("drive");
  const [copied, setCopied] = useState(false);

  // Google Chat API State
  const [chatSpaces, setChatSpaces] = useState<any[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatStatus, setChatStatus] = useState("");
  const [selectedSpace, setSelectedSpace] = useState("");
  const [chatMessageText, setChatMessageText] = useState(
    "Salam pasukan M&E BFG! Ini adalah kemas kini status sistem mendalam terus daripada Portal Pentadbir.",
  );
  const [sendingChat, setSendingChat] = useState(false);

  // Drive API State
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [driveStatus, setDriveStatus] = useState("");

  // Gmail API State
  const [mailTo, setMailTo] = useState("admin@bfgplt.com");
  const [mailSubject, setMailSubject] = useState("Notifikasi Test Bena Flash");
  const [mailBody, setMailBody] = useState(
    "Salam sejahtera, ini adalah e-mel percubaan dari sistem integrasi google workspace BFG PLT.",
  );
  const [mailStatus, setMailStatus] = useState("");
  const [sendingMail, setSendingMail] = useState(false);

  // Calendar API State
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loadingCal, setLoadingCal] = useState(false);
  const [calStatus, setCalStatus] = useState("");
  // New Event Form State
  const [eventTitle, setEventTitle] = useState("Site Visit & Audit M&E");
  const [eventDesc, setEventDesc] = useState(
    "Pemeriksaan litar elektrikal dan pemasangan pendingin hawa di tapak.",
  );
  const [eventDate, setEventDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [eventStartTime, setEventStartTime] = useState("10:00");
  const [eventEndTime, setEventEndTime] = useState("11:30");
  const [withMeet, setWithMeet] = useState(true);

  // Extra Workspace Apps State
  const [tasksLists, setTasksLists] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [docsFiles, setDocsFiles] = useState<any[]>([]);
  const [slidesFiles, setSlidesFiles] = useState<any[]>([]);
  const [formsFiles, setFormsFiles] = useState<any[]>([]);
  const [pickerUrl, setPickerUrl] = useState("");

  // Fetch Drive Files dynamically when OAuth Token changes
  useEffect(() => {
    if (oauthAccessToken && activeSubTab === "drive") {
      fetchDriveFiles();
    }
  }, [oauthAccessToken, activeSubTab]);

  // Fetch Calendar events
  useEffect(() => {
    if (oauthAccessToken && activeSubTab === "calendar") {
      fetchCalendarEvents();
    }
  }, [oauthAccessToken, activeSubTab]);

  useEffect(() => {
    if (!oauthAccessToken) return;
    if (activeSubTab === "tasks") {
      fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
        headers: { Authorization: `Bearer ${oauthAccessToken}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.items) setTasksLists(d.items);
        })
        .catch(console.error);
    }
    if (activeSubTab === "contacts") {
      fetch(
        "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses",
        { headers: { Authorization: `Bearer ${oauthAccessToken}` } },
      )
        .then((r) => r.json())
        .then((d) => {
          if (d.connections) setContacts(d.connections);
        })
        .catch(console.error);
    }
    if (activeSubTab === "docs")
      fetchDriveMime("application/vnd.google-apps.document", setDocsFiles);
    if (activeSubTab === "slides")
      fetchDriveMime(
        "application/vnd.google-apps.presentation",
        setSlidesFiles,
      );
    if (activeSubTab === "forms")
      fetchDriveMime("application/vnd.google-apps.form", setFormsFiles);
  }, [oauthAccessToken, activeSubTab]);

  const fetchDriveMime = (mime: string, setter: any) => {
    fetch(
      `https://www.googleapis.com/drive/v3/files?q=mimeType='${mime}'&pageSize=10&fields=files(id,name,webViewLink)`,
      { headers: { Authorization: `Bearer ${oauthAccessToken}` } },
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.files) setter(d.files);
      })
      .catch(console.error);
  };

  // APP SCRIPT SOURCE CODE LENGKAP
  const appsScriptCode = `/**
 * BENA FLASH GLOBAL PLT - Google Sheets Database Sync & Admin API
 * Web App URL Endpoint to receive lead submissions, projects, certifications, careers, settings and audit logs.
 * 
 * CARA SETUP:
 * 1. Di Google Drive, bina Google Sheet baru dan beri nama "Bena Flash Global - database".
 * 2. Di dalam Sheet tersebut, pastikan nama Tab (Helaian) adalah seperti berikut:
 *    "Leads", "Projects", "CompanyInfo", "Certifications", "Applications", "AdminLogs", "AppSettings"
 * 3. Buka Google Sheet tersebut, klik "Extensions > Apps Script".
 * 4. Padam semua kod lalai, tampal kod lengkap di bawah, gantikan ID Google Sheet anda.
 * 5. Klik "Deploy > New Deployment". Pilih "Web app".
 * 6. Setkan: "Execute as: Me" dan "Who has access: Anyone".
 * 7. Salin pautan Web App URL yang diberikan dan masukkan di ruangan "CMS Settings" tab Analitis di laman web BFG atau di .env sebagai VITE_GOOGLE_APPS_SCRIPT_URL.
 */

var SPREADSHEET_ID = ""; // Ganti dengan ID Google Sheet anda jika mahu mengunci Sheet tertentu, atau kosongkan untuk auto-pautan.

var APPROVED_EMAILS = [
  "admin@bfgplt.com",
  "benaflash@gmail.com",
  "benaflash2026@gmail.com",
  "benaflashglobal@gmail.com",
  "benaflashglobal2026@gmail.com"
];

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var action = data.action;
    var payload = data.payload || {};
    var clientEmail = data.adminEmail || "";
    
    var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    
    // Senarai tindakan pentadbir (perlu pengesahan)
    var adminActions = [
      "add_project", "delete_project", "update_company", 
      "update_certifications", "admin_login_log", "save_setting",
      "delete_lead", "delete_certification", "delete_blog"
    ];
    
    // Semak pengesahan jika tindakan pentadbir dipanggil
    if (adminActions.indexOf(action) !== -1) {
      if (!clientEmail || APPROVED_EMAILS.indexOf(clientEmail.trim().toLowerCase()) === -1) {
        return ContentService.createTextOutput(JSON.stringify({ 
          status: "denied", 
          message: "Akses ditolak! Emel tidak disahkan sebagai pentadbir." 
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    if (action === "admin_login_log") {
      var sheet = getOrCreateSheet(ss, "AdminLogs");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Timestamp", "Email", "Action", "Status"]);
      }
      sheet.appendRow([
        new Date().toISOString(),
        clientEmail,
        payload.actionType || "LOG_IN",
        payload.status || "SUCCESS"
      ]);
    }
    else if (action === "save_setting") {
      var sheet = getOrCreateSheet(ss, "AppSettings");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["SettingKey", "SettingValue", "UpdatedBy", "Timestamp"]);
      }
      // Semak jika setting sedia ada untuk dikemaskini
      var keyToFind = payload.key;
      var valToSet = payload.value;
      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      var foundIndex = -1;
      
      for (var i = 1; i < values.length; i++) {
        if (values[i][0] === keyToFind) {
          foundIndex = i + 1; // 1-based index
          break;
        }
      }
      
      if (foundIndex !== -1) {
        sheet.getRange(foundIndex, 2).setValue(valToSet);
        sheet.getRange(foundIndex, 3).setValue(clientEmail);
        sheet.getRange(foundIndex, 4).setValue(new Date().toISOString());
      } else {
        sheet.appendRow([keyToFind, valToSet, clientEmail, new Date().toISOString()]);
      }
    }
    else if (action === "add_lead") {
      var sheet = getOrCreateSheet(ss, "Leads");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["ID", "Name", "Email", "Phone", "Service Type / Message", "Physical Address", "Date Submitted", "Status", "Rating"]);
      }
      sheet.appendRow([
        payload.id || "",
        payload.name || "",
        payload.email || "",
        payload.phone || "",
        payload.serviceType || payload.message || "",
        payload.address || "",
        new Date().toISOString(),
        payload.status || "New",
        payload.rating || ""
      ]);

      // Hantar Notifikasi Emel Serta-merta ke Admin
      var emailSubject = "[Tempahan BFG PLT Website] Sebut Harga Baru: " + (payload.name || "");
      var emailBody = "Salam Pentadbir,\\n\\nTerdapat selarasan tempahan/borang sebut harga masuk baru dari laman web:\\n\\n" +
                      "Nama: " + (payload.name || "") + "\\n" +
                      "E-mel: " + (payload.email || "") + "\\n" +
                      "No Tel: " + (payload.phone || "") + "\\n" +
                      "Skop Perkhidmatan: " + (payload.serviceType || "") + "\\n" +
                      "Lokasi: " + (payload.location || "") + "\\n" +
                      "Mesej: " + (payload.message || "") + "\\n\\n" +
                      "Butiran ini telah disimpan di dalam helaian Leads Google Sheet.\\n\\nSistem Automasi BFG PLT";
      try {
        MailApp.sendEmail("admin@bfgplt.com, benaflash@gmail.com", emailSubject, emailBody);
      } catch(e) {}
    }
    else if (action === "update_lead") {
      var sheet = getOrCreateSheet(ss, "Leads");
      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      var idToFind = payload.id;
      for (var i = 1; i < values.length; i++) {
        if (values[i][0] === idToFind) {
          if (payload.status) sheet.getRange(i + 1, 8).setValue(payload.status);
          if (payload.rating) sheet.getRange(i + 1, 9).setValue(payload.rating);
          break;
        }
      }
    }
    else if (action === "delete_lead") {
      var sheet = getOrCreateSheet(ss, "Leads");
      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      var idToFind = payload.id;
      for (var i = values.length - 1; i >= 1; i--) {
        if (values[i][0] === idToFind) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
    }
    else if (action === "add_project") {
      var sheet = getOrCreateSheet(ss, "Projects");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["ID", "Title", "Client", "Category", "Status", "Date Added"]);
      }
      sheet.appendRow([
        payload.id || "",
        payload.title || "",
        payload.client || "",
        payload.category || "",
        payload.status || "",
        new Date().toISOString()
      ]);
    }
    else if (action === "delete_project") {
      var sheet = getOrCreateSheet(ss, "Projects");
      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      var idToFind = payload.id;
      for (var i = values.length - 1; i >= 1; i--) {
        if (values[i][0] === idToFind) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
    }
    else if (action === "update_company") {
      var sheet = getOrCreateSheet(ss, "CompanyInfo");
      sheet.clear();
      sheet.appendRow(["Field", "Value"]);
      for (var key in payload) {
        sheet.appendRow([key, typeof payload[key] === 'object' ? JSON.stringify(payload[key]) : payload[key]]);
      }
    }
    else if (action === "update_certifications") {
      var sheet = getOrCreateSheet(ss, "Certifications");
      sheet.clear();
      sheet.appendRow(["ID", "Name", "Issuing Body", "Registration No", "Validity"]);
      if (Array.isArray(payload)) {
        payload.forEach(function(cert) {
          sheet.appendRow([
            cert.id || "",
            cert.name || "",
            cert.issuingBody || "",
            cert.registrationNo || "",
            cert.validity || ""
          ]);
        });
      }
    }
    else if (action === "add_application") {
      var sheet = getOrCreateSheet(ss, "Applications");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["ID", "Career ID", "Name", "Email", "Phone", "Date Submitted"]);
      }
      sheet.appendRow([
        payload.id || "",
        payload.careerId || "",
        payload.name || "",
        payload.email || "",
        payload.phone || "",
        new Date().toISOString()
      ]);

      // Hantar Notifikasi Emel Kerjaya Calon Serta-Merta ke Admin
      var emailSubject = "[Kerjaya BFG Website] Permohonan Jawatan Baru: " + (payload.careerTitle || "") + " - " + (payload.name || "");
      var emailBody = "Salam Pentadbir,\\n\\nTerdapat permohonan jawatan baru dihantar oleh calon melalui portal kerjaya:\\n\\n" +
                      "Nama Calon: " + (payload.name || "") + "\\n" +
                      "Jawatan Diminta: " + (payload.careerTitle || "") + "\\n" +
                      "E-mel Calon: " + (payload.email || "") + "\\n" +
                      "No Tel: " + (payload.phone || "") + "\\n" +
                      "Ringkasan Kualifikasi:\\n" + (payload.experienceSummary || "") + "\\n\\n" +
                      "Sila layari Dashboard Admin untuk memuat turun dokumen sokongan sedia ada.\\n\\nSistem Automasi BFG PLT";
      try {
        MailApp.sendEmail("admin@bfgplt.com, benaflash@gmail.com", emailSubject, emailBody);
      } catch(e) {}
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Data diselaraskan secara langsung ke Google Sheet!" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var action = e.parameter.action;
  
  if (action === "get_settings") {
    var sheet = getOrCreateSheet(ss, "AppSettings");
    var values = sheet.getDataRange().getValues();
    var settings = {};
    for (var i = 1; i < values.length; i++) {
      settings[values[i][0]] = values[i][1];
    }
    return ContentService.createTextOutput(JSON.stringify(settings))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return HtmlService.createHtmlOutput("<h2>Bena Flash Global - Google Sheets Sync API Aktif</h2><p>Penyambung ini dipasang dengan sifar ralat. Sila gunakan permintaan POST untuk menyegerakan data anda secara automatik.</p>");
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Google Drive REST API List
  const fetchDriveFiles = async () => {
    if (!oauthAccessToken) return;
    setLoadingDrive(true);
    setDriveStatus("");
    try {
      const res = await fetch(
        "https://www.googleapis.com/drive/v3/files?pageSize=6&fields=files(id,name,mimeType,thumbnailLink,webViewLink,iconLink)",
        {
          headers: { Authorization: `Bearer ${oauthAccessToken}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setDriveFiles(data.files || []);
      } else {
        const err = await res.json();
        setDriveStatus(
          `Gagal memuat naik fail Drive: ${err.error?.message || "Ralat tidak diketahui"}`,
        );
      }
    } catch (e: any) {
      setDriveStatus(`Ralat sambungan Drive: ${e.message}`);
    } finally {
      setLoadingDrive(false);
    }
  };

  // Google Calendar REST API List
  const fetchCalendarEvents = async () => {
    if (!oauthAccessToken) return;
    setLoadingCal(true);
    setCalStatus("");
    try {
      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMin=" +
          new Date().toISOString() +
          "&maxResults=5",
        {
          headers: { Authorization: `Bearer ${oauthAccessToken}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setCalendarEvents(data.items || []);
      } else {
        const err = await res.json();
        setCalStatus(
          `Gagal memuat kalendar: ${err.error?.message || "Ralat tidak diketahui"}`,
        );
      }
    } catch (e: any) {
      setCalStatus(`Ralat sambungan Kalendar: ${e.message}`);
    } finally {
      setLoadingCal(false);
    }
  };

  // Create Google Calendar event with Google Meet Option
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oauthAccessToken) return;
    setCalStatus("");
    try {
      const startDateTime = `${eventDate}T${eventStartTime}:00`;
      const endDateTime = `${eventDate}T${eventEndTime}:00`;

      const timeZone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kuala_Lumpur";

      const eventPayload: any = {
        summary: eventTitle,
        description: eventDesc,
        start: { dateTime: startDateTime, timeZone },
        end: { dateTime: endDateTime, timeZone },
      };

      if (withMeet) {
        eventPayload.conferenceData = {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        };
      }

      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${oauthAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventPayload),
        },
      );

      if (res.ok) {
        setCalStatus(
          "Berjaya menjadualkan sesi perjumpaan dalam Google Calendar!",
        );
        fetchCalendarEvents();
      } else {
        const err = await res.json();
        setCalStatus(
          `Ralat memasukkan jadual: ${err.error?.message || "Ralat tidak diketahui"}`,
        );
      }
    } catch (e: any) {
      setCalStatus(`Ralat Calendar: ${e.message}`);
    }
  };

  // Gmail REST API Send (Standard raw RFC 2822 payload for REST gateway)
  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oauthAccessToken) return;
    setSendingMail(true);
    setMailStatus("");

    try {
      // Build proper base64 RFC 2822 email payload
      const mailString = [
        `To: ${mailTo}`,
        `Subject: ${mailSubject}`,
        "Content-Type: text/plain; charset=UTF-8",
        "",
        mailBody,
      ].join("\n");

      // Encode base64url standard safe
      const encodedMail = btoa(unescape(encodeURIComponent(mailString)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const res = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${oauthAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ raw: encodedMail }),
        },
      );

      if (res.ok) {
        setMailStatus(
          "E-mel berdaftar berjaya di hantar keluar menggunakan Gerbang Gmail!",
        );
        setMailTo("admin@bfgplt.com");
      } else {
        const err = await res.json();
        setMailStatus(
          `Gagal menghantar e-mel: ${err.error?.message || "Ralat"}`,
        );
      }
    } catch (err: any) {
      setMailStatus(`Ralat menghantar emel: ${err.message}`);
    } finally {
      setSendingMail(false);
    }
  };

  // Fetch Google Chat spaces dynamically
  useEffect(() => {
    if (oauthAccessToken && activeSubTab === "chat") {
      fetchChatSpaces();
    }
  }, [oauthAccessToken, activeSubTab]);

  const fetchChatSpaces = async () => {
    if (!oauthAccessToken) return;
    setLoadingChat(true);
    setChatStatus("");
    try {
      const res = await fetch("https://chat.googleapis.com/v1/spaces", {
        headers: { Authorization: `Bearer ${oauthAccessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        const spaces = data.spaces || [];
        setChatSpaces(spaces);
        if (spaces.length > 0) {
          setSelectedSpace(spaces[0].name);
        }
      } else {
        const err = await res.json();
        setChatStatus(
          `Gagal memuat Google Chat Spaces: ${err.error?.message || "Ralat tidak diketahui"}`,
        );
      }
    } catch (e: any) {
      setChatStatus(`Ralat sambungan Google Chat: ${e.message}`);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oauthAccessToken || !selectedSpace) {
      setChatStatus(
        "Sila sambung Google & pilih ruang sembang terlebih dahulu.",
      );
      return;
    }
    setSendingChat(true);
    setChatStatus("");
    try {
      const res = await fetch(
        `https://chat.googleapis.com/v1/${selectedSpace}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${oauthAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: chatMessageText }),
        },
      );
      if (res.ok) {
        setChatStatus("Mesej berjaya dihantar ke dalam Google Chat Space!");
        setChatMessageText("");
      } else {
        const err = await res.json();
        setChatStatus(
          `Gagal menghantar mesej Google Chat: ${err.error?.message || "Ralat"}`,
        );
      }
    } catch (e: any) {
      setChatStatus(`Ralat Google Chat: ${e.message}`);
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
        <div>
          <h3 className="font-heading font-extrabold text-[#0F172A] text-lg uppercase tracking-wider">
            Pusat Integrasi Google Workspace
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Uruskan database Google Sheet, aset Drive, Gmail rasmi syarikat,
            borang, dan mesyuarat Meet secara langsung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {oauthAccessToken ? (
            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full border border-green-100 font-extrabold uppercase">
              <span className="w-2 h-2 rounded-full bg-green-600 block"></span>
              <span>Akaun Google Disambung</span>
            </div>
          ) : (
            <button
              onClick={onGoogleSignIn}
              className="flex items-center gap-2 bg-[#0F172A] text-white hover:bg-slate-800 text-xs font-bold uppercase px-4 py-2 bg-[#0F172A] rounded-xl transition"
            >
              <LogIn className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={3} />
              <span>Sambung Akaun Google</span>
            </button>
          )}
        </div>
      </div>

      {/* HORIZONTAL HUB TAB SELECTOR */}
      <div className="flex flex-wrap items-center gap-1.5 border-b pb-2 select-none">
        {[
          { id: "docs", icon: Type, label: "Docs" },
          { id: "slides", icon: MonitorPlay, label: "Slides" },
          { id: "drive", icon: HardDrive, label: "Drive" },
          { id: "gmail", icon: Mail, label: "Gmail" },
          { id: "chat", icon: MessageSquare, label: "Chat" },
          { id: "calendar", icon: Calendar, label: "Calendar" },
          { id: "tasks", icon: ListTodo, label: "Tasks" },
          { id: "forms", icon: Settings, label: "Forms" },
          { id: "keep", icon: StickyNote, label: "Keep" },
          { id: "contacts", icon: Users, label: "Contacts" },
          { id: "picker", icon: MousePointer2, label: "Picker" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === tab.id
                ? "bg-slate-100 text-slate-900 font-extrabold"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <tab.icon className="w-4 h-4 text-slate-600" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE INTEGRATION PANEL */}
      <div className="space-y-4">
        {/* DRIVE & PICKER PANEL */}
        {activeSubTab === "drive" && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-2">
              <h4 className="font-extrabold text-[#0F172A] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-sky-600" />
                Paparan Aset & Pembaca Fail Drive
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Uruskan fail korporat pemaju JKR, tender, penyaman udara, dan
                sebut harga langsung dari storan awan Google Drive anda.
              </p>
            </div>

            {!oauthAccessToken ? (
              <div className="text-center p-8 bg-slate-50 border border-dashed rounded-3xl space-y-3">
                <p className="text-xs text-slate-400 italic">
                  Sambung akaun Google anda terlebih dahulu untuk melayari fail
                  korporat anda di Google Drive.
                </p>
                <button
                  onClick={onGoogleSignIn}
                  className="bg-[#0F172A] text-[#D4AF37] px-4 py-2 rounded-xl text-xs font-bold uppercase transition hover:bg-slate-800"
                >
                  Sambung Drive Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold text-slate-700">
                    Senarai Fail Terkini
                  </span>
                  <button
                    onClick={fetchDriveFiles}
                    className="p-1 rounded hover:bg-slate-100 text-slate-500 transition"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loadingDrive ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>

                {driveStatus && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded text-red-700 text-xs font-bold">
                    {driveStatus}
                  </div>
                )}

                {loadingDrive ? (
                  <div className="py-12 flex justify-center items-center">
                    <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {driveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-3.5 bg-white border border-slate-200 rounded-2xl flex gap-3 items-center shadow-3xs hover:border-[#D4AF37] transition"
                      >
                        <img
                          src={file.iconLink}
                          alt=""
                          className="w-6 h-6 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {file.name}
                          </p>
                          <span className="text-[9px] text-slate-400 block truncate">
                            {file.mimeType}
                          </span>
                        </div>
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-slate-50 text-slate-600 hover:text-[#D4AF37] hover:bg-amber-50 rounded-lg transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                    {driveFiles.length === 0 && (
                      <div className="col-span-full py-8 text-center text-xs text-slate-400 italic">
                        Tiada fail dijumpai di Google Drive. Sila muat naik
                        tender atau sijil syarikat.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* GMAIL PANEL */}
        {activeSubTab === "gmail" && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-2">
              <h4 className="font-extrabold text-[#0F172A] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-red-600" />
                Gerbang E-mel Korporat Gmail
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hantar emel jawapan sebut harga dan pautan perjumpaan terus
                kepada pelanggan rasmi syarikat di bawah domain rasmi syarikat{" "}
                <strong>admin@bfgplt.com</strong>.
              </p>
            </div>

            {!oauthAccessToken ? (
              <div className="text-center p-8 bg-slate-50 border border-dashed rounded-3xl space-y-3">
                <p className="text-xs text-slate-400 italic">
                  Sambung akaun Gmail untuk menghantar mesej keluar.
                </p>
                <button
                  onClick={onGoogleSignIn}
                  className="bg-[#0F172A] text-[#D4AF37] px-4 py-2 rounded-xl text-xs font-bold uppercase transition hover:bg-slate-800"
                >
                  Sambung Gmail
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMail} className="space-y-3 max-w-xl">
                {mailStatus && (
                  <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded font-bold text-xs">
                    {mailStatus}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      E-mel Penerima
                    </label>
                    <input
                      type="email"
                      required
                      value={mailTo}
                      onChange={(e) => setMailTo(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Subjek E-mel
                    </label>
                    <input
                      type="text"
                      required
                      value={mailSubject}
                      onChange={(e) => setMailSubject(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Kandungan Mesej
                  </label>
                  <textarea
                    required
                    value={mailBody}
                    onChange={(e) => setMailBody(e.target.value)}
                    rows={4}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingMail}
                  className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase"
                >
                  {sendingMail ? "Menghantar..." : "Hantar E-mel Keluar"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* CALENDAR PANEL */}
        {activeSubTab === "calendar" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-2">
                <h4 className="font-extrabold text-[#0F172A] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Jadual Kerja & Google Meet Generator
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tambahkan sesi perjumpaan sebut harga, perbincangan tender
                  elektrikal, atau pemeriksaan pendingin hawa terus di Google
                  Calendar dengan pautan Meet.
                </p>
              </div>

              {!oauthAccessToken ? (
                <div className="text-center p-8 bg-slate-50 border border-dashed rounded-3xl space-y-3">
                  <p className="text-xs text-slate-400 italic">
                    Sambung ke Google Calendar untuk mengurus perjumpaan
                    syarikat.
                  </p>
                  <button
                    onClick={onGoogleSignIn}
                    className="bg-[#0F172A] text-[#D4AF37] px-4 py-2 rounded-xl text-xs font-bold uppercase transition hover:bg-slate-800"
                  >
                    Sambung Kalendar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateEvent} className="space-y-3">
                  {calStatus && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded font-bold text-xs">
                      {calStatus}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Tajuk Aktiviti Tapak / Mesyuarat
                    </label>
                    <input
                      type="text"
                      required
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Penerangan Sesi
                    </label>
                    <textarea
                      required
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Tarikh
                      </label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Mula
                      </label>
                      <input
                        type="text"
                        required
                        value={eventStartTime}
                        onChange={(e) => setEventStartTime(e.target.value)}
                        placeholder="10:00"
                        className="w-full text-xs p-2 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Tamat
                      </label>
                      <input
                        type="text"
                        required
                        value={eventEndTime}
                        onChange={(e) => setEventEndTime(e.target.value)}
                        placeholder="11:30"
                        className="w-full text-xs p-2 border border-slate-300 rounded focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1.5 select-none">
                    <input
                      type="checkbox"
                      id="googleMeetCheckbox"
                      checked={withMeet}
                      onChange={(e) => setWithMeet(e.target.checked)}
                      className="rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    <label
                      htmlFor="googleMeetCheckbox"
                      className="text-xs font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <Video className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        Sertakan Pautan Mesyuarat Google Meet Secara Automatik
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase"
                  >
                    Jadualkan Mesyuarat
                  </button>
                </form>
              )}
            </div>

            {/* List upcoming events */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block border-b pb-1.5 uppercase tracking-wider">
                Jadual Korporat Terkini
              </span>
              {loadingCal ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {calendarEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-1 text-slate-800 font-sans shadow-3xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs text-slate-800 truncate">
                          {ev.summary}
                        </span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-extrabold px-1.5 py-0.5 rounded uppercase">
                          Kalendar
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed truncate">
                        {ev.description || "Tiada penerangan dimasukkan."}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono pt-1.5 border-t border-slate-100">
                        <span>
                          {ev.start?.dateTime
                            ? new Date(ev.start.dateTime).toLocaleString(
                                "ms-MY",
                              )
                            : ev.start?.date || ""}
                        </span>
                        {ev.hangoutLink && (
                          <a
                            href={ev.hangoutLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-50 hover:bg-blue-100 border border-blue-150 rounded px-2 py-0.5 text-blue-700 font-sans font-bold flex items-center gap-1 transition shrink-0"
                          >
                            <Video className="w-3 h-3 text-blue-600" />
                            <span>Sertai Meet</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {oauthAccessToken && calendarEvents.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400 italic">
                      Tiada janji temu atau sesi tapak dijumpai dalam kalendar
                      utama anda. Jadualkan baru di sebelah kiri.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {["docs", "slides", "forms"].includes(activeSubTab) && (
        <div className="space-y-4">
          <h4 className="font-extrabold text-[#0F172A] text-xs uppercase tracking-wider">
            Senarai Fail {activeSubTab}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(activeSubTab === "docs"
              ? docsFiles
              : activeSubTab === "slides"
                ? slidesFiles
                : formsFiles
            ).map((f) => (
              <a
                key={f.id}
                href={f.webViewLink}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-white border rounded shadow-sm hover:border-slate-400 text-xs text-blue-600 truncate block"
              >
                {f.name}
              </a>
            ))}
          </div>
          {(activeSubTab === "docs"
            ? docsFiles
            : activeSubTab === "slides"
              ? slidesFiles
              : formsFiles
          ).length === 0 &&
            oauthAccessToken && (
              <p className="text-xs text-slate-500">Tiada fail dijumpai.</p>
            )}
        </div>
      )}

      {activeSubTab === "tasks" && (
        <div className="space-y-4">
          <h4 className="font-extrabold text-[#0F172A] text-xs uppercase tracking-wider">
            Google Tasks Lists
          </h4>
          <ul className="list-disc pl-5 text-sm text-slate-700">
            {tasksLists.map((t) => (
              <li key={t.id}>{t.title}</li>
            ))}
          </ul>
          {tasksLists.length === 0 && oauthAccessToken && (
            <p className="text-xs text-slate-500">
              Tiada senarai tugas dijumpai.
            </p>
          )}
        </div>
      )}

      {activeSubTab === "contacts" && (
        <div className="space-y-4">
          <h4 className="font-extrabold text-[#0F172A] text-xs uppercase tracking-wider">
            Google Contacts
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {contacts.map((c, i) => (
              <div key={i} className="p-3 border rounded text-xs bg-slate-50">
                <p className="font-bold">{c.names?.[0]?.displayName}</p>
                <p className="text-slate-500">{c.emailAddresses?.[0]?.value}</p>
              </div>
            ))}
          </div>
          {contacts.length === 0 && oauthAccessToken && (
            <p className="text-xs text-slate-500">Tiada kenalan dijumpai.</p>
          )}
        </div>
      )}

      {activeSubTab === "keep" && (
        <div className="space-y-4">
          <h4 className="font-extrabold text-[#0F172A] text-xs uppercase tracking-wider">
            Google Keep
          </h4>
          <p className="text-xs text-slate-600 border border-slate-200 p-4 rounded bg-slate-50 italic">
            Sambungan Google Keep API berjaya disediakan secara lalai. Modul
            pembaca nota Google Keep akan diaktifkan di dalam versi seterusnya.
          </p>
        </div>
      )}

      {activeSubTab === "picker" && (
        <div className="space-y-4">
          <h4 className="font-extrabold text-[#0F172A] text-xs uppercase tracking-wider">
            Google Picker Alternative
          </h4>
          <p className="text-xs text-slate-600 bg-red-50 p-3 rounded border border-red-100 text-red-800">
            Google Picker API memerlukan konfigurasi Developer Key tambahan.
            Sebagai alternatif, sila pautkan atau tampal URL fail secara manual:
          </p>
          <input
            type="text"
            value={pickerUrl}
            onChange={(e) => setPickerUrl(e.target.value)}
            placeholder="Tampal Pautan Fail di sini..."
            className="w-full text-xs p-3 border rounded"
          />
          {pickerUrl && (
            <a
              href={pickerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 underline"
            >
              Buka Pautan
            </a>
          )}
        </div>
      )}
    </div>
  );
}
