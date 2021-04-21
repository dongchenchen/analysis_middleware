/**
 * @author dididong
 * @description 实际处理类
 */
import * as Config  from '../common/config';
import { CommonDao } from '../dao/common_dao';
import { transformLine } from '../data_transform/line_transform';
import { transformTable } from '../data_transform/table_transform';
import { transformYesterdayData } from '../data_transform/yesterday_transform';
import { transformPie } from '../data_transform/pie_transform';
import { transformBar } from '../data_transform/bar_transform';
import * as CommonUtil from '../data_transform/common_util';
import * as DateUtil from '../util/date';
export class Controller {
  private CommonDao: CommonDao;

  constructor(config: Config.AnalysisConfig) {
    this.CommonDao = new CommonDao(config);
  }

  public getRawData(dataRequest: Config.DataRequest): any {
    return this.CommonDao.getData(dataRequest);
  }

  public drawLine(dataRequest: Config.DataRequest, showConfig: Config.ShowConfig): any {
    return this.CommonDao.get(dataRequest, showConfig, this.formatLineData, this.requestFailureCb);
  }

  public drawLineWithData(data: Array<object>, showConfig: Config.ShowConfig): any {
    return this.formatLineFromData(data, showConfig);
  }

  public drawTable(dataRequest: Config.DataRequest, showConfig: Config.ShowConfig): any {
    return this.CommonDao.get(dataRequest, showConfig, this.formatTableData, this.requestFailureCb);
  }

  public drawPie(dataRequest: Config.DataRequest, showConfig: Config.ShowConfig): any {
    return this.CommonDao.get(dataRequest, showConfig, this.formatPieData, this.requestFailureCb);
  }

  public drawPieWithData(data: Array<object>, showConfig: Config.ShowConfig): any {
    return this.formatPieFromData(data, showConfig);
  }

  public drawBarChart(dataRequest: Config.DataRequest, showConfig: Config.ShowConfig): any {
    return this.CommonDao.get(dataRequest, showConfig, this.formatBarData, this.requestFailureCb);
  }

  public drawYesterdayData(dataRequest: Config.DataRequest, showConfig: Config.ShowConfig): any {
    let yesterday = DateUtil.getDaysBefore(1),
        twoDaysBefore = DateUtil.getDaysBefore(2),
        weekBefore = DateUtil.getDaysBefore(7);
    let lastMonth = DateUtil.getLastMonth(yesterday);

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
    return this.CommonDao.get(dataRequest, showConfig, this.formatYesterdayData, null)
  }

  private formatLineData(resp: object, lineConfig: any): any {
    let dataList = CommonUtil.commonDealData(resp);

    const lineChartOpt = transformLine(dataList, lineConfig);

    let { domId = '', 
          LineChart = () => {}
        } = lineConfig;
    
    LineChart.render(domId, lineChartOpt);
    return {
      success: true,
      data: dataList
    }
  } 

  private formatLineFromData(dataList: Array<object>, lineConfig: any): any {
    const lineChartOpt = transformLine(dataList, lineConfig);
    let { domId = '', 
          LineChart = () => {}
        } = lineConfig;
    
    LineChart.render(domId, lineChartOpt);
    return {
      success: true,
      data: dataList
    }
  }

  private formatPieFromData(dataList: Array<object>, pieConfig: any): any {
    const pie_transform = transformPie(dataList, pieConfig);
    const { domId = '',
            PieChart = () => {}
          } = pieConfig;

    if (pieConfig) {
      PieChart.render(domId, pie_transform);
      return {
        success: true,
        data: dataList
      }
    } 
  }

  private formatTableData(resp: object, tableConfig: any): any {
    
    let dataList = CommonUtil.commonDealData(resp);

    return transformTable(dataList, tableConfig);
  }

  private formatYesterdayData(resp: object, commonConfig: any): any {
    let dataList = CommonUtil.commonDealData(resp);

    return transformYesterdayData(dataList, commonConfig);
  }

  private formatPieData(resp: object, pieConfig: any): any {
    let dataList = CommonUtil.commonDealData(resp);

    const pieChartOpt = transformPie(dataList, pieConfig);

    const { domId = '',
            PieChart = () => {}
          } = pieConfig;
          
    if (pieChartOpt) {
      PieChart.render(domId, pieChartOpt);
      return {
        success: true,
        data: dataList
      }
    } 
  }

  private formatBarData(resp: object, barConfig: any): any {
    let dataList = CommonUtil.commonDealData(resp);
    
    const barChartOpt = transformBar(dataList, barConfig);

    const { domId = '',
            ColummnChart = () => {}
          } = barConfig;
    
    if (barChartOpt) {
      ColummnChart.render(domId, barChartOpt);
      return true;
    } else {
      return false;
    }
  }

  public requestFailureCb(resp: object) {
    return resp;
  }
}