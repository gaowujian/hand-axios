import React from "react";
import ReactDOM from "react-dom";
import axios from "./axios";

axios({
  method: "get",
  url: "http://localhost:5050",
  params: {
    username: "tony",
    age: 28,
  },
})
  .then((data: any) => {
    console.log("data:", data);
    ReactDOM.render(<React.StrictMode>{JSON.stringify(data)}</React.StrictMode>, document.getElementById("root"));
  })
  .catch((err) => {
    console.log("err:", err);
  });
