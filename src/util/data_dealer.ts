export function findItemByDate(date: string, dataList: Array<object>): any{
  let result = null;
  for (let i = 0; i < dataList.length;  i++) {
    let item = dataList[i];
    if (item['refdate'] === date) {
      result = item;
      break;
    }
  }
  return result;
}

export function findItemByDateAndScene(date: string, scene: number, dataList: Array<object>): any {
  let result = null;
  for (let i = 0; i < dataList.length;  i++) {
    let item = dataList[i];
    if (item['refdate'] === date && parseInt(item['scene'], 10) === scene) {
      result = item;
      break;
    }
  }
  return result;
}

export function findItemByHourAndScene(hour: number, scene: number, dataList: Array<object>): any {
  let result = null;
  for (let i = 0; i < dataList.length;  i++) {
    let item = dataList[i];
    if (parseInt(item['refhour'], 10) === hour && parseInt(item['scene'], 10) === scene) {
      result = item;
      break;
    }
  }
  return result;
}

export function findItemByHour(hour: number, dataList: Array<object>): any {
  let result = null;
  for (var i = 0; i < dataList.length; i++) {
    var item = dataList[i];
    // 之前的逻辑字段是refhour
    if (item['refhour'] && parseInt(item['refhour'], 10) === hour) {
        result = item;
        break;
    }
    // 因为音频后端返回格式跟之前不一样, 为了不影响之前的在这里做兼容
    if(item['date_hour']) {
        var audioItem = item['date_hour'] || '';
        var audioTime = audioItem.slice(audioItem.length - 2, audioItem.length);
        if(audioTime * 100 === hour) {
            result = item;
            break;
        }
    }
  }
  return result;
}

export function sortByDate(dataList: Array<Object>): any{
  return dataList.sort((a, b) => {
    return a['refdate'] > b['refdate'] ? 1 : -1;
  });
}

export function formatItemByPercent(dividend, divide, toFixedNum): number{
  let result:number = parseFloat((dividend * 100 / divide).toFixed(2));
  return result;
}

export function _changeUnitChinese(number, fixed) {
  number = parseFloat(number);
  let divider = 1e4, uint = '万';
  if (number < 1e4) divider = 1, uint = '';
  else if (number < 1e8) divider = 1e4, uint = '万';
  else if (number < 1e9) divider = 1e8, uint = '亿';
  
  let _fix = fixed || 1;
  let tmp = number / divider;
  if (tmp - Math.floor(tmp) < 1e-5) {
      _fix = fixed || 0;
  }
  return parseFloat((number / divider).toFixed(_fix)) + uint;
}
