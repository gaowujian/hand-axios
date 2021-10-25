import React from "react";
import ReactDOM from "react-dom";
import axios, { AxiosResponse } from "./axios";

interface User {
  username: string;
  age: number;
}
const user: User = {
  username: "tony",
  age: 28,
};
axios<User>({
  method: "post",
  url: "http://localhost:5050",
  headers: {
    "content-type": "application/json",
  },
  data: user,
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
