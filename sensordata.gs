function recordSensorData() {
  const deviceData = getNatureRemoData("devices");　　　　//data取得
  const lastSensorData = getLastData("Inquiry");　　　　　//最終data取得

  var arg = {
    te: deviceData[0].newest_events.te.val,　　//温度
    hu: deviceData[0].newest_events.hu.val,　　//湿度
  }

  setSensorData(arg, lastSensorData + 1);
}

function setSensorData(data, row) {
  getSheet('Inquiry').getRange(row-1, 8, 1, 1).setValue(data.te); // 気温を8行目に記入
  getSheet('Inquiry').getRange(row-1, 9, 1, 1).setValue(data.hu); // 湿度を9行目に記入
}
