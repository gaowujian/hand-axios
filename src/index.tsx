// import React from "react";
// import ReactDOM from "react-dom";
import axios, { AxiosResponse } from "./axios";

interface User {
  username: string;
  age: number;
}
const user: User = {
  username: "tony",
  age: 28,
};

axios.interceptors.request.use((config: any) => {
  config.data.username += "req1";
  return config;
});
axios.interceptors.request.use((config: any) => {
  // return new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     config.data.username += "req2";
  //     resolve(config);
  //   }, 2000);
  // });
  config.data.username += "req2";
  return config;
});
axios.interceptors.request.use((config: any) => {
  config.data.username += "req3";
  return config;
});

axios.interceptors.response.use((res: any) => {
  res.data.username += "res1";
  return res;
});
axios.interceptors.response.use((res: any) => {
  res.data.username += "res2";
  return res;
});
axios.interceptors.response.use((res: any) => {
  res.data.username += "res3";
  return res;
});
axios({
  method: "post",
  url: "http://localhost:5050/",
  headers: {
    "content-type": "application/json",
  },
  data: user,
  timeout: 1000,
})
  .then((res) => {
    console.log("res:", res);
    // ReactDOM.render(<React.StrictMode>{JSON.stringify(res)}</React.StrictMode>, document.getElementById("root"));
    return res.data;
  })
  .then((data) => {
    console.log("data:", data);
  })
  .catch((err) => {
    console.log("err:", err);
  });
