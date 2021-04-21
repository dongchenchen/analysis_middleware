const slotDataTransform = (dataObjects: Array<any>, data: Object) => {
  let returnObject = {};
  for (let i = 0; i < dataObjects.length; i++) {
    let slotName = dataObjects[i].name ? dataObjects[i].name : dataObjects[i];
    let value = data[slotName] ? data[slotName] : '_("暂无")';
    returnObject[slotName] =  Object.prototype.toString.call(dataObjects[i].formatFunc) === '[object Function]' ? dataObjects[i].formatFunc(value) : value;
  }
  return returnObject;
}

export function transformTable(dataList: Array<object>, tableConfig: any) {
  const { headList, mapInfo } = tableConfig;
    let tableData = {
      head: [],
      body: []
    };
    headList.forEach(element => {
      let name = element && element.name ? element.name : element;
      tableData.head.push({
        title: element.title,
        key: name,
        className: element.className ? element.className : ''
      });
    });
    for (let i = 0; i < dataList.length; i++) {
      let data = dataList[i];
      let line = {
        type: 'default'
      }
      // 暂时只支持文本类型 等后期mp-table完成改造后再支持
      for (let j = 0; j < headList.length; j++) {
        let key = headList[j].name ? headList[j].name : headList[j];
        if (headList[j].slot) {
          let slotName = headList[j].slot.name;
          let dataObjects = headList[j].slot.data;
          line[key] = {
            type: headList[j].type ? headList[j].type : 'default',
            slot: slotName,
            data: slotDataTransform(dataObjects, data),
            className: headList[j].contentClass ? headList[j].contentClass : ''
          }
        } else {
          let value = data[key] ? data[key] : '_("暂无")';
          line[key] = {
            content: Object.prototype.toString.call(headList[j].formatFunc) === '[object Function]' ? headList[j].formatFunc(value) : value,
            className: headList[j].contentClass ? headList[j].contentClass : '',
          }
        } 
      }
      tableData.body.push(line);
    }
    return tableData;
}