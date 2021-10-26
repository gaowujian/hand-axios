const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res, next) => {
  res.json(req.query);
});
app.post("/", (req, res, next) => {
  console.log("req.body:", req.body);
  res.json(req.body);
});
app.post("/post", (req, res, next) => {
  console.log("req.body:", req.body);
  res.json(req.body);
});

app.post("/timeout", (req, res, next) => {
  setTimeout(() => {
    res.json("三秒后返回的正常内容");
  }, req.query.timeout);
});
app.post("/error_code", (req, res, next) => {
  res.status(500).json("返回异常状态码");
});

app.listen(5050, () => {
  console.log("server is running on 5050!");
});
