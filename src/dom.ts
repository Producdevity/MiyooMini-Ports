export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: {
    class?: string;
    attrs?: Record<string, string | boolean | null | undefined>;
    children?: (Node | string)[];
  } = {},
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  for (const [k, v] of Object.entries(opts.attrs ?? {})) {
    if (v == null || v === false) continue;
    node.setAttribute(k, v === true ? "" : v);
  }
  for (const child of opts.children ?? []) {
    node.append(child);
  }
  return node;
}
