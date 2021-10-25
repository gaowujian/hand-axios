import { AxiosRequestConfig, AxiosResponse } from "./types";
import qs from "qs";
import parseHeaders from "parse-headers";

export interface AxiosPromise<T = never> extends Promise<AxiosResponse<T>> {}
class Axios {
  // T用来限制相应对象里的data类型,T的类型是User
  request<T>(config: AxiosRequestConfig): AxiosPromise<T> {
    return this.dispatchRequest<T>(config);
  }
  // !定义一个派发请求的方法？？
  dispatchRequest<T>(config: AxiosRequestConfig): AxiosPromise<T> {
    return new Promise<AxiosResponse<T>>((resolve, reject) => {
      const request = new XMLHttpRequest();
      let { method, url, params, headers, data } = config;
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
      // 如果是post请求数据，必须写明 content-type的请求头，否则后端无法解析
      if (headers) {
        for (const key in headers) {
          request.setRequestHeader(key, headers[key]);
        }
      }
      let body;
      if (data) {
        body = JSON.stringify(data);
        console.log("body:", body);
      }
      request.send(body);
    });
  }
}

export default Axios;
