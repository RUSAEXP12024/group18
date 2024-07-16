function getSheet(name) {
  const SPREADSHEET_ID = '13yYAt6QiLTLEnF7AEI0_KcPWFUNWfQ0sZDfFoKDBX18'
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    throw new Error('シートが見つかりません');
  }

  return sheet;
}

function getLastData(name) {
  return getSheet(name).getDataRange().getValues().length;
}
