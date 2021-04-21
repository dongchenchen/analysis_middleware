import * as DataDealer from '../util/data_dealer';

export function transformYesterdayData(dataList: Array<object>, commonConfig: any): any {
  let { dateList, quatoList } = commonConfig;
  let returnDataList = [];
  for(let date of dateList){
    let returnData = {
      refdate: date
    }
    let dataLine = DataDealer.findItemByDate(date, dataList);
    for (let quato of quatoList) {
      returnData[quato] = !dataLine ? 0 : dataLine[quato];
    }
    returnDataList.push(returnData);
  }
  return returnDataList;
}