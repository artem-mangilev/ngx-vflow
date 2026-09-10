// Run from repository root: node .scratch/flow-design-system/competitor-runtime/probe.cjs
// Uses public demos. CSS mutations are probes, NOT supported demo features.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const out = __dirname;
const configs = [
  {name:'reactflow',url:'https://ui.reactflow.dev/components/database-schema-node',node:'.react-flow__node[data-id="1"]',body:'[data-slot="base-node-content"]',port:'.react-flow__handle.source[data-handleid="warehouse_id"]',edges:'.react-flow__edge-path'},
  {name:'foblex',url:'https://flow.foblex.com/embedded/schema-designer/',node:'table-node[data-f-node-id="orders"]',body:'.columns',port:'[data-f-output-id="order_customer_id"]',edges:'f-connection .f-connection-path'},
];
(async()=>{
 const browser=await chromium.launch();
 const results=[];
 try {
 for(const c of configs){
  const page=await browser.newPage({viewport:{width:1400,height:950}});
  await page.goto(c.url,{waitUntil:'domcontentloaded'});
  await page.locator(c.node+' '+c.port).waitFor();
  await page.waitForTimeout(1500);
  const snapshot=()=>page.evaluate(c=>{
    const node=document.querySelector(c.node),body=node.querySelector(c.body),port=node.querySelector(c.port);
    const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};
    return {node:rect(node),body:rect(body),port:rect(port),scrollTop:body.scrollTop,scrollHeight:body.scrollHeight,clientHeight:body.clientHeight,paths:[...document.querySelectorAll(c.edges)].map(e=>e.getAttribute('d'))};
  },c);
  const baseline=await snapshot();
  await page.screenshot({path:path.join(out,c.name+'-baseline.png')});
  await page.locator(c.node+' '+c.body).evaluate(el=>{el.style.maxHeight='60px';el.style.overflowY='auto'});
  await page.waitForTimeout(700);
  const constrained=await snapshot();
  await page.locator(c.node+' '+c.body).evaluate(el=>el.scrollTop=50);
  await page.waitForTimeout(700);
  const scrolled=await snapshot();
  await page.screenshot({path:path.join(out,c.name+'-scroll.png')});
  await page.locator(c.node+' '+c.body).evaluate(el=>{el.style.maxHeight='';el.style.overflowY='';el.scrollTop=0});
  await page.waitForTimeout(700);
  const restored=await snapshot();
  await page.locator(c.node+' '+c.body).evaluate(el=>el.style.display='none');
  await page.waitForTimeout(700);
  const collapsed=await snapshot();
  await page.screenshot({path:path.join(out,c.name+'-collapse.png')});
  const result={name:c.name,url:c.url,baseline,constrained,scrolled,restored,collapsed,verdict:{scrollMoved:scrolled.scrollTop>0,portMoved:Math.abs(scrolled.port.y-constrained.port.y)>1,scrollPathsUnchanged:JSON.stringify(scrolled.paths)===JSON.stringify(constrained.paths),collapsedPathsUnchanged:JSON.stringify(collapsed.paths)===JSON.stringify(restored.paths),collapsedEdgeCount:collapsed.paths.length}};
  results.push(result);console.log(c.name,JSON.stringify(result.verdict));await page.close();
 }
 const page=await browser.newPage({viewport:{width:1400,height:950}});
 await page.goto('https://example-apps.xyflow.com/react/pro/expand-collapse/index.html',{waitUntil:'domcontentloaded'});
 await page.getByText('collapse ▲',{exact:true}).first().waitFor();await page.waitForTimeout(700);
 const counts=async()=>({nodes:await page.locator('.react-flow__node').count(),edges:await page.locator('.react-flow__edge-path').count()});
 const before=await counts();await page.screenshot({path:path.join(out,'reactflow-tree-before.png')});
 await page.getByText('collapse ▲',{exact:true}).first().click();await page.waitForTimeout(700);
 const after=await counts();await page.screenshot({path:path.join(out,'reactflow-tree-collapsed.png')});
 await page.getByText('expand ▼',{exact:true}).first().click();await page.waitForTimeout(700);
 const expanded=await counts();results.push({name:'reactflow-native-tree-collapse',before,after,expanded});console.log('tree',JSON.stringify({before,after,expanded}));
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2)+'\n');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
