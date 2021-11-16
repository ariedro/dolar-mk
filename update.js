const https = require("https");
const fs = require("fs");

const start = 5.75;

const step = 24;
const billetes = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

function rectFn(x1, x2, y1, y2) {
  const m = (y2 - y1) / (x2 - x1);
  const b = y1 - x1 * m;
  return (x) => m * x + b;
}

function getHeight(dollarValue) {
  if (dollarValue > billetes[0]) {
    return start;
  }
  for (let i = 1; i < 10; i++) {
    if (dollarValue >= billetes[i]) {
      return rectFn(
        billetes[i - 1],
        billetes[i],
        start + step * (i - 1),
        start + step * i
      )(dollarValue);
    }
  }
}

function updateHtml(apiData) {
  const { venta: dollarValue, fecha: lastUpdate } = apiData;
  const dollarHeight = getHeight(dollarValue);

  const template = fs.readFileSync("./template.html", "utf-8");
  const html = template
    .replace("{{dollarHeight}}", dollarHeight)
    .replace("{{lastUpdate}}", lastUpdate);
  fs.writeFileSync("public/index.html", html);
}

https
  .get("https://api-dolar-argentina.herokuapp.com/api/dolarblue", (res) => {
    const data = [];
    res.on("data", (chunk) => data.push(chunk));
    res.on("end", () => updateHtml(JSON.parse(Buffer.concat(data).toString())));
  })
  .on("error", (err) => console.error("Error: ", err.message));
