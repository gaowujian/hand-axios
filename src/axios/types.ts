import InterceptorManager from "./InterceptorManager";
type Methods = "get" | "GET" | "post" | "POST";

export interface AxiosRequestConfig {
  method: Methods;
  url: string;
  params?: Record<string, any>;
  headers?: Record<string, any>;
  data?: Record<string, any>;
  timeout?: number;
  transformRequest?: (data: any) => any;
  transformResponse?: (data: any) => any;
}
export interface AxiosInstance {
  <T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  interceptors: {
    request: InterceptorManager<AxiosRequestConfig>;
    response: InterceptorManager<AxiosResponse>;
  };
}
// 泛型T代表相应体的类型
export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string | string[]>;
  config: AxiosRequestConfig;
  request?: XMLHttpRequest;
}
