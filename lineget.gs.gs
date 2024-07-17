const LINE_ACCESS_TOKEN = 'YKCpp+2mNpZLwf6MXOBnsXX0aW/H69cj5Gh48LNF9/WS2NPyPZq5D6xK+cbk4gNcIVp9JBhJTIUNG1BVEaNmcyKtsjQds6mY0uqCCb1JRp/djS5KNf6fkyviHJZUYxZSXtegm/DSl3QGMRpGRnMGUQdB04t89/1O/w1cDnyilFU=';

function sendHourlyMessage() {
  const spreadsheetId = '13yYAt6QiLTLEnF7AEI0_KcPWFUNWfQ0sZDfFoKDBX18';
  const sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
  const temperature = getLastNonEmptyValue(sheet, 'H'); // H列の最新の値を取得
  const humidity = getLastNonEmptyValue(sheet, 'I'); // I列の最新の値を取得

  if (temperature !== '' && humidity !== '') {
    const message = `現在の室温は${temperature}です。湿度は${humidity}です。エアコンを操作する場合はメッセージを送ってください。`;
    sendLineMessage(message);
  } else {
    Logger.log("H列またはI列の最新の値が取得できませんでした。");
  }
}

function getLastNonEmptyValue(sheet, columnLetter) {
  const range = sheet.getRange(columnLetter + ':' + columnLetter); 
  const values = range.getValues();
  
  for (let i = values.length - 1; i >= 0; i--) {
    const value = values[i][0];
    if (value !== '') {
      return value;
    }
  }
  return ''; 
}

function sendLineMessage(message) {
  const url = 'https://api.line.me/v2/bot/message/push';
  const recipient = 'U3e4797f6d3a2f166bb6b8d516262e59e'; // 送信先のユーザーID
  const payload = {
    to: recipient,
    messages: [{
      type: 'text',
      text: message
    }]
  };
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
    },
    payload: JSON.stringify(payload)
  };
  UrlFetchApp.fetch(url, options);
}

function createTimeDrivenTrigger() {
  ScriptApp.newTrigger('sendHourlyMessage')
    .timeBased()
    .everyHours(1)
    .create();
}
