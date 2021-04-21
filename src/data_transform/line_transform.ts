import * as DateUtil from '../util/date';
import * as DataDealer from '../util/data_dealer'

/**
 * 处理折线图数据入口
 * @param dataList 后台返回的对象数组
 * @param lineConfig 需要展示的折线图的配置
 */
export function transformLine(dataList: Array<object>, lineConfig: any): any {
  let { isDrawDiff = false } = lineConfig;
  if (!!isDrawDiff) {
    return transformDiffLine(dataList, lineConfig);
  }
  let { xAxis = 'refdate', autoFillDate = false} = lineConfig;
  if (xAxis === 'refdate' && autoFillDate) {
    return transformAutoFillDateLine(dataList, lineConfig);
  } else if (xAxis === 'refhour') {
    return transformAutoFillHourLine(dataList, lineConfig);
  } else {
    return transformCommonLine(dataList, lineConfig);
  }
}


function initLineChartOpt(yAxis: Array<object>) {
  const lineChartOpt = {
    xAxis: {
      categories: []
    },
    series: [],
  };   
  let color: Array<string>;
  switch(yAxis.length) {
    case 4:
      color = ['#07C160', '#8CD68C', '#4EA5EB', '#C9E4F9'];
      break;
    default:
      color = ['#07C160', '#5E72CE', '#F7B42F', '#8D60CD', '#E96345', '#40CCE1', '#F34587', '#B744C6']
  }
  return Object.assign(lineChartOpt, {'color': color});
} 

/**
 * 根据日期自动填充折线图
 * @param dataList 
 * @param lineConfig 
 */
function transformAutoFillDateLine(dataList: Array<object>, lineConfig: any): any {
  let { yAxis = [],
        dateRange = { begin: new Date().getTime() - 7 * 86400000, end: new Date().getTime() }, 
        mapInfo = {},
        includeScene = false,
      } = lineConfig;
  
  
  const lineChartOpt = initLineChartOpt(yAxis);

  if (Object.prototype.toString.call(yAxis)=="[object String]") {
    yAxis = [yAxis];
  }

  if (!Array.isArray(yAxis)) {
    return;
  }

  yAxis.forEach(element => {
    let name = element;
    if (element && element.name) {
      name = element.name;
    }
    lineChartOpt.series.push({
      data: [],
      name: mapInfo[name],
      id: name
    });
  });
  // Object.assign(lineChartOpt.xAxis, { tickInterval: Math.ceil(dataList.length / 3)});

  if (dateRange && dateRange.begin && dateRange.end) {
    let beginTimestamp = DateUtil.getTimestamp(dateRange.begin);
    let endTimestamp = DateUtil.getTimestamp(dateRange.end);
    let todayTimestamp = DateUtil.getTodayTimeStamp();
    for (let i = beginTimestamp; i <= endTimestamp && i < todayTimestamp; i += 86400000) {
      lineChartOpt.xAxis.categories.push(DateUtil.getTimeWordingWithLine(i));
      let item;
      if (!!includeScene) {
        let scene = lineConfig.scene;
        item = DataDealer.findItemByDateAndScene(DateUtil.getTimeWordingOriginal(i), scene, dataList);
      } else {
        item = DataDealer.findItemByDate(DateUtil.getTimeWordingOriginal(i), dataList);
      }
      if (!item) {
        for (let j = 0; j < lineChartOpt.series.length; j++) {
          let serie = lineChartOpt.series[j];
          serie.data.push(0);
        }
      } else {
        for (let j = 0; j < yAxis.length; j++) {
          let axisName = yAxis[j] && yAxis[j].name ? yAxis[j].name : yAxis[j];
          let serie = getLineSerie(axisName, lineChartOpt.series);
          let value = item[axisName];
          if (Object.prototype.toString.call(yAxis[j].formatFunc) === '[object Function]') {
            value = yAxis[j].formatFunc(value);
          } else {
            value = parseInt(value);
          }
          serie.data.push(value);
        }
      }
    }
  }
  const tickPositions = [];
  const max = 6; // 表示x轴展示几max + 1个
  const categories = lineChartOpt.xAxis.categories;
  const categoriesLen = categories.length;

  if(categoriesLen <= max) {
      for(let i = 0; i < categoriesLen; i++) {
          tickPositions.push(i);
      }
  } else {
      const spacing = Math.floor(categoriesLen / max); 
      for(let i = 0; i < categoriesLen; i += spacing) {
          if(tickPositions.length === max) {
              tickPositions.push(categoriesLen -1);
              break;
          } else {
              tickPositions.push(i);
          }
      }
  }
  (<any>lineChartOpt.xAxis).tickPositions = tickPositions;
  return lineChartOpt;
}

/**
 * 不自动填充折线图
 * @param dataList 
 * @param lineConfig 
 */
function transformCommonLine(dataList: Array<object>, lineConfig: any): any {
  let { 
    xAxis = 'refdate',
    yAxis = [],
    mapInfo = {},
  } = lineConfig;

  const lineChartOpt = initLineChartOpt(yAxis);

  if (Object.prototype.toString.call(yAxis)=="[object String]") {
    yAxis = [yAxis];
  }
  
  if (!Array.isArray(yAxis)) {
    return;
  }

  yAxis.forEach(element => {
    let name;
    if (element && element.name) {
      name = element.name;
    } else {
      name = element;
    }
    lineChartOpt.series.push({
      data: [],
      name: mapInfo[name],
      id: name
    });
  });

  dataList = DataDealer.sortByDate(dataList);
  for (let i = 0; i < dataList.length; i++) {
    let item = dataList[i];
    lineChartOpt.xAxis.categories.push(item[xAxis]);
  }
  // Object.assign(lineChartOpt.xAxis, { tickInterval: Math.ceil(dataList.length / 7)});
  for (let i = 0; i < yAxis.length; i++) {
    let axisName = yAxis[i] && yAxis[i].name ? yAxis[i].name : yAxis[i];
    for (let j = 0; j < dataList.length; j++) {
      let serie = getLineSerie(axisName, lineChartOpt.series);
      let value = (<any> dataList[j])[axisName];
      if (Object.prototype.toString.call(yAxis[i].formatFunc) === '[object Function]') {
        value = yAxis[i].formatFunc(value);
      } else {
        value = parseInt(value);
      }
      serie.data.push(value);
    }
  }
  return lineChartOpt;
}

function transformDiffLine(dataList: Array<object>, lineConfig: any) {
  let { 
    xAxis = 'refdate',
    yAxis = [],
    mapInfo = {},
    dateRange,
    diffDateRange
  } = lineConfig;

  const lineChartOpt = initLineChartOpt(yAxis);

  if (Object.prototype.toString.call(yAxis)=="[object String]") {
    yAxis = [yAxis];
  }

  if (!Array.isArray(yAxis)) {
    return;
  }

  yAxis.forEach(element => {
    let name = element;
    if (element && element.name) {
      name = element.name;
    }
    lineChartOpt.series.push({
      data: [],
      name: mapInfo[name],
      id: name
    });
  });

  if (dateRange.begin && dateRange.end) {
    let beginTimestamp = DateUtil.getTimestamp(dateRange.begin);
    let endTimestamp = DateUtil.getTimestamp(dateRange.end);
    let todayTimestamp = DateUtil.getTodayTimeStamp();
    for (let i = beginTimestamp; i <= endTimestamp && i < todayTimestamp; i += 86400000) {

      lineChartOpt.xAxis.categories.push(DateUtil.getTimeWordingWithLine(i));
      let item = DataDealer.findItemByDate(DateUtil.getTimeWordingOriginal(i), dataList);
      if (!item) {
        for (let j = 0; j < 2; j++) {
          let serie = lineChartOpt.series[j];
          serie.data.push(0);
        }
      } else {
        for (let j = 0; j < 2; j++) {
          let axisName = yAxis[j] && yAxis[j].name ? yAxis[j].name : yAxis[j];
          let serie = getLineSerie(axisName, lineChartOpt.series);
          let value = item[axisName];
          if (Object.prototype.toString.call(yAxis[j].formatFunc) === '[object Function]') {
            value = yAxis[j].formatFunc(value);
          } else {
            value = parseInt(value);
          }
          serie.data.push(value);
        }
      }
    }
  }

  if (diffDateRange.begin && diffDateRange.end) {
    let beginTimestamp = DateUtil.getTimestamp(diffDateRange.begin);
    let endTimestamp = DateUtil.getTimestamp(diffDateRange.end);
    let todayTimestamp = DateUtil.getTodayTimeStamp();
    for (let i = beginTimestamp; i <= endTimestamp && i < todayTimestamp; i += 86400000) {
      lineChartOpt.xAxis.categories.push(DateUtil.getTimeWordingWithLine(i));
      let item = DataDealer.findItemByDate(DateUtil.getTimeWordingOriginal(i), dataList);
      if (!item) {
        for (let j = 0; j < lineChartOpt.series.length; j++) {
          let serie = lineChartOpt.series[j];
          serie.data.push(0);
        }
      } else {
        for (let j = 2; j < 4; j++) {
          let axisName = yAxis[j] && yAxis[j].name ? yAxis[j].name : yAxis[j];
          let serie = getLineSerie(axisName, lineChartOpt.series);
          let value = item[axisName];
          if (Object.prototype.toString.call(yAxis[j].formatFunc) === '[object Function]') {
            value = yAxis[j].formatFunc(value);
          } else {
            value = parseInt(value);
          }
          serie.data.push(value);
        }
      }
    }
  }
  return lineChartOpt;
}

function transformAutoFillHourLine(dataList: Array<object>, lineConfig: any): any {
  let { yAxis = [],
        mapInfo = {},
        includeScene = false,
      } = lineConfig;
  
  
  const lineChartOpt = initLineChartOpt(yAxis);
  // Object.assign(lineChartOpt.xAxis, { tickInterval: 4});

  if (Object.prototype.toString.call(yAxis)=="[object String]") {
    yAxis = [yAxis];
  }

  if (!Array.isArray(yAxis)) {
    return;
  }

  yAxis.forEach(element => {
    let name = element;
    if (element && element.name) {
      name = element.name;
    }
    lineChartOpt.series.push({
      data: [],
      name: mapInfo[name],
      id: name
    });
  });

  for (let i = 0; i <= 2300; i += 100) {
    lineChartOpt.xAxis.categories.push(DateUtil.formatHour(i));
    let item;
    if (!!includeScene) {
      let scene = lineConfig.scene;
      item = DataDealer.findItemByHourAndScene(i, scene, dataList);
    } else {
      item = DataDealer.findItemByHour(i, dataList);
    }
    if (!item) {
      for (let j = 0; j < lineChartOpt.series.length; j++) {
        let serie = lineChartOpt.series[j];
        serie.data.push(0);
      }
    } else {
      for (let j = 0; j < yAxis.length; j++) {
        let axisName = yAxis[j] && yAxis[j].name ? yAxis[j].name : yAxis[j];
        let serie = getLineSerie(axisName, lineChartOpt.series);
        let value = item[axisName];
        if (Object.prototype.toString.call(yAxis[j].formatFunc) === '[object Function]') {
          value = yAxis[j].formatFunc(value);
        } else {
          value = parseInt(value);
        }
        serie.data.push(value);
      }
    }
  }

  // 之前显示是0-24 但是0点和24点是一样的， 在0-23之间 tickInterval取  2 3 4 都无法平分， 平分的结果总是会经过24  x轴最后出现24这个数字
  // 所以使用  tickPositions 进行自动差分x轴
  const tickPositions = [];
  for(let i = 0; i < 23; i += 4) {
      tickPositions.push(i);
      if(i + 4 > 23) {
          tickPositions.push(23);
      }
  }
  (<any>lineChartOpt.xAxis).tickPositions = tickPositions;
  
  return lineChartOpt;
}

function getLineSerie(id: string, series: Array<object>): any {
  let serie = null;
  for (let i = 0; i < series.length; i++) {
    let item = series[i];
    if (item['id'] === id) {
      serie = item;
      break;
    }
  }
  return serie;
}



