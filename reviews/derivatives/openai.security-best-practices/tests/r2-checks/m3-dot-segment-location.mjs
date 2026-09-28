// R2 m3：服务端 Location 原样发出点段形式时，浏览器（WHATWG URL）按当前源解析，不离开本源；
// 只有把解析后的 pathname 重新序列化成相对串再使用时才变成协议相对的站外地址。
const base = 'https://app.example/login'
const rows = []
for (const loc of ['/.//evil.example', '/a/..//evil.example', '/%2e//evil.example', '/%2e%2e//evil.example', '//evil.example', '/\\evil.example']) {
  const u = new URL(loc, base)
  const reserialized = u.pathname + u.search + u.hash
  rows.push({ location: loc, asSentOrigin: u.origin, normalizedPath: u.pathname, reserializedOrigin: new URL(reserialized, base).origin })
}
for (const r of rows) console.log(JSON.stringify(r))
const ok = rows.slice(0, 4).every(r => r.asSentOrigin === 'https://app.example' && r.reserializedOrigin === 'https://evil.example')
  && rows.slice(4).every(r => r.asSentOrigin === 'https://evil.example')
console.log(JSON.stringify({ node: process.version, claimHolds: ok }))
process.exit(ok ? 0 : 1)
