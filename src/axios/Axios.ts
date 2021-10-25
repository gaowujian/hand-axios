import { AxiosRequestConfig, AxiosResponse } from "./types";
import qs from "qs";
import parseHeaders from "parse-headers";
import InterceptorManager, { Interceptor } from "./InterceptorManager";

class Axios<T> {
  public interceptors = {
    request: new InterceptorManager<AxiosRequestConfig>(),
    response: new InterceptorManager<AxiosResponse<T>>(),
  };
  // T用来限制相应对象里的data类型,T的类型是User
  request(config: AxiosRequestConfig): any {
    // Promise<AxiosResponse<T>>
    // return this.dispatchRequest<T>(config);
    // !在这个例子中，前三个是请求拦截器，每个拦截器有成功和回调失败，然后是真正的请求，然后是返回拦截器，每个拦截器也有成功和失败
    const chain: Array<Interceptor<AxiosRequestConfig> | Interceptor<AxiosResponse<T>>> = [
      // todo
      {
        onFulfilled: this.dispatchRequest as any,
        onRejected: (err) => err,
      },
    ];
    // 把请求拦截器和相应拦截器排序好弄成一个数组，等之后promise进行连接
    // [req3,req2,req1,real request,res1,res3,res3]
    this.interceptors.request.interceptors.forEach((interceptor) => {
      if (interceptor) {
        chain.unshift(interceptor);
      }
    });
    this.interceptors.response.interceptors.forEach((interceptor) => {
      if (interceptor) {
        chain.push(interceptor);
      }
    });
    // 开始定义第一个promise
    let promise: Promise<Interceptor<AxiosRequestConfig> | Interceptor<AxiosResponse<T>>> = Promise.resolve(config);
    while (chain.length > 0) {
      const { onFulfilled, onRejected } = chain.shift()!;
      promise = promise.then(onFulfilled, onRejected);
    }
  }
  // !定义一个派发请求的方法？？
  dispatchRequest<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return new Promise<AxiosResponse<T>>((resolve, reject) => {
      const request = new XMLHttpRequest();
      let { method, url, params, headers, data, timeout } = config;
      let paramsStr = "";
      if (params && typeof params === "object") {
        paramsStr = qs.stringify(params);
        url += url.indexOf("?") > -1 ? "&" : "?" + paramsStr;
      }
      request.open(method, url, true);
      // 默认认为服务器返回json格式数据,那么客户端的xhr设置成对应的返回类型就能自动解析
      request.responseType = "json";
      request.onreadystatechange = function (e: Event) {
        if (request.readyState === 4 && request.status !== 0) {
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
            // ! 异常状态码错误处理
            reject(`Error: Request failed with error code ${request.status}`);
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

      // !断网错误处理
      request.onerror = function () {
        reject("net::ERR_INTERNET_DISCONNECTED");
      };

      // !超时处理
      if (timeout) {
        request.timeout = timeout;
        request.ontimeout = function () {
          reject(`Error: timeout of ${timeout} was exceed`);
        };
      }
      request.send(body);
    });
  }
}

export default Axios;
