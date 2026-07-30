/**
 * Google Apps Script for Bena Flash Global Website Backend API
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.google.com).
 * 2. Create a new Spreadsheet and name it "Bena Flash Global Database".
 * 3. Go to "Extensions" > "Apps Script".
 * 4. Delete any code in the editor and paste this entire script.
 * 5. Click the "Save" (floppy disk) icon.
 * 6. Click "Deploy" > "New deployment".
 * 7. Click the gear icon (Select type) and choose "Web app".
 * 8. Set the following settings:
 *    - Description: "BFG Website CRUD API"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone"
 * 9. Click "Deploy".
 * 10. Copy the "Web app URL" (it starts with https://script.google.com/macros/s/...)
 * 11. Log in to the Admin Dashboard of your website (https://bfgplt.com/admin or via local preview),
 *     go to the "Sistem Google Sheets" tab, paste the URL there, and enable Google Sheets.
 */

// Global lock to prevent concurrent write issues in Sheets
var LOCK_TIMEOUT_MS = 10000;

function doGet(e) {
  var params = e.parameter;
  var action = params.action;
  var collection = params.collection;
  
  if (!action || !collection) {
    return createJsonResponse({ success: false, error: "Missing action or collection parameter" });
  }
  
  var sheet = getOrCreateSheet(collection);
  
  if (action === "read") {
    var data = readData(sheet);
    return createJsonResponse({ success: true, data: data });
  }
  
  return createJsonResponse({ success: false, error: "Invalid GET action: " + action });
}

function doPost(e) {
  var postData;
  try {
    postData = JSON.parse(e.postData.contents);
  } catch (err) {
    return createJsonResponse({ success: false, error: "Malformed JSON payload: " + err.message });
  }
  
  var action = postData.action;
  var collection = postData.collection;
  var id = postData.id;
  var itemData = postData.data;
  
  if (!action || !collection) {
    return createJsonResponse({ success: false, error: "Missing action or collection in payload" });
  }
  
  var sheet = getOrCreateSheet(collection);
  
  // Acquire a lock to ensure thread safety during writes
  var lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(LOCK_TIMEOUT_MS)) {
      return createJsonResponse({ success: false, error: "Database is busy. Please try again later." });
    }
    
    if (action === "create") {
      var newItem = createData(sheet, itemData);
      return createJsonResponse({ success: true, data: newItem });
    }
    
    if (action === "update") {
      if (!id) {
        return createJsonResponse({ success: false, error: "Missing id for update" });
      }
      var updated = updateData(sheet, id, itemData);
      return createJsonResponse({ success: updated });
    }
    
    if (action === "delete") {
      if (!id) {
        return createJsonResponse({ success: false, error: "Missing id for delete" });
      }
      var deleted = deleteData(sheet, id);
      return createJsonResponse({ success: deleted });
    }
    
    return createJsonResponse({ success: false, error: "Invalid POST action: " + action });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  } finally {
    lock.releaseLock();
  }
}

// Helper to format response as JSON with CORS-friendly output
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
                       .setMimeType(ContentService.MimeType.JSON);
}

// Find a sheet by name or create a new one with correct headers
function getOrCreateSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Write standard headers
    sheet.appendRow(["id", "json_data", "timestamp"]);
    // Bold the headers
    sheet.getRange(1, 1, 1, 3).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Read all JSON records from sheet
function readData(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return []; // Header only
  
  var rows = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  var data = [];
  
  for (var i = 0; i < rows.length; i++) {
    var id = rows[i][0];
    var jsonStr = rows[i][1];
    if (!id) continue;
    
    try {
      var item = JSON.parse(jsonStr);
      item.id = String(id); // Ensure ID is preserved
      data.push(item);
    } catch (e) {
      // Fallback for raw text
      data.push({ id: String(id), raw: jsonStr, error: "JSON parse failed" });
    }
  }
  return data;
}

// Append a new JSON record
function createData(sheet, itemData) {
  var id = itemData.id || "id_" + Math.random().toString(36).substr(2, 9);
  itemData.id = id;
  
  var jsonStr = JSON.stringify(itemData);
  var timestamp = new Date().toISOString();
  
  sheet.appendRow([id, jsonStr, timestamp]);
  return itemData;
}

// Find and update a JSON record by its ID
function updateData(sheet, id, itemData) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;
  
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      itemData.id = id;
      var jsonStr = JSON.stringify(itemData);
      var timestamp = new Date().toISOString();
      
      // Update columns B (JSON Data) and C (Timestamp)
      sheet.getRange(i + 2, 2).setValue(jsonStr);
      sheet.getRange(i + 2, 3).setValue(timestamp);
      return true;
    }
  }
  return false;
}

// Find and delete a JSON record by ID
function deleteData(sheet, id) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;
  
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2); // Row is 1-indexed, +1 for header, +1 for loop index
      return true;
    }
  }
  return false;
}
