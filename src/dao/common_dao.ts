/**
 * @author dididong
 * @description 底层获取数据类
 */
import { DataRequest, ShowConfig, AnalysisConfig } from '../common/config';
const RET_MSG = {
  '-2': 'basic params error',
  '1014': 'args non-conform to the template',
  '1001': 'date range error'
};

export class CommonDao {
  private CGI: any;
  
  constructor(config: AnalysisConfig) {
    this.CGI = config.CGI;
  }

  public get(request: DataRequest, showConfig: ShowConfig, successCb: Function, failCb: Function): any {
    if (!this.CGI || Object.prototype.toString.call(this.CGI.post) !== '[object Function]') {
      return null;
    }

    return this.getData(request).then((resp) => {
      return successCb && successCb(resp, showConfig);
    }).catch((resp) => {
      return failCb && failCb(resp); 
    });
  }

  public getData(request: DataRequest): any {
    let { busi, tmpl, args } = request;
    return new Promise((resolve, reject) => {
      let result = this.verifyRequest(request);
      
      if (!!result['errMsg']) {
        reject(result);
        return;
      }
      
      this.CGI.post({
        url: '/misc/datacubequery',
        data: {
          action: 'query',
          busi: busi,
          tmpl: tmpl,
          args: JSON.stringify(args)
        }
      }, (resp) => {
        resp = this.addRetMsg(resp);
        if (resp && resp.base_resp && resp.base_resp.ret === 0) {
          resolve(resp);
        } else {
          reject(resp);
        }
      })
    });
  }

  private verifyRequest(request: DataRequest): Object {
    let result = {};
    let { busi, tmpl, args } = request;
    busi = Number(busi);
    tmpl = Number(tmpl);
    if (isNaN(busi)) {
      result['errMsg'] = `${busi} is unvalid, expected number`; 
    }

    if (isNaN(tmpl)) {
      result['errMsg'] = `${tmpl} is unvalid, expected number`; 
    }

    if (Object.prototype.toString.call(args) !== "[object Object]") {
      result['errMsg'] = `args is unvalid, expected object`; 
    }

    return result;
  }

  
   
  private addRetMsg(resp: any): Object {
    if (resp && resp.base_resp && resp.base_resp.ret) {
      let retNum = resp.base_resp.ret.toString();
      resp['retMsg'] = RET_MSG[retNum] || '';
    }
    return resp;
  }
}