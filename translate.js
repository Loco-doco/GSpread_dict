const EN_getTransWord = () => { spreadTransNeedWord("EN",ENSheet) };
const EN_postTransWord = () => {
  postTranslatedWord("EN",ENSheet)
  spreadTransNeedWord("EN", ENSheet)
}

const FR_getTransWord = () => { spreadTransNeedWord("FR", FRSheet) };
const FR_postTransWord = () => {
  postTranslatedWord("FR", FRSheet)
  spreadTransNeedWord("FR", FRSheet)
}

const ES_getTransWord = () => { spreadTransNeedWord("ES", ESSheet) };
const ES_postTransWord = () => {
  postTranslatedWord("ES", ESSheet)
  spreadTransNeedWord("ES", ESSheet)
}


/* TransMedium 시트로부터 특정 언어로 번역이 필요한 단어를 호출 및 뿌려주는 함수.
* 언어를 매개변수로 가짐. 
*/
const spreadTransNeedWord = (language, Sheet) => {
  
    // ----- 값 가져오기 -----
    const targetVal = language+"_val"
    const targetStartCol = language+"_startCol"
    
    let lastRow = TransMediumSheet.getRange("A2:A").getValues();
    lastRow = getLastRowSpecial(lastRow)
    
    const wordKey = TransMediumSheet.getRange(
        2, TransMediumColObj.wordKey,
       lastRow, 1
      ).getValues(); // GET 키 값 from TransMedium 시트
  
    const KR_val_updatedAt = TransMediumSheet.getRange(
       2, TransMediumColObj.KR_val,
       lastRow, 2
      ).getValues(); // GET 한국어 내용, 업데이트 날짜 from TransMedium 시트
  
    const target_val_updatedAt = TransMediumSheet.getRange(
        2, TransMediumColObj[targetVal],
        lastRow, 2
      ).getValues(); // GET 해당 언어의 내용, 업데이트 날짜 from TransMedium 시트
    
    
    let dataCount = Sheet.getRange("B2").getValue() || 1;
    Logger.log(dataCount)
    
    let SheetLastRow = Sheet.getRange(
      TransObj.startRow, TransObj.startCol,
      dataCount, 1
    ).getValues();

    SheetLastRow = getLastRowSpecial(SheetLastRow)
    Logger.log("SheetlastRow =", SheetLastRow)
    
    // ----- 검증하기 -----
    const targetArr = filterWords(wordKey, KR_val_updatedAt, target_val_updatedAt, Sheet, SheetLastRow || 1);
    
    // ----- 뿌려주기 -----
    
    try{
    
      Sheet.getRange(
        TransObj.startRow + SheetLastRow, TransObj.startCol,
        targetArr.length, targetArr[0].length
      ).setValues(targetArr); // 키 값, KR내용, 기존 번역 내용 저장    
      
    } catch(e) {
    
      Browser.msgBox('가져올 단어가 없습니다')
      
    }

}

/*
* 데이터 초기화
*/

const clearPrevContents = (Sheet, dataCount) => {
  
  let lastRow = Sheet.getRange(
    TransObj.startRow, TransObj.startCol,
    dataCount, 1
  ).getValues();
                                 
  lastRow = getLastRowSpecial(lastRow)
  Sheet.getRange(TransObj.startRow, TransObj.startCol, lastRow, TransObj.colRange).clearContent()
}

/* 검증 함수 
* 1) 한국어의 키 값과 내용(KR_val)은 있으나, 해당 언어에 Val(En_val,FR_Val...)이 없는 경우.
* 2) 한국어의 업데이트 날짜 보다 해당 언어의 업데이트 날짜가 적은 경우.
* 위 1)의 경우 || 2)의 경우 시 번역 대상 언어로 판명.
* wordKey = WordSheet 의 key 값 들
* kr = WordSheet의 한국어 value 및 updatedAt 값 들
* target = TransMedium의 해당 언어 value 및 updatedAt 값 들
*/
const filterWords = (wordKey, kr, target, Sheet, SheetLastRow) => {
  
  const PreVals_range = Sheet.getRange(
         TransObj.startRow, TransObj.startCol,
         SheetLastRow, TransObj.colRange
       )
  const preVals = PreVals_range.getValues();  


  const arrLength = kr.length
  let returnArr = new Array();
  
  for (let i=0; i<arrLength; i++){
      if(!target[i][0]){ // 내용 비어있는 것
      
        Logger.log(i,"번째 내용이 비어있음")
        returnArr.push([wordKey[i][0], kr[i][0], target[i][0]]) // 키 값, KR내용, 기존 번역 내용 저장
        
      } else if (kr[i][1] >= target[i][1]){ // 업데이트 날짜가 구식인 것.
        
        Logger.log(i,"번쨰 내용의 업데이트 날짜가 구식임")
        returnArr.push([wordKey[i][0], kr[i][0], target[i][0]]) // 키 값, KR내용, 기존 번역 내용 저장
        
      } 
  }
  
  for (let e=0; e<returnArr.length; e++){
    if ( preVals.findIndex((prev) => prev[0] === returnArr[e][0]) >= 0){
      returnArr.splice(e,1,[null])
    }
  }
  
  
  Logger.log("returnArr", returnArr)
  
  returnArr = returnArr.filter((v) => {if(v[0]) return v})
  Logger.log("real returnArr =", returnArr)
  
  return returnArr
}



/* 번역된 단어를 배포하는 함수.
*/
const postTranslatedWord = (language,Sheet) => {
  // 범위 갖고 오기. (시작 좌표, 범위 좌표)
  
  const dataCount = Sheet.getRange("B2").getValue()
  
  let wordSheetKeys = WordSheet.getRange(
      2, WordSheetColObj.wordKey,
      wordSheetLastRow-1,1
    ).getValues();
  wordSheetKeys = wordSheetKeys.map((v) => v[0])

  // 해당 번역 시트의 현재까지 작성된 값 갖고 오기
  let lastRow = Sheet.getRange(
      TransObj.startRow, TransObj.startCol,
      dataCount, 1
    ).getValues();

  lastRow = getLastRowSpecial(lastRow)

  const transPreVals_range = Sheet.getRange(
       TransObj.startRow, TransObj.startCol,
       lastRow, TransObj.colRange
     )
  const transPreVals = transPreVals_range.getValues();

  // 범위 중 번역이 된 것 선별
  const transFinWords = isTranslated(transPreVals)
  
  // 키 값 기준으로 맞는 것만 WordSheet에 빈칸 채우기
  
  const targetVal = WordSheetColObj[language+"_val"]
  const transRange = WordSheetColObj.transRange
  
  spreadFinWordToWordSheet(transFinWords, wordSheetKeys, targetVal, transRange)
  // 맞는 건 제거하고 아직 안 된 것들은 Translate 시트에 그대로 남기기
  transPreVals_range.clearContent();
}

/* 
* 번역이 다 되었는지 판별하는 함수.
* 1) Translate_after 행이 비어있지 않아야 함.
*/
const isTranslated = (preVals) => {

  let finWords = preVals.filter((v) => { if(v[3]) return v })
  
  return finWords
}

/*
* Wordsheet에 있는 키 값과 대조해서 뿌리기 
*/
const spreadFinWordToWordSheet = (finWord, wordSheetKeys, targetVal, transRange) => {
  
  
  const datetime = new Date()
  
  const insertRowArr = [];
  let insertRowElement;
  finWord.forEach((fin) => {
    insertRowElement = wordSheetKeys.indexOf(fin[0])
    if(insertRowElement >=0) insertRowArr.push(insertRowElement+2)
  })
  
  Logger.log(insertRowArr)
  Logger.log(targetVal)
  let _setValues = [];
  
  for(let i=0; i<insertRowArr.length; i++){
    WordSheet.getRange(
      insertRowArr[i], targetVal,
      1, transRange
    ).setValues([[finWord[i][3], datetime, userEmail]])
  }
}