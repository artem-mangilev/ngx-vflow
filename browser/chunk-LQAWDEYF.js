import{a as Q}from"./chunk-S3I3S5BX.js";import{f as L,k as Y,n as q}from"./chunk-OTAEONLZ.js";import{a as G}from"./chunk-ALJMEAIF.js";import"./chunk-YV53NWFE.js";import{j as W}from"./chunk-IQL2UJ6C.js";import"./chunk-IO7LDB7E.js";import{a as $}from"./chunk-VYAX5YUU.js";import"./chunk-WI2JOD2Y.js";import{a as k}from"./chunk-34LC2K2P.js";import{T as as}from"./chunk-MU5S45C6.js";import{$b as t,Ac as h,Db as m,Eb as V,Ga as C,Gb as z,Ha as v,Jc as A,Ob as j,Ra as _,Sa as P,Sb as d,Xb as w,ac as l,bc as i,bd as T,dd as U,fc as D,hc as N,ic as p,jc as H,kc as F,pb as r,qc as I,ra as f,rc as M,tc as o,va as y,wa as g,ya as O,zc as R}from"./chunk-WSOERDLG.js";import{a as S,b as E,g as ns}from"./chunk-P2VZOJAX.js";var ss=ns(as());var x=class{constructor(c){this.node=c,this.position=m("top"),this.template=m(null),this.offset=m(10),this.point=T(()=>{switch(this.position()){case"top":return{x:this.node.size().width/2-this.size().width/2,y:-this.size().height-this.offset()};case"bottom":return{x:this.node.size().width/2-this.size().width/2,y:this.node.size().height+this.offset()};case"left":return{x:-this.size().width-this.offset(),y:this.node.size().height/2-this.size().height/2};case"right":return{x:this.node.size().width+this.offset(),y:this.node.size().height/2-this.size().height/2}}}),this.transform=T(()=>`translate(${this.point().x}, ${this.point().y})`),this.size=m({width:0,height:0})}};var es=["toolbar"],ts=["*"];function ls(s,c){if(s&1&&(t(0,"div",1),F(1),l()),s&2){let n=p();d("model",n.model)}}var J=(()=>{class s{constructor(){this.overlaysService=f(Y),this.nodeService=f(W),this.position=_("top"),this.toolbarContentTemplate=V.required("toolbar"),this.model=new x(this.nodeService.model()),U(()=>this.model.position.set(this.position()),{allowSignalWrites:!0})}ngOnInit(){this.model.template.set(this.toolbarContentTemplate()),this.overlaysService.addToolbar(this.model)}ngOnDestroy(){this.overlaysService.removeToolbar(this.model)}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=g({type:s,selectors:[["node-toolbar"]],viewQuery:function(a,e){a&1&&I(e.toolbarContentTemplate,es,5),a&2&&M()},inputs:{position:[y.SignalBased,"position"]},standalone:!0,features:[h],ngContentSelectors:ts,decls:2,vars:0,consts:[["toolbar",""],["nodeToolbarWrapper","",1,"wrapper",3,"model"]],template:function(a,e){a&1&&(H(),j(0,ls,2,1,"ng-template",null,0,A))},dependencies:()=>[ps],styles:[".wrapper[_ngcontent-%COMP%]{width:max-content}"],changeDetection:0})}}return s})(),ps=(()=>{class s{constructor(){this.element=f(P),this.model=_.required()}ngOnInit(){this.model().size.set({width:this.element.nativeElement.clientWidth,height:this.element.nativeElement.clientHeight})}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275dir=O({type:s,selectors:[["","nodeToolbarWrapper",""]],inputs:{model:[y.SignalBased,"model"]},standalone:!0})}}return s})();function ds(s,c){if(s&1){let n=D();t(0,"div",2)(1,"div",3),o(2," Output 1 "),i(3,"handle",4),l(),t(4,"div",3),o(5," Output 2 "),i(6,"handle",4),l()(),t(7,"node-toolbar",5)(8,"button",6),N("click",function(){C(n);let e=p().$implicit,b=p();return v(b.deleteNode(e.node))}),o(9,"Delete"),l()()}if(s&2){let n=p().$implicit;r(3),d("id",n.node.data.output1),r(3),d("id",n.node.data.output2)}}function is(s,c){if(s&1){let n=D();t(0,"div",2)(1,"div",3),o(2," Input 1 "),i(3,"handle",7),l(),t(4,"div",3),o(5," Input 2 "),i(6,"handle",7),l()(),t(7,"node-toolbar",8)(8,"button",6),N("click",function(){C(n);let e=p().$implicit,b=p();return v(b.deleteNode(e.node))}),o(9,"Delete"),l()()}if(s&2){let n=p().$implicit;r(3),d("id",n.node.data.input1),r(3),d("id",n.node.data.input2)}}function os(s,c){if(s&1&&j(0,ds,10,2)(1,is,10,2),s&2){let n=c.$implicit;w(0,n.node.data.type==="output"?0:-1),r(),w(1,n.node.data.type==="input"?1:-1)}}var K=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:60,y:150},type:"html-template",data:{type:"output",output1:"output1",output2:"output2"}},{id:"2",point:{x:300,y:100},type:"html-template",data:{type:"input",input1:"input1",input2:"input2"}}],this.edges=[{id:"1 -> 2 one",source:"1",target:"2",sourceHandle:"output1",targetHandle:"input1"},{id:"1 -> 2 two",source:"1",target:"2",sourceHandle:"output2",targetHandle:"input2"}]}deleteNode(n){this.nodes=this.nodes.filter(a=>a.id!==n.id)}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=g({type:s,selectors:[["ng-component"]],standalone:!0,features:[h],decls:2,vars:2,consts:[["view","auto",3,"nodes","edges"],["nodeHtml",""],[1,"custom-node"],[1,"data-block"],["position","right","type","source",3,"id"],["position","left"],[3,"click"],["position","left","type","target",3,"id"],["position","right"]],template:function(a,e){a&1&&(t(0,"vflow",0),j(1,os,2,2,"ng-template",1),l()),a&2&&d("nodes",e.nodes)("edges",e.edges)},dependencies:[q,G,J,L],styles:["[_nghost-%COMP%]{width:100%;height:100%}.custom-node[_ngcontent-%COMP%]{width:150px;height:100px;background-color:#0f4c75;border:1px solid gray;border-radius:5px;align-items:center;padding-left:7px;padding-right:7px}.data-block[_ngcontent-%COMP%]{background-color:#fff;color:#1b262c;margin-top:15px;border-radius:5px;text-align:center}"],changeDetection:0})}}return s})();var cs={title:"Node toolbar",mdFile:"./index.md",category:Q,demos:{NodeToolbarDemoComponent:K}},u=cs;var X=[];var gs={NodeToolbarDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'projects/ngx-vflow-lib/src/public-api'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">templateUrl</span>: <span class="hljs-string ngde">'./node-toolbar-demo.component.html'</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styleUrls</span>: [<span class="hljs-string ngde">'./node-toolbar-demo.styles.scss'</span>],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>]
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">NodeToolbarDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">60</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">150</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'output'</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">output1</span>: <span class="hljs-string ngde">'output1'</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">output2</span>: <span class="hljs-string ngde">'output2'</span>
</span><span class="line ngde">      }
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">300</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'input'</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">input1</span>: <span class="hljs-string ngde">'input1'</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">input2</span>: <span class="hljs-string ngde">'input2'</span>
</span><span class="line ngde">      }
</span><span class="line ngde">    },
</span><span class="line ngde">  ]
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 2 one'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">sourceHandle</span>: <span class="hljs-string ngde">'output1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">targetHandle</span>: <span class="hljs-string ngde">'input1'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 2 two'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">sourceHandle</span>: <span class="hljs-string ngde">'output2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">targetHandle</span>: <span class="hljs-string ngde">'input2'</span>
</span><span class="line ngde">    },
</span><span class="line ngde">  ]
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">deleteNode</span>(<span class="hljs-params ngde">node: <a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">nodes</span> = <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">nodes</span>.<span class="hljs-title function_ ngde">filter</span>(<span class="hljs-function ngde"><span class="hljs-params ngde">n</span> =></span> n.<span class="hljs-property ngde">id</span> !== node.<span class="hljs-property ngde">id</span>)
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre>`},{title:"HTML",code:`<pre class="ngde hljs"><code lang="html" class="hljs language-html code-lines ngde"><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">vflow</span> <span class="hljs-attr ngde">view</span>=<span class="hljs-string ngde">"auto"</span> [<span class="hljs-attr ngde">nodes</span>]=<span class="hljs-string ngde">"nodes"</span> [<span class="hljs-attr ngde">edges</span>]=<span class="hljs-string ngde">"edges"</span>></span>
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-template</span> <span class="hljs-attr ngde">nodeHtml</span> <span class="hljs-attr ngde">let-ctx</span>></span>
</span><span class="line ngde">    @if (ctx.node.data.type === 'output') {
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"custom-node"</span>></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"data-block"</span>></span>
</span><span class="line ngde">          Output 1
</span><span class="line ngde">          <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"right"</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"source"</span> [<span class="hljs-attr ngde">id</span>]=<span class="hljs-string ngde">"ctx.node.data.output1"</span>/></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"data-block"</span>></span>
</span><span class="line ngde">          Output 2
</span><span class="line ngde">          <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"right"</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"source"</span> [<span class="hljs-attr ngde">id</span>]=<span class="hljs-string ngde">"ctx.node.data.output2"</span>/></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">node-toolbar</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"left"</span>></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">button</span> (<span class="hljs-attr ngde">click</span>)=<span class="hljs-string ngde">"deleteNode(ctx.node)"</span>></span>Delete<span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">button</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">node-toolbar</span>></span>
</span><span class="line ngde">    }
</span><span class="line ngde">
</span><span class="line ngde">    @if (ctx.node.data.type === 'input') {
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"custom-node"</span>></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"data-block"</span>></span>
</span><span class="line ngde">          Input 1
</span><span class="line ngde">          <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"left"</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"target"</span> [<span class="hljs-attr ngde">id</span>]=<span class="hljs-string ngde">"ctx.node.data.input1"</span>/></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"data-block"</span>></span>
</span><span class="line ngde">          Input 2
</span><span class="line ngde">          <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"left"</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"target"</span> [<span class="hljs-attr ngde">id</span>]=<span class="hljs-string ngde">"ctx.node.data.input2"</span>/></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">node-toolbar</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"right"</span>></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">button</span> (<span class="hljs-attr ngde">click</span>)=<span class="hljs-string ngde">"deleteNode(ctx.node)"</span>></span>Delete<span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">button</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">node-toolbar</span>></span>
</span><span class="line ngde">    }
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">ng-template</span>></span>
</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">vflow</span>></span>
</span></code></pre>`},{title:"SCSS",code:`<pre class="ngde hljs"><code lang="scss" class="hljs language-scss code-lines ngde"><span class="line ngde"><span class="hljs-selector-pseudo ngde">:host</span> {
</span><span class="line ngde">  <span class="hljs-attribute ngde">width</span>: <span class="hljs-number ngde">100%</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">height</span>: <span class="hljs-number ngde">100%</span>;
</span><span class="line ngde">}
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-selector-class ngde">.custom-node</span> {
</span><span class="line ngde">  <span class="hljs-attribute ngde">width</span>: <span class="hljs-number ngde">150px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">height</span>: <span class="hljs-number ngde">100px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">background-color</span>: <span class="hljs-number ngde">#0f4c75</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">border</span>: <span class="hljs-number ngde">1px</span> solid gray;
</span><span class="line ngde">  <span class="hljs-attribute ngde">border-radius</span>: <span class="hljs-number ngde">5px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">align-items</span>: center;
</span><span class="line ngde">  <span class="hljs-attribute ngde">padding-left</span>: <span class="hljs-number ngde">7px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">padding-right</span>: <span class="hljs-number ngde">7px</span>;
</span><span class="line ngde">}
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-selector-class ngde">.data-block</span> {
</span><span class="line ngde">  <span class="hljs-attribute ngde">background-color</span>: <span class="hljs-number ngde">#ffffff</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">color</span>: <span class="hljs-number ngde">#1b262c</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">margin-top</span>: <span class="hljs-number ngde">15px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">border-radius</span>: <span class="hljs-number ngde">5px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">text-align</span>: center;
</span><span class="line ngde">}
</span></code></pre>`}]},Z=gs;var rs='<h1 id="node-toolbar" class="ngde">Node toolbar<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/node-toolbar#node-toolbar"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">You can add a <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/NodeToolbarComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">NodeToolbarComponent</a></code> to your node. The content of this component is automatically positioned near one side of the node, based on the value of the <code class="ngde">position</code> input.</p><ng-doc-demo-pane componentname="NodeToolbarDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>',hs=(()=>{class s extends k{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=rs,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/pages/node-toolbar/index.md?message=docs(node-toolbar): describe your changes here...",this.page=u,this.demoAssets=Z}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=g({type:s,selectors:[["ng-doc-page-features-node-toolbar"]],standalone:!0,features:[R([{provide:k,useExisting:s},X,u.providers??[]]),z,h],decls:1,vars:0,template:function(a,e){a&1&&i(0,"ng-doc-page")},dependencies:[$],encapsulation:2,changeDetection:0})}}return s})(),ms=[E(S({},(0,ss.isRoute)(u.route)?u.route:{}),{path:"",component:hs,title:"Node toolbar"})],Is=ms;export{hs as DynamicComponent,Is as default};
