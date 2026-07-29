import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function test1() {
  try {
    const newLead = {
      id: "lead-test-1234",
      name: "Test User"
    };
    await setDoc(doc(db, "leads", newLead.id), newLead);
    console.log("Lead created in default db!");
  } catch (e) {
    console.error("Error Leads default db:", e.message);
  }
}
test1();
