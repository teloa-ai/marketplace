// 三份行业业务看板的真实 PostgreSQL 验证：按核心现有服务导入市场包、准备、预览、采用，写入合成业务记录后读取已保存看板页，
// 核对计数、金额（按币种）、缺值（null 而非 0）与清单下钻到对应记录。每次运行在隔离的临时容器里完成，不连接任何已有实例。
// 用法：TELOA_COMMUNITY=<teloa-community 源码根> node --test tools/tests/industry-dashboards.pg.test.mjs
// 需要本机容器运行时（OrbStack / Docker）；依赖取自社区源码自身的 node_modules，不安装任何全局依赖。
import test,{before,after} from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {existsSync} from 'node:fs'
import {readFile} from 'node:fs/promises'
import {createRequire} from 'node:module'
import {dirname,join,resolve} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'

const marketRoot=resolve(dirname(fileURLToPath(import.meta.url)),'../..')
function communityRoot(){
 if(process.env.TELOA_COMMUNITY)return resolve(process.env.TELOA_COMMUNITY)
 for(let dir=marketRoot;dir!==dirname(dir);dir=dirname(dir)){const candidate=join(dir,'products/teloa-community');if(existsSync(join(candidate,'packages/backend/package.json')))return candidate}
 throw Error('找不到 teloa-community 源码：请设置 TELOA_COMMUNITY。')
}
const community=communityRoot(),backend=join(community,'packages/backend')
const backendRequire=createRequire(join(backend,'package.json'))
const load=path=>import(pathToFileURL(join(backend,path)).href)
const {Pool}=(await import(pathToFileURL(backendRequire.resolve('pg')).href)).default
const {PostgreSqlContainer}=await import(pathToFileURL(backendRequire.resolve('@testcontainers/postgresql')).href)
const api=await load('src/index.ts')
const {readBusinessDashboardResource}=await import(pathToFileURL(join(community,'packages/contract/src/business-dashboard-resource.ts')).href)
const {MarketContentStore}=await load('src/market/content-store.ts')
const {BusinessConfigurationDraftService}=await load('src/work/business-configuration-drafts.ts')
const {BusinessConfigurationStore}=await load('src/work/business-configuration-store.ts')
const {BusinessConfigurationPreviewService}=await load('src/work/business-configuration-preview.ts')
const {BusinessConfigurationService}=await load('src/work/business-configuration.ts')
const {BusinessConfigurationPageService}=await load('src/work/business-configuration-page.ts')
const {BusinessDefinitionSourceReader}=await load('src/work/business-definition-source.ts')
const {BusinessDashboardResourceService}=await load('src/work/business-dashboard-resource.ts')
const {useLocalContainerRuntime}=await load('tests/testcontainers-env.ts')

const ids=['teloa.saas-delivery-dashboard','teloa.content-ops-dashboard','teloa.b2b-sales-followup-dashboard']
const artifact=async(id,file)=>JSON.parse(await readFile(join(marketRoot,'artifacts/dashboards',id,'1.0.0',file),'utf8'))
const identity={id:randomUUID,now:()=>new Date().toISOString()}
const unavailable=async()=>{throw Error('不得请求远端来源或模型')}
const DAY=86_400_000,at=days=>new Date(Date.now()+days*DAY).toISOString()
let pool,container

before(async()=>{
 useLocalContainerRuntime()
 container=await new PostgreSqlContainer('postgres:17-alpine').start()
 pool=new Pool({connectionString:container.getConnectionUri()})
 await api.initializeTeloaDatabase(pool)
},{timeout:180000})
after(async()=>{await pool?.end();await container?.stop()})

function services(){
 const market=new MarketContentStore(pool,identity),drafts=new BusinessConfigurationDraftService(pool,identity),store=new BusinessConfigurationStore(pool)
 const definitions=new BusinessDefinitionSourceReader({get:unavailable,getInTransaction:unavailable},{get:unavailable,getInTransaction:unavailable,listInTransaction:async()=>({items:[],hasMore:false})},{activeSourceIds:unavailable},undefined,store)
 const configuration=new BusinessConfigurationService(pool,identity,{drafts,store,definitions,runtime:new api.BusinessRuntimeService(pool,identity),spaces:new api.BusinessSpaceService(pool,identity)})
 const preview=new BusinessConfigurationPreviewService(pool,drafts,definitions,identity)
 const pages=new BusinessConfigurationPageService(pool,identity,{drafts,store,definitions,executor:{schema:'public',execute:unavailable}})
 const records=new api.BusinessRecordService(pool,identity,{definitions,warehouse:new api.BusinessWarehouseService(pool,identity),references:new api.BusinessSnapshotReferenceService(pool,identity)})
 const ports={market,drafts,configuration,preview,pages}
 return {...ports,records,resource:new BusinessDashboardResourceService(pool,ports)}
}

/** 按市场包原样导入（teloa.json + configuration.json），新建业务采用；返回可写记录与读看板的工具。 */
async function adopt(manifest,body){
 const s=services(),actor={ownerId:'industry:'+randomUUID(),scopeIds:[]}
 const files=[['teloa.json',manifest],['configuration.json',body]].map(([path,value])=>({path,bytes:new TextEncoder().encode(JSON.stringify(value))}))
 const {content}=await s.market.import({ownerId:actor.ownerId,kind:'human'},{kind:'industry-template',requestId:randomUUID(),source:{kind:'upload',name:manifest.title},manifestPath:'teloa.json',files,references:[]})
 const draft=await s.resource.prepare(actor,{requestId:randomUUID(),contentId:content.id,contentHash:content.hash,resourceId:body.id,target:{kind:'new',title:body.configuration.title}})
 const previewPage=await s.resource.page(actor,{draftId:draft.id,expectedRevision:draft.revision,pageId:draft.candidate.homePageId})
 const preview=await s.resource.preview(actor,{draftId:draft.id,expectedRevision:draft.revision})
 await s.resource.apply(actor,{requestId:randomUUID(),draftId:draft.id,expectedRevision:draft.revision,expectedBaseVersion:draft.baseVersion,previewReceipt:preview.receipt})
 actor.scopeIds=(await new api.BusinessScopeService(pool).list(actor.ownerId)).map(row=>row.scope).filter(scope=>scope!=='general')
 const scope=draft.scope
 const create=async(type,title,fields)=>s.records.create(actor,{scope,type,requestId:randomUUID(),title,summary:'',fields:Object.entries(fields).map(([name,value])=>({name,value}))})
 const archive=async record=>s.records.archive(actor,{scope,type:record.type,id:record.id,expectedVersion:record.version,requestId:randomUUID()})
 const read=async()=>{
  const projection=await s.pages.read(actor,{scope,pageId:draft.candidate.homePageId})
  assert.equal(projection.mode,'saved');assert.equal(projection.page.kind,'dashboard')
  return byView(projection.page.results)
 }
 return {s,actor,scope,draft,previewPage,create,archive,read}
}
/** 采用时核心把资源内标识改写为 `board-<来源摘要>-<原标识>-<摘要>`；按原视图标识取结果。 */
const byView=results=>new Map(results.map(result=>[result.view.viewId.replace(/^board-[0-9a-f]+-/,'').replace(/-[0-9a-f]{12}$/,''),result.view]))
const count=view=>view.rows[0].values[0]
const listed=view=>view.objects.map(object=>object.id)
const field=(view,id,label)=>view.objects.find(object=>object.id===id).fields.find(item=>item.label===label)?.value
const row=(view,dimension)=>view.rows.find(item=>item.dimension===dimension)?.values

test('三份资源被核心契约直接读取，清单身份一致且只含视图组件、无数据源绑定或默认动作',async()=>{
 for(const id of ids){
  const manifest=await artifact(id,'teloa.json'),body=readBusinessDashboardResource(await artifact(id,'configuration.json'))
  assert.equal(body.id,manifest.resources[0].id);assert.equal(body.configuration.scope,manifest.scope)
  const kinds=body.configuration.definitions.map(item=>item.kind)
  assert.ok(!kinds.includes('source-mapping'))
  assert.ok(body.configuration.definitions.filter(item=>item.kind==='widget').every(item=>item.definition.kind==='view-ref'))
  assert.deepEqual(body.configuration.sources,[{sourceId:'records',kind:'local-records'}])
 }
})

test('软件与 SaaS 交付：空态真实为 0/空清单；写入记录后阻塞、验收、逾期与发布准备按记录计算并可下钻',async()=>{
 const id=ids[0],f=await adopt(await artifact(id,'teloa.json'),await artifact(id,'configuration.json'))
 const empty=byView(f.previewPage.page.results)
 assert.equal(count(empty.get('blocker-open')),0);assert.deepEqual(empty.get('req-overdue').rows,[]);assert.deepEqual(empty.get('req-stage').rows,[])
 const r1=await f.create('requirement','导出报表',{stage:'开发中',owner:'王敏',acceptance:'未写',priority:'P1','next-step':'补验收条件',due:at(-2)})
 const r2=await f.create('requirement','单点登录',{stage:'待验收',owner:'李雷',acceptance:'已确认',priority:'P0',due:at(3)})
 await f.create('requirement','深色模式',{stage:'已交付',owner:'李雷',acceptance:'已确认',priority:'P2'})
 const r4=await f.create('requirement','审计日志',{stage:'待澄清',owner:'王敏',acceptance:'待确认',priority:'P2'})
 const b1=await f.create('blocker','测试环境证书过期',{status:'未解除',impact:'阻断发布',owner:'赵强','next-step':'续签证书','raised-at':at(-3)})
 await f.create('blocker','依赖库升级',{status:'已解除',impact:'阻断需求',owner:'赵强','raised-at':at(-9)})
 const rel1=await f.create('release','2.4.0',{readiness:'准备中',owner:'李雷','planned-at':at(5),checklist:'部分完成',rollback:'未准备',notes:'草稿'})
 await f.create('release','2.3.0',{readiness:'已发布',owner:'李雷','planned-at':at(-20),checklist:'全部完成',rollback:'已准备',notes:'已审'})
 const extra=await f.create('blocker','已归档的阻塞',{status:'未解除',impact:'有替代方案',owner:'赵强','raised-at':at(-1)})
 await f.archive(extra)
 const v=await f.read()
 assert.equal(count(v.get('blocker-open')),1,'归档记录不计入')
 assert.equal(count(v.get('req-unconfirmed')),2)
 assert.equal(count(v.get('req-awaiting')),1)
 assert.deepEqual(listed(v.get('blocker-open-list')),[b1.id]);assert.equal(field(v.get('blocker-open-list'),b1.id,'下一步'),'续签证书')
 assert.deepEqual(listed(v.get('req-overdue')),[r1.id]);assert.equal(field(v.get('req-overdue'),r1.id,'负责人'),'王敏')
 assert.deepEqual(listed(v.get('req-awaiting-list')),[r2.id])
 assert.deepEqual(listed(v.get('release-pending')),[rel1.id])
 assert.deepEqual(row(v.get('release-checklist'),'部分完成'),[1]);assert.equal(v.get('release-checklist').rows.length,1)
 assert.deepEqual(Object.fromEntries(v.get('req-stage').rows.map(item=>[item.dimension,item.values[0]])),{'开发中':1,'待验收':1,'已交付':1,'待澄清':1})
 assert.ok(!listed(v.get('req-overdue')).includes(r4.id),'无计划完成日期的需求不算逾期')
})

test('内容运营：曝光与转化只合计有统计来源的记录，未录入为 null 而非 0；审批、超期、排期按记录计算',async()=>{
 const id=ids[1],f=await adopt(await artifact(id,'teloa.json'),await artifact(id,'configuration.json'))
 const c1=await f.create('content','新品发布长文',{stage:'待审批',owner:'陈晨',channel:'公众号',approver:'周总',due:at(-1)})
 await f.create('content','用户故事视频脚本',{stage:'制作中',owner:'陈晨',channel:'视频号',due:at(4)})
 const c3=await f.create('content','九月产品更新',{stage:'已发布',owner:'林楠',channel:'公众号','publish-at':at(-2),'metrics-source':'平台导出',impressions:'1200',conversions:'30','metrics-at':at(-1)})
 const c4=await f.create('content','行业报告解读',{stage:'已发布',owner:'林楠',channel:'公众号','publish-at':at(-5)})
 const c5=await f.create('content','上手清单',{stage:'已发布',owner:'林楠',channel:'小红书','publish-at':at(-1),'metrics-source':'未录入'})
 const c6=await f.create('content','客户案例',{stage:'已排期',owner:'陈晨',channel:'官网博客','publish-at':at(3)})
 const v=await f.read()
 assert.equal(count(v.get('approval')),1);assert.equal(count(v.get('overdue')),1)
 assert.deepEqual(listed(v.get('approval-list')),[c1.id]);assert.deepEqual(listed(v.get('overdue-list')),[c1.id])
 assert.deepEqual(listed(v.get('scheduled')),[c6.id])
 const results=v.get('channel-results')
 assert.deepEqual(row(results,'公众号'),[2,1,1200,30])
 assert.deepEqual(row(results,'小红书'),[1,0,null,null],'没有统计来源的曝光与转化是缺失，不是 0')
 assert.ok(results.missingFields.includes('impressions')&&results.missingFields.includes('conversions'))
 assert.deepEqual(listed(v.get('recent-published')),[c5.id,c3.id,c4.id])
 assert.equal(field(v.get('recent-published'),c3.id,'曝光'),'1200')
})

test('B2B 销售：金额按币种分列不换算、缺额为 null；承诺到期、跟进逾期、预计成交与风险客户按记录计算并可下钻',async()=>{
 const id=ids[2],f=await adopt(await artifact(id,'teloa.json'),await artifact(id,'configuration.json'))
 const a1=await f.create('account','华东制造',{relationship:'已签约',owner:'孙悦',health:'风险','renewal-at':at(10),'next-step':'安排续约评审'})
 const a2=await f.create('account','北辰物流',{relationship:'商机中',owner:'孙悦',health:'关注'})
 await f.create('account','南方零售',{relationship:'潜在',owner:'吴昊'})
 const money=(currency,decimal)=>JSON.stringify({currency,decimal})
 const o1=await f.create('opportunity','华东制造 扩容',{account:a1.id,stage:'方案报价',owner:'孙悦',amount:money('CNY','100000'),'close-at':at(10),'next-at':at(-1),'next-step':'发送报价'})
 await f.create('opportunity','北辰物流 年度合同',{account:a2.id,stage:'商务谈判',owner:'孙悦',amount:money('USD','20000'),'close-at':at(60),'next-at':at(2)})
 await f.create('opportunity','华东制造 培训',{account:a1.id,stage:'线索确认',owner:'吴昊'})
 await f.create('opportunity','北辰物流 试点',{account:a2.id,stage:'赢单',owner:'孙悦',amount:money('CNY','50000.5')})
 await f.create('opportunity','华东制造 二期',{account:a1.id,stage:'需求确认',owner:'吴昊',amount:money('CNY','30000')})
 const k1=await f.create('commitment','提供安全白皮书',{account:a1.id,party:'我方',owner:'孙悦',due:at(-2),status:'未完成',source:'9 月 30 日通话'})
 const k2=await f.create('commitment','客户提供数据样本',{account:a2.id,party:'客户方',owner:'孙悦',due:at(3),status:'未完成'})
 await f.create('commitment','发送会议纪要',{account:a1.id,party:'我方',owner:'孙悦',due:at(-5),status:'已完成'})
 const v=await f.read()
 assert.equal(count(v.get('opp-open')),4);assert.equal(count(v.get('commit-overdue')),1);assert.equal(count(v.get('account-risk')),1)
 const stages=v.get('opp-stage'),cny=decimal=>({type:'money',currency:'CNY',decimal}),usd=decimal=>({type:'money',currency:'USD',decimal})
 assert.deepEqual(row(stages,'方案报价'),[1,cny('100000'),null,null])
 assert.deepEqual(row(stages,'商务谈判'),[1,null,usd('20000'),null])
 assert.deepEqual(row(stages,'线索确认'),[1,null,null,null],'未填金额是缺失，不是 0')
 assert.deepEqual(row(stages,'赢单'),[1,cny('50000.5'),null,null])
 assert.deepEqual(row(stages,'需求确认'),[1,cny('30000'),null,null])
 assert.deepEqual(listed(v.get('commit-overdue-list')),[k1.id]);assert.equal(field(v.get('commit-overdue-list'),k1.id,'出处'),'9 月 30 日通话')
 assert.deepEqual(listed(v.get('commit-week')),[k2.id])
 assert.deepEqual(listed(v.get('opp-followup-overdue')),[o1.id]);assert.equal(field(v.get('opp-followup-overdue'),o1.id,'下一步'),'发送报价')
 assert.deepEqual(listed(v.get('opp-closing')),[o1.id])
 assert.deepEqual(listed(v.get('account-watch')),[a1.id,a2.id])
 assert.deepEqual(listed(v.get('renewal')),[a1.id])
})

test('核心现状：v2 业务配置看板不渲染 SQL 组件，资源因此只用视图组件',async()=>{
 const id=ids[0],manifest=await artifact(id,'teloa.json'),body=await artifact(id,'configuration.json')
 const scope=body.configuration.scope
 body.configuration.definitions.push({kind:'widget',definition:{format:'teloa.business-widget/v1',id:'sql-open-blockers',version:'1.0.0',domain:scope,title:'SQL 未解除阻塞',kind:'metric',query:"select count(*) as n from blocker where status = '未解除'",metric:{valueColumn:'n'}}})
 const dashboard=body.configuration.definitions.find(item=>item.kind==='dashboard').definition
 dashboard.widgets.push('sql-open-blockers');dashboard.layout.push({widget:'sql-open-blockers',x:0,y:27,w:4,h:3})
 readBusinessDashboardResource(body)
 await assert.rejects(adopt(manifest,body),error=>{assert.equal(error.code,'teloa/dependency-unavailable');assert.match(error.message,/看板仅支持已接入的视图组件/);return true})
})
