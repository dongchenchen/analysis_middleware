/**
 * @author dididong
 * @description 入口页支持纯获取数据、绘制折线图、绘制饼图、绘制表格、绘制昨日数据
 * 
 * @param DataRequest {busi:业务id，tmpl:模板id, args：查询参数(json字符串)}
 */
import { DataRequest, ShowConfig, AnalysisConfig } from './common/config';
import { Controller } from './controller/controller';
export default class AnalysisMiddleware {
  private Controller: Controller; 
  
  constructor(config: AnalysisConfig) {
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
  public drawLine(dataRequest: DataRequest, showConfig: ShowConfig): any {
    return this.Controller.drawLine(dataRequest, showConfig);
  }

  public drawLineWithData(data: Array<object>, showConfig: ShowConfig): any {
    return this.Controller.drawLineWithData(data, showConfig);
  }
 
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

  public drawPie(dataRequest: DataRequest, showConfig: ShowConfig): any {
    return this.Controller.drawPie(dataRequest, showConfig);
  }

  public drawPieWithData(data: Array<object>, showConfig: ShowConfig): any {
    return this.Controller.drawPieWithData(data, showConfig);
  }

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
  public drawTable(dataRequest: DataRequest, showConfig: ShowConfig): any {
    return this.Controller.drawTable(dataRequest, showConfig);
  }

  /**
   * 
   * @param dataRequest 同上
   * @param showConfig 
   * {
   *  quatoList: 指标列表 type: array 
   * }
   */
  public drawYesterdayData(dataRequest: DataRequest, showConfig: ShowConfig): any {
    return this.Controller.drawYesterdayData(dataRequest, showConfig);
  }

  /**
   * 
   * @param dataRequest 同上
   */
  public getRawData(dataRequest: DataRequest): any {
    return this.Controller.getRawData(dataRequest);
  }

  public drawBarChart(dataRequest: DataRequest, showConfig: ShowConfig): any {
    return this.Controller.drawBarChart(dataRequest, showConfig);
  }
}


