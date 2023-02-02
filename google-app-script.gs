var wbook = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1JgINylQ8Dp0EfvSuoYQyNCMbZ4Wh1RUaBFEJKexeGXY/edit?usp=sharing");


function doPost(e)
{
  var action = e.parameter.action;
  
  if(action == 'forumPost')
  {
    return forumPost(e);
  }
  else if(action == 'userLogin')
  {
    return userLogin(e);
  }
  else if(action == "quizAttempt")
  {
    return quizAttempted(e);
  }

}

//called when someone finishes quiz
function quizAttempted(e)
{
  var data = JSON.parse(e.postData.contents);
  var sheet = wbook.getSheetByName(data.sheetName+"_aktivnosti");
  
  var quizIdCol = sheet.createTextFinder("Quiz: "+data.quizId).findNext();
  
  //If quizId column for received quiz doesn't exist, insert one and get new column index
  if(!quizIdCol){
    var column = 3;//because first 3 columns are populated with [indeks, ime, prezime,]
    var lastColumn = 1;
    while(sheet.getRange(1,lastColumn).isBlank() == false){
      lastColumn++;
    }
    sheet.getRange(1,lastColumn).setValue("Quiz: "+data.quizId);
    quizIdCol = lastColumn;
    sheet.getRange(1,lastColumn+1).setValue("Vreme zavrsetka quiz-a "+data.quizId+":");
  }
  //Else, get column index
  else{
    quizIdCol = quizIdCol.getColumn();
  }


  
  var studentIdRow = sheet.createTextFinder(data.indeks).findNext();
  if(!studentIdRow)
  {
    sheet.appendRow([data.indeks, data.ime, data.prezime]);
    studentIdRow = sheet.getLastRow();//returns the position of the last row that HAS content
  }
  else
  {
    studentIdRow = studentIdRow.getRow();
  }
  sheet.getRange(studentIdRow,quizIdCol).setValue(data.ocena);
  sheet.getRange(studentIdRow,quizIdCol+1).setValue(UnixTimeToDate(+data.timestamp));

  

  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
 
}

//gets called when post on forum is created
function forumPost(e)
{

  var data = JSON.parse(e.postData.contents);
  var sheet = wbook.getSheetByName(data.sheetName+"_forum");
  var timestamp = UnixTimeToDate(+data.timestamp);
  sheet.appendRow([data.id,data.ime,data.prezime,timestamp,data.action]);

  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}

//called when user logs in
function userLogin(e)
{
  
  var data = JSON.parse(e.postData.contents);
  var sheet = wbook.getSheetByName(data.sheetName);
  var userRow = sheet.createTextFinder(data.indeks).findNext();

  //If it's a first login, new row is created
  if(!userRow){
    sheet.appendRow([data.indeks, data.ime, data.prezime, UnixTimeToDate(+data.timestamp)]);
  }

  //Else, cell is updated
  else{
    userRow = userRow.getRow();
    var lastLoginColumn = sheet.createTextFinder("Vreme poslednjeg prijavljivanja").findNext().getColumn();
    var cell = sheet.getRange(userRow,lastLoginColumn);
    cell.setValue(UnixTimeToDate(+data.timestamp));
  }
  
  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}

function UnixTimeToDate(tim) {
  //var tim = 1572401067;
  var date = new Date(tim*1000);
  var formattedDate = Utilities.formatDate(date, "GMT+1", "dd-MM-yyyy HH:mm:ss");
  //Logger.log(formattedDate);
  return formattedDate;
}


