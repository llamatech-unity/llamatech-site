const UNITY_ASSETS = {
  "/demo/Build/demo.framework.js": {
    gz: "/demo/Build/demo.framework.js.gz",
    type: "application/javascript",
  },
  "/demo/Build/demo.wasm": {
    gz: "/demo/Build/demo.wasm.gz",
    type: "application/wasm",
  },
  "/demo/Build/demo.data": {
    gz: "/demo/Build/demo.data.gz",
    type: "application/octet-stream",
  },
};

async function gunzip(asset) {
  const compressed = await asset.arrayBuffer();
  return new Response(
    new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"))
  ).arrayBuffer();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const asset = UNITY_ASSETS[url.pathname];

    if (asset) {
      const plain = await env.ASSETS.fetch(request);
      if (plain.ok) {
        return new Response(plain.body, {
          status: plain.status,
          headers: { "Content-Type": asset.type },
        });
      }

      const gzUrl = new URL(url);
      gzUrl.pathname = asset.gz;
      const gz = await env.ASSETS.fetch(new Request(gzUrl, request));
      if (!gz.ok) return gz;

      const body = await gunzip(gz);
      return new Response(body, {
        status: 200,
        headers: { "Content-Type": asset.type },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
