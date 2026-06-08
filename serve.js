const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 444;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".bank": "application/octet-stream",
  ".wasm": "application/wasm",
};

function contentType(filePath) {
  if (filePath.endsWith(".framework.js.gz")) return "application/javascript";
  if (filePath.endsWith(".wasm.gz")) return "application/wasm";
  if (filePath.endsWith(".data.gz")) return "application/octet-stream";
  return MIME[path.extname(filePath)] || "application/octet-stream";
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const headers = { "Content-Type": contentType(filePath) };
    if (filePath.endsWith(".gz")) {
      headers["Content-Encoding"] = "gzip";
    }

    res.writeHead(200, headers);
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Llamatech site: http://127.0.0.1:${PORT}`);
});
