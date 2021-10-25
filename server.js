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

app.listen(5050, () => {
  console.log("server is running on 5050!");
});
