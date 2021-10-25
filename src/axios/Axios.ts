import { AxiosRequestConfig, AxiosResponse } from "./types";
import qs from "qs";
import parseHeaders from "parse-headers";

class Axios {
  // T用来限制相应对象里的data类型
  request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.dispatchRequest(config);
  }
  // !定义一个派发请求的方法？？
  dispatchRequest<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return new Promise<AxiosResponse<T>>((resolve, reject) => {
      const request = new XMLHttpRequest();
      let { method, url, params } = config;
      let paramsStr = "";
      if (params && typeof params === "object") {
        paramsStr = qs.stringify(params);
        url += url.indexOf("?") > -1 ? "&" : "?" + paramsStr;
      }
      request.open(method, url, true);
      // 默认认为服务器返回json格式数据,那么客户端的xhr设置成对应的返回类型就能自动解析
      request.responseType = "json";
      request.onreadystatechange = function (e: Event) {
        if (request.readyState === 4) {
          if (request.status >= 200 && request.status <= 300) {
            let response: AxiosResponse<T> = {
              data: request.response ? request.response : request.responseText,
              status: request.status,
              statusText: request.statusText,
              headers: parseHeaders(request.getAllResponseHeaders()),
              config,
              request,
            };
            resolve(response);
          } else {
            reject("fail");
          }
        }
      };
      request.send();
    });
  }
}

export default Axios;
