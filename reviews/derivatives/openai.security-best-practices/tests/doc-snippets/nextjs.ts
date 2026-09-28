function safeReturnTo(value: unknown, origin: string, fallback = "/"): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048) return fallback;
  // 1. Raw-string policy: path-absolute, not `//` or `/\`, no control/whitespace chars, no backslash,
  //    no percent-encoded `.` `/` `\` `%` (any case), and no `.`/`..` segments. Legitimate return-to targets never need these.
  if (!value.startsWith("/") || value[1] === "/" || value[1] === "\\") return fallback;
  if (/[\u0000- \u007f\\]/.test(value) || /%(2e|2f|5c|25)/i.test(value)) return fallback;
  const pathPart = value.split(/[?#]/, 1)[0];
  if (pathPart.split("/").some((segment) => segment === "." || segment === "..")) return fallback;
  // 2. Parse against the current origin and compare origins; only http(s).
  let url: URL;
  try { url = new URL(value, origin); } catch { return fallback; }
  if (url.origin !== origin || (url.protocol !== "https:" && url.protocol !== "http:")) return fallback;
  // 3. Re-check the normalized output (defense in depth) and return the absolute, already-validated URL.
  if (url.pathname.startsWith("//") || url.pathname.startsWith("/\\")) return fallback;
  return url.href;
}

export { safeReturnTo };
