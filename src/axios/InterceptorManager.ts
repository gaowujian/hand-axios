import { AxiosRequestConfig } from "./types";

// 每一个拦截器对象都接收两个回调，成功和失败
interface OnFulfilled<V> {
  (val: V): V | Promise<V>;
}
interface OnRejected {
  (err: any): any;
}
// 一个拦截器对象的形状
export interface Interceptor<V> {
  onFulfilled?: OnFulfilled<V>; //成功回调
  onRejected?: OnRejected; //失败回调
}

// 请求拦截器：先添加后执行s
// 返回拦截器：先添加先执行
// 拦截器管理对象，绑定在axios实例上，一个负责管理所有的请求拦截器对象，一个负责管理所有的返回拦截器对象
class InterceptorManager<V> {
  public interceptors: Array<Interceptor<V> | null> = [];
  use(onFulfilled?: OnFulfilled<V>, onRejected?: OnRejected): number {
    this.interceptors.push({
      onFulfilled,
      onRejected,
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
