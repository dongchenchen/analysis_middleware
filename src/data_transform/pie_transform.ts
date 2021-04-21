import * as DataDealer from '../util/data_dealer';

export function transformPie(dataList: Array<object>, pieConfig: any): any {
  const { mainSceneList = [], otherSceneList = [],  sceneMapInfo = {}, key, title, subTitle} = pieConfig
  const otherId = 'other';
  let pieChartOpt = {
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
          formatter() {
            const name = this.point.name + (this.point.drilldown ? '_("（点击展开详情）")' : '');
            const percent = DataDealer.formatItemByPercent(this.point.y, this.point.total, 4);
            return `${name} ${this.point.y}次 ${percent}%`;
          }
        }
      }
    }
  };

  let sum = 0;
  let otherSum = 0;
  dataList.forEach((item) => {
    let scene = parseInt(item['scene'], 10)
    const name = sceneMapInfo[scene];
    const y = parseInt(item[key], 10);
    sum += y;
    if (mainSceneList.indexOf(scene) > -1) {
      pieChartOpt.series[0].data.push({
        name,
        y
      });
    } else if (otherSceneList.indexOf(scene) > -1) {
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
      } else {
        const otherObj = pieChartOpt.drilldown.series[0].data[0];
        pieChartOpt.series[0].data.push({
          name: otherObj[0],
          y: otherObj[1]
        });
      }
    }
    const pieRenderFunc = function pieRenderFunc() {
      const paths = this.renderer.box.childNodes[5].childNodes[0].childNodes;
      let visible = false;
      for (let i = 0, len = paths.length; !visible && i < len; i++) {
        if (paths[i].getAttribute('visibility') !== 'hidden') visible = true;
      }
      if (visible) {
        // 动态设置标题位置
        var gRect = this.series[0].group.element.getBoundingClientRect(); // 获取圆的rect信息
        var titleRect = this.title.element.getBoundingClientRect(); // 获取标题的rect信息
        if (this.series[0].name === 'sub') {
            this.title.element.setAttribute('visibility', 'hidden');
            this.subtitle.element.setAttribute('visibility', 'hidden');
        } else {
            this.setTitle({
                x: gRect.left + gRect.width / 2 - titleRect.left - titleRect.width / 2,
                y: this.series[0].center[1] - 10
            }, {
                x: gRect.left + gRect.width / 2 - titleRect.left - titleRect.width / 2,
                y: this.series[0].center[1] + 11
            });
            this.title.element.setAttribute('visibility', 'visible');
            this.subtitle.element.setAttribute('visibility', 'visible');
        }
      }
      else {
          this.title.element.setAttribute('visibility', 'hidden');
      }
    };
    let formatSum = DataDealer._changeUnitChinese(sum, 1);
    let titleConfig = {
      title: {
        text: title,
        style: {
          color: '#353535',
          fontSize: '16px'
        },
        floating: true,
      },
      subtitle: {
        text: `${formatSum}${subTitle}`,
        style: {
          color: '#9A9A9A',
          fontSize: '14px'
        },
        floating: true,
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
