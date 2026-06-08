const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const PORT = 444;
const ROOT = __dirname;

const GZIP_ALIASES = {
  "/demo/Build/demo.framework.js": "/demo/Build/demo.framework.js.gz",
  "/demo/Build/demo.wasm": "/demo/Build/demo.wasm.gz",
  "/demo/Build/demo.data": "/demo/Build/demo.data.gz",
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".bank": "application/octet-stream",
  ".wasm": "application/wasm",
  ".data": "application/octet-stream",
};

function contentType(filePath) {
  if (filePath.endsWith(".framework.js")) return "application/javascript";
  if (filePath.endsWith(".wasm")) return "application/wasm";
  if (filePath.endsWith(".data")) return "application/octet-stream";
  return MIME[path.extname(filePath)] || "application/octet-stream";
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  const gzPath = GZIP_ALIASES[urlPath];
  const filePath = path.normalize(path.join(ROOT, gzPath || urlPath));

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

    const respond = (body) => {
      res.writeHead(200, { "Content-Type": contentType(gzPath ? urlPath : filePath) });
      res.end(body);
    };

    if (gzPath) {
      zlib.gunzip(data, (gunzipErr, body) => {
        if (gunzipErr) {
          res.writeHead(500);
          res.end("Failed to decompress asset");
          return;
        }
        respond(body);
      });
      return;
    }

    respond(data);
  });
});

server.listen(PORT, () => {
  console.log(`Llamatech site: http://127.0.0.1:${PORT}`);
});
