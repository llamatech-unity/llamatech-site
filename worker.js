const UNITY_GZIP = new Set([
  "/demo/Build/demo.framework.js.gz",
  "/demo/Build/demo.wasm.gz",
  "/demo/Build/demo.data.gz",
]);

function unityContentType(path) {
  if (path.endsWith(".framework.js.gz")) return "application/javascript";
  if (path.endsWith(".wasm.gz")) return "application/wasm";
  if (path.endsWith(".data.gz")) return "application/octet-stream";
  return "application/octet-stream";
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;

    if (UNITY_GZIP.has(path)) {
      const asset = await env.ASSETS.fetch(request);
      if (!asset.ok) return asset;

      return new Response(asset.body, {
        status: asset.status,
        headers: {
          "Content-Type": unityContentType(path),
          "Content-Encoding": "gzip",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        encodeBody: "manual",
      });
    }

    return env.ASSETS.fetch(request);
  },
};
