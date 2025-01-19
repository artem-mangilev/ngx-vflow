import{a as H}from"./chunk-4UQ4PWC7.js";import{a as O}from"./chunk-2ACI5QFB.js";import{a as A}from"./chunk-S3I3S5BX.js";import{i as M,k as B,n as x,v as m,x as k}from"./chunk-JMEWMEDY.js";import{a as R}from"./chunk-SH6HWCPG.js";import"./chunk-CQCG3KCY.js";import{a as S}from"./chunk-WT6KFS7F.js";import{Ba as g,Ea as C,Fa as I,Ga as v,Ia as V,O as E,Pa as d,Qa as o,R as l,Ra as t,Xa as w,_ as q,aa as y,ea as T,ha as P,hb as r,jb as h,na as i,nb as F,ob as p,vc as K,ya as u}from"./chunk-VLX6VUPD.js";import{a as j,b as D,g as J}from"./chunk-P2VZOJAX.js";var W=J(K());function Q(s,b){if(s&1&&(d(0,"div",2),r(1),t(2,"handle",3),o()),s&2){let n=b.$implicit;V("custom-node_selected",n.selected()),i(),h(" ",n.node.data().text," ")}}var L=(()=>{class s{constructor(){this.nodes=[{id:"1",point:u({x:100,y:100}),type:"html-template",data:u({customType:"gradient",text:"I am a nice custom node with gradient"})},{id:"2",point:u({x:250,y:250}),type:"default",text:u("Default")}],this.edges=[{id:"1 -> 2",source:"1",target:"2"}]}static{this.\u0275fac=function(e){return new(e||s)}}static{this.\u0275cmp=l({type:s,selectors:[["ng-component"]],standalone:!0,features:[p],decls:2,vars:2,consts:[["view","auto",3,"nodes","edges"],["nodeHtml",""],["selectable","",1,"custom-node"],["type","source","position","right"]],template:function(e,a){e&1&&(d(0,"vflow",0),C(1,Q,3,3,"ng-template",1),o()),e&2&&v("nodes",a.nodes)("edges",a.edges)},dependencies:[k,m,H,B],styles:["[_nghost-%COMP%]{width:100%;height:100%}.custom-node[_ngcontent-%COMP%]{width:150px;height:100px;background:linear-gradient(to right,#00d2ff,#3a7bd5);border:1px solid gray;border-radius:5px;display:flex;align-items:center;padding-left:5px;padding-right:5px}.custom-node_selected[_ngcontent-%COMP%]{border:2px solid gray}"],changeDetection:0})}}return s})();var Y=(()=>{class s extends x{constructor(){super(...arguments),this.blueSquareEvent=T()}onClick(){this.blueSquareEvent.emit({x:5,y:5})}static{this.\u0275fac=(()=>{let n;return function(a){return(n||(n=y(s)))(a||s)}})()}static{this.\u0275cmp=l({type:s,selectors:[["ng-component"]],outputs:{blueSquareEvent:"blueSquareEvent"},standalone:!0,features:[g,p],decls:3,vars:1,consts:[[1,"blue-square",3,"click"],["type","target","position","left"]],template:function(e,a){if(e&1&&(d(0,"div",0),w("click",function(){return a.onClick()}),r(1),t(2,"handle",1),o()),e&2){let c;i(),h(" ",(c=a.data())==null?null:c.blueSquareText," ")}},dependencies:[m],styles:[".blue-square[_ngcontent-%COMP%]{width:100px;height:100px;background-color:#0096ff;border-radius:5px;display:flex;align-items:center;justify-content:center;padding-left:5px;padding-right:5px}"],changeDetection:0})}}return s})();var G=(()=>{class s extends x{constructor(){super(...arguments),this.redSquareEvent=new P}onClick(){this.redSquareEvent.emit("Click from red square")}static{this.\u0275fac=(()=>{let n;return function(a){return(n||(n=y(s)))(a||s)}})()}static{this.\u0275cmp=l({type:s,selectors:[["ng-component"]],outputs:{redSquareEvent:"redSquareEvent"},standalone:!0,features:[g,p],decls:3,vars:1,consts:[[1,"red-square",3,"click"],["type","source","position","right"]],template:function(e,a){if(e&1&&(d(0,"div",0),w("click",function(){return a.onClick()}),r(1),t(2,"handle",1),o()),e&2){let c;i(),h(" ",(c=a.data())==null?null:c.redSquareText," ")}},dependencies:[m],styles:[".red-square[_ngcontent-%COMP%]{width:100px;height:100px;background-color:#de3163;border-radius:5px;display:flex;align-items:center;justify-content:center;padding-left:5px;padding-right:5px}"],changeDetection:0})}}return s})();function X(s,b){if(s&1&&(q(),t(0,"path",2)),s&2){let n=b.$implicit;I("d",n.path())("stroke-width",4)("stroke","red")("marker-end",n.markerEnd())}}var U=(()=>{class s{constructor(){this.notifyService=E(O),this.nodes=[{id:"1",point:{x:100,y:100},type:G,data:{redSquareText:"Red"}},{id:"2",point:{x:250,y:250},type:Y,data:{blueSquareText:"Blue"}}],this.edges=[]}onConnect(n){this.edges=[...this.edges,j({id:`${n.source} -> ${n.target}`,type:"template",curve:"smooth-step",markers:{end:{type:"arrow"}}},n)]}static{this.\u0275fac=function(e){return new(e||s)}}static{this.\u0275cmp=l({type:s,selectors:[["ng-component"]],standalone:!0,features:[p],decls:2,vars:2,consts:[["view","auto",3,"nodes","edges"],["edge",""],["fill","none"]],template:function(e,a){e&1&&(d(0,"vflow",0),C(1,X,1,4,"ng-template",1),o()),e&2&&v("nodes",a.nodes)("edges",a.edges)},dependencies:[k,M],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return s})();var Z={title:"Custom nodes",mdFile:"./index.md",category:A,demos:{CustomNodesDemoComponent:L,CustomComponentNodesDemoComponent:U},keyword:"FeaturesCustomNodes",order:2},f=Z;var $=[];var ss={CustomNodesDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span>, signal } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/DynamicNode" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">DynamicNode</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'projects/ngx-vflow-lib/src/public-api'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;vflow view="auto" [nodes]="nodes" [edges]="edges"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;ng-template let-ctx nodeHtml></span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;div class="custom-node" selectable [class.custom-node_selected]="ctx.selected()"></span>
</span><span class="line ngde"><span class="hljs-string ngde">        {{ ctx.node.data().text }}</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">        &#x3C;handle type="source" position="right" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/ng-template></span>
</span><span class="line ngde"><span class="hljs-string ngde">  &#x3C;/vflow>\`</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [
</span><span class="line ngde">    <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">      :host {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 100%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 100%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      .custom-node {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 150px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 100px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        background: linear-gradient(to right, #00d2ff, #3a7bd5);</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border: 1px solid gray;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        display: flex;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        align-items: center;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        padding-left: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        padding-right: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">        &#x26;_selected {</span>
</span><span class="line ngde"><span class="hljs-string ngde">          border: 2px solid gray;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        }</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde">    \`</span>,
</span><span class="line ngde">  ],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">CustomNodesDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/DynamicNode" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">DynamicNode</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">100</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: <span class="hljs-title function_ ngde">signal</span>({
</span><span class="line ngde">        <span class="hljs-attr ngde">customType</span>: <span class="hljs-string ngde">'gradient'</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'I am a nice custom node with gradient'</span>,
</span><span class="line ngde">      }),
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">250</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">250</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-string ngde">'Default'</span>),
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">}
</span></code></pre>`}],CustomComponentNodesDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span>, inject } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">NgDocNotifyService</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@ng-doc/ui-kit'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'projects/ngx-vflow-lib/src/public-api'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">BlueSquareNodeComponent</span>, <span class="hljs-title class_ ngde">BlueSquareData</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'./components/blue-square-node.component'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">RedSquareNodeComponent</span>, <span class="hljs-title class_ ngde">RedSquareData</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'./components/red-square-node.component'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;vflow view="auto" [nodes]="nodes" [edges]="edges"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;ng-template let-ctx edge></span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;svg:path</span>
</span><span class="line ngde"><span class="hljs-string ngde">        fill="none"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [attr.d]="ctx.path()"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [attr.stroke-width]="4"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [attr.stroke]="'red'"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [attr.marker-end]="ctx.markerEnd()" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/ng-template></span>
</span><span class="line ngde"><span class="hljs-string ngde">  &#x3C;/vflow>\`</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [
</span><span class="line ngde">    <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">      :host {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 100%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 100%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde">    \`</span>,
</span><span class="line ngde">  ],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">CustomComponentNodesDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">private</span> notifyService = <span class="hljs-title function_ ngde">inject</span>(<span class="hljs-title class_ ngde">NgDocNotifyService</span>);
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">100</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">RedSquareNodeComponent</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">redSquareText</span>: <span class="hljs-string ngde">'Red'</span>,
</span><span class="line ngde">      } satisfies <span class="hljs-title class_ ngde">RedSquareData</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">250</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">250</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">BlueSquareNodeComponent</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">blueSquareText</span>: <span class="hljs-string ngde">'Blue'</span>,
</span><span class="line ngde">      } satisfies <span class="hljs-title class_ ngde">BlueSquareData</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [
</span><span class="line ngde">    <span class="hljs-comment ngde">// {</span>
</span><span class="line ngde">    <span class="hljs-comment ngde">//   id: '1 -> 2',</span>
</span><span class="line ngde">    <span class="hljs-comment ngde">//   source: '1',</span>
</span><span class="line ngde">    <span class="hljs-comment ngde">//   target: '2',</span>
</span><span class="line ngde">    <span class="hljs-comment ngde">// },</span>
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-title function_ ngde">onConnect</span>(<span class="hljs-params ngde">connection: <a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span> = [
</span><span class="line ngde">      ...<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span>,
</span><span class="line ngde">      {
</span><span class="line ngde">        <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\`<span class="hljs-subst ngde">\${connection.source}</span> -> <span class="hljs-subst ngde">\${connection.target}</span>\`</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'template'</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">curve</span>: <span class="hljs-string ngde">'smooth-step'</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">markers</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">end</span>: { <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'arrow'</span> },
</span><span class="line ngde">        },
</span><span class="line ngde">        ...connection,
</span><span class="line ngde">      },
</span><span class="line ngde">    ];
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre>`}]},z=ss;var ns=`<h1 id="custom-nodes" class="ngde">Custom nodes<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/custom-nodes#custom-nodes"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><ng-doc-blockquote type="warning" class="ngde"><p class="ngde">Be careful with CSS rules applied to node content. Custom nodes are implemented with SVG's <code class="ngde">foreignObject</code> element, and Safari has issues with some CSS rules inside <code class="ngde">foreignObject</code>. Therefore, please check this browser when applying complex styling.</p></ng-doc-blockquote><p class="ngde">This is where things become a lot more interesting. You can create custom nodes with HTML and CSS.</p><h2 id="template-nodes" class="ngde">Template nodes<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/custom-nodes#template-nodes"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">You can create custom nodes with <code class="ngde">ng-template</code></p><p class="ngde">Follow these steps to achieve this:</p><ol class="ngde"><li class="ngde">Set <code class="ngde">type</code> of node to <code class="ngde">html-template</code></li><li class="ngde">Provide <code class="ngde">ng-template</code> with <code class="ngde">nodeHtml</code> selector inside <code class="ngde">vflow</code></li><li class="ngde">Write your HTML inside this template</li><li class="ngde">You can also pass any data with <code class="ngde">data</code> field on node, and then get it inside <code class="ngde">ng-template</code></li></ol><ng-doc-demo-pane componentname="CustomNodesDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane><h2 id="component-nodes" class="ngde">Component nodes<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/custom-nodes#component-nodes"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">Another approach is to render nodes from components.</p><p class="ngde">Its benefits:</p><ul class="ngde"><li class="ngde">type-safe node data access</li><li class="ngde">good for complex flows with many different node types</li></ul><p class="ngde">Its limitations</p><ul class="ngde"><li class="ngde">it's harder to manage events because such nodes are rendered dynamically</li></ul><p class="ngde">How to create component node:</p><ol class="ngde"><li class="ngde">Create a regular angular standalone component</li><li class="ngde">Extend with <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/CustomNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomNodeComponent</a></code> (please see the reference of this base component to get an idea of what fields you could use in your custom component node), otherwise it won't work!</li><li class="ngde">Pass your data interface to generic of <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/CustomNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomNodeComponent</a></code> to use in component. This <code class="ngde">data</code> comes from <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></code> definition</li><li class="ngde">Use your new component in <code class="ngde">type</code> field of <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></code>. Library will render your node for you</li></ol><ng-doc-demo-pane componentname="CustomComponentNodesDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane><h3 id="handling-events" class="ngde">Handling events<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/custom-nodes#handling-events"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h3><ng-doc-blockquote type="warning" class="ngde"><p class="ngde">This is an experimental API</p></ng-doc-blockquote><p class="ngde">There is a <code class="ngde">(onComponentNodeEvent)</code> event on <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/VflowComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">VflowComponent</a></code>. Here is how it works:</p><ol class="ngde"><li class="ngde">It accumulates every <code class="ngde">EventEmitter</code> of every component node of your flow</li><li class="ngde">It emits on every emit of those emitters</li></ol><p class="ngde">The shape of this accumulator-event contains following useful info:</p><pre class="ngde hljs"><code class="hljs language-ts code-lines ngde" lang="ts" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">type</span> <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/AnyComponentNodeEvent" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">AnyComponentNodeEvent</a></span> = {
</span><span class="line ngde">  <span class="hljs-attr ngde">nodeId</span>: <span class="hljs-built_in ngde">string</span>; <span class="hljs-comment ngde">// Id of node where event occurs</span>
</span><span class="line ngde">  <span class="hljs-attr ngde">eventName</span>: <span class="hljs-built_in ngde">string</span>;
</span><span class="line ngde">  <span class="hljs-attr ngde">eventPayload</span>: <span class="hljs-built_in ngde">unknown</span>;
</span><span class="line ngde">};
</span></code></pre><p class="ngde">The Library also includes <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/type-aliases/ComponentNodeEvent" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">ComponentNodeEvent</a></code> helper type to get type-safe event, where you just need to pass an array of your custom components in generic, and this type will infer proper types for <code class="ngde">eventName</code> and <code class="ngde">eventPayload</code>:</p><pre class="ngde hljs"><code class="hljs language-ts code-lines ngde" lang="ts" name="" icon="" highlightedlines="[]"><span class="line ngde">  ...
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-title function_ ngde">handleComponentEvent</span>(<span class="hljs-params ngde">event: <a href="/api/ngx-vflow/type-aliases/ComponentNodeEvent" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">ComponentNodeEvent</a>&#x3C;[RedSquareNodeComponent, BlueSquareNodeComponent]></span>) {
</span><span class="line ngde">    <span class="hljs-keyword ngde">if</span> (event.<span class="hljs-property ngde">eventName</span> === <span class="hljs-string ngde">'redSquareEvent'</span>) {
</span><span class="line ngde">      <span class="hljs-variable language_ ngde">console</span>.<span class="hljs-title function_ ngde">log</span>(event.<span class="hljs-property ngde">eventPayload</span>)
</span><span class="line ngde">    }
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-keyword ngde">if</span> (event.<span class="hljs-property ngde">eventName</span> === <span class="hljs-string ngde">'blueSquareEvent'</span>) {
</span><span class="line ngde">      <span class="hljs-variable language_ ngde">console</span>.<span class="hljs-title function_ ngde">log</span>(event.<span class="hljs-property ngde">eventPayload</span>.<span class="hljs-property ngde">x</span> + event.<span class="hljs-property ngde">eventPayload</span>.<span class="hljs-property ngde">y</span>)
</span><span class="line ngde">    }
</span><span class="line ngde">  }
</span><span class="line ngde">
</span><span class="line ngde">  ..
</span></code></pre>`,es=(()=>{class s extends S{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=ns,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/pages/custom-nodes/index.md?message=docs(custom-nodes): describe your changes here...",this.page=f,this.demoAssets=z}static{this.\u0275fac=function(e){return new(e||s)}}static{this.\u0275cmp=l({type:s,selectors:[["ng-doc-page-features-custom-nodes"]],standalone:!0,features:[F([{provide:S,useExisting:s},$,f.providers??[]]),g,p],decls:1,vars:0,template:function(e,a){e&1&&t(0,"ng-doc-page")},dependencies:[R],encapsulation:2,changeDetection:0})}}return s})(),as=[D(j({},(0,W.isRoute)(f.route)?f.route:{}),{path:"",component:es,title:"Custom nodes"})],Bs=as;export{es as DynamicComponent,Bs as default};
