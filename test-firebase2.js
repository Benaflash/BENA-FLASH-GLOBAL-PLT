import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, "ai-studio-dce0cccb-11f2-4cb5-842d-bba3d7dabbfb");

async function test1() {
  try {
    const newLead = {
      id: "lead-test-1234",
      name: "Test User"
    };
    await setDoc(doc(db, "leads", newLead.id), newLead);
    console.log("Lead created!");
  } catch (e) {
    console.error("Error Leads:", e.message);
  }
}
test1();
