import{a as ps}from"./chunk-G45ERDUB.js";import{a as ls}from"./chunk-MNCM4GNQ.js";import{a as es}from"./chunk-I6KPVQGY.js";import{a as as}from"./chunk-TDKHU3AS.js";import{i as Z,j as K,n as j,t as ss,x as ns,z as v}from"./chunk-DBNQT47Y.js";import{k as m}from"./chunk-NA7FJBPQ.js";import{a as J}from"./chunk-ZBKCENK6.js";import"./chunk-G5N4YGVJ.js";import{a as H}from"./chunk-AKRIWIS4.js";import{T as ys}from"./chunk-QMHLIXQX.js";import{$b as p,Ac as i,Bc as X,Db as l,Eb as $,Ga as S,Gb as r,Ha as F,Ia as L,Ka as h,Ob as V,Pb as R,Qb as E,Wb as I,Xb as Y,Zb as W,_b as G,ac as t,ad as C,bc as d,bd as U,cd as Q,fc as T,hc as _,ic as y,ka as A,pb as o,qc as q,ra as b,rc as B,tc as c,uc as M,vc as u,wa as g,zc as P}from"./chunk-Z42XPK5A.js";import{a as N,b as O,g as us}from"./chunk-ODLL2QMY.js";var ms=us(ys());var ts=(()=>{class n extends j{static{this.\u0275fac=(()=>{let s;return function(a){return(s||(s=h(n)))(a||n)}})()}static{this.\u0275cmp=g({type:n,selectors:[["ng-component"]],standalone:!0,features:[r,i],decls:3,vars:0,consts:[[1,"node"],["type","target","position","left"]],template:function(e,a){e&1&&(p(0,"div",0),c(1," Input Node "),d(2,"handle",1),t())},dependencies:[m],styles:[".node[_ngcontent-%COMP%]{width:150px;height:100px;border:1.5px solid #1b262c;border-radius:5px;display:flex;align-items:center;justify-content:center;color:#000;background-color:#fff}"],changeDetection:0})}}return n})();function xs(n,f){if(n&1){let s=T();p(0,"span",3),_("click",function(){let a=S(s).$implicit,D=y();return F(D.selectEmoji(a))}),c(1),t()}if(n&2){let s=f.$implicit;o(),M(s)}}var ds=["\u{1F31E}","\u{1F4A1}","\u{1F4BB}"],cs=(()=>{class n extends j{constructor(){super(...arguments),this.emojis=ds,this.emoji=ds[0]}selectEmoji(s){this.emoji=s}static{this.\u0275fac=(()=>{let s;return function(a){return(s||(s=h(n)))(a||n)}})()}static{this.\u0275cmp=g({type:n,selectors:[["ng-component"]],standalone:!0,features:[r,i],decls:7,vars:1,consts:[["type","target","position","left"],["type","source","position","right"],[1,"emoji-toolbar"],[3,"click"]],template:function(e,a){e&1&&(c(0),d(1,"handle",0)(2,"handle",1),p(3,"node-toolbar")(4,"div",2),W(5,xs,2,1,"span",null,Y),t()()),e&2&&(u(" ",a.emoji," "),o(5),G(a.emojis))},dependencies:[ls,m],styles:["[_nghost-%COMP%]{width:150px;height:100px;border:1.5px solid #1b262c;border-radius:5px;display:flex;align-items:center;justify-content:center;color:#000;background-color:#fff}.emoji-toolbar[_ngcontent-%COMP%]{height:25px;background-color:#122c26;border-radius:5px;text-align:center;padding-left:5px;padding-right:5px}"],changeDetection:0})}}return n})();var gs=(()=>{class n extends j{static{this.\u0275fac=(()=>{let s;return function(a){return(s||(s=h(n)))(a||n)}})()}static{this.\u0275cmp=g({type:n,selectors:[["ng-component"]],standalone:!0,features:[r,i],decls:4,vars:1,consts:[["selectable","",1,"resizable",3,"resizable"],["type","target","position","left"],["type","source","position","right"]],template:function(e,a){e&1&&(p(0,"div",0),c(1," Resizable Node "),d(2,"handle",1)(3,"handle",2),t()),e&2&&E("resizable",a.selected())},dependencies:[m,ns,as],styles:["[_nghost-%COMP%]{display:contents}.resizable[_ngcontent-%COMP%]{min-width:150px;min-height:100px;height:100%;border:1.5px solid #1b262c;border-radius:5px;display:flex;align-items:center;justify-content:center;color:#000;background-color:#fff}"],changeDetection:0})}}return n})();var is=(()=>{class n extends j{constructor(){super(...arguments),this.store=b(w),this.connectedNodeWidth=C(()=>{let s=this.store.edges().find(a=>a.target===this.node().id&&a.targetHandle==="width")??null,e=s?this.store.nodes().find(a=>a.id===s?.source):null;return Math.floor(e?.width?.()??0)}),this.connectedNodeHeight=C(()=>{let s=this.store.edges().find(a=>a.target===this.node().id&&a.targetHandle==="height")??null,e=s?this.store.nodes().find(a=>a.id===s?.source):null;return Math.floor(e?.height?.()??0)})}static{this.\u0275fac=(()=>{let s;return function(a){return(s||(s=h(n)))(a||n)}})()}static{this.\u0275cmp=g({type:n,selectors:[["ng-component"]],standalone:!0,features:[r,i],decls:6,vars:2,consts:[["position","left","type","target","id","width"],[1,"bottom-label"],["position","left","type","target","id","height"]],template:function(e,a){e&1&&(p(0,"div"),c(1),d(2,"handle",0),t(),p(3,"div",1),c(4),d(5,"handle",2),t()),e&2&&(o(),u(" width: ",a.connectedNodeWidth()," "),o(3),u(" height: ",a.connectedNodeHeight()," "))},dependencies:[m],styles:["[_nghost-%COMP%]{display:block;width:150px;height:100px;border:1.5px solid #1b262c;padding:10px;border-radius:5px;color:#000;background-color:#fff}.bottom-label[_ngcontent-%COMP%]{margin-top:25px}"],changeDetection:0})}}return n})();var os=(()=>{class n extends j{constructor(){super(...arguments),this.store=b(w),this.connectedNodeX=C(()=>{let s=this.store.edges().find(a=>a.target===this.node().id&&a.targetHandle==="x")??null,e=s?this.store.nodes().find(a=>a.id===s?.source):null;return Math.floor(e?.point().x??0)}),this.connectedNodeY=C(()=>{let s=this.store.edges().find(a=>a.target===this.node().id&&a.targetHandle==="y")??null,e=s?this.store.nodes().find(a=>a.id===s?.source):null;return Math.floor(e?.point().y??0)})}static{this.\u0275fac=(()=>{let s;return function(a){return(s||(s=h(n)))(a||n)}})()}static{this.\u0275cmp=g({type:n,selectors:[["ng-component"]],standalone:!0,features:[r,i],decls:6,vars:2,consts:[["position","left","type","target","id","x"],[1,"bottom-label"],["position","left","type","target","id","y"]],template:function(e,a){e&1&&(p(0,"div"),c(1),d(2,"handle",0),t(),p(3,"div",1),c(4),d(5,"handle",2),t()),e&2&&(o(),u(" X: ",a.connectedNodeX()," "),o(3),u(" Y: ",a.connectedNodeY()," "))},dependencies:[m],styles:["[_nghost-%COMP%]{display:block;width:150px;height:100px;padding:10px;border:1.5px solid #1b262c;border-radius:5px;color:#000;background-color:#fff}.bottom-label[_ngcontent-%COMP%]{margin-top:25px}"],changeDetection:0})}}return n})();var w=(()=>{class n{constructor(){this.nodes=l([{id:"1",point:l({x:10,y:10}),type:"default",text:l("Default Node"),width:l(150)},{id:"2",point:l({x:252,y:200}),type:"default",text:l("<i>I can show styled text</i>"),width:l(200)},{id:"3",point:l({x:254,y:-181}),type:ts},{id:"4",point:l({x:465,y:-90}),type:"default-group",width:l(500),height:l(200)},{id:"5",parentId:l("4"),point:l({x:100,y:50}),type:cs},{id:"6",point:l({x:1056,y:-39}),type:gs,width:l(0),height:l(0)},{id:"7",point:l({x:1332,y:-181}),type:is},{id:"8",point:l({x:1332,y:200}),type:os}]),this.edges=l([{id:"1 -> 2",source:"1",target:"2",curve:"smooth-step",edgeLabels:{center:{type:"html-template",data:{type:"text",text:"Smooth Step Edge"}}}},{id:"1 -> 3",source:"1",target:"3",type:"template",curve:"bezier",edgeLabels:{center:{type:"html-template",data:{type:"text",text:"Animated Edge"}}},data:{type:"animated"}},{id:"2 -> 5",source:"2",target:"5"},{id:"5 -> 6",source:"5",target:"6"},{id:"6 -> 7width",source:"6",target:"7",targetHandle:"width",edgeLabels:{center:{type:"html-template",data:{type:"delete"}}},markers:{end:{type:"arrow-closed"}}},{id:"6 -> 7height",source:"6",target:"7",targetHandle:"height",edgeLabels:{center:{type:"html-template",data:{type:"delete"}}},markers:{end:{type:"arrow-closed"}}},{id:"6 -> 8x",source:"6",target:"8",targetHandle:"x",edgeLabels:{center:{type:"html-template",data:{type:"delete"}}},markers:{end:{type:"arrow-closed"}}},{id:"6 -> 8y",source:"6",target:"8",targetHandle:"y",edgeLabels:{center:{type:"html-template",data:{type:"delete"}}},markers:{end:{type:"arrow-closed"}}}])}static{this.\u0275fac=function(e){return new(e||n)}}static{this.\u0275prov=A({token:n,factory:n.\u0275fac})}}return n})();var ws=()=>({type:"dots"});function bs(n,f){if(n&1&&(L(),d(0,"path",3)),n&2){let s=y().$implicit;R("d",s.path())("stroke-width",2)("stroke","black")("marker-end",s.markerEnd())}}function Cs(n,f){if(n&1&&V(0,bs,1,4,":svg:path",3),n&2){let s=f.$implicit;I(0,(s.edge.data==null?null:s.edge.data.type)==="animated"?0:-1)}}function _s(n,f){if(n&1&&(p(0,"div",4),c(1),t()),n&2){let s=y().$implicit;o(),M(s.label.data.text)}}function vs(n,f){if(n&1){let s=T();p(0,"div",6),_("click",function(){S(s);let a=y().$implicit,D=y();return F(D.deleteEdge(a.edge))}),c(1,"\xD7"),t()}}function ks(n,f){if(n&1&&V(0,_s,2,1,"div",4)(1,vs,2,0,"div",5),n&2){let s=f.$implicit;I(0,s.label.data.type==="text"?0:-1),o(),I(1,s.label.data.type==="delete"?1:-1)}}var rs=(()=>{class n{constructor(){this.store=b(w),this.vflow=$.required(v),Q(()=>{this.vflow().initialized()&&U(()=>this.vflow().fitView())},{allowSignalWrites:!0})}createEdge(s){let e=`${s.source}${s.sourceHandle??""}-${s.target}${s.targetHandle??""}`;this.store.edges.update(a=>[...a,N({id:e,edgeLabels:{center:{type:"html-template",data:{type:"delete"}}}},s)])}deleteEdge(s){this.store.edges.update(e=>e.filter(a=>a!==s))}static{this.\u0275fac=function(e){return new(e||n)}}static{this.\u0275cmp=g({type:n,selectors:[["ng-component"]],viewQuery:function(e,a){e&1&&q(a.vflow,v,5),e&2&&B()},standalone:!0,features:[P([w]),i],decls:4,vars:4,consts:[["view","auto",3,"onConnect","nodes","edges","background"],["edge",""],["edgeLabelHtml",""],["fill","none",1,"animated-edge"],[1,"label-text"],[1,"label-delete"],[1,"label-delete",3,"click"]],template:function(e,a){e&1&&(p(0,"vflow",0),_("onConnect",function(fs){return a.createEdge(fs)}),V(1,Cs,1,1,"ng-template",1)(2,ks,2,2,"ng-template",2),d(3,"mini-map"),t()),e&2&&E("nodes",a.store.nodes())("edges",a.store.edges())("background",X(3,ws))},dependencies:[v,es,ss,K,Z],styles:["[_nghost-%COMP%]{display:block;width:100%;height:700px}.label-text[_ngcontent-%COMP%]{height:25px;background-color:#122c26;border-radius:5px;text-align:center;padding-left:5px;padding-right:5px}.label-delete[_ngcontent-%COMP%]{width:25px;height:25px;background-color:#b1b1b7;text-align:center;padding-left:5px;padding-right:5px;border-radius:50%}.animated-edge[_ngcontent-%COMP%]{stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:10;stroke-dashoffset:200;animation:_ngcontent-%COMP%_move-white-stroke 4s linear infinite}@keyframes _ngcontent-%COMP%_move-white-stroke{to{stroke-dashoffset:0}}"],changeDetection:0})}}return n})();var Ds={title:"What is ngx-vflow",mdFile:"./index.md",category:ps,order:1,demos:{AllFeaturesDemoComponent:rs}},k=Ds;var hs=[];var Ns={AllFeaturesDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span>, effect, inject, untracked, viewChild } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">VflowComponent</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">FlowStoreService</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'./services/flow-store.service'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;vflow</span>
</span><span class="line ngde"><span class="hljs-string ngde">    view="auto"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [nodes]="store.nodes()"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [edges]="store.edges()"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [background]="{ type: 'dots' }"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    (onConnect)="createEdge($event)"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;ng-template let-ctx edge></span>
</span><span class="line ngde"><span class="hljs-string ngde">      @if (ctx.edge.data?.type === 'animated') {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        &#x3C;svg:path</span>
</span><span class="line ngde"><span class="hljs-string ngde">          class="animated-edge"</span>
</span><span class="line ngde"><span class="hljs-string ngde">          fill="none"</span>
</span><span class="line ngde"><span class="hljs-string ngde">          [attr.d]="ctx.path()"</span>
</span><span class="line ngde"><span class="hljs-string ngde">          [attr.stroke-width]="2"</span>
</span><span class="line ngde"><span class="hljs-string ngde">          [attr.stroke]="'black'"</span>
</span><span class="line ngde"><span class="hljs-string ngde">          [attr.marker-end]="ctx.markerEnd()" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/ng-template></span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;ng-template let-ctx edgeLabelHtml></span>
</span><span class="line ngde"><span class="hljs-string ngde">      @if (ctx.label.data.type === 'text') {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        &#x3C;div class="label-text">{{ ctx.label.data.text }}&#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      @if (ctx.label.data.type === 'delete') {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        &#x3C;div class="label-delete" (click)="deleteEdge(ctx.edge)">\xD7&#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/ng-template></span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;mini-map /></span>
</span><span class="line ngde"><span class="hljs-string ngde">  &#x3C;/vflow>\`</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [
</span><span class="line ngde">    <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">      :host {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        display: block;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 100%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 700px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      .label-text {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 25px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        background-color: #122c26;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        text-align: center;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        padding-left: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        padding-right: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      .label-delete {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 25px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 25px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        background-color: rgb(177, 177, 183);</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        text-align: center;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        padding-left: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        padding-right: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 50%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      .animated-edge {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        stroke-linecap: round;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        stroke-linejoin: round;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        stroke-dasharray: 10; /* Matches the length of the path */</span>
</span><span class="line ngde"><span class="hljs-string ngde">        stroke-dashoffset: 200; /* Initially offset */</span>
</span><span class="line ngde"><span class="hljs-string ngde">        animation: move-white-stroke 4s linear infinite;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      @keyframes move-white-stroke {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        to {</span>
</span><span class="line ngde"><span class="hljs-string ngde">          stroke-dashoffset: 0; /* Move the stroke along the path */</span>
</span><span class="line ngde"><span class="hljs-string ngde">        }</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde">    \`</span>,
</span><span class="line ngde">  ],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">  <span class="hljs-attr ngde">providers</span>: [<span class="hljs-title class_ ngde">FlowStoreService</span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">AllFeaturesDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">protected</span> store = <span class="hljs-title function_ ngde">inject</span>(<span class="hljs-title class_ ngde">FlowStoreService</span>);
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">protected</span> vflow = viewChild.required(<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">VflowComponent</a></span>);
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-title function_ ngde">constructor</span>(<span class="hljs-params ngde"></span>) {
</span><span class="line ngde">    <span class="hljs-title function_ ngde">effect</span>(
</span><span class="line ngde">      <span class="hljs-function ngde">() =></span> {
</span><span class="line ngde">        <span class="hljs-keyword ngde">if</span> (<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-title function_ ngde">vflow</span>().<span class="hljs-title function_ ngde">initialized</span>()) {
</span><span class="line ngde">          <span class="hljs-title function_ ngde">untracked</span>(<span class="hljs-function ngde">() =></span> <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-title function_ ngde">vflow</span>().<span class="hljs-title function_ ngde">fitView</span>());
</span><span class="line ngde">        }
</span><span class="line ngde">      },
</span><span class="line ngde">      { <span class="hljs-attr ngde">allowSignalWrites</span>: <span class="hljs-literal ngde">true</span> },
</span><span class="line ngde">    );
</span><span class="line ngde">  }
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-title function_ ngde">createEdge</span>(<span class="hljs-params ngde">connection: <a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>) {
</span><span class="line ngde">    <span class="hljs-keyword ngde">const</span> id = <span class="hljs-string ngde">\`<span class="hljs-subst ngde">\${connection.source}</span><span class="hljs-subst ngde">\${connection.sourceHandle ?? <span class="hljs-string ngde">''</span>}</span>-<span class="hljs-subst ngde">\${connection.target}</span><span class="hljs-subst ngde">\${connection.targetHandle ?? <span class="hljs-string ngde">''</span>}</span>\`</span>;
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">store</span>.<span class="hljs-property ngde">edges</span>.<span class="hljs-title function_ ngde">update</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">edges</span>) =></span> {
</span><span class="line ngde">      <span class="hljs-keyword ngde">return</span> [
</span><span class="line ngde">        ...edges,
</span><span class="line ngde">        {
</span><span class="line ngde">          id,
</span><span class="line ngde">          <span class="hljs-attr ngde">edgeLabels</span>: {
</span><span class="line ngde">            <span class="hljs-attr ngde">center</span>: {
</span><span class="line ngde">              <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">              <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">                <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'delete'</span>,
</span><span class="line ngde">              },
</span><span class="line ngde">            },
</span><span class="line ngde">          },
</span><span class="line ngde">          ...connection,
</span><span class="line ngde">        },
</span><span class="line ngde">      ];
</span><span class="line ngde">    });
</span><span class="line ngde">  }
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-title function_ ngde">deleteEdge</span>(<span class="hljs-params ngde">edgeToDelete: <a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">store</span>.<span class="hljs-property ngde">edges</span>.<span class="hljs-title function_ ngde">update</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">edges</span>) =></span> {
</span><span class="line ngde">      <span class="hljs-keyword ngde">return</span> edges.<span class="hljs-title function_ ngde">filter</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">edge</span>) =></span> edge !== edgeToDelete);
</span><span class="line ngde">    });
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre>`}]},js=Ns;var Ss=`<h1 id="what-is-ngx-vflow" class="ngde">What is ngx-vflow<a title="Link to heading" class="ng-doc-header-link ngde" href="/getting-started/what-is-ngx-vflow#what-is-ngx-vflow"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde"><code class="ngde">ngx-vflow</code> is an Angular library for creating node-based applications. It aims to assist you in building anything from a static diagram to a visual editor. You can utilize the default design or apply your own by customizing everything using familiar technologies.</p><ng-doc-demo componentname="AllFeaturesDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{"container":false}</div></ng-doc-demo><ng-doc-tab group="feature-overview" name="all-features-demo.component.ts" icon="" class="ngde"><pre class="ngde hljs"><code class="hljs language-typescript code-lines ngde" lang="typescript" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span>, effect, inject, untracked, viewChild } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">VflowComponent</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">FlowStoreService</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'./services/flow-store.service'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;vflow</span>
</span><span class="line ngde"><span class="hljs-string ngde">    view="auto"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [nodes]="store.nodes()"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [edges]="store.edges()"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [background]="{ type: 'dots' }"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    (onConnect)="createEdge($event)"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;ng-template let-ctx edge></span>
</span><span class="line ngde"><span class="hljs-string ngde">      @if (ctx.edge.data?.type === 'animated') {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        &#x3C;svg:path</span>
</span><span class="line ngde"><span class="hljs-string ngde">          class="animated-edge"</span>
</span><span class="line ngde"><span class="hljs-string ngde">          fill="none"</span>
</span><span class="line ngde"><span class="hljs-string ngde">          [attr.d]="ctx.path()"</span>
</span><span class="line ngde"><span class="hljs-string ngde">          [attr.stroke-width]="2"</span>
</span><span class="line ngde"><span class="hljs-string ngde">          [attr.stroke]="'black'"</span>
</span><span class="line ngde"><span class="hljs-string ngde">          [attr.marker-end]="ctx.markerEnd()" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/ng-template></span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;ng-template let-ctx edgeLabelHtml></span>
</span><span class="line ngde"><span class="hljs-string ngde">      @if (ctx.label.data.type === 'text') {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        &#x3C;div class="label-text">{{ ctx.label.data.text }}&#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      @if (ctx.label.data.type === 'delete') {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        &#x3C;div class="label-delete" (click)="deleteEdge(ctx.edge)">\xD7&#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/ng-template></span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;mini-map /></span>
</span><span class="line ngde"><span class="hljs-string ngde">  &#x3C;/vflow>\`</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [
</span><span class="line ngde">    <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">      :host {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        display: block;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 100%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 700px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      .label-text {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 25px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        background-color: #122c26;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        text-align: center;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        padding-left: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        padding-right: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      .label-delete {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 25px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 25px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        background-color: rgb(177, 177, 183);</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        text-align: center;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        padding-left: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        padding-right: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 50%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      .animated-edge {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        stroke-linecap: round;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        stroke-linejoin: round;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        stroke-dasharray: 10; /* Matches the length of the path */</span>
</span><span class="line ngde"><span class="hljs-string ngde">        stroke-dashoffset: 200; /* Initially offset */</span>
</span><span class="line ngde"><span class="hljs-string ngde">        animation: move-white-stroke 4s linear infinite;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      @keyframes move-white-stroke {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        to {</span>
</span><span class="line ngde"><span class="hljs-string ngde">          stroke-dashoffset: 0; /* Move the stroke along the path */</span>
</span><span class="line ngde"><span class="hljs-string ngde">        }</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde">    \`</span>,
</span><span class="line ngde">  ],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">  <span class="hljs-attr ngde">providers</span>: [<span class="hljs-title class_ ngde">FlowStoreService</span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">AllFeaturesDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">protected</span> store = <span class="hljs-title function_ ngde">inject</span>(<span class="hljs-title class_ ngde">FlowStoreService</span>);
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">protected</span> vflow = viewChild.required(<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">VflowComponent</a></span>);
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-title function_ ngde">constructor</span>(<span class="hljs-params ngde"></span>) {
</span><span class="line ngde">    <span class="hljs-title function_ ngde">effect</span>(
</span><span class="line ngde">      <span class="hljs-function ngde">() =></span> {
</span><span class="line ngde">        <span class="hljs-keyword ngde">if</span> (<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-title function_ ngde">vflow</span>().<span class="hljs-title function_ ngde">initialized</span>()) {
</span><span class="line ngde">          <span class="hljs-title function_ ngde">untracked</span>(<span class="hljs-function ngde">() =></span> <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-title function_ ngde">vflow</span>().<span class="hljs-title function_ ngde">fitView</span>());
</span><span class="line ngde">        }
</span><span class="line ngde">      },
</span><span class="line ngde">      { <span class="hljs-attr ngde">allowSignalWrites</span>: <span class="hljs-literal ngde">true</span> },
</span><span class="line ngde">    );
</span><span class="line ngde">  }
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-title function_ ngde">createEdge</span>(<span class="hljs-params ngde">connection: <a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>) {
</span><span class="line ngde">    <span class="hljs-keyword ngde">const</span> id = <span class="hljs-string ngde">\`<span class="hljs-subst ngde">\${connection.source}</span><span class="hljs-subst ngde">\${connection.sourceHandle ?? <span class="hljs-string ngde">''</span>}</span>-<span class="hljs-subst ngde">\${connection.target}</span><span class="hljs-subst ngde">\${connection.targetHandle ?? <span class="hljs-string ngde">''</span>}</span>\`</span>;
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">store</span>.<span class="hljs-property ngde">edges</span>.<span class="hljs-title function_ ngde">update</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">edges</span>) =></span> {
</span><span class="line ngde">      <span class="hljs-keyword ngde">return</span> [
</span><span class="line ngde">        ...edges,
</span><span class="line ngde">        {
</span><span class="line ngde">          id,
</span><span class="line ngde">          <span class="hljs-attr ngde">edgeLabels</span>: {
</span><span class="line ngde">            <span class="hljs-attr ngde">center</span>: {
</span><span class="line ngde">              <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">              <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">                <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'delete'</span>,
</span><span class="line ngde">              },
</span><span class="line ngde">            },
</span><span class="line ngde">          },
</span><span class="line ngde">          ...connection,
</span><span class="line ngde">        },
</span><span class="line ngde">      ];
</span><span class="line ngde">    });
</span><span class="line ngde">  }
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-title function_ ngde">deleteEdge</span>(<span class="hljs-params ngde">edgeToDelete: <a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">store</span>.<span class="hljs-property ngde">edges</span>.<span class="hljs-title function_ ngde">update</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">edges</span>) =></span> {
</span><span class="line ngde">      <span class="hljs-keyword ngde">return</span> edges.<span class="hljs-title function_ ngde">filter</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">edge</span>) =></span> edge !== edgeToDelete);
</span><span class="line ngde">    });
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre></ng-doc-tab><ng-doc-tab group="feature-overview" name="only-input-node.component.ts" icon="" class="ngde"><pre class="ngde hljs"><code class="hljs language-typescript code-lines ngde" lang="typescript" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/CustomDynamicNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomDynamicNodeComponent</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;div class="node"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    Input <a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;handle type="target" position="left" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">  &#x3C;/div>\`</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [
</span><span class="line ngde">    <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">      .node {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 150px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 100px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border: 1.5px solid #1b262c;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        display: flex;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        align-items: center;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        justify-content: center;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        color: black;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        background-color: white;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde">    \`</span>,
</span><span class="line ngde">  ],
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">OnlyInputNodeComponent</span> <span class="hljs-keyword ngde">extends</span> <span class="hljs-title class_ inherited__ ngde"><a href="/api/ngx-vflow/classes/CustomDynamicNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomDynamicNodeComponent</a></span> {}
</span></code></pre></ng-doc-tab><ng-doc-tab group="feature-overview" name="position-node.component.ts" icon="" class="ngde"><pre class="ngde hljs"><code class="hljs language-typescript code-lines ngde" lang="typescript" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span>, computed, inject } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/CustomDynamicNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomDynamicNodeComponent</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">FlowStoreService</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'../services/flow-store.service'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;div></span>
</span><span class="line ngde"><span class="hljs-string ngde">      X: {{ connectedNodeX() }}</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;handle position="left" type="target" id="x" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;div class="bottom-label"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      Y: {{ connectedNodeY() }}</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;handle position="left" type="target" id="y" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde">  \`</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [
</span><span class="line ngde">    <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">      :host {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        display: block;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 150px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 100px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        padding: 10px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border: 1.5px solid #1b262c;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        color: black;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        background-color: white;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      .bottom-label {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        margin-top: 25px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde">    \`</span>,
</span><span class="line ngde">  ],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">PositionNodeComponent</span> <span class="hljs-keyword ngde">extends</span> <span class="hljs-title class_ inherited__ ngde"><a href="/api/ngx-vflow/classes/CustomDynamicNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomDynamicNodeComponent</a></span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> store = <span class="hljs-title function_ ngde">inject</span>(<span class="hljs-title class_ ngde">FlowStoreService</span>);
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> connectedNodeX = <span class="hljs-title function_ ngde">computed</span>(<span class="hljs-function ngde">() =></span> {
</span><span class="line ngde">    <span class="hljs-keyword ngde">const</span> edge = <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">store</span>.<span class="hljs-title function_ ngde">edges</span>().<span class="hljs-title function_ ngde">find</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">edge</span>) =></span> edge.<span class="hljs-property ngde">target</span> === <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-title function_ ngde">node</span>().<span class="hljs-property ngde">id</span> &#x26;&#x26; edge.<span class="hljs-property ngde">targetHandle</span> === <span class="hljs-string ngde">'x'</span>) ?? <span class="hljs-literal ngde">null</span>;
</span><span class="line ngde">    <span class="hljs-keyword ngde">const</span> sourceNode = edge ? <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">store</span>.<span class="hljs-title function_ ngde">nodes</span>().<span class="hljs-title function_ ngde">find</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">node</span>) =></span> node.<span class="hljs-property ngde">id</span> === edge?.<span class="hljs-property ngde">source</span>) : <span class="hljs-literal ngde">null</span>;
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-keyword ngde">return</span> <span class="hljs-title class_ ngde">Math</span>.<span class="hljs-title function_ ngde">floor</span>(sourceNode?.<span class="hljs-title function_ ngde">point</span>().<span class="hljs-property ngde">x</span> ?? <span class="hljs-number ngde">0</span>);
</span><span class="line ngde">  });
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> connectedNodeY = <span class="hljs-title function_ ngde">computed</span>(<span class="hljs-function ngde">() =></span> {
</span><span class="line ngde">    <span class="hljs-keyword ngde">const</span> edge = <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">store</span>.<span class="hljs-title function_ ngde">edges</span>().<span class="hljs-title function_ ngde">find</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">edge</span>) =></span> edge.<span class="hljs-property ngde">target</span> === <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-title function_ ngde">node</span>().<span class="hljs-property ngde">id</span> &#x26;&#x26; edge.<span class="hljs-property ngde">targetHandle</span> === <span class="hljs-string ngde">'y'</span>) ?? <span class="hljs-literal ngde">null</span>;
</span><span class="line ngde">    <span class="hljs-keyword ngde">const</span> sourceNode = edge ? <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">store</span>.<span class="hljs-title function_ ngde">nodes</span>().<span class="hljs-title function_ ngde">find</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">node</span>) =></span> node.<span class="hljs-property ngde">id</span> === edge?.<span class="hljs-property ngde">source</span>) : <span class="hljs-literal ngde">null</span>;
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-keyword ngde">return</span> <span class="hljs-title class_ ngde">Math</span>.<span class="hljs-title function_ ngde">floor</span>(sourceNode?.<span class="hljs-title function_ ngde">point</span>().<span class="hljs-property ngde">y</span> ?? <span class="hljs-number ngde">0</span>);
</span><span class="line ngde">  });
</span><span class="line ngde">}
</span></code></pre></ng-doc-tab><ng-doc-tab group="feature-overview" name="resizable-node.component.ts" icon="" class="ngde"><pre class="ngde hljs"><code class="hljs language-typescript code-lines ngde" lang="typescript" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/CustomDynamicNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomDynamicNodeComponent</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\` &#x3C;div class="resizable" selectable [resizable]="selected()"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    Resizable <a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;handle type="target" position="left" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;handle type="source" position="right" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">  &#x3C;/div>\`</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [
</span><span class="line ngde">    <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">      :host {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        display: contents;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      .resizable {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        min-width: 150px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        min-height: 100px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 100%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border: 1.5px solid #1b262c;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        display: flex;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        align-items: center;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        justify-content: center;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        color: black;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        background-color: white;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde">    \`</span>,
</span><span class="line ngde">  ],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">ResizableNodeComponent</span> <span class="hljs-keyword ngde">extends</span> <span class="hljs-title class_ inherited__ ngde"><a href="/api/ngx-vflow/classes/CustomDynamicNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomDynamicNodeComponent</a></span> {}
</span></code></pre></ng-doc-tab><ng-doc-tab group="feature-overview" name="size-node.component.ts" icon="" class="ngde"><pre class="ngde hljs"><code class="hljs language-typescript code-lines ngde" lang="typescript" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span>, computed, inject } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/CustomDynamicNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomDynamicNodeComponent</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">FlowStoreService</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'../services/flow-store.service'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;div></span>
</span><span class="line ngde"><span class="hljs-string ngde">      width: {{ connectedNodeWidth() }}</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;handle position="left" type="target" id="width" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;div class="bottom-label"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      height: {{ connectedNodeHeight() }}</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;handle position="left" type="target" id="height" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde">  \`</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [
</span><span class="line ngde">    <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">      :host {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        display: block;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 150px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 100px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border: 1.5px solid #1b262c;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        padding: 10px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        color: black;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        background-color: white;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      .bottom-label {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        margin-top: 25px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde">    \`</span>,
</span><span class="line ngde">  ],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">SizeNodeComponent</span> <span class="hljs-keyword ngde">extends</span> <span class="hljs-title class_ inherited__ ngde"><a href="/api/ngx-vflow/classes/CustomDynamicNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomDynamicNodeComponent</a></span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> store = <span class="hljs-title function_ ngde">inject</span>(<span class="hljs-title class_ ngde">FlowStoreService</span>);
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> connectedNodeWidth = <span class="hljs-title function_ ngde">computed</span>(<span class="hljs-function ngde">() =></span> {
</span><span class="line ngde">    <span class="hljs-keyword ngde">const</span> edge =
</span><span class="line ngde">      <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">store</span>.<span class="hljs-title function_ ngde">edges</span>().<span class="hljs-title function_ ngde">find</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">edge</span>) =></span> edge.<span class="hljs-property ngde">target</span> === <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-title function_ ngde">node</span>().<span class="hljs-property ngde">id</span> &#x26;&#x26; edge.<span class="hljs-property ngde">targetHandle</span> === <span class="hljs-string ngde">'width'</span>) ?? <span class="hljs-literal ngde">null</span>;
</span><span class="line ngde">    <span class="hljs-keyword ngde">const</span> sourceNode = edge ? <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">store</span>.<span class="hljs-title function_ ngde">nodes</span>().<span class="hljs-title function_ ngde">find</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">node</span>) =></span> node.<span class="hljs-property ngde">id</span> === edge?.<span class="hljs-property ngde">source</span>) : <span class="hljs-literal ngde">null</span>;
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-keyword ngde">return</span> <span class="hljs-title class_ ngde">Math</span>.<span class="hljs-title function_ ngde">floor</span>(sourceNode?.<span class="hljs-property ngde">width</span>?.() ?? <span class="hljs-number ngde">0</span>);
</span><span class="line ngde">  });
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> connectedNodeHeight = <span class="hljs-title function_ ngde">computed</span>(<span class="hljs-function ngde">() =></span> {
</span><span class="line ngde">    <span class="hljs-keyword ngde">const</span> edge =
</span><span class="line ngde">      <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">store</span>.<span class="hljs-title function_ ngde">edges</span>().<span class="hljs-title function_ ngde">find</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">edge</span>) =></span> edge.<span class="hljs-property ngde">target</span> === <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-title function_ ngde">node</span>().<span class="hljs-property ngde">id</span> &#x26;&#x26; edge.<span class="hljs-property ngde">targetHandle</span> === <span class="hljs-string ngde">'height'</span>) ?? <span class="hljs-literal ngde">null</span>;
</span><span class="line ngde">    <span class="hljs-keyword ngde">const</span> sourceNode = edge ? <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">store</span>.<span class="hljs-title function_ ngde">nodes</span>().<span class="hljs-title function_ ngde">find</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">node</span>) =></span> node.<span class="hljs-property ngde">id</span> === edge?.<span class="hljs-property ngde">source</span>) : <span class="hljs-literal ngde">null</span>;
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-keyword ngde">return</span> <span class="hljs-title class_ ngde">Math</span>.<span class="hljs-title function_ ngde">floor</span>(sourceNode?.<span class="hljs-property ngde">height</span>?.() ?? <span class="hljs-number ngde">0</span>);
</span><span class="line ngde">  });
</span><span class="line ngde">}
</span></code></pre></ng-doc-tab><ng-doc-tab group="feature-overview" name="toolbar-node.component.ts" icon="" class="ngde"><pre class="ngde hljs"><code class="hljs language-typescript code-lines ngde" lang="typescript" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/CustomDynamicNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomDynamicNodeComponent</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/HandleComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">HandleComponent</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/NodeToolbarComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">NodeToolbarComponent</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-keyword ngde">const</span> emojis = [<span class="hljs-string ngde">'\u{1F31E}'</span>, <span class="hljs-string ngde">'\u{1F4A1}'</span>, <span class="hljs-string ngde">'\u{1F4BB}'</span>];
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">    {{ emoji }}</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;handle type="target" position="left" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;handle type="source" position="right" /></span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;node-toolbar></span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;div class="emoji-toolbar"></span>
</span><span class="line ngde"><span class="hljs-string ngde">        @for (emoji of emojis; track $index) {</span>
</span><span class="line ngde"><span class="hljs-string ngde">          &#x3C;span (click)="selectEmoji(emoji)">{{ emoji }}&#x3C;/span></span>
</span><span class="line ngde"><span class="hljs-string ngde">        }</span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/node-toolbar></span>
</span><span class="line ngde"><span class="hljs-string ngde">  \`</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [
</span><span class="line ngde">    <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">      :host {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 150px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 100px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border: 1.5px solid #1b262c;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        display: flex;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        align-items: center;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        justify-content: center;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        color: black;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        background-color: white;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      .emoji-toolbar {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 25px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        background-color: #122c26;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        text-align: center;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        padding-left: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        padding-right: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde">    \`</span>,
</span><span class="line ngde">  ],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/NodeToolbarComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">NodeToolbarComponent</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/HandleComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">HandleComponent</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">ToolbarNodeComponent</span> <span class="hljs-keyword ngde">extends</span> <span class="hljs-title class_ inherited__ ngde"><a href="/api/ngx-vflow/classes/CustomDynamicNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomDynamicNodeComponent</a></span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> emojis = emojis;
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> emoji = emojis[<span class="hljs-number ngde">0</span>];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-title function_ ngde">selectEmoji</span>(<span class="hljs-params ngde">emoji: <span class="hljs-built_in ngde">string</span></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">emoji</span> = emoji;
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre></ng-doc-tab><ng-doc-tab group="feature-overview" name="flow-store.service.ts" icon="" class="ngde"><pre class="ngde hljs"><code class="hljs language-typescript code-lines ngde" lang="typescript" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">Injectable</span>, signal } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/DynamicNode" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">DynamicNode</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">OnlyInputNodeComponent</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'../components/only-input-node.component'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ToolbarNodeComponent</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'../components/toolbar-node.component'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ResizableNodeComponent</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'../components/resizable-node.component'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">SizeNodeComponent</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'../components/size-node.component'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">PositionNodeComponent</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'../components/position-node.component'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Injectable</span>()
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">FlowStoreService</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">readonly</span> nodes = <span class="hljs-title function_ ngde">signal</span>([
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">10</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-string ngde">'Default <a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a>'</span>),
</span><span class="line ngde">      <span class="hljs-attr ngde">width</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-number ngde">150</span>),
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">252</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-string ngde">'&#x3C;i>I can show styled text&#x3C;/i>'</span>),
</span><span class="line ngde">      <span class="hljs-attr ngde">width</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-number ngde">200</span>),
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">254</span>, <span class="hljs-attr ngde">y</span>: -<span class="hljs-number ngde">181</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">OnlyInputNodeComponent</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'4'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">465</span>, <span class="hljs-attr ngde">y</span>: -<span class="hljs-number ngde">90</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default-group'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">width</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-number ngde">500</span>),
</span><span class="line ngde">      <span class="hljs-attr ngde">height</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-number ngde">200</span>),
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'5'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">parentId</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-string ngde">'4'</span>),
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">100</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">50</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">ToolbarNodeComponent</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'6'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">1056</span>, <span class="hljs-attr ngde">y</span>: -<span class="hljs-number ngde">39</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">ResizableNodeComponent</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">width</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-number ngde">0</span>),
</span><span class="line ngde">      <span class="hljs-attr ngde">height</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-number ngde">0</span>),
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'7'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">1332</span>, <span class="hljs-attr ngde">y</span>: -<span class="hljs-number ngde">181</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">SizeNodeComponent</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'8'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">1332</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">PositionNodeComponent</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ] <span class="hljs-keyword ngde">as</span> <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/DynamicNode" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">DynamicNode</a></span>[]);
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">readonly</span> edges = <span class="hljs-title function_ ngde">signal</span>([
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">curve</span>: <span class="hljs-string ngde">'smooth-step'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">edgeLabels</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">center</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">          <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">            <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'text'</span>,
</span><span class="line ngde">            <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'Smooth Step <a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a>'</span>,
</span><span class="line ngde">          },
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'template'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">curve</span>: <span class="hljs-string ngde">'bezier'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">edgeLabels</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">center</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">          <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">            <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'text'</span>,
</span><span class="line ngde">            <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'Animated <a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a>'</span>,
</span><span class="line ngde">          },
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'animated'</span>,
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2 -> 5'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'5'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'5 -> 6'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'5'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'6'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'6 -> 7width'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'6'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'7'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">targetHandle</span>: <span class="hljs-string ngde">'width'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">edgeLabels</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">center</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">          <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">            <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'delete'</span>,
</span><span class="line ngde">          },
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">      <span class="hljs-attr ngde">markers</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">end</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'arrow-closed'</span>,
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'6 -> 7height'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'6'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'7'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">targetHandle</span>: <span class="hljs-string ngde">'height'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">edgeLabels</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">center</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">          <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">            <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'delete'</span>,
</span><span class="line ngde">          },
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">      <span class="hljs-attr ngde">markers</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">end</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'arrow-closed'</span>,
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'6 -> 8x'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'6'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'8'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">targetHandle</span>: <span class="hljs-string ngde">'x'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">edgeLabels</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">center</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">          <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">            <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'delete'</span>,
</span><span class="line ngde">          },
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">      <span class="hljs-attr ngde">markers</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">end</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'arrow-closed'</span>,
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'6 -> 8y'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'6'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'8'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">targetHandle</span>: <span class="hljs-string ngde">'y'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">edgeLabels</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">center</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">          <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">            <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'delete'</span>,
</span><span class="line ngde">          },
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">      <span class="hljs-attr ngde">markers</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">end</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'arrow-closed'</span>,
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">  ] <span class="hljs-keyword ngde">as</span> <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[]);
</span><span class="line ngde">}
</span></code></pre></ng-doc-tab><h2 id="main-features" class="ngde">Main features<a title="Link to heading" class="ng-doc-header-link ngde" href="/getting-started/what-is-ngx-vflow#main-features"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde"><strong class="ngde">Easy to use:</strong> Just describe your flow with a simple API; all of the heavy lifting, such as dragging, zooming, and curve math, is handled by the library for you.</p><p class="ngde"><strong class="ngde">Customizable:</strong> There is a default design for basic usage, and you can also customize nodes with good old HTML and CSS. Other entities such as edges, connection lines, and handles are also customizable, but it will require a little SVG knowledge.</p><p class="ngde"><strong class="ngde">Great performance:</strong> Angular signals are the heart and soul of <code class="ngde">ngx-vflow</code>, which are performant by default, so you shouldn't worry about performance even with large flows.</p><p class="ngde"><strong class="ngde">Zoneless:</strong> <a href="https://stackblitz.com/edit/stackblitz-starters-qhu6im?file=src%2Fmain.ts" class="ngde">Does not require <code class="ngde">zone.js</code></a></p>`,Fs=(()=>{class n extends H{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=Ss,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/getting-started/pages/what-is-ngx-vflow/index.md?message=docs(what-is-ngx-vflow): describe your changes here...",this.page=k,this.demoAssets=js}static{this.\u0275fac=function(e){return new(e||n)}}static{this.\u0275cmp=g({type:n,selectors:[["ng-doc-page-getting-started-what-is-ngx-vflow"]],standalone:!0,features:[P([{provide:H,useExisting:n},hs,k.providers??[]]),r,i],decls:1,vars:0,template:function(e,a){e&1&&d(0,"ng-doc-page")},dependencies:[J],encapsulation:2,changeDetection:0})}}return n})(),Vs=[O(N({},(0,ms.isRoute)(k.route)?k.route:{}),{path:"",component:Fs,title:"What is ngx-vflow"})],Dn=Vs;export{Fs as DynamicComponent,Dn as default};
