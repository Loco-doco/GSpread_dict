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

  const datetime = new Date()
  Logger.log(wordSheetLastRow)
  
//  var lastRow = configSheet.getRange("G2").getValue(); // +1  
  WordSheet.getRange(wordSheetLastRow+1,1,1,9).setValues([[
    form.wordOrSenKey,
    form.lanCheckValues,
    form.prodCheckValues,
    form.isWord,
    form.wordOrSenDesc,
    form.description,
    form.refWiki,
    datetime,
    userEmail
  ]]);
  
  return true
}

// 언어 배포 값 동적 GET
const getLanValidate = () => {
  const data = configSheet.getRange("A2:B30").getValues();
  let list = data.reduce( (acc, val) => {
    if(val[0]) acc.push(val)
    return acc
  },[])
  
  return list
}

// 제품 배포 값 동적 GET
const getProdValidate = () => {
  const data = configSheet.getRange("C2:D30").getValues();
  let list = data.reduce( (acc, val) => {
    if(val[0]) acc.push(val)
    return acc
  }, [])
  
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
  if(wordSheetLastRow <= 1){
    return new Array();
  } else {
    const data = WordSheet.getRange(2,WordSheetColObj.wordKey,wordSheetLastRow-1,1).getValues();
    return data
  }
}