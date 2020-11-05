const fs = require("fs");
const path = require("path");

function fix(filename) {
  const dir = path.join(__dirname, `../dist/${filename}`)
  console.log(`directory ${dir}}`);

  const file = fs.readFileSync(dir).toString();

  file.replace("var(", "var(--")
  file.replace("----", "--");

  fs.writeFileSync(dir, file);
}

console.log("fixing vue3-slider.esm.css");
fix("vue3-slider.esm.css");

console.log("fixing vue3-slider.min.css");
fix("vue3-slider.min.css");

console.log("fixing vue3-slider.ssr.css");
fix("vue3-slider.ssr.css");
