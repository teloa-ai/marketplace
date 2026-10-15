// Checks the index signing path with a throwaway Ed25519 key pair generated here; the production key is never used.
// Run: node --test tools/tests/sign-index.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {generateKeyPairSync,verify} from 'node:crypto'
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'

const repo=fileURLToPath(new URL('../..',import.meta.url))
const run=(script,args,env={})=>spawnSync(process.execPath,[script,...args],{cwd:repo,encoding:'utf8',env:{PATH:process.env.PATH,...env}})
const pair=()=>{const {privateKey,publicKey}=generateKeyPairSync('ed25519');return {privatePem:privateKey.export({type:'pkcs8',format:'pem'}),publicPem:publicKey.export({type:'spki',format:'pem'}),publicKey}}

async function fixture(t){
 const dir=await mkdtemp(join(tmpdir(),'teloa-sign-index-'))
 t.after(()=>rm(dir,{recursive:true,force:true}))
 const out=join(dir,'index'),written=run('tools/validate.mjs',['--index-out',out])
 assert.equal(written.status,0,written.stderr)
 const key=pair(),publicPath=join(dir,'public.pem')
 await writeFile(publicPath,key.publicPem)
 return {dir,out,key,publicPath}
}

test('validator writes the unsigned indexes only in strict mode and never overwrites them',async t=>{
 const f=await fixture(t)
 const catalogVersion=(await readFile(join(repo,'catalog-version.txt'),'utf8')).trim()
 for(const file of ['index.json','v2/index.json'])assert.equal(JSON.parse(await readFile(join(f.out,file),'utf8')).catalogVersion,catalogVersion)
 assert.equal(run('tools/validate.mjs',['--index-out',f.out]).status,1,'existing indexes are not overwritten')
 assert.equal(run('tools/validate.mjs',['--write','--index-out',join(f.dir,'other')]).status,2)
 assert.equal(run('tools/validate.mjs',['--pr','--index-out',join(f.dir,'other')]).status,2)
})

test('signs both indexes with the matching key, verifies them and writes checksums and provenance without printing the key',async t=>{
 const f=await fixture(t),source='a'.repeat(40)
 const signed=run('.github/scripts/sign-index.mjs',['--dir',f.out,'--public-key',f.publicPath,'--source',source],{TELOA_MARKET_SIGNING_KEY:f.key.privatePem})
 assert.equal(signed.status,0,signed.stderr)
 assert.equal((signed.stdout+signed.stderr).includes('PRIVATE KEY'),false,'the key never appears in the output')
 for(const file of ['index.json','v2/index.json']){
  const bytes=await readFile(join(f.out,file)),text=await readFile(join(f.out,file+'.sig'),'utf8')
  assert.match(text,/^[A-Za-z0-9+/]{86}==\n$/,'base64 of the 64-byte signature plus a newline')
  assert.ok(verify(null,bytes,f.key.publicKey,Buffer.from(text.trim(),'base64')))
 }
 const provenance=JSON.parse(await readFile(join(f.out,'provenance.json'),'utf8'))
 assert.equal(provenance.source,source);assert.equal(Object.keys(provenance.files).length,4)
 assert.equal((await readFile(join(f.out,'SHA256SUMS'),'utf8')).trim().split('\n').length,4)
})

test('refuses a key that is not the built-in public key, a missing key and an altered public key file',async t=>{
 const f=await fixture(t)
 const other=pair()
 const wrong=run('.github/scripts/sign-index.mjs',['--dir',f.out,'--public-key',f.publicPath],{TELOA_MARKET_SIGNING_KEY:other.privatePem})
 assert.equal(wrong.status,1);assert.match(wrong.stderr,/does not match the app's built-in public key/)
 assert.equal((wrong.stdout+wrong.stderr).includes('PRIVATE KEY'),false)
 assert.equal(run('.github/scripts/sign-index.mjs',['--dir',f.out,'--public-key',f.publicPath]).status,1,'no key')
 assert.equal(run('.github/scripts/sign-index.mjs',['--dir',f.out,'--public-key',f.publicPath],{TELOA_MARKET_SIGNING_KEY:'not a key'}).status,1)
 const rsa=generateKeyPairSync('rsa',{modulusLength:2048}).privateKey.export({type:'pkcs8',format:'pem'})
 assert.equal(run('.github/scripts/sign-index.mjs',['--dir',f.out,'--public-key',f.publicPath],{TELOA_MARKET_SIGNING_KEY:rsa}).status,1,'only Ed25519')
 for(const file of ['index.json.sig','v2/index.json.sig'])await assert.rejects(readFile(join(f.out,file)),'nothing is written after a refusal')
})

test('the committed public key is the app key and the repository workflow signs only on main',async()=>{
 const pem=await readFile(join(repo,'.github/market-index-public-key.pem'),'utf8')
 assert.equal(pem,'-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAFSp1Bn9wO8fC2tD17aQouchH4lHOJnTUKkk7xi2xMKM=\n-----END PUBLIC KEY-----\n','MARKET_INDEX_PUBLIC_KEY from teloa-ai/teloa packages/harness-dsh/src/market-remote.ts')
 const workflow=await readFile(join(repo,'.github/workflows/sign-index.yml'),'utf8')
 assert.doesNotMatch(workflow,/pull_request/,'never runs on pull requests')
 assert.match(workflow,/if: github\.ref == 'refs\/heads\/main'/)
 assert.equal(workflow.match(/secrets\.TELOA_MARKET_SIGNING_KEY/g)?.length,1,'the secret reaches one step only')
})
