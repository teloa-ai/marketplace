#!/usr/bin/env node
// Signs the two unsigned catalog indexes written by `node tools/validate.mjs --index-out <dir>` and checks them
// against the Teloa app's built-in production public key (.github/market-index-public-key.pem, copied verbatim
// from MARKET_INDEX_PUBLIC_KEY in teloa-ai/teloa packages/harness-dsh/src/market-remote.ts).
//
// The private key comes only from the TELOA_MARKET_SIGNING_KEY environment variable and is never printed. The
// script refuses to sign unless the key's public half is exactly that built-in public key, so an index the app
// would reject can never be produced. Signatures use the format of the Teloa market tooling and app: base64 of the
// raw Ed25519 signature over the exact index bytes, followed by a newline. Existing files are never overwritten.
//
// Usage: node .github/scripts/sign-index.mjs --dir <index dir> [--public-key <pem>] [--source <commit>]
// Writes <dir>/index.json.sig, <dir>/v2/index.json.sig, <dir>/SHA256SUMS and <dir>/provenance.json.
import {createHash,createPrivateKey,createPublicKey,sign,verify} from 'node:crypto'
import {readFile,writeFile} from 'node:fs/promises'
import {join,resolve} from 'node:path'

const fail=message=>{console.error(`Index signing failed / 索引签名失败: ${message}`);process.exit(1)}
const args=process.argv.slice(2)
const known=new Set(['--dir','--public-key','--source'])
for(let at=0;at<args.length;at+=2)if(!known.has(args[at])||at+1>=args.length){console.error('Usage: node .github/scripts/sign-index.mjs --dir <index dir> [--public-key <pem>] [--source <commit>]');process.exit(2)}
const option=name=>{const at=args.indexOf(name);return at<0?undefined:args[at+1]}
const dir=resolve(option('--dir')??fail('--dir is required'))
const publicKeyPath=resolve(option('--public-key')??'.github/market-index-public-key.pem')
const source=option('--source')??process.env.GITHUB_SHA??null
if(source!==null&&!/^[0-9a-f]{40}$/.test(source))fail('--source must be a full commit SHA')
const FILES=['index.json','v2/index.json']
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex')
const spki=key=>key.export({type:'spki',format:'der'})

const pem=process.env.TELOA_MARKET_SIGNING_KEY
if(!pem?.trim())fail('TELOA_MARKET_SIGNING_KEY is not set')
let privateKey
// The error from createPrivateKey never contains key material, but print a fixed message anyway.
try{privateKey=createPrivateKey(pem)}catch{fail('TELOA_MARKET_SIGNING_KEY is not a valid private key')}
if(privateKey.asymmetricKeyType!=='ed25519')fail('the signing key must be Ed25519')
let publicKey
try{publicKey=createPublicKey(await readFile(publicKeyPath,'utf8'))}catch{fail(`cannot read the built-in public key ${publicKeyPath}`)}
if(publicKey.asymmetricKeyType!=='ed25519')fail('the built-in public key must be Ed25519')
if(!spki(createPublicKey(privateKey)).equals(spki(publicKey)))fail('the signing key does not match the app\'s built-in public key; the app could not verify this index')

const indexes=[]
for(const file of FILES){
 let bytes
 try{bytes=await readFile(join(dir,file))}catch{fail(`${file} is missing; run node tools/validate.mjs --index-out ${dir} first`)}
 let parsed
 try{parsed=JSON.parse(bytes.toString('utf8'))}catch{fail(`${file} is not JSON`)}
 if(typeof parsed?.catalogVersion!=='string'||!Array.isArray(parsed.entries))fail(`${file} is not a catalog index`)
 indexes.push({file,bytes,catalogVersion:parsed.catalogVersion,entries:parsed.entries.length})
}
if(indexes[0].catalogVersion!==indexes[1].catalogVersion)fail('index.json and v2/index.json have different catalog versions')

const sums={}
for(const index of indexes){
 const signature=sign(null,index.bytes,privateKey)
 // Verify exactly as the app does: the public key, the full index bytes and the decoded 64-byte signature.
 const text=signature.toString('base64')+'\n'
 const decoded=Buffer.from(text.trim(),'base64')
 if(decoded.length!==64||!verify(null,index.bytes,publicKey,decoded))fail(`${index.file}.sig does not verify with the built-in public key`)
 await writeFile(join(dir,index.file+'.sig'),text,{flag:'wx'})
 sums[index.file]=sha256(index.bytes)
 sums[index.file+'.sig']=sha256(Buffer.from(text))
}
const provenance={format:'teloa.market-index-release/v1',catalogVersion:indexes[0].catalogVersion,source,entries:{v1:indexes[0].entries,v2:indexes[1].entries},publicKeySha256:sha256(spki(publicKey)),files:sums}
await writeFile(join(dir,'provenance.json'),JSON.stringify(provenance,null,2)+'\n',{flag:'wx'})
await writeFile(join(dir,'SHA256SUMS'),Object.entries(sums).map(([file,hash])=>`${hash}  ${file}`).join('\n')+'\n',{flag:'wx'})
console.log(`Signed catalog ${provenance.catalogVersion} (v1 ${provenance.entries.v1} entries, v2 ${provenance.entries.v2} entries); both signatures verify with ${publicKeyPath} (public key sha256 ${provenance.publicKeySha256}). / 已签名并用该公钥验签。`)
