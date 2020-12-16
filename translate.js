const EN_postTransWord = () => {  postTranslatedWord("EN",ENSheet) }
const FR_postTransWord = () => { postTranslatedWord("FR", FRSheet) }
const ES_postTransWord = () => { postTranslatedWord("ES", ESSheet) }

/* 번역된 단어를 배포하는 함수.
*/
const postTranslatedWord = (language,Sheet) => {
  // 범위 갖고 오기. (시작 좌표, 범위 좌표)
  const dataCount = Sheet.getRange("B2").getValue()
  
  let wordSheetKeys = getCurrKeys();
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
  const targetRange = WordSheetColObj.transRange
  
  spreadFinWordToWordSheet(transFinWords, wordSheetKeys, targetVal, targetRange)
  // 맞는 건 제거하고 아직 안 된 것들은 Translate 시트에 그대로 남기기
  Sheet.getRange(TransObj.startRow,TransObj.lastCol,lastRow,1).clearContent();
}

/* 
* 번역이 다 되었는지 판별하는 함수.
* 1) Translate_after 행이 비어있지 않아야 함.
*/
const isTranslated = (preVals) => preVals.filter((v) => { if(v[3]) return v })

/*
* Wordsheet에 있는 키 값과 대조해서 뿌리기 
* finWord = 번역이 완료된 row들 (Key, KR_DESC, Translate_Before, Translate_After)
* wordSheetKeys = WordSheet의 key 값 들
* targetVal = WordSheet에서 해당 언어의 번역 값들이 들어가야 할 컬럼 좌표 (시작 위치)
* transRange = WordSheet에서 해당 언어의 번역 값들이 들어가야 할 범위 수
*/
const spreadFinWordToWordSheet = (finWord, wordSheetKeys, targetVal, targetRange) => {
  
  const datetime = new Date()
  
  let insertRowArr = finWord.reduce( (acc, val) => {
    pushIdx = wordSheetKeys.indexOf(val[0])
    if( pushIdx >=0 ) acc.push(pushIdx+2)
    return acc
  },[])
  
  let _setValues = [];
  
  for(let i=0; i<insertRowArr.length; i++){
    WordSheet.getRange(
      insertRowArr[i], targetVal,
      1, targetRange
    ).setValues([[finWord[i][3], datetime, userEmail]])
  }
  
}