const sa = SpreadsheetApp.getActiveSpreadsheet();
const currSheet = sa.getActiveSheet();
const configSheet = sa.getSheetByName('config');

const WordSheet = sa.getSheetByName('Word');
let wordSheetLastRow = WordSheet.getRange("A:A").getValues();
wordSheetLastRow = getLastRowSpecial(wordSheetLastRow);


const ENSheet = sa.getSheetByName('EN');
const FRSheet = sa.getSheetByName('FR');
const ESSheet = sa.getSheetByName('ES');

const userEmail = Session.getActiveUser().getEmail();

/*
* Word 시트의 컬럼 정보를 담은 객체
*/
const WordSheetColObj = {
  "wordKey" : letterToColumn("A"),
  "transRange" : 3, // 번역에 들어가는 컬럼 값 수. 
  "KR_val" : letterToColumn("E"),
  "KR_updatedAt" : letterToColumn("H"),
  "EN_val" : letterToColumn("J"),
  "EN_updatedAt" : letterToColumn("K"),
  "FR_val" : letterToColumn("M"),
  "FR_updatedAt" : letterToColumn("N"),
  "ES_val" : letterToColumn("P"),
  "ES_updatedAt" : letterToColumn("Q"),
}

/* 
* Translate 시트에 관한 정보를 담은 객체.
* startRow : 시작 행 (모든 언어 일괄 적용)
* colRange : 각 언어별 컬럼 갯수 (모든 언어 일괄 적용)
* startCol : 각 언어별 시작 컬럼
* lastCol : 각 언어별 마지막 컬럼
*/
const TransObj = {
  "startRow" : 5,
  "colRange" : 4,
  "startCol" : letterToColumn("A"),
  "lastCol" : letterToColumn("D"),
}


// Custom 메뉴 구현
function onOpen(e) {
  SpreadsheetApp.getUi()
  .createMenu('입력하기')
  .addItem('단어 / 문장 입력', 'showAddWordDialog')
  .addToUi();
}

function createMenu(){
  SpreadsheetApp.getUi().createMenu('test').addItem('addWord', 'showAddWordDialog').addToUi()
}