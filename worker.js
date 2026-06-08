function gzipContentType(path) {
  if (path.endsWith(".framework.js.gz")) return "application/javascript";
  if (path.endsWith(".wasm.gz")) return "application/wasm";
  if (path.endsWith(".data.gz")) return "application/octet-stream";
  return "application/octet-stream";
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;

    if (path.endsWith(".gz")) {
      const asset = await env.ASSETS.fetch(request);
      if (!asset.ok) return asset;

      return new Response(asset.body.pipeThrough(new DecompressionStream("gzip")), {
        status: asset.status,
        headers: {
          "Content-Type": gzipContentType(path),
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
