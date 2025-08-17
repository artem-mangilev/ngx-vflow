import{a as N}from"./chunk-UUHU3CBA.js";import"./chunk-S3I3S5BX.js";import{B as k,D,p as b}from"./chunk-YKUHACPP.js";import{a as v}from"./chunk-XEAWODMG.js";import"./chunk-5DYL7VP6.js";import{a as g}from"./chunk-PKRD3RVL.js";import{Ba as c,Ga as m,R as l,Ra as y,Sa as u,Ta as p,aa as j,jb as x,lb as w,na as f,pb as C,qb as t,wc as T}from"./chunk-CG7QMWE5.js";import{a as r,b as h,g as P}from"./chunk-ODLL2QMY.js";var S=P(T());var _=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:100,y:100},type:i,data:{text:"Node 1"}},{id:"2",point:{x:200,y:200},type:i,data:{text:"Node 2"}},{id:"3",point:{x:100,y:300},type:i,data:{text:"Node 3"}}],this.edges=[{id:"1 -> 2",source:"1",target:"2",markers:{end:{type:"arrow-closed"}},floating:!0},{id:"2 -> 3",source:"2",target:"3",markers:{end:{type:"arrow-closed"}},floating:!0}],this.connection={mode:"loose"}}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=l({type:s,selectors:[["ng-component"]],standalone:!0,features:[t],decls:1,vars:3,consts:[["view","auto",3,"nodes","edges","connection"]],template:function(n,a){n&1&&p(0,"vflow",0),n&2&&m("nodes",a.nodes)("edges",a.edges)("connection",a.connection)},dependencies:[D],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return s})(),i=(()=>{class s extends b{static{this.\u0275fac=(()=>{let e;return function(a){return(e||(e=j(s)))(a||s)}})()}static{this.\u0275cmp=l({type:s,selectors:[["ng-component"]],standalone:!0,features:[c,t],decls:6,vars:1,consts:[[1,"node"],["type","source","position","top","id","a"],["type","source","position","right","id","b"],["type","source","position","bottom","id","c"],["type","source","position","left","id","d"]],template:function(n,a){if(n&1&&(y(0,"div",0),x(1),p(2,"handle",1)(3,"handle",2)(4,"handle",3)(5,"handle",4),u()),n&2){let o;f(),w(" ",(o=a.data())==null?null:o.text," ")}},dependencies:[k],styles:[".node[_ngcontent-%COMP%]{width:100px;height:50px;border:1.5px solid #1b262c;border-radius:5px;display:flex;align-items:center;justify-content:center;color:#000;background-color:#fff}"],changeDetection:0})}}return s})();var A={title:"Floating Edges",mdFile:"./index.md",category:N,demos:{FloatingEdgesDemoComponent:_},order:2},d=A;var E=[];var V={FloatingEdgesDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/CustomNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomNodeComponent</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\` &#x3C;vflow view="auto" [nodes]="nodes" [edges]="edges" [connection]="connection" /> \`</span>,
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
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">FloatingEdgesDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">100</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">FloatingEdgesNodeComponent</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'<a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a> 1'</span>,
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">FloatingEdgesNodeComponent</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'<a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a> 2'</span>,
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">100</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">300</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">FloatingEdgesNodeComponent</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'<a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a> 3'</span>,
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">markers</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">end</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'arrow-closed'</span>,
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">      <span class="hljs-attr ngde">floating</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2 -> 3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">markers</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">end</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'arrow-closed'</span>,
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">      <span class="hljs-attr ngde">floating</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">connection</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></span> = {
</span><span class="line ngde">    <span class="hljs-attr ngde">mode</span>: <span class="hljs-string ngde">'loose'</span>,
</span><span class="line ngde">  };
</span><span class="line ngde">}
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-keyword ngde">interface</span> <span class="hljs-title class_ ngde">FloatingEdgesNodeData</span> {
</span><span class="line ngde">  <span class="hljs-attr ngde">text</span>: <span class="hljs-built_in ngde">string</span>;
</span><span class="line ngde">}
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;div class="node"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    {{ data()?.text }}</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;handle type="source" position="top" id="a" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;handle type="source" position="right" id="b" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;handle type="source" position="bottom" id="c" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;handle type="source" position="left" id="d" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">  &#x3C;/div>\`</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [
</span><span class="line ngde">    <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">      .node {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 100px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 50px;</span>
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
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">FloatingEdgesNodeComponent</span> <span class="hljs-keyword ngde">extends</span> <span class="hljs-title class_ inherited__ ngde"><a href="/api/ngx-vflow/classes/CustomNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomNodeComponent</a></span>&#x3C;<span class="hljs-title class_ ngde">FloatingEdgesNodeData</span>> {}
</span></code></pre>`}]},F=V;var I='<h1 id="floating-edges" class="ngde">Floating Edges<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/edges/floating-edges#floating-edges"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">The library supports floating edges. A floating edge is an edge that connects the closest handles of the source and target nodes. You can enable floating edges using the <code class="ngde">floating</code> flag on <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></code>.</p><ng-doc-blockquote type="info" class="ngde"><p class="ngde">Since the library always looks for the closest handles between nodes, there can only be one edge between any two nodes. Keep this in mind when building your flows.</p><p class="ngde">This limitation may be addressed in future releases.</p></ng-doc-blockquote><ng-doc-demo-pane componentname="FloatingEdgesDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>',M=(()=>{class s extends g{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=I,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/categories/edges/floating-edges/index.md?message=docs(floating-edges): describe your changes here...",this.page=d,this.demoAssets=F}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=l({type:s,selectors:[["ng-doc-page-features-edges-floating-edges"]],standalone:!0,features:[C([{provide:g,useExisting:s},E,d.providers??[]]),c,t],decls:1,vars:0,template:function(n,a){n&1&&p(0,"ng-doc-page")},dependencies:[v],encapsulation:2,changeDetection:0})}}return s})(),R=[h(r({},(0,S.isRoute)(d.route)?d.route:{}),{path:"",component:M,title:"Floating Edges"})],$=R;export{M as DynamicComponent,$ as default};
