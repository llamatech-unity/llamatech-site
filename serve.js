const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const PORT = 444;
const ROOT = __dirname;

const UNITY_ASSETS = [
  {
    url: "/demo/Build/demo.framework.js",
    gz: "/demo/Build/demo.framework.js.gz",
    type: "application/javascript",
  },
  {
    url: "/demo/Build/demo.wasm",
    gz: "/demo/Build/demo.wasm.gz",
    type: "application/wasm",
  },
  {
    url: "/demo/Build/demo.data",
    gz: "/demo/Build/demo.data.gz",
    type: "application/octet-stream",
  },
];

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

function resolvePath(urlPath) {
  return path.normalize(path.join(ROOT, urlPath.replace(/^\/+/, "")));
}

function contentType(urlPath) {
  const asset = UNITY_ASSETS.find((entry) => entry.url === urlPath);
  if (asset) return asset.type;
  return MIME[path.extname(urlPath)] || "application/octet-stream";
}

function serveUnityAsset(urlPath, res) {
  const asset = UNITY_ASSETS.find((entry) => entry.url === urlPath);
  if (!asset) return false;

  const plainPath = resolvePath(asset.url);
  const gzPath = resolvePath(asset.gz);

  const respond = (body) => {
    res.writeHead(200, { "Content-Type": asset.type });
    res.end(body);
  };

  if (fs.existsSync(plainPath)) {
    fs.readFile(plainPath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Failed to read asset");
        return;
      }
      respond(data);
    });
    return true;
  }

  if (fs.existsSync(gzPath)) {
    fs.readFile(gzPath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Failed to read asset");
        return;
      }
      zlib.gunzip(data, (gunzipErr, body) => {
        if (gunzipErr) {
          res.writeHead(500);
          res.end("Failed to decompress asset");
          return;
        }
        respond(body);
      });
    });
    return true;
  }

  res.writeHead(404);
  res.end("Not found");
  return true;
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  if (serveUnityAsset(urlPath, res)) return;

  const diskPath = resolvePath(urlPath);
  if (!diskPath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(diskPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, { "Content-Type": contentType(urlPath) });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Llamatech site: http://127.0.0.1:${PORT}`);
});
