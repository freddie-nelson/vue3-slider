const fs = require("fs");

let html = fs.readFileSync("./demo/index.html", "utf-8");
html = html.replace(/"\//g, '"./');

fs.writeFileSync("./demo/index.html", html);
