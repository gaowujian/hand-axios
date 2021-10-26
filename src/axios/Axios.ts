import { AxiosRequestConfig, AxiosResponse } from "./types";
import qs from "qs";
import parseHeaders from "parse-headers";
import InterceptorManager, { Interceptor } from "./InterceptorManager";
import { transform } from "typescript";

let defaults: AxiosRequestConfig = {
  method: "get",
  url: "http://localhost:80",
  timeout: 0,
  headers: {
    common: {
      //针对所有请求生效
      accept: "application/json",
    },
  },
  // 默认把所有请求体转json
  transformRequest(data) {
    return JSON.stringify(data);
    // return data;
  },
  // 默认只返回data属性,默认不用开启,让用户去自定义
  // transformResponse(res) {
  //   return res.data;
  // },
};

const getStyleMethods = ["get", "delete", "options", "head"];
getStyleMethods.forEach((method: string) => {
  defaults.headers![method] = {};
});
// post类型请求，默认请求体是json格式
const postStyleMethods = ["put", "post", "patch"];
postStyleMethods.forEach((method: string) => {
  defaults.headers![method] = {
    "content-type": "application/json",
  };
});

const allMethods = [...getStyleMethods, ...postStyleMethods];

class Axios<T> {
  public defaults: AxiosRequestConfig = defaults;
  public interceptors = {
    request: new InterceptorManager<AxiosRequestConfig>(),
    response: new InterceptorManager<AxiosResponse<T>>(),
  };
  // T用来限制相应对象里的data类型,T的类型是User
  request(config: AxiosRequestConfig): Promise<AxiosRequestConfig | AxiosResponse<T>> {
    // *合并默认配置和传入配置为最终配置
    config.headers = { ...this.defaults.headers, ...config.headers };
    config = { ...this.defaults, ...config };

    // ! chain的类型错误
    const chain: any = [
      {
        onFulfilled: this.dispatchRequest,
        // onRejected: (err) => err,
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
    // 开始定义第一个promise, 需要断言
    let promise: any = Promise.resolve(config);
    while (chain.length > 0) {
      const { onFulfilled, onRejected } = chain.shift()!;
      promise = promise.then(onFulfilled, onRejected);
    }
    return promise;
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

            console.log("请求回来的数据", response);

            // *如果有返回转换器需要转换结果
            if (config.transformResponse) {
              response = config.transformResponse(response);
            }
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
          // 如果key是通用的默认配置，或者给指定请求方法添加默认配置，会先赋值再被自定义覆盖
          if (key === "common" || key === config.method) {
            for (const subKey in headers[key]) {
              request.setRequestHeader(subKey, headers[key][subKey]);
            }
          } else {
            if (!allMethods.includes(key)) {
              request.setRequestHeader(key, headers[key]);
            }
          }
        }
      }
      let body = null;
      if (data) {
        body = data;
        console.log("请求前的数据回来的数据", body);
        // * 请求真正发送前转换数据类型
        if (config.transformRequest) {
          const result = config.transformRequest(config.data);
          config.data = result;
          body = result;
        }
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
