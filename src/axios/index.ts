import Axios from "./Axios";
import { AxiosInstance } from "./types";

function createInstance(): AxiosInstance {
  // 创建一个Axios类的对象
  const context = new Axios();
  // 导出的axios实例实际上是request方法
  let instance = Axios.prototype.request.bind(context);
  //   把context的实例方法和的Axios原型上的方法都放到了instance上
  instance = Object.assign(instance, Axios.prototype, context);
  return instance as AxiosInstance;
}

const axios = createInstance();
export default axios;
export * from "./types";
