function doGet(e) {
  var action = e.parameter.action;
  
  if (action == 'getUsers') {
    return getUsers();
  } else if (action == 'getProjects') {
    return getProjects();
  }
  
  return ContentService.createTextOutput("Tindakan tidak sah.").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  
  if (action == 'createProject') {
    return createProject(data.payload);
  } else if (action == 'updateProject') {
    return updateProject(data.payload);
  } else if (action == 'deleteProject') {
    return deleteProject(data.payload);
  }
  
  return ContentService.createTextOutput("Tindakan POST tidak sah.").setMimeType(ContentService.MimeType.TEXT);
}

function getSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function getUsers() {
  var sheet = getSheet('Users');
  var data = sheet.getDataRange().getValues();
  var users = [];
  
  for (var i = 1; i < data.length; i++) {
    users.push({
      email: data[i][0],
      role: data[i][1],
      name: data[i][2]
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify(users)).setMimeType(ContentService.MimeType.JSON);
}

function getProjects() {
  var sheet = getSheet('Projects');
  var data = sheet.getDataRange().getValues();
  var projects = [];
  
  if (data.length > 1) {
    var headers = data[0];
    for (var i = 1; i < data.length; i++) {
      var project = {};
      for (var j = 0; j < headers.length; j++) {
        project[headers[j]] = data[i][j];
      }
      projects.push(project);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(projects)).setMimeType(ContentService.MimeType.JSON);
}

function createProject(payload) {
  var sheet = getSheet('Projects');
  
  if (sheet.getLastRow() == 0) {
    sheet.appendRow(['id', 'title', 'category', 'status', 'date']);
  }
  
  var newId = Utilities.getUuid();
  sheet.appendRow([
    newId,
    payload.title,
    payload.category,
    payload.status,
    new Date().toISOString()
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, id: newId })).setMimeType(ContentService.MimeType.JSON);
}

function updateProject(payload) {
  var sheet = getSheet('Projects');
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == payload.id) { // id column
      // Assume order: id, title, category, status, date
      sheet.getRange(i + 1, 2).setValue(payload.title);
      sheet.getRange(i + 1, 3).setValue(payload.category);
      sheet.getRange(i + 1, 4).setValue(payload.status);
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Not found' })).setMimeType(ContentService.MimeType.JSON);
}

function deleteProject(payload) {
  var sheet = getSheet('Projects');
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == payload.id) {
      sheet.deleteRow(i + 1);
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Not found' })).setMimeType(ContentService.MimeType.JSON);
}
