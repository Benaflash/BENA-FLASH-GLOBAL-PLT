const SCRIPT_URL = (import.meta as any).env.VITE_GOOGLE_APPS_SCRIPT_URL || '';

export async function fetchFromSheets(action: string) {
  if (!SCRIPT_URL) {
    console.warn("Sila masukkan VITE_GOOGLE_APPS_SCRIPT_URL di dalam .env");
    return [];
  }
  try {
    const res = await fetch(`${SCRIPT_URL}?action=${action}`);
    return await res.json();
  } catch (error) {
    console.error("Ralat mengambil data:", error);
    return [];
  }
}

export async function postToSheets(action: string, payload: any) {
  if (!SCRIPT_URL) return { success: false, error: 'Tiada URL Web App' };
  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action, payload }),
      headers: { 'Content-Type': 'application/json' },
      mode: 'no-cors' // Important for Google Apps Script to prevent CORS blocking from local
    });
    // With no-cors, you won't get a readable response back, but the request goes through.
    return { success: true }; 
  } catch (error) {
    console.error("Ralat menghantar data:", error);
    return { success: false, error };
  }
}
