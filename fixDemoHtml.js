const fs = require("fs");

let html = fs.readFileSync("./demo/index.html", "utf-8");
html = html.replace(/"\//g, '"./');
html = html.replace("<title>Vue App</title>", "<title>vue3-slider by Freddie Nelson</title>");
html = html.replace(
  "<head>",
  '<head><link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔥</text></svg>">'
);

fs.writeFileSync("./demo/index.html", html);
