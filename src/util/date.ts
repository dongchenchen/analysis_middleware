/**
 * 
 * @param time 时间日期或时间戳 
 * @description 返回时间戳
 */
export function getTimestamp(time: any) {
  let timeStamp = '';
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(time)) {
    timeStamp += new Date(time).getTime();
  } else if (/^\d{13}$/.test(time)) {
    timeStamp += time;
  } else if (/^\d{8}$/.test(time)) {
    let date = time.substr(0, 4) + '-' +time.substr(4, 2) + '-' +time.substr(6, 2);
    timeStamp += new Date(date).getTime();
  }
  return parseInt(timeStamp);
}

/**
 * 
 * @param time 时间日期或时间戳 
 * @description 返回2019-10-11格式
 */
export function getTimeWordingWithLine(time: any) {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return [year, month, day].map(formatNumber).join('-');
}

/**
 * 
 * @param time 时间日期或时间戳 
 * @description 返回20191011格式
 */
export function getTimeWordingOriginal(time: any) {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return [year, month, day].map(formatNumber).join('');
}

export function getDaysBefore(days: number) {
  const today = new Date().getTime();
  let daysBefore = new Date().getTime() - days * 24 * 60 * 60 * 1000;
  let daysBeforeDate = new Date(daysBefore);
  return getTimeWordingOriginal(daysBeforeDate);
}

export function getLastMonth(compareDate: any) {
  let timeStamp = getTimestamp(compareDate);
  compareDate = new Date(timeStamp);
  let lastMonth = compareDate.setMonth(compareDate.getMonth() -1);
  return getTimeWordingOriginal(lastMonth);
}

export function getTodayTimeStamp() {
  const todayFormat = getTimeWordingWithLine(new Date().getTime());
  return getTimestamp(todayFormat);
}

function formatNumber(n: any) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

// 将时间从1200 => 12:00
export function formatHour(time) {
  time = `${time}`;
  while (time.length < 4) { // 长度不满4则在前面补0
    time = `0${time}`;
  }
  return time.replace(/(\d{2})(\d{2})/, '$1:$2');
}