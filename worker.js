const GZIP_ALIASES = {
  "/demo/Build/demo.framework.js": "/demo/Build/demo.framework.js.gz",
  "/demo/Build/demo.wasm": "/demo/Build/demo.wasm.gz",
  "/demo/Build/demo.data": "/demo/Build/demo.data.gz",
};

function contentType(path) {
  if (path.endsWith(".framework.js")) return "application/javascript";
  if (path.endsWith(".wasm")) return "application/wasm";
  if (path.endsWith(".data")) return "application/octet-stream";
  return "application/octet-stream";
}

async function gunzip(asset) {
  const compressed = await asset.arrayBuffer();
  return new Response(
    new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"))
  ).arrayBuffer();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const gzPath = GZIP_ALIASES[url.pathname];

    if (gzPath) {
      const gzUrl = new URL(url);
      gzUrl.pathname = gzPath;
      const asset = await env.ASSETS.fetch(new Request(gzUrl, request));

      if (!asset.ok) return asset;

      const body = await gunzip(asset);

      return new Response(body, {
        status: 200,
        headers: { "Content-Type": contentType(url.pathname) },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
