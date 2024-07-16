const SHEET_URL = "https://docs.google.com/spreadsheets/d/13yYAt6QiLTLEnF7AEI0_KcPWFUNWfQ0sZDfFoKDBX18/edit?gid=0#gid=0";
const CHANNEL_ACCESS_TOKEN = 'YKCpp+2mNpZLwf6MXOBnsXX0aW/H69cj5Gh48LNF9/WS2NPyPZq5D6xK+cbk4gNcIVp9JBhJTIUNG1BVEaNmcyKtsjQds6mY0uqCCb1JRp/djS5KNf6fkyviHJZUYxZSXtegm/DSl3QGMRpGRnMGUQdB04t89/1O/w1cDnyilFU=';

const InquiryColumn = { TimeStamp: 1, UserId: 2, Contents: 3, Name: 4, Mail: 5, Status: 7 ,Aircon: 10};
const UserStatus = { Follow: "follow", Name: "name", Address: "address", Aircon: "aircon", Finish: "finish" };

const spreadSheet = SpreadsheetApp.openByUrl(SHEET_URL);

const inquirySheet = spreadSheet.getSheetByName("Inquiry");
const logSheet = spreadSheet.getSheetByName("log");
const notifySheet = spreadSheet.getSheetByName("返信通知");


function doPost(request) {
    const receiveJSON = JSON.parse(request.postData.contents);
    const event = receiveJSON.events[0];

    logSheet.appendRow([event]);

    if (event.type == "follow") {
        inquirySheet.appendRow([getCurrentTime(), event.source.userId, , , , , UserStatus.Follow]);
        replyToUser(event.replyToken, "はじめまして、ご利用ありがとうございます。");
        return;
    }

    if (event.message.type != "text") {
        return
    }

    if (event.message.text === "ON") {
      inquirySheet.appendRow([getCurrentTime(), event.source.userId, , , , , , , , event.message.text, , UserStatus.Name]);
      replyToUser(event.replyToken, "ONにします")
      return
    }

    if (event.message.text === "OFF") {
      inquirySheet.appendRow([getCurrentTime(), event.source.userId, , , , , , , , event.message.text, , UserStatus.Name]);
      replyToUser(event.replyToken, "OFFにします")
      return
    }
    

    const rowIndex = findRowByUserId(event.source.userId)

    const userStatus = inquirySheet.getRange(rowIndex, InquiryColumn.Status).getValue();

    if (userStatus === UserStatus.Follow) {
        replyToUser(event.replyToken, "今から初期設定を行います。\nお名前をご入力ください。")
    } else if (userStatus === UserStatus.Name) {
        replyToUser(event.replyToken, "エアコンの温度を設定してください");
    } else if (userStatus === UserStatus.Address) {
        replyToUser(event.replyToken, "エアコンを起動しますか？起動[ON],停止[OFF]")
    } else if (userStatus === UserStatus.Aircon) {
        replyToUser(event.replyToken, "了解しました。再度設定する際は「設定温度を変更」と入力してください。")
    }

    const changeStatus = update(rowIndex, userStatus, event.message.text)
    if (!changeStatus) {
        replyToUser(event.replyToken, "今から再設定を行います。\nお名前をご入力ください。")
        inquirySheet.appendRow([getCurrentTime(), event.source.userId, event.message.text, , , , UserStatus.Name]);

    }
}


function getCurrentTime() {
    return Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss");
}

function findRowByUserId(userId) {

    const userIdListRange = inquirySheet.getRange(1, 2, inquirySheet.getLastRow()).getValues();

    const arrData = Array.prototype.concat.apply([], userIdListRange);

    const index = arrData.lastIndexOf(userId);

    return index === -1 ? index : index + 1;
}

function replyToUser(replyToken, text) {

    const replyText = {
        "replyToken": replyToken,
        "messages": [{
            "type": "text",
            "text": text,
        }]
    }

    const options = {
        "method": "post",
        "headers":
        {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN,
        },
        "payload": JSON.stringify(replyText)
    };

    UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", options);
}

function update(rowIndex, userStatus, text) {
    if (userStatus === UserStatus.Follow) {
        inquirySheet.getRange(rowIndex, InquiryColumn.Contents).setValue(text);
        inquirySheet.getRange(rowIndex, InquiryColumn.Status).setValue(UserStatus.Name);
    } else if (userStatus === UserStatus.Name) {
        inquirySheet.getRange(rowIndex, InquiryColumn.Name).setValue(text);
        inquirySheet.getRange(rowIndex, InquiryColumn.Status).setValue(UserStatus.Address);
    } else if (userStatus === UserStatus.Address) {
        inquirySheet.getRange(rowIndex, InquiryColumn.Mail).setValue(text);
        inquirySheet.getRange(rowIndex, InquiryColumn.Status).setValue(UserStatus.Aircon);
    } else if (userStatus === UserStatus.Aircon) {
        inquirySheet.getRange(rowIndex, InquiryColumn.Aircon).setValue(text);
        inquirySheet.getRange(rowIndex, InquiryColumn.Status).setValue(UserStatus.Finish);
    } else {
        // 既に該当ユーザーの入力が終わっていた場合
        return false;
    }

    return true;
}
