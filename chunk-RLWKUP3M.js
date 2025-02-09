import{a as W}from"./chunk-G45ERDUB.js";import{i as G,j as U,n as v,o as q,p as Y,s as $,v as b,x as B}from"./chunk-CRAWC3BK.js";import{a as L}from"./chunk-SH6HWCPG.js";import"./chunk-CQCG3KCY.js";import{a as N}from"./chunk-WT6KFS7F.js";import{Ba as m,Ea as w,Fa as C,Ga as d,Ha as A,Ia as O,Pa as i,Qa as c,R as o,Ra as t,Va as T,Xa as S,Y as P,Ya as V,Z as M,_ as f,aa as y,gb as H,hb as _,na as h,nb as I,ob as r,pb as z,vc as es,xb as R,ya as x}from"./chunk-VLX6VUPD.js";import{a as u,b as E,g as as}from"./chunk-P2VZOJAX.js";var ns=as(es());function ls(n,g){if(n&1&&(f(),t(0,"rect",8)),n&2){let s=g.$implicit;O("handle_idle",s.state()==="idle")("handle_valid",s.state()==="valid")("handle_invalid",s.state()==="invalid"),C("x",s.point().x-5)("y",s.point().y-5)}}var Z=(()=>{class n extends v{static{this.\u0275fac=(()=>{let s;return function(e){return(s||(s=y(n)))(e||n)}})()}static{this.\u0275cmp=o({type:n,selectors:[["ng-component"]],standalone:!0,features:[m,r],decls:12,vars:6,consts:[["squareHandleTemplate",""],[1,"node"],[1,"control-wrapper"],[1,"input",3,"value"],["type","target","position","left","id","one",3,"template"],["type","target","position","left","id","two",3,"template"],[1,"control-wrapper","control-wrapper_last"],["type","target","position","left","id","three",3,"template"],["width","10","height","10","stroke-width","1","stroke","black","rx","1","ry","1"]],template:function(a,e){if(a&1&&(i(0,"div",1)(1,"div",2),t(2,"input",3)(3,"handle",4),c(),i(4,"div",2),t(5,"input",3)(6,"handle",5),c(),i(7,"div",6),t(8,"input",3)(9,"handle",7),c()(),w(10,ls,1,8,"ng-template",null,0,R)),a&2){let l,p,k,D=H(11);h(2),d("value",(l=e.data())==null||l.id==null?null:l.id.one()),h(),d("template",D),h(2),d("value",(p=e.data())==null||p.id==null?null:p.id.two()),h(),d("template",D),h(2),d("value",(k=e.data())==null||k.id==null?null:k.id.three()),h(),d("template",D)}},dependencies:[b],styles:[".node[_ngcontent-%COMP%]{width:150px;background:#bbe1fa;border:1px solid gray;border-radius:5px;color:#000;padding:10px}.input[_ngcontent-%COMP%]{width:130px}.control-wrapper[_ngcontent-%COMP%]{margin-bottom:20px}.control-wrapper_last[_ngcontent-%COMP%]{margin-bottom:0}.handle_idle[_ngcontent-%COMP%]{fill:#fff}.handle_valid[_ngcontent-%COMP%]{fill:green}.handle_invalid[_ngcontent-%COMP%]{fill:red}"],changeDetection:0})}}return n})();var K=(()=>{class n extends v{static{this.\u0275fac=(()=>{let s;return function(e){return(s||(s=y(n)))(e||n)}})()}static{this.\u0275cmp=o({type:n,selectors:[["ng-component"]],standalone:!0,features:[m,r],decls:4,vars:0,consts:[[1,"node"],["type","target","position","top"],["type","source","position","bottom"]],template:function(a,e){a&1&&(i(0,"div",0),_(1," Custom node! "),t(2,"handle",1)(3,"handle",2),c())},dependencies:[b],styles:[".node[_ngcontent-%COMP%]{width:150px;height:100px;background:#bbe1fa;border:1px solid gray;border-radius:5px;display:flex;align-items:center;justify-content:center;color:#000}"],changeDetection:0})}}return n})();var ts=()=>({type:"dots"});function ps(n,g){if(n&1&&(f(),t(0,"path",3)),n&2){let s=g.$implicit;C("d",s.path())("stroke-width",4)("stroke",s.edge.data.color)("marker-end",s.markerEnd())}}function ds(n,g){if(n&1){let s=T();i(0,"div",4),S("click",function(){let e=P(s).$implicit,l=V();return M(l.deleteEdge(e.edge))}),_(1,"Delete"),c()}if(n&2){let s=g.$implicit;A("background-color",s.label.data.color)}}var Q=(()=>{class n{constructor(){this.nodes=[{id:"1",point:{x:10,y:200},type:"default",text:"Default"},{id:"2",point:{x:200,y:10},type:"default",text:"Resized",width:100,height:100},{id:"3",point:{x:200,y:270},type:K,draggable:!1},{id:"4",point:{x:600,y:150},type:Z,data:{id:{one:x(""),two:x(""),three:x("")}}}],this.edges=[{id:"1 -> 2",source:"1",target:"2",markers:{end:{type:"arrow-closed"}}},{id:"1 -> 3",source:"1",target:"3",curve:"straight",markers:{end:{type:"arrow"}}},{id:"3 -> 4-three",source:"3",target:"4",targetHandle:"three"}],this.connection={validator(s){return s.source!=="3"}}}handleConnect(s){if(s.target==="4"){let e=this.nodes.filter(q).find(p=>p.id==="4")?.data,l=this.nodes.filter(Y).find(p=>p.id===s.source);l&&(s.targetHandle==="one"&&e.id.one.set(l.text??""),s.targetHandle==="two"&&e.id.two.set(l.text??""),s.targetHandle==="three"&&e.id.three.set(l.text??""))}let a=is();this.edges=[...this.edges,u({id:crypto.randomUUID(),type:"template",data:{color:a},markers:{end:{type:"arrow-closed",width:30,height:30,color:a}},edgeLabels:{center:{type:"html-template",data:{color:a}}}},s)]}deleteEdge(s){this.edges=this.edges.filter(a=>a!==s)}static{this.\u0275fac=function(a){return new(a||n)}}static{this.\u0275cmp=o({type:n,selectors:[["ng-component"]],standalone:!0,features:[r],decls:3,vars:5,consts:[["view","auto",3,"onConnect","nodes","edges","connection","background"],["edge",""],["edgeLabelHtml",""],["fill","none"],[1,"label",3,"click"]],template:function(a,e){a&1&&(i(0,"vflow",0),S("onConnect",function(p){return e.handleConnect(p)}),w(1,ps,1,4,"ng-template",1)(2,ds,2,2,"ng-template",2),c()),a&2&&d("nodes",e.nodes)("edges",e.edges)("connection",e.connection)("background",z(4,ts))},dependencies:[B,$,U,G],styles:["[_nghost-%COMP%]{width:100%;height:100%}.label[_ngcontent-%COMP%]{width:60px;height:25px;background-color:#122c26;border-radius:5px;text-align:center}"],changeDetection:0})}}return n})();function is(){let n=[0,1,2,3,4,5,6,7,8,9,"A","B","C","D","E","F"],g="#";for(let s=0;s<6;s++){let a=Math.floor(Math.random()*n.length);g+=n[a]}return g}var cs={title:"What is ngx-vflow",mdFile:"./index.md",category:W,order:1,demos:{AllFeaturesDemoComponent:Q}},j=cs;var X=[];var gs={AllFeaturesDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span>, signal } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> {
</span><span class="line ngde">  <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>,
</span><span class="line ngde">  <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>,
</span><span class="line ngde">  <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>,
</span><span class="line ngde">  <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>,
</span><span class="line ngde">  <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></span>,
</span><span class="line ngde">  <a href="/api/ngx-vflow/functions/isComponentStaticNode" class="ng-doc-code-anchor ngde" data-link-type="Function" class="ngde">isComponentStaticNode</a>,
</span><span class="line ngde">  <a href="/api/ngx-vflow/functions/isDefaultStaticNode" class="ng-doc-code-anchor ngde" data-link-type="Function" class="ngde">isDefaultStaticNode</a>,
</span><span class="line ngde">} <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ComplexCustomNodeComponent</span>, <span class="hljs-title class_ ngde">ComplexCustomNodeData</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'./components/complex-custom-node.component'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">SimpleCustomNodeComponent</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'./components/simple-custom-node.component'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;vflow</span>
</span><span class="line ngde"><span class="hljs-string ngde">    view="auto"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [nodes]="nodes"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [edges]="edges"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [connection]="connection"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [background]="{ type: 'dots' }"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    (onConnect)="handleConnect($event)"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;ng-template let-ctx edge></span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;svg:path</span>
</span><span class="line ngde"><span class="hljs-string ngde">        fill="none"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [attr.d]="ctx.path()"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [attr.stroke-width]="4"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [attr.stroke]="ctx.edge.data.color"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [attr.marker-end]="ctx.markerEnd()" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/ng-template></span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;ng-template let-ctx edgeLabelHtml></span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;div class="label" [style.background-color]="ctx.label.data.color" (click)="deleteEdge(ctx.edge)">Delete&#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/ng-template></span>
</span><span class="line ngde"><span class="hljs-string ngde">  &#x3C;/vflow>\`</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [
</span><span class="line ngde">    <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">      :host {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 100%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 100%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      .label {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 60px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 25px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        background-color: #122c26;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        text-align: center;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde">    \`</span>,
</span><span class="line ngde">  ],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">AllFeaturesDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'Default'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">10</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\`Resized\`</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">width</span>: <span class="hljs-number ngde">100</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">height</span>: <span class="hljs-number ngde">100</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">270</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">SimpleCustomNodeComponent</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">draggable</span>: <span class="hljs-literal ngde">false</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'4'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">600</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">150</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">ComplexCustomNodeComponent</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">id</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">one</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-string ngde">''</span>),
</span><span class="line ngde">          <span class="hljs-attr ngde">two</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-string ngde">''</span>),
</span><span class="line ngde">          <span class="hljs-attr ngde">three</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-string ngde">''</span>),
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">markers</span>: { <span class="hljs-attr ngde">end</span>: { <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'arrow-closed'</span> } },
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">curve</span>: <span class="hljs-string ngde">'straight'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">markers</span>: { <span class="hljs-attr ngde">end</span>: { <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'arrow'</span> } },
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'3 -> 4-three'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'4'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">targetHandle</span>: <span class="hljs-string ngde">'three'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">connection</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></span> = {
</span><span class="line ngde">    <span class="hljs-title function_ ngde">validator</span>(<span class="hljs-params ngde">connection</span>) {
</span><span class="line ngde">      <span class="hljs-keyword ngde">if</span> (connection.<span class="hljs-property ngde">source</span> === <span class="hljs-string ngde">'3'</span>) {
</span><span class="line ngde">        <span class="hljs-keyword ngde">return</span> <span class="hljs-literal ngde">false</span>;
</span><span class="line ngde">      }
</span><span class="line ngde">
</span><span class="line ngde">      <span class="hljs-keyword ngde">return</span> <span class="hljs-literal ngde">true</span>;
</span><span class="line ngde">    },
</span><span class="line ngde">  };
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-title function_ ngde">handleConnect</span>(<span class="hljs-params ngde">connection: <a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>) {
</span><span class="line ngde">    <span class="hljs-keyword ngde">if</span> (connection.<span class="hljs-property ngde">target</span> === <span class="hljs-string ngde">'4'</span>) {
</span><span class="line ngde">      <span class="hljs-keyword ngde">const</span> data = <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">nodes</span>.<span class="hljs-title function_ ngde">filter</span>(<a href="/api/ngx-vflow/functions/isComponentStaticNode" class="ng-doc-code-anchor ngde" data-link-type="Function" class="ngde">isComponentStaticNode</a>).<span class="hljs-title function_ ngde">find</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">n</span>) =></span> n.<span class="hljs-property ngde">id</span> === <span class="hljs-string ngde">'4'</span>)?.<span class="hljs-property ngde">data</span> <span class="hljs-keyword ngde">as</span> <span class="hljs-title class_ ngde">ComplexCustomNodeData</span>;
</span><span class="line ngde">
</span><span class="line ngde">      <span class="hljs-keyword ngde">const</span> sourceNode = <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">nodes</span>.<span class="hljs-title function_ ngde">filter</span>(<a href="/api/ngx-vflow/functions/isDefaultStaticNode" class="ng-doc-code-anchor ngde" data-link-type="Function" class="ngde">isDefaultStaticNode</a>).<span class="hljs-title function_ ngde">find</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">n</span>) =></span> n.<span class="hljs-property ngde">id</span> === connection.<span class="hljs-property ngde">source</span>);
</span><span class="line ngde">
</span><span class="line ngde">      <span class="hljs-keyword ngde">if</span> (sourceNode) {
</span><span class="line ngde">        <span class="hljs-keyword ngde">if</span> (connection.<span class="hljs-property ngde">targetHandle</span> === <span class="hljs-string ngde">'one'</span>) {
</span><span class="line ngde">          data.<span class="hljs-property ngde">id</span>.<span class="hljs-property ngde">one</span>.<span class="hljs-title function_ ngde">set</span>(sourceNode.<span class="hljs-property ngde">text</span> ?? <span class="hljs-string ngde">''</span>);
</span><span class="line ngde">        }
</span><span class="line ngde">        <span class="hljs-keyword ngde">if</span> (connection.<span class="hljs-property ngde">targetHandle</span> === <span class="hljs-string ngde">'two'</span>) {
</span><span class="line ngde">          data.<span class="hljs-property ngde">id</span>.<span class="hljs-property ngde">two</span>.<span class="hljs-title function_ ngde">set</span>(sourceNode.<span class="hljs-property ngde">text</span> ?? <span class="hljs-string ngde">''</span>);
</span><span class="line ngde">        }
</span><span class="line ngde">        <span class="hljs-keyword ngde">if</span> (connection.<span class="hljs-property ngde">targetHandle</span> === <span class="hljs-string ngde">'three'</span>) {
</span><span class="line ngde">          data.<span class="hljs-property ngde">id</span>.<span class="hljs-property ngde">three</span>.<span class="hljs-title function_ ngde">set</span>(sourceNode.<span class="hljs-property ngde">text</span> ?? <span class="hljs-string ngde">''</span>);
</span><span class="line ngde">        }
</span><span class="line ngde">      }
</span><span class="line ngde">    }
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-keyword ngde">const</span> color = <span class="hljs-title function_ ngde">randomHex</span>();
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span> = [
</span><span class="line ngde">      ...<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span>,
</span><span class="line ngde">      {
</span><span class="line ngde">        <span class="hljs-attr ngde">id</span>: crypto.<span class="hljs-title function_ ngde">randomUUID</span>(),
</span><span class="line ngde">        <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'template'</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">          color,
</span><span class="line ngde">        },
</span><span class="line ngde">        <span class="hljs-attr ngde">markers</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">end</span>: {
</span><span class="line ngde">            <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'arrow-closed'</span>,
</span><span class="line ngde">            <span class="hljs-attr ngde">width</span>: <span class="hljs-number ngde">30</span>,
</span><span class="line ngde">            <span class="hljs-attr ngde">height</span>: <span class="hljs-number ngde">30</span>,
</span><span class="line ngde">            color,
</span><span class="line ngde">          },
</span><span class="line ngde">        },
</span><span class="line ngde">        <span class="hljs-attr ngde">edgeLabels</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">center</span>: {
</span><span class="line ngde">            <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">            <span class="hljs-attr ngde">data</span>: { color },
</span><span class="line ngde">          },
</span><span class="line ngde">        },
</span><span class="line ngde">        ...connection,
</span><span class="line ngde">      },
</span><span class="line ngde">    ];
</span><span class="line ngde">  }
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">deleteEdge</span>(<span class="hljs-params ngde">edge: <a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span> = <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span>.<span class="hljs-title function_ ngde">filter</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">e</span>) =></span> e !== edge);
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-keyword ngde">function</span> <span class="hljs-title function_ ngde">randomHex</span>(<span class="hljs-params ngde"></span>) {
</span><span class="line ngde">  <span class="hljs-keyword ngde">const</span> hexValues = [<span class="hljs-number ngde">0</span>, <span class="hljs-number ngde">1</span>, <span class="hljs-number ngde">2</span>, <span class="hljs-number ngde">3</span>, <span class="hljs-number ngde">4</span>, <span class="hljs-number ngde">5</span>, <span class="hljs-number ngde">6</span>, <span class="hljs-number ngde">7</span>, <span class="hljs-number ngde">8</span>, <span class="hljs-number ngde">9</span>, <span class="hljs-string ngde">'A'</span>, <span class="hljs-string ngde">'B'</span>, <span class="hljs-string ngde">'C'</span>, <span class="hljs-string ngde">'D'</span>, <span class="hljs-string ngde">'E'</span>, <span class="hljs-string ngde">'F'</span>];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">let</span> hex = <span class="hljs-string ngde">'#'</span>;
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">for</span> (<span class="hljs-keyword ngde">let</span> i = <span class="hljs-number ngde">0</span>; i &#x3C; <span class="hljs-number ngde">6</span>; i++) {
</span><span class="line ngde">    <span class="hljs-keyword ngde">const</span> index = <span class="hljs-title class_ ngde">Math</span>.<span class="hljs-title function_ ngde">floor</span>(<span class="hljs-title class_ ngde">Math</span>.<span class="hljs-title function_ ngde">random</span>() * hexValues.<span class="hljs-property ngde">length</span>);
</span><span class="line ngde">    hex += hexValues[index];
</span><span class="line ngde">  }
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">return</span> hex;
</span><span class="line ngde">}
</span></code></pre>`}]},ss=gs;var os=`<h1 id="what-is-ngx-vflow" class="ngde">What is ngx-vflow<a title="Link to heading" class="ng-doc-header-link ngde" href="/getting-started/what-is-ngx-vflow#what-is-ngx-vflow"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><br class="ngde"><ng-doc-demo-pane componentname="AllFeaturesDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane><p class="ngde"><code class="ngde">ngx-vflow</code> is an Angular library for creating node-based applications. It aims to assist you in building anything from a static diagram to a visual editor. You can utilize the default design or apply your own by customizing everything using familiar technologies.</p><h2 id="main-features" class="ngde">Main features<a title="Link to heading" class="ng-doc-header-link ngde" href="/getting-started/what-is-ngx-vflow#main-features"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde"><strong class="ngde">Easy to use:</strong> Just describe your flow with a simple API; all of the heavy lifting, such as dragging, zooming, and curve math, is handled by the library for you.</p><p class="ngde"><strong class="ngde">Customizable:</strong> There is a default design for basic usage, and you can also customize nodes with good old HTML and CSS. Other entities such as edges, connection lines, and handles are also customizable, but it will require a little SVG knowledge.</p><p class="ngde"><strong class="ngde">Great performance:</strong> Angular signals are the heart and soul of <code class="ngde">ngx-vflow</code>, which are performant by default, so you shouldn't worry about performance even with large flows.</p><p class="ngde"><strong class="ngde">Zoneless:</strong> <a href="https://stackblitz.com/edit/stackblitz-starters-qhu6im?file=src%2Fmain.ts" class="ngde">Does not require <code class="ngde">zone.js</code></a></p>`,rs=(()=>{class n extends N{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=os,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/getting-started/pages/what-is-ngx-vflow/index.md?message=docs(what-is-ngx-vflow): describe your changes here...",this.page=j,this.demoAssets=ss}static{this.\u0275fac=function(a){return new(a||n)}}static{this.\u0275cmp=o({type:n,selectors:[["ng-doc-page-getting-started-what-is-ngx-vflow"]],standalone:!0,features:[I([{provide:N,useExisting:n},X,j.providers??[]]),m,r],decls:1,vars:0,template:function(a,e){a&1&&t(0,"ng-doc-page")},dependencies:[L],encapsulation:2,changeDetection:0})}}return n})(),hs=[E(u({},(0,ns.isRoute)(j.route)?j.route:{}),{path:"",component:rs,title:"What is ngx-vflow"})],zs=hs;export{rs as DynamicComponent,zs as default};
