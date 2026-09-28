// 用同一组 vectors.json 实跑从文档提取的 React/Next.js 片段（node 原生 TS 类型剥离）。
import {readFileSync} from 'node:fs'
const {base,attack,benign}=JSON.parse(readFileSync(new URL('../vectors.json',import.meta.url),'utf8'))
globalThis.window={location:{origin:base}}
const react=await import('./react.ts'),nxt=await import('./nextjs.ts')
let fail=0,n=0
const nav=s=>{try{return new URL(s,base).origin}catch{return 'ERR'}}
for(const v of attack){n+=3
 if(react.safeReturnTo(v)!=='/'){fail++;console.log('FAIL react attack',JSON.stringify(v))}
 if(react.sameOriginPath(v)!=='/'){fail++;console.log('FAIL react path attack',JSON.stringify(v))}
 if(nxt.safeReturnTo(v,base)!=='/'){fail++;console.log('FAIL next attack',JSON.stringify(v))}}
for(const v of benign){n+=2
 const a=react.safeReturnTo(v),b=nxt.safeReturnTo(v,base)
 if(!(a.startsWith(base)&&nav(a)===base)){fail++;console.log('FAIL react benign',v,a)}
 if(!(b.startsWith(base)&&nav(b)===base)){fail++;console.log('FAIL next benign',v,b)}}
console.log(JSON.stringify({source:'doc-extracted react.ts + nextjs.ts',checks:n,failures:fail}))
process.exit(fail?1:0)
