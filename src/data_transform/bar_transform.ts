export function transformBar(dataList: Array<object>, barConfig: any): any {
  const { labelFormat = '', pointFormat = '', xAxisFormat = () => {}, xAxis = '', yAxis = '' } = barConfig;
  const barChartOpt = {
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
    dataList.forEach((item) => {
      barChartOpt.xAxis.categories.push(xAxisFormat(item[xAxis]));
      barChartOpt.series[0].data.push(item[yAxis]);
    });
    return barChartOpt;
  }
  return null;
}