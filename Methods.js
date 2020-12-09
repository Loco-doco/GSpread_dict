// 데이터 마지막 행 찾기
function getLastRowSpecial(range){
  var rowNum = 0;
  var blank = false;
  for(var row = 0; row < range.length; row++){
 
    if(range[row][0] === "" && !blank){
      rowNum = row;
      blank = true;
 
    }else if(range[row][0] !== ""){
      blank = false;
    };
  };
  return rowNum;
};

// 알파벳으로 컬럼 인덱스 반환
function letterToColumn(letter){
  var column = 0, length = letter.length;
  for (var i = 0; i < length; i++)
  {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column;
}