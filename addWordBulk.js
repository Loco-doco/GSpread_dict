function showAddLanProdDialog() {  
  var html = HtmlService.createTemplateFromFile('addLanProdView').evaluate();
  SpreadsheetApp.getUi()
  .showSidebar(html);
}



/* 배포값 모달로부터 할당된 배포 값을 시트에 setValue
*/
const fillCell = (calValues) => {
  Logger.log("CalValues =", calValues)
//  if(!e.valCheck ){
//    Browser.msgBox('하나 이상 체크해주셈')
//    throw new Error
//  }
//  
//  const targetVal = Array.isArray(e.valCheck)? e.valCheck.reduce((arr, val) => arr*val, 1) : e.valCheck
  BulkSheet.getActiveRange().setValue(calValues);
}


const insertWordAsBulk = () => {
  // 언어 배포값은 다 입력되어있다 전제.
  const lastRowRange = BulkSheet.getRange("B4:B").getValues();
  const lastRow = getLastRowSpecial(lastRowRange);
  
  const targetSetRange = BulkSheet.getRange(
    bulkObj.startRow, bulkObj.startCol,
    lastRow, bulkObj.colRange
  )
  const targetSet = targetSetRange.getValues()
  Logger.log("targetSet =", targetSet)
  
  // 검증1 입력한 단어 끼리 중복이 있는가?
  let verifiedTypeWord = verifyIsDuple(targetSet)
  Logger.log("검증 1 끝나고 =", verifiedTypeWord)
  
  // 검증2 제품 배포값이나 단어/문장, 내용이 들어가 있는가?
  verifiedTypeWord = verifyIsFilled(verifiedTypeWord)
  Logger.log("검증 2 끝나고 =", verifiedTypeWord)
  
  // 키 값을 str_, sen_ 형태로 처리
  const senCount = configSheet.getRange("F2").getValue(); // 현재까지 문장 갯수 갖고 오기
  verifiedTypeWord = changeKeyValue(verifiedTypeWord, senCount)
  Logger.log("키 값 처리하고 =", verifiedTypeWord)
  
  // 검증3 변환된 키 값이 WordSheet의 키 값이랑 중복되는 것이 있는가?
  const wordSheetKeys = getCurrKeys();
  verifyIsDupleKey(wordSheetKeys, verifiedTypeWord);
  Logger.log(verifiedTypeWord)
  
  //다 된 것들 WordSheet에다 뿌리기
  spreadBulkWordToSheet(verifiedTypeWord)
  
  // Bulk 시트 초기화
  targetSetRange.clearContent()
}


// 검증1 입력한 "단어" 끼리 중복이 있는가?
const verifyIsDuple = (valueArr) => {
  
  // 단어 키 값이 입력된 것 && 배포값이 단어인 것.
  // 배포 값이 단어인데 키 값이 입력 안된 것 검증
  const result = valueArr.reduce((acc, val) => {
    if(!val[0] && val[3] === 1 && val[4]) {
      Browser.msgBox("단어인데 키 값이 없슴다 \\n" + val.slice(0,5))
      throw new Error ("단어인데 키 값이 없음")
    }
    if(val[0] && val[3] === 1) acc.push(val[0])
    return acc
  },[])
  
  Logger.log("result =", result)
  
  // 단어 입력된 것 내부에서 중복이 발생하는지 (Boolean)
  const isDupl = result.some((val) => {
    return result.indexOf(val) !== result.lastIndexOf(val)
  })
  
  // 중복 있을 시 중복된 단어 표시
  if (isDupl) {
    const res2 = result.reduce((obj, val) => {
      obj[val] = (obj[val] || 0) + 1
      if(obj[val] > 1) obj["_dupl"] += val+" "
      return obj
    }, {"_dupl" : []})
    
    const dupVal = res2['_dupl']
    
    BulkSheet.getRange("B2").setValue(dupVal)
    Browser.msgBox(`Bulk 시트 내에 중복 단어가 존재합니다. (${dupVal})`)
    throw new Error ('시트 내 중복 값이 존재')
  }
  
  // 중복 없을 시 매개변수로 들어온 리스트는 중복 없는 리스트이므로, 키 값이나 (문장인 경우)DESC가 입력된 것만 추출 후 리턴.
  const returnArr = valueArr.reduce((acc, arr) => {
    if (result.includes(arr[0]) || arr[4]) acc.push(arr)
    return acc
  },[])
  
  if (!returnArr[0]) {
    Browser.msgBox("뭐 넣을 게 없는데요;;")
    throw new Error ("장난하지 마세요")
  }
  
  return returnArr
}

// 검증2 제품 배포값이나 단어/문장, 내용이 들어가 있는가?
const verifyIsFilled = (valueArr) => {
  /*
  * 언어 배포 값이 있고(val[1])
  * 제품 배포 값이 있고(val[2])
  * 단어, 문장 여부가 있고(val[4])
  * 내용이 있는 것 (val[4])
  */
  const lanValidate = getLanValidateOnly();
  const prodValidate = getProdValidateOnly();
  
  return valueArr.reduce((acc,val) => {
    Logger.log("val =", val)
  
    if (val[1] && val[2] && val[3] && val[4]) {
      acc.push(val)
    } else {
      Browser.msgBox("빈 칸이 제대로 안 들어간 row가 있슴다 \\n" + val.slice(0,5))
      throw new Error ('빈칸이 제대로 안 들어간 게 있습니다.')
    }
    return acc
  },[])
}

// 키 값을 str_, sen_ 형태로 처리
const changeKeyValue = (valueArr, senCount) => {
  
  const returnArr = valueArr.reduce((acc, val) => {
    if(val[3] === 1) { // 단어인 경우
      val[0] = "str_"+val[0].replace(" ","_")
      val[0] = val[0].toLowerCase(val[0])
      acc.push(val)
    } else { // 문장인 경우
      senCount += 1
      val[0] = "str_sen_"+senCount
      acc.push(val)
    }
    return acc
  }, [])
  
  configSheet.getRange("F2").setValue(senCount+1);
  return returnArr
}

// 검증3 변환된 키 값이 WordSheet의 키 값이랑 중복되는 것이 있는가?
const verifyIsDupleKey = (targetArr, valueArr) => {
  valueArr.reduce((acc, val1) => {
    const isDupl = targetArr.some((val2) => val2.includes(val1[0]))
    if(isDupl){
      Browser.msgBox("아래 키 값이 기존 값이랑 중복임다 \\n"+val1.slice(0,5))
      throw new Error("중복!")
    }
  },[])
}

const spreadBulkWordToSheet = (valueArr) => {
  const datetime = new Date()
  valueArr = valueArr.reduce((acc,val) => {
    val.push(datetime,userEmail)
    acc.push(val)
    return acc
  },[])
  

  WordSheet.getRange(
    wordSheetLastRow+1, WordSheetColObj.wordKey,
    valueArr.length, valueArr[0].length
  ).setValues(valueArr)
}