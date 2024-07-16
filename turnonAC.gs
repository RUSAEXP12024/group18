function controlACBasedOnSheet() {
  var sheetName = "Inquiry";  
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log("Error: Sheet named '" + sheetName + "' not found.");
    return;
  }

  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange("1:1").getValues()[0];
  var acStatusIndex = headers.indexOf("エアコン");  
  var tempIndex = headers.indexOf("設定温度");  

  if (acStatusIndex === -1 || tempIndex === -1) {
    Logger.log("Error: Column names not found.");
    return;
  }

  var acStatus = sheet.getRange(lastRow, acStatusIndex + 1).getValue(); 
  var temperature = sheet.getRange(lastRow, tempIndex + 1).getValue(); 

  if (!acStatus || !temperature) {
    Logger.log("Error: Missing data in the latest row.");
  }

  // Call the function to turn on/off the A/C
  sendCommandToAC(acStatus, temperature);
}

function sendCommandToAC(status, temp) {
  var applianceId = "applianceID"; // 
  var accessToken = "token"; // 
  var apiUrl = "https://api.nature.global/1/appliances/" + applianceId + "/aircon_settings";

  var options;

  if (status === "ON") {

    options = {
      "method": "POST",
      "headers": {
        "Authorization": "Bearer " + accessToken,
        "Content-Type": "application/json"
      },
      "payload": JSON.stringify({
        "operation_mode": "cool", // Assuming 'cool' mode for ON
        "temperature": "temp.toString()", // Ensure temperature is set as a string
        "air_volume": "auto", // Set fan speed to auto, adjust as needed
        "temperature_unit": "c"
      })
    };
  } else if (status === "OFF") {
    options = {
      "method": "post",
      "headers": { 
        Authorization: "Bearer " + accessToken },
        "payload": {
        appliance: applianceId,
        button: "power-off",
      },
    };
  }

  try {
    var response = UrlFetchApp.fetch(apiUrl, options);
    Logger.log("A/C Command Response: " + response.getContentText());

    if (response.getResponseCode() == 200) {
      Logger.log("Air conditioner command successful: " + status);
    } else {
      Logger.log("Failed to execute air conditioner command: " + status + ". Response: " + response.getContentText());
    }
  } catch (error) {
    Logger.log("Error sending command to A/C: " + error.message);
  }
}
