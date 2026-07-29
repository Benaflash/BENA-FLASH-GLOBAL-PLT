import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test1() {
  try {
    const newLead = {
      id: "lead-test-1234",
      name: "Test User",
      email: "test@example.com",
      phone: "0123456789",
      location: "Kuantan",
      serviceType: "Aircond",
      budget: "100",
      message: "Test",
      status: "New",
      date: new Date().toISOString()
    };
    await setDoc(doc(db, "leads", newLead.id), newLead);
    console.log("Lead created!");
  } catch (e) {
    console.error("Error Leads:", e.message);
  }
}
async function test2() {
  try {
    const newNotif = {
      id: "notif-test-1234",
      timestamp: new Date().toISOString(),
      type: "booking",
      title: "Booking / Permohonan Baru",
      message: "Test",
      read: false,
      senderName: "Test",
      senderEmail: "test@example.com"
    };
    await setDoc(doc(db, "notifications", newNotif.id), newNotif);
    console.log("Notification created!");
  } catch (e) {
    console.error("Error Notif:", e.message);
  }
}
async function run() {
  await test1();
  await test2();
  process.exit(0);
}
run();
