import { AxiosRequestConfig } from "./types";

// 每一个拦截器对象都接收两个回调，成功和失败
interface onFulfilled<T> {
  (config: T): T | Promise<T>;
}

interface onRejected {
  (err: any): any;
}
export interface Interceptor<T> {
  onFulfilled: onFulfilled<T>;
  onRejected?: onRejected;
}

// 请求拦截器：先添加后执行
// 返回拦截器：先添加先执行
class InterceptorManager<T> {
  public interceptors: Array<Interceptor<T> | null> = [];
  use(fulfilledCb: onFulfilled<T>, rejectedCb: onRejected): number {
    this.interceptors.push({
      onFulfilled: fulfilledCb,
      onRejected: rejectedCb,
    });
    return this.interceptors.length - 1;
  }
  eject(id: number): void {
    if (this.interceptors[id]) {
      this.interceptors[id] = null;
    }
  }
}

export default InterceptorManager;
