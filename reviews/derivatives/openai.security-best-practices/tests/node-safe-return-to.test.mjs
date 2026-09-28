// 实跑 React/Next.js/Vue 参考中的 safeReturnTo()。策略见 vectors.json.policy。
import {readFileSync} from 'node:fs'
const {base,attack,benign}=JSON.parse(readFileSync(new URL('./vectors.json',import.meta.url),'utf8'))
// === 与 references 中片段逻辑一致：去掉 TS 类型标注，window.location.origin / Next 的 origin 以参数 origin 传入（R2）；文档原样片段另由 doc-snippets/ 实跑 ===
function safeReturnTo(value, origin, fallback = "/") {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048) return fallback;
  // 1. Raw-string policy: path-absolute, not `//` or `/\`, no control/whitespace chars, no backslash,
  //    no percent-encoded `.` `/` `\` `%` (any case), and no `.`/`..` segments. Legitimate return-to targets never need these.
  if (!value.startsWith("/") || value[1] === "/" || value[1] === "\\") return fallback;
  if (/[\u0000- \u007f\\]/.test(value) || /%(2e|2f|5c|25)/i.test(value)) return fallback;
  const pathPart = value.split(/[?#]/, 1)[0];
  if (pathPart.split("/").some((segment) => segment === "." || segment === "..")) return fallback;
  // 2. Parse against the current origin and compare origins; only http(s).
  let url;
  try { url = new URL(value, origin); } catch { return fallback; }
  if (url.origin !== origin || (url.protocol !== "https:" && url.protocol !== "http:")) return fallback;
  // 3. Re-check the normalized output (defense in depth) and return the absolute, already-validated URL.
  if (url.pathname.startsWith("//") || url.pathname.startsWith("/\\")) return fallback;
  return url.href;
}
// For client-side routers that need a path: derive it from the validated absolute URL, never from the raw input.
function sameOriginPath(value, origin, fallback = "/") {
  const href = safeReturnTo(value, origin, fallback);
  if (href === fallback) return fallback;
  const url = new URL(href);
  if (url.pathname.startsWith("//") || url.pathname.startsWith("/\\")) return fallback;
  return url.pathname + url.search + url.hash;
}
const upstream=/^\/[^\s]*$/
let fail=0;const rows=[]
function navOrigin(s){try{return new URL(s,base).origin}catch{return 'PARSE-ERROR'}}
for(const v of attack){const href=safeReturnTo(v,base),path=sameOriginPath(v,base);const ok=href==='/'&&path==='/';if(!ok)fail++
 rows.push({kind:'attack',input:v,upstreamRegexAccepts:upstream.test(v),inputNavOrigin:navOrigin(v),safeReturnTo:href,sameOriginPath:path,pass:ok})}
for(const v of benign){const href=safeReturnTo(v,base),path=sameOriginPath(v,base)
 const ok=(v==='/'?href===base+'/':href!=='/')&&navOrigin(href)===base&&navOrigin(path)===base&&!path.startsWith('//')&&!path.startsWith('/\\');if(!ok)fail++
 rows.push({kind:'benign',input:v,safeReturnTo:href,sameOriginPath:path,hrefNavOrigin:navOrigin(href),pathNavOrigin:navOrigin(path),pass:ok})}
for(const r of rows)console.log(JSON.stringify(r))
console.log(JSON.stringify({node:process.version,total:rows.length,attack:attack.length,benign:benign.length,failures:fail,upstreamRegexAcceptedAttacks:rows.filter(r=>r.kind==='attack'&&r.upstreamRegexAccepts).length}))
process.exit(fail?1:0)
