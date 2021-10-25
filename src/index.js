"use strict";
exports.__esModule = true;
var axios_1 = require("axios");
(0, axios_1["default"])({
    method: "get",
    url: "http://localhost:5050"
})
    .then(function (data) {
    console.log("data:", data);
})["catch"](function (err) {
    console.log("err:", err);
});
