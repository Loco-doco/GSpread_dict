function showAddWordDialog() {  
  var html = HtmlService.createTemplateFromFile('addWordView').evaluate();
  SpreadsheetApp.getUi()
  .showSidebar(html);
}

function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
};

//const ArrOrder = [
//  "wordOrSenKey",
//  "lanCheckValues",
//  "prodCheckValues",
//  "isWord",
//  "wordOrSenDesc",
//  "description",
//  "refWiki",
//  "currDate",
//  "userEmail"
//]

// Sidebar에서 들어온 데이터 처리
const userInput = (form) => {

//  form['currDate'] = new Date();
//  form['userEmail'] = userEmail;
//  
//  var setArr = [];
//  setArr[0] = ArrOrder.map(function(v){
//    return form[v]
//  })

  const sheetRange = KRSheet.getRange("A:A").getValues();
  const lastRows = getLastRowSpecial(sheetRange);
  Logger.log(lastRows)
  
//  var lastRow = configSheet.getRange("G2").getValue(); // +1  
  KRSheet.getRange(lastRows+1,1,1,9).setValues([[
    form.wordOrSenKey,
    form.lanCheckValues,
    form.prodCheckValues,
    form.isWord,
    form.wordOrSenDesc,
    form.description,
    form.refWiki,
    new Date(),
    userEmail
  ]]);
  
  return true
}

// 언어 배포 값 동적 GET
const getLanValidate = () => {
  const list = [];
  const data = configSheet.getRange("A2:B30").getValues();
  data.forEach( (e) => {
    if(!e[0] === false) list.push(e)
  })
  return list
}

// 제품 배포 값 동적 GET
const getProdValidate = () => {
  const list = [];
  const data = configSheet.getRange("C2:D30").getValues();
  data.forEach( (e) => {
    if(!e[0] === false) list.push(e)
  })
  return list
}

// 현재까지 입력된 문장들의 갯수
const getSenCount = () => {
  const data = configSheet.getRange("F2").getValue();
  configSheet.getRange("F2").setValue(data+1);
  return data
}


// 현재까지 입력된 KR시트의 단어, 문장 Key들 갖고오기.
const getCurrKeys = () => {
  const lastRow = configSheet.getRange("G2").getValue();
  if(lastRow <= 1){
    return new Array();
  } else {
    const data = KRSheet.getRange(2,1,lastRow-1,1).getValues();
    return data
  }
}