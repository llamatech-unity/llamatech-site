const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

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
  if (filePath.endsWith(".framework.js.br") || filePath.endsWith(".framework.js.gz")) {
    return "application/javascript";
  }
  if (filePath.endsWith(".wasm.br") || filePath.endsWith(".wasm.gz")) {
    return "application/wasm";
  }
  if (filePath.endsWith(".data.br") || filePath.endsWith(".data.gz")) {
    return "application/octet-stream";
  }
  return MIME[path.extname(filePath)] || "application/octet-stream";
}

function decompress(filePath, data, callback) {
  if (filePath.endsWith(".br")) {
    zlib.brotliDecompress(data, callback);
  } else if (filePath.endsWith(".gz")) {
    zlib.gunzip(data, callback);
  } else {
    callback(null, data);
  }
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

    decompress(filePath, data, (decompressErr, body) => {
      if (decompressErr) {
        res.writeHead(500);
        res.end("Failed to decompress asset");
        return;
      }

      res.writeHead(200, { "Content-Type": contentType(filePath) });
      res.end(body);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Llamatech site: http://127.0.0.1:${PORT}`);
});
