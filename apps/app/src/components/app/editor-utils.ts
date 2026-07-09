export function rehydrateImageSrc(json: unknown, assets: Array<{ id: string; url?: string; signedUrl?: string }>): unknown {
  if (!json) return json;
  if (Array.isArray(json)) return json.map(n => rehydrateImageSrc(n, assets));
  if (typeof json === "object") {
    const node = { ...(json as Record<string, unknown>) };
    const attrs = node.attrs as Record<string, unknown> | undefined;
    if (node.type === "image" && attrs?.assetId) {
      const asset = assets.find(a => a.id === attrs.assetId);
      const url = asset?.signedUrl || asset?.url;
      if (url) {
        node.attrs = { ...attrs, src: url };
      }
    }
    if (node.content) {
      node.content = rehydrateImageSrc(node.content, assets);
    }
    return node;
  }
  return json;
}

export function stripImageSrc(json: unknown): unknown {
  if (!json) return json;
  if (Array.isArray(json)) return json.map(stripImageSrc);
  if (typeof json === "object") {
    const node = { ...(json as Record<string, unknown>) };
    const attrs = node.attrs as Record<string, unknown> | undefined;
    if (node.type === "image" && attrs) {
      const { src, ...restAttrs } = attrs;
      node.attrs = restAttrs;
    }
    if (node.content) {
      node.content = stripImageSrc(node.content);
    }
    return node;
  }
  return json;
}
