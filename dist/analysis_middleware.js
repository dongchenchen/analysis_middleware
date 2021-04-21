(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.AnalysisMiddleware = factory());
}(this, (function () { 'use strict';

  var RET_MSG = {
      '-2': 'basic params error',
      '1014': 'args non-conform to the template',
      '1001': 'date range error'
  };
  var CommonDao = /** @class */ (function () {
      function CommonDao(config) {
          this.CGI = config.CGI;
      }
      CommonDao.prototype.get = function (request, showConfig, successCb, failCb) {
          if (!this.CGI || Object.prototype.toString.call(this.CGI.post) !== '[object Function]') {
              return null;
          }
          return this.getData(request).then(function (resp) {
              return successCb && successCb(resp, showConfig);
          })["catch"](function (resp) {
              return failCb && failCb(resp);
          });
      };
      CommonDao.prototype.getData = function (request) {
          var _this = this;
          var busi = request.busi, tmpl = request.tmpl, args = request.args;
          return new Promise(function (resolve, reject) {
              var result = _this.verifyRequest(request);
              if (!!result['errMsg']) {
                  reject(result);
                  return;
              }
              _this.CGI.post({
                  url: '/misc/datacubequery',
                  data: {
                      action: 'query',
                      busi: busi,
                      tmpl: tmpl,
                      args: JSON.stringify(args)
                  }
              }, function (resp) {
                  resp = _this.addRetMsg(resp);
                  if (resp && resp.base_resp && resp.base_resp.ret === 0) {
                      resolve(resp);
                  }
                  else {
                      reject(resp);
                  }
              });
          });
      };
      CommonDao.prototype.verifyRequest = function (request) {
          var result = {};
          var busi = request.busi, tmpl = request.tmpl, args = request.args;
          busi = Number(busi);
          tmpl = Number(tmpl);
          if (isNaN(busi)) {
              result['errMsg'] = busi + " is unvalid, expected number";
          }
          if (isNaN(tmpl)) {
              result['errMsg'] = tmpl + " is unvalid, expected number";
          }
          if (Object.prototype.toString.call(args) !== "[object Object]") {
              result['errMsg'] = "args is unvalid, expected object";
          }
          return result;
      };
      CommonDao.prototype.addRetMsg = function (resp) {
          if (resp && resp.base_resp && resp.base_resp.ret) {
              var retNum = resp.base_resp.ret.toString();
              resp['retMsg'] = RET_MSG[retNum] || '';
          }
          return resp;
      };
      return CommonDao;
  }());

  /**
   *
   * @param time 时间日期或时间戳
   * @description 返回时间戳
   */
  function getTimestamp(time) {
      var timeStamp = '';
      if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(time)) {
          timeStamp += new Date(time).getTime();
      }
      else if (/^\d{13}$/.test(time)) {
          timeStamp += time;
      }
      else if (/^\d{8}$/.test(time)) {
          var date = time.substr(0, 4) + '-' + time.substr(4, 2) + '-' + time.substr(6, 2);
          timeStamp += new Date(date).getTime();
      }
      return parseInt(timeStamp);
  }
  /**
   *
   * @param time 时间日期或时间戳
   * @description 返回2019-10-11格式
   */
  function getTimeWordingWithLine(time) {
      var date = new Date(time);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      return [year, month, day].map(formatNumber).join('-');
  }
  /**
   *
   * @param time 时间日期或时间戳
   * @description 返回20191011格式
   */
  function getTimeWordingOriginal(time) {
      var date = new Date(time);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      return [year, month, day].map(formatNumber).join('');
  }
  function getDaysBefore(days) {
      var today = new Date().getTime();
      var daysBefore = new Date().getTime() - days * 24 * 60 * 60 * 1000;
      var daysBeforeDate = new Date(daysBefore);
      return getTimeWordingOriginal(daysBeforeDate);
  }
  function getLastMonth(compareDate) {
      var timeStamp = getTimestamp(compareDate);
      compareDate = new Date(timeStamp);
      var lastMonth = compareDate.setMonth(compareDate.getMonth() - 1);
      return getTimeWordingOriginal(lastMonth);
  }
  function getTodayTimeStamp() {
      var todayFormat = getTimeWordingWithLine(new Date().getTime());
      return getTimestamp(todayFormat);
  }
  function formatNumber(n) {
      n = n.toString();
      return n[1] ? n : '0' + n;
  }
  // 将时间从1200 => 12:00
  function formatHour(time) {
      time = "" + time;
      while (time.length < 4) { // 长度不满4则在前面补0
          time = "0" + time;
      }
      return time.replace(/(\d{2})(\d{2})/, '$1:$2');
  }

  function findItemByDate(date, dataList) {
      var result = null;
      for (var i = 0; i < dataList.length; i++) {
          var item = dataList[i];
          if (item['refdate'] === date) {
              result = item;
              break;
          }
      }
      return result;
  }
  function findItemByDateAndScene(date, scene, dataList) {
      var result = null;
      for (var i = 0; i < dataList.length; i++) {
          var item = dataList[i];
          if (item['refdate'] === date && parseInt(item['scene'], 10) === scene) {
              result = item;
              break;
          }
      }
      return result;
  }
  function findItemByHourAndScene(hour, scene, dataList) {
      var result = null;
      for (var i = 0; i < dataList.length; i++) {
          var item = dataList[i];
          if (parseInt(item['refhour'], 10) === hour && parseInt(item['scene'], 10) === scene) {
              result = item;
              break;
          }
      }
      return result;
  }
  function findItemByHour(hour, dataList) {
      var result = null;
      for (var i = 0; i < dataList.length; i++) {
          var item = dataList[i];
          // 之前的逻辑字段是refhour
          if (item['refhour'] && parseInt(item['refhour'], 10) === hour) {
              result = item;
              break;
          }
          // 因为音频后端返回格式跟之前不一样, 为了不影响之前的在这里做兼容
          if (item['date_hour']) {
              var audioItem = item['date_hour'] || '';
              var audioTime = audioItem.slice(audioItem.length - 2, audioItem.length);
              if (audioTime * 100 === hour) {
                  result = item;
                  break;
              }
          }
      }
      return result;
  }
  function sortByDate(dataList) {
      return dataList.sort(function (a, b) {
          return a['refdate'] > b['refdate'] ? 1 : -1;
      });
  }
  function formatItemByPercent(dividend, divide, toFixedNum) {
      var result = parseFloat((dividend * 100 / divide).toFixed(2));
      return result;
  }
  function _changeUnitChinese(number, fixed) {
      number = parseFloat(number);
      var divider = 1e4, uint = '万';
      if (number < 1e4)
          divider = 1, uint = '';
      else if (number < 1e8)
          divider = 1e4, uint = '万';
      else if (number < 1e9)
          divider = 1e8, uint = '亿';
      var _fix = fixed || 1;
      var tmp = number / divider;
      if (tmp - Math.floor(tmp) < 1e-5) {
          _fix = fixed || 0;
      }
      return parseFloat((number / divider).toFixed(_fix)) + uint;
  }

  /**
   * 处理折线图数据入口
   * @param dataList 后台返回的对象数组
   * @param lineConfig 需要展示的折线图的配置
   */
  function transformLine(dataList, lineConfig) {
      var _a = lineConfig.isDrawDiff, isDrawDiff = _a === void 0 ? false : _a;
      if (!!isDrawDiff) {
          return transformDiffLine(dataList, lineConfig);
      }
      var _b = lineConfig.xAxis, xAxis = _b === void 0 ? 'refdate' : _b, _c = lineConfig.autoFillDate, autoFillDate = _c === void 0 ? false : _c;
      if (xAxis === 'refdate' && autoFillDate) {
          return transformAutoFillDateLine(dataList, lineConfig);
      }
      else if (xAxis === 'refhour') {
          return transformAutoFillHourLine(dataList, lineConfig);
      }
      else {
          return transformCommonLine(dataList, lineConfig);
      }
  }
  function initLineChartOpt(yAxis) {
      var lineChartOpt = {
          xAxis: {
              categories: []
          },
          series: [],
      };
      var color;
      switch (yAxis.length) {
          case 4:
              color = ['#07C160', '#8CD68C', '#4EA5EB', '#C9E4F9'];
              break;
          default:
              color = ['#07C160', '#5E72CE', '#F7B42F', '#8D60CD', '#E96345', '#40CCE1', '#F34587', '#B744C6'];
      }
      return Object.assign(lineChartOpt, { 'color': color });
  }
  /**
   * 根据日期自动填充折线图
   * @param dataList
   * @param lineConfig
   */
  function transformAutoFillDateLine(dataList, lineConfig) {
      var _a = lineConfig.yAxis, yAxis = _a === void 0 ? [] : _a, _b = lineConfig.dateRange, dateRange = _b === void 0 ? { begin: new Date().getTime() - 7 * 86400000, end: new Date().getTime() } : _b, _c = lineConfig.mapInfo, mapInfo = _c === void 0 ? {} : _c, _d = lineConfig.includeScene, includeScene = _d === void 0 ? false : _d;
      var lineChartOpt = initLineChartOpt(yAxis);
      if (Object.prototype.toString.call(yAxis) == "[object String]") {
          yAxis = [yAxis];
      }
      if (!Array.isArray(yAxis)) {
          return;
      }
      yAxis.forEach(function (element) {
          var name = element;
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
          var beginTimestamp = getTimestamp(dateRange.begin);
          var endTimestamp = getTimestamp(dateRange.end);
          var todayTimestamp = getTodayTimeStamp();
          for (var i = beginTimestamp; i <= endTimestamp && i < todayTimestamp; i += 86400000) {
              lineChartOpt.xAxis.categories.push(getTimeWordingWithLine(i));
              var item = void 0;
              if (!!includeScene) {
                  var scene = lineConfig.scene;
                  item = findItemByDateAndScene(getTimeWordingOriginal(i), scene, dataList);
              }
              else {
                  item = findItemByDate(getTimeWordingOriginal(i), dataList);
              }
              if (!item) {
                  for (var j = 0; j < lineChartOpt.series.length; j++) {
                      var serie = lineChartOpt.series[j];
                      serie.data.push(0);
                  }
              }
              else {
                  for (var j = 0; j < yAxis.length; j++) {
                      var axisName = yAxis[j] && yAxis[j].name ? yAxis[j].name : yAxis[j];
                      var serie = getLineSerie(axisName, lineChartOpt.series);
                      var value = item[axisName];
                      if (Object.prototype.toString.call(yAxis[j].formatFunc) === '[object Function]') {
                          value = yAxis[j].formatFunc(value);
                      }
                      else {
                          value = parseInt(value);
                      }
                      serie.data.push(value);
                  }
              }
          }
      }
      var tickPositions = [];
      var max = 6; // 表示x轴展示几max + 1个
      var categories = lineChartOpt.xAxis.categories;
      var categoriesLen = categories.length;
      if (categoriesLen <= max) {
          for (var i = 0; i < categoriesLen; i++) {
              tickPositions.push(i);
          }
      }
      else {
          var spacing = Math.floor(categoriesLen / max);
          for (var i = 0; i < categoriesLen; i += spacing) {
              if (tickPositions.length === max) {
                  tickPositions.push(categoriesLen - 1);
                  break;
              }
              else {
                  tickPositions.push(i);
              }
          }
      }
      lineChartOpt.xAxis.tickPositions = tickPositions;
      return lineChartOpt;
  }
  /**
   * 不自动填充折线图
   * @param dataList
   * @param lineConfig
   */
  function transformCommonLine(dataList, lineConfig) {
      var _a = lineConfig.xAxis, xAxis = _a === void 0 ? 'refdate' : _a, _b = lineConfig.yAxis, yAxis = _b === void 0 ? [] : _b, _c = lineConfig.mapInfo, mapInfo = _c === void 0 ? {} : _c;
      var lineChartOpt = initLineChartOpt(yAxis);
      if (Object.prototype.toString.call(yAxis) == "[object String]") {
          yAxis = [yAxis];
      }
      if (!Array.isArray(yAxis)) {
          return;
      }
      yAxis.forEach(function (element) {
          var name;
          if (element && element.name) {
              name = element.name;
          }
          else {
              name = element;
          }
          lineChartOpt.series.push({
              data: [],
              name: mapInfo[name],
              id: name
          });
      });
      dataList = sortByDate(dataList);
      for (var i = 0; i < dataList.length; i++) {
          var item = dataList[i];
          lineChartOpt.xAxis.categories.push(item[xAxis]);
      }
      // Object.assign(lineChartOpt.xAxis, { tickInterval: Math.ceil(dataList.length / 7)});
      for (var i = 0; i < yAxis.length; i++) {
          var axisName = yAxis[i] && yAxis[i].name ? yAxis[i].name : yAxis[i];
          for (var j = 0; j < dataList.length; j++) {
              var serie = getLineSerie(axisName, lineChartOpt.series);
              var value = dataList[j][axisName];
              if (Object.prototype.toString.call(yAxis[i].formatFunc) === '[object Function]') {
                  value = yAxis[i].formatFunc(value);
              }
              else {
                  value = parseInt(value);
              }
              serie.data.push(value);
          }
      }
      return lineChartOpt;
  }
  function transformDiffLine(dataList, lineConfig) {
      var _a = lineConfig.xAxis, _b = lineConfig.yAxis, yAxis = _b === void 0 ? [] : _b, _c = lineConfig.mapInfo, mapInfo = _c === void 0 ? {} : _c, dateRange = lineConfig.dateRange, diffDateRange = lineConfig.diffDateRange;
      var lineChartOpt = initLineChartOpt(yAxis);
      if (Object.prototype.toString.call(yAxis) == "[object String]") {
          yAxis = [yAxis];
      }
      if (!Array.isArray(yAxis)) {
          return;
      }
      yAxis.forEach(function (element) {
          var name = element;
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
          var beginTimestamp = getTimestamp(dateRange.begin);
          var endTimestamp = getTimestamp(dateRange.end);
          var todayTimestamp = getTodayTimeStamp();
          for (var i = beginTimestamp; i <= endTimestamp && i < todayTimestamp; i += 86400000) {
              lineChartOpt.xAxis.categories.push(getTimeWordingWithLine(i));
              var item = findItemByDate(getTimeWordingOriginal(i), dataList);
              if (!item) {
                  for (var j = 0; j < 2; j++) {
                      var serie = lineChartOpt.series[j];
                      serie.data.push(0);
                  }
              }
              else {
                  for (var j = 0; j < 2; j++) {
                      var axisName = yAxis[j] && yAxis[j].name ? yAxis[j].name : yAxis[j];
                      var serie = getLineSerie(axisName, lineChartOpt.series);
                      var value = item[axisName];
                      if (Object.prototype.toString.call(yAxis[j].formatFunc) === '[object Function]') {
                          value = yAxis[j].formatFunc(value);
                      }
                      else {
                          value = parseInt(value);
                      }
                      serie.data.push(value);
                  }
              }
          }
      }
      if (diffDateRange.begin && diffDateRange.end) {
          var beginTimestamp = getTimestamp(diffDateRange.begin);
          var endTimestamp = getTimestamp(diffDateRange.end);
          var todayTimestamp = getTodayTimeStamp();
          for (var i = beginTimestamp; i <= endTimestamp && i < todayTimestamp; i += 86400000) {
              lineChartOpt.xAxis.categories.push(getTimeWordingWithLine(i));
              var item = findItemByDate(getTimeWordingOriginal(i), dataList);
              if (!item) {
                  for (var j = 0; j < lineChartOpt.series.length; j++) {
                      var serie = lineChartOpt.series[j];
                      serie.data.push(0);
                  }
              }
              else {
                  for (var j = 2; j < 4; j++) {
                      var axisName = yAxis[j] && yAxis[j].name ? yAxis[j].name : yAxis[j];
                      var serie = getLineSerie(axisName, lineChartOpt.series);
                      var value = item[axisName];
                      if (Object.prototype.toString.call(yAxis[j].formatFunc) === '[object Function]') {
                          value = yAxis[j].formatFunc(value);
                      }
                      else {
                          value = parseInt(value);
                      }
                      serie.data.push(value);
                  }
              }
          }
      }
      return lineChartOpt;
  }
  function transformAutoFillHourLine(dataList, lineConfig) {
      var _a = lineConfig.yAxis, yAxis = _a === void 0 ? [] : _a, _b = lineConfig.mapInfo, mapInfo = _b === void 0 ? {} : _b, _c = lineConfig.includeScene, includeScene = _c === void 0 ? false : _c;
      var lineChartOpt = initLineChartOpt(yAxis);
      // Object.assign(lineChartOpt.xAxis, { tickInterval: 4});
      if (Object.prototype.toString.call(yAxis) == "[object String]") {
          yAxis = [yAxis];
      }
      if (!Array.isArray(yAxis)) {
          return;
      }
      yAxis.forEach(function (element) {
          var name = element;
          if (element && element.name) {
              name = element.name;
          }
          lineChartOpt.series.push({
              data: [],
              name: mapInfo[name],
              id: name
          });
      });
      for (var i = 0; i <= 2300; i += 100) {
          lineChartOpt.xAxis.categories.push(formatHour(i));
          var item = void 0;
          if (!!includeScene) {
              var scene = lineConfig.scene;
              item = findItemByHourAndScene(i, scene, dataList);
          }
          else {
              item = findItemByHour(i, dataList);
          }
          if (!item) {
              for (var j = 0; j < lineChartOpt.series.length; j++) {
                  var serie = lineChartOpt.series[j];
                  serie.data.push(0);
              }
          }
          else {
              for (var j = 0; j < yAxis.length; j++) {
                  var axisName = yAxis[j] && yAxis[j].name ? yAxis[j].name : yAxis[j];
                  var serie = getLineSerie(axisName, lineChartOpt.series);
                  var value = item[axisName];
                  if (Object.prototype.toString.call(yAxis[j].formatFunc) === '[object Function]') {
                      value = yAxis[j].formatFunc(value);
                  }
                  else {
                      value = parseInt(value);
                  }
                  serie.data.push(value);
              }
          }
      }
      // 之前显示是0-24 但是0点和24点是一样的， 在0-23之间 tickInterval取  2 3 4 都无法平分， 平分的结果总是会经过24  x轴最后出现24这个数字
      // 所以使用  tickPositions 进行自动差分x轴
      var tickPositions = [];
      for (var i = 0; i < 23; i += 4) {
          tickPositions.push(i);
          if (i + 4 > 23) {
              tickPositions.push(23);
          }
      }
      lineChartOpt.xAxis.tickPositions = tickPositions;
      return lineChartOpt;
  }
  function getLineSerie(id, series) {
      var serie = null;
      for (var i = 0; i < series.length; i++) {
          var item = series[i];
          if (item['id'] === id) {
              serie = item;
              break;
          }
      }
      return serie;
  }

  var slotDataTransform = function (dataObjects, data) {
      var returnObject = {};
      for (var i = 0; i < dataObjects.length; i++) {
          var slotName = dataObjects[i].name ? dataObjects[i].name : dataObjects[i];
          var value = data[slotName] ? data[slotName] : '_("暂无")';
          returnObject[slotName] = Object.prototype.toString.call(dataObjects[i].formatFunc) === '[object Function]' ? dataObjects[i].formatFunc(value) : value;
      }
      return returnObject;
  };
  function transformTable(dataList, tableConfig) {
      var headList = tableConfig.headList, mapInfo = tableConfig.mapInfo;
      var tableData = {
          head: [],
          body: []
      };
      headList.forEach(function (element) {
          var name = element && element.name ? element.name : element;
          tableData.head.push({
              title: element.title,
              key: name,
              className: element.className ? element.className : ''
          });
      });
      for (var i = 0; i < dataList.length; i++) {
          var data = dataList[i];
          var line = {
              type: 'default'
          };
          // 暂时只支持文本类型 等后期mp-table完成改造后再支持
          for (var j = 0; j < headList.length; j++) {
              var key = headList[j].name ? headList[j].name : headList[j];
              if (headList[j].slot) {
                  var slotName = headList[j].slot.name;
                  var dataObjects = headList[j].slot.data;
                  line[key] = {
                      type: headList[j].type ? headList[j].type : 'default',
                      slot: slotName,
                      data: slotDataTransform(dataObjects, data),
                      className: headList[j].contentClass ? headList[j].contentClass : ''
                  };
              }
              else {
                  var value = data[key] ? data[key] : '_("暂无")';
                  line[key] = {
                      content: Object.prototype.toString.call(headList[j].formatFunc) === '[object Function]' ? headList[j].formatFunc(value) : value,
                      className: headList[j].contentClass ? headList[j].contentClass : '',
                  };
              }
          }
          tableData.body.push(line);
      }
      return tableData;
  }

  function transformYesterdayData(dataList, commonConfig) {
      var dateList = commonConfig.dateList, quatoList = commonConfig.quatoList;
      var returnDataList = [];
      for (var _i = 0, dateList_1 = dateList; _i < dateList_1.length; _i++) {
          var date = dateList_1[_i];
          var returnData = {
              refdate: date
          };
          var dataLine = findItemByDate(date, dataList);
          for (var _a = 0, quatoList_1 = quatoList; _a < quatoList_1.length; _a++) {
              var quato = quatoList_1[_a];
              returnData[quato] = !dataLine ? 0 : dataLine[quato];
          }
          returnDataList.push(returnData);
      }
      return returnDataList;
  }

  function transformPie(dataList, pieConfig) {
      var _a = pieConfig.mainSceneList, mainSceneList = _a === void 0 ? [] : _a, _b = pieConfig.otherSceneList, otherSceneList = _b === void 0 ? [] : _b, _c = pieConfig.sceneMapInfo, sceneMapInfo = _c === void 0 ? {} : _c, key = pieConfig.key, title = pieConfig.title, subTitle = pieConfig.subTitle;
      var otherId = 'other';
      var pieChartOpt = {
          series: [{
                  name: 'main',
                  innerSize: '70%',
                  cursor: 'default',
                  data: []
              }],
          drilldown: {
              series: [{
                      name: 'sub',
                      id: otherId,
                      cursor: 'default',
                      colors: ['#8A9ADB', '#A1AFE0', '#BBC6E8', '#D4DAEF', '#E7EAF4'],
                      data: []
                  }]
          },
          plotOptions: {
              pie: {
                  dataLabels: {
                      formatter: function () {
                          var name = this.point.name + (this.point.drilldown ? '_("（点击展开详情）")' : '');
                          var percent = formatItemByPercent(this.point.y, this.point.total);
                          return name + " " + this.point.y + "\u6B21 " + percent + "%";
                      }
                  }
              }
          }
      };
      var sum = 0;
      var otherSum = 0;
      dataList.forEach(function (item) {
          var scene = parseInt(item['scene'], 10);
          var name = sceneMapInfo[scene];
          var y = parseInt(item[key], 10);
          sum += y;
          if (mainSceneList.indexOf(scene) > -1) {
              pieChartOpt.series[0].data.push({
                  name: name,
                  y: y
              });
          }
          else if (otherSceneList.indexOf(scene) > -1) {
              pieChartOpt.drilldown.series[0].data.push([name, y]);
              otherSum += y;
          }
      });
      if (sum > 0) {
          // 添加其他渠道
          if (otherSum > 0) {
              if (pieChartOpt.drilldown.series[0].data.length > 1) {
                  pieChartOpt.series[0].data.push({
                      name: '_("更多")',
                      y: otherSum,
                      drilldown: otherId
                  });
              }
              else {
                  var otherObj = pieChartOpt.drilldown.series[0].data[0];
                  pieChartOpt.series[0].data.push({
                      name: otherObj[0],
                      y: otherObj[1]
                  });
              }
          }
          var pieRenderFunc = function pieRenderFunc() {
              var paths = this.renderer.box.childNodes[5].childNodes[0].childNodes;
              var visible = false;
              for (var i = 0, len = paths.length; !visible && i < len; i++) {
                  if (paths[i].getAttribute('visibility') !== 'hidden')
                      visible = true;
              }
              if (visible) {
                  // 动态设置标题位置
                  var gRect = this.series[0].group.element.getBoundingClientRect(); // 获取圆的rect信息
                  var titleRect = this.title.element.getBoundingClientRect(); // 获取标题的rect信息
                  this.setTitle({
                      x: gRect.left + gRect.width / 2 - titleRect.left - titleRect.width / 2,
                      y: this.series[0].center[1]
                  });
              }
              else {
                  this.title.element.setAttribute('visibility', 'hidden');
              }
          };
          var formatSum = _changeUnitChinese(sum, 1);
          var titleConfig = {
              title: {
                  text: title,
                  style: {
                      color: '#353535',
                      fontSize: '16px'
                  },
                  floating: true,
                  align: 'center',
                  verticalAlign: 'middle',
                  y: -40
              },
              subtitle: {
                  text: "" + formatSum + subTitle,
                  style: {
                      color: '#9A9A9A',
                      fontSize: '14px'
                  },
                  align: 'center',
                  verticalAlign: 'middle',
                  y: -20
              },
              chart: {
                  events: {
                      render: pieRenderFunc
                  }
              }
          };
          pieChartOpt = Object.assign(pieChartOpt, titleConfig);
          return pieChartOpt;
      }
      return null;
  }

  function transformBar(dataList, barConfig) {
      var _a = barConfig.labelFormat, labelFormat = _a === void 0 ? '' : _a, _b = barConfig.pointFormat, pointFormat = _b === void 0 ? '' : _b, _c = barConfig.xAxisFormat, xAxisFormat = _c === void 0 ? function () { } : _c, _d = barConfig.xAxis, xAxis = _d === void 0 ? '' : _d, _e = barConfig.yAxis, yAxis = _e === void 0 ? '' : _e;
      var barChartOpt = {
          plotOptions: {
              column: {
                  dataLabels: {
                      enabled: false
                  }
              }
          },
          xAxis: {
              categories: []
          },
          yAxis: {
              labels: {
                  format: labelFormat
              }
          },
          tooltip: {
              pointFormat: pointFormat
          },
          series: [{
                  data: []
              }]
      };
      if (dataList && dataList.length > 0) {
          dataList.forEach(function (item) {
              barChartOpt.xAxis.categories.push(xAxisFormat(item[xAxis]));
              barChartOpt.series[0].data.push(item[yAxis]);
          });
          return barChartOpt;
      }
      return null;
  }

  function commonDealData(resp) {
      return resp && resp['data'] ? resp['data'] : [];
  }

  var Controller = /** @class */ (function () {
      function Controller(config) {
          this.CommonDao = new CommonDao(config);
      }
      Controller.prototype.getRawData = function (dataRequest) {
          return this.CommonDao.getData(dataRequest);
      };
      Controller.prototype.drawLine = function (dataRequest, showConfig) {
          return this.CommonDao.get(dataRequest, showConfig, this.formatLineData, this.requestFailureCb);
      };
      Controller.prototype.drawLineWithData = function (data, showConfig) {
          return this.formatLineFromData(data, showConfig);
      };
      Controller.prototype.drawTable = function (dataRequest, showConfig) {
          return this.CommonDao.get(dataRequest, showConfig, this.formatTableData, this.requestFailureCb);
      };
      Controller.prototype.drawPie = function (dataRequest, showConfig) {
          return this.CommonDao.get(dataRequest, showConfig, this.formatPieData, this.requestFailureCb);
      };
      Controller.prototype.drawPieWithData = function (data, showConfig) {
          return this.formatPieFromData(data, showConfig);
      };
      Controller.prototype.drawBarChart = function (dataRequest, showConfig) {
          return this.CommonDao.get(dataRequest, showConfig, this.formatBarData, this.requestFailureCb);
      };
      Controller.prototype.drawYesterdayData = function (dataRequest, showConfig) {
          var yesterday = getDaysBefore(1), twoDaysBefore = getDaysBefore(2), weekBefore = getDaysBefore(7);
          var lastMonth = getLastMonth(yesterday);
          if (dataRequest && dataRequest.args) {
              // dataRequest.args['date1'] = yesterday;
              // dataRequest.args['date2'] = twoDaysBefore;
              // dataRequest.args['date3'] = weekBefore;
              // dataRequest.args['date4'] = lastMonth;
              dataRequest.args['refdate0'] = yesterday;
              dataRequest.args['refdate1'] = twoDaysBefore;
              dataRequest.args['refdate2'] = weekBefore;
              dataRequest.args['refdate3'] = lastMonth;
          }
          if (showConfig) {
              showConfig['dateList'] = [yesterday, twoDaysBefore, weekBefore, lastMonth];
          }
          return this.CommonDao.get(dataRequest, showConfig, this.formatYesterdayData, null);
      };
      Controller.prototype.formatLineData = function (resp, lineConfig) {
          var dataList = commonDealData(resp);
          var lineChartOpt = transformLine(dataList, lineConfig);
          var _a = lineConfig.domId, domId = _a === void 0 ? '' : _a, _b = lineConfig.LineChart, LineChart = _b === void 0 ? function () { } : _b;
          LineChart.render(domId, lineChartOpt);
          return {
              success: true,
              data: dataList
          };
      };
      Controller.prototype.formatLineFromData = function (dataList, lineConfig) {
          var lineChartOpt = transformLine(dataList, lineConfig);
          var _a = lineConfig.domId, domId = _a === void 0 ? '' : _a, _b = lineConfig.LineChart, LineChart = _b === void 0 ? function () { } : _b;
          LineChart.render(domId, lineChartOpt);
          return {
              success: true,
              data: dataList
          };
      };
      Controller.prototype.formatPieFromData = function (dataList, pieConfig) {
          var pie_transform = transformPie(dataList, pieConfig);
          var _a = pieConfig.domId, domId = _a === void 0 ? '' : _a, _b = pieConfig.PieChart, PieChart = _b === void 0 ? function () { } : _b;
          if (pieConfig) {
              PieChart.render(domId, pie_transform);
              return {
                  success: true,
                  data: dataList
              };
          }
      };
      Controller.prototype.formatTableData = function (resp, tableConfig) {
          var dataList = commonDealData(resp);
          return transformTable(dataList, tableConfig);
      };
      Controller.prototype.formatYesterdayData = function (resp, commonConfig) {
          var dataList = commonDealData(resp);
          return transformYesterdayData(dataList, commonConfig);
      };
      Controller.prototype.formatPieData = function (resp, pieConfig) {
          var dataList = commonDealData(resp);
          var pieChartOpt = transformPie(dataList, pieConfig);
          var _a = pieConfig.domId, domId = _a === void 0 ? '' : _a, _b = pieConfig.PieChart, PieChart = _b === void 0 ? function () { } : _b;
          // const helper = (c) => {
          // }
          if (pieChartOpt) {
              PieChart.render(domId, pieChartOpt);
              return {
                  success: true,
                  data: dataList
              };
          }
      };
      Controller.prototype.formatBarData = function (resp, barConfig) {
          var dataList = commonDealData(resp);
          var barChartOpt = transformBar(dataList, barConfig);
          var _a = barConfig.domId, domId = _a === void 0 ? '' : _a, _b = barConfig.ColummnChart, ColummnChart = _b === void 0 ? function () { } : _b;
          if (barChartOpt) {
              ColummnChart.render(domId, barChartOpt);
              return true;
          }
          else {
              return false;
          }
      };
      Controller.prototype.requestFailureCb = function (resp) {
          return resp;
      };
      return Controller;
  }());

  var AnalysisMiddleware = /** @class */ (function () {
      function AnalysisMiddleware(config) {
          this.Controller = new Controller(config);
      }
      /**
       * 绘制折线图
       * @param dataRequest
       * {
       *  busi: 业务id
       *  tmpl: 模板id
       *  args: 参数
       * }
       * @param showConfig
       * {
       *   xAxis: x轴 type: string
       *   yAxis: y轴列表, type: array | string | Object 当为对象时支持传递处理函数
       *   [{
       *     name: '',
       *     formatFunc: Function
       *   }]
       *   ['play_pv', 'play_uv'] 这种形式默认不对数据进行处理
       *   mapInfo: y轴对应的中文名称 type: object
       *   autoFillDate: 是否自动补充日期 (当x轴的值为refDate时有效) type: boolean
       *   dataRange: 日期区间 (当autoFillDate为true时有效)
       *      {
       *          beginDate: 开始时间
       *          endDate: 结束时间
       *      }
       *   domId: 绘制折线图的domid type: string
       * }
       */
      AnalysisMiddleware.prototype.drawLine = function (dataRequest, showConfig) {
          return this.Controller.drawLine(dataRequest, showConfig);
      };
      AnalysisMiddleware.prototype.drawLineWithData = function (data, showConfig) {
          return this.Controller.drawLineWithData(data, showConfig);
      };
      /**
       *
       * @param dataRequest 同上
       * @param showConfig
       * {
       *  domId: 绘制饼图的domid  type: string
       *  sceneMapInfo: 每个场景值对应的中文名 type: object
       *  mainSceneList: 主要场景数组 type: array
       *  otherSceneList: 其他场景数组 type: array
       *  key: 分析指标 type: string
       * }
       */
      AnalysisMiddleware.prototype.drawPie = function (dataRequest, showConfig) {
          return this.Controller.drawPie(dataRequest, showConfig);
      };
      AnalysisMiddleware.prototype.drawPieWithData = function (data, showConfig) {
          return this.Controller.drawPieWithData(data, showConfig);
      };
      /**
       *
       * @param dataRequest 同上
       * @param showConfig
       * {
       *  headList: 表头列表 type: array
       *  ['xxx', 'xxx'] 或
       *  [{
       *    'name': 'xxx',
       *    'formatFunc': Function
       * }]
       *  mapInfo: 中英文对照表 type: object
       * }
       */
      AnalysisMiddleware.prototype.drawTable = function (dataRequest, showConfig) {
          return this.Controller.drawTable(dataRequest, showConfig);
      };
      /**
       *
       * @param dataRequest 同上
       * @param showConfig
       * {
       *  quatoList: 指标列表 type: array
       * }
       */
      AnalysisMiddleware.prototype.drawYesterdayData = function (dataRequest, showConfig) {
          return this.Controller.drawYesterdayData(dataRequest, showConfig);
      };
      /**
       *
       * @param dataRequest 同上
       */
      AnalysisMiddleware.prototype.getRawData = function (dataRequest) {
          return this.Controller.getRawData(dataRequest);
      };
      AnalysisMiddleware.prototype.drawBarChart = function (dataRequest, showConfig) {
          return this.Controller.drawBarChart(dataRequest, showConfig);
      };
      return AnalysisMiddleware;
  }());

  return AnalysisMiddleware;

})));
