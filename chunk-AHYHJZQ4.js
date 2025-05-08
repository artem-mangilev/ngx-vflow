import{a as b}from"./chunk-UUHU3CBA.js";import"./chunk-S3I3S5BX.js";import{A as w,t as x}from"./chunk-UZDESVOV.js";import{a as y}from"./chunk-R2FYFHTZ.js";import"./chunk-FGWLUFMG.js";import{a as g}from"./chunk-JLOZFYHF.js";import{Ba as i,Ga as r,R as c,Ra as h,Sa as j,Ta as f,Za as m,pb as u,qb as d,wc as _}from"./chunk-VFFNGGE6.js";import{a as p,b as t,g as E}from"./chunk-ODLL2QMY.js";var k=E(_());var v=(()=>{class n{constructor(){this.nodes=[{id:"1",point:{x:100,y:100},type:"default",text:"1"},{id:"2",point:{x:600,y:100},type:"default",text:"2"},{id:"3",point:{x:100,y:300},type:"default",text:"3"},{id:"4",point:{x:600,y:300},type:"default",text:"4"}],this.edges=[{id:"1 -> 2",source:"1",target:"2",type:"default",reconnectable:!0,edgeLabels:{center:{type:"default",text:"Reconnectable from both sides",style:{color:"black",lineHeight:"80%",borderRadius:"5px"}}}},{id:"3 -> 4",source:"3",target:"4",type:"default",reconnectable:"source",edgeLabels:{center:{type:"default",text:"Reconnectable only from source side",style:{color:"black",lineHeight:"80%",borderRadius:"5px"}}}}]}reconnect({oldEdge:a,connection:{source:s,target:e}}){this.edges=[...this.edges.filter(o=>o!==a),t(p({},a),{id:`${s} -> ${e}`,source:s,target:e})]}static{this.\u0275fac=function(s){return new(s||n)}}static{this.\u0275cmp=c({type:n,selectors:[["ng-component"]],standalone:!0,features:[d],decls:1,vars:2,consts:[["view","auto",3,"onReconnect","nodes","edges"]],template:function(s,e){s&1&&(h(0,"vflow",0),m("onReconnect",function(D){return e.reconnect(D)}),j()),s&2&&r("nodes",e.nodes)("edges",e.edges)},dependencies:[w,x],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return n})();var N={title:"Reconnect Edge",mdFile:"./index.md",category:b,demos:{ReconnectionDemoComponent:v},order:6},l=N;var R=[];var S={ReconnectionDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/ReconnectionEvent" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ReconnectionEvent</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;vflow view="auto" [nodes]="nodes" [edges]="edges" (onReconnect)="reconnect($event)" /> \`</span>,
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
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">ReconnectionDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">100</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\`1\`</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">600</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\`2\`</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">100</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">300</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\`3\`</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'4'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">600</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">300</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\`4\`</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">reconnectable</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">edgeLabels</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">center</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">          <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'Reconnectable from both sides'</span>,
</span><span class="line ngde">          <span class="hljs-attr ngde">style</span>: {
</span><span class="line ngde">            <span class="hljs-attr ngde">color</span>: <span class="hljs-string ngde">'black'</span>,
</span><span class="line ngde">            <span class="hljs-attr ngde">lineHeight</span>: <span class="hljs-string ngde">'80%'</span>,
</span><span class="line ngde">            <span class="hljs-attr ngde">borderRadius</span>: <span class="hljs-string ngde">'5px'</span>,
</span><span class="line ngde">          },
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'3 -> 4'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'4'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">reconnectable</span>: <span class="hljs-string ngde">'source'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">edgeLabels</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">center</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">          <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'Reconnectable only from source side'</span>,
</span><span class="line ngde">          <span class="hljs-attr ngde">style</span>: {
</span><span class="line ngde">            <span class="hljs-attr ngde">color</span>: <span class="hljs-string ngde">'black'</span>,
</span><span class="line ngde">            <span class="hljs-attr ngde">lineHeight</span>: <span class="hljs-string ngde">'80%'</span>,
</span><span class="line ngde">            <span class="hljs-attr ngde">borderRadius</span>: <span class="hljs-string ngde">'5px'</span>,
</span><span class="line ngde">          },
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">reconnect</span>(<span class="hljs-params ngde">{ oldEdge, connection: { source, target } }: <a href="/api/ngx-vflow/interfaces/ReconnectionEvent" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ReconnectionEvent</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span> = [
</span><span class="line ngde">      ...<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span>.<span class="hljs-title function_ ngde">filter</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">edge</span>) =></span> edge !== oldEdge),
</span><span class="line ngde">      {
</span><span class="line ngde">        ...oldEdge,
</span><span class="line ngde">        <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\`<span class="hljs-subst ngde">\${source}</span> -> <span class="hljs-subst ngde">\${target}</span>\`</span>,
</span><span class="line ngde">        source,
</span><span class="line ngde">        target,
</span><span class="line ngde">      },
</span><span class="line ngde">    ];
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre>`}]},C=S;var O='<h1 id="reconnect-edge" class="ngde">Reconnect Edge<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/edges/reconnect-edges#reconnect-edge"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">Edges can be reconnected. To reconnect an edge, follow these steps:</p><ol class="ngde"><li class="ngde">Mark the <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></code> object as <code class="ngde">reconnectable</code>.</li><li class="ngde">Create a handler for the <code class="ngde">(onReconnect)</code> event.</li><li class="ngde">This handler accepts a <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/ReconnectionEvent" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ReconnectionEvent</a></code> argument, which contains a new <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></code> and the <code class="ngde">oldEdge</code> that you are trying to reconnect.</li><li class="ngde">Update the <code class="ngde">Edge[]</code> list with a new edge based on the <code class="ngde">oldEdge</code> and the new <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></code>, then remove the reference to the old edge from the list.</li></ol><ng-doc-demo-pane componentname="ReconnectionDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>',T=(()=>{class n extends g{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=O,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/categories/edges/reconnect-edges/index.md?message=docs(reconnect-edges): describe your changes here...",this.page=l,this.demoAssets=C}static{this.\u0275fac=function(s){return new(s||n)}}static{this.\u0275cmp=c({type:n,selectors:[["ng-doc-page-features-edges-reconnect-edges"]],standalone:!0,features:[u([{provide:g,useExisting:n},R,l.providers??[]]),i,d],decls:1,vars:0,template:function(s,e){s&1&&f(0,"ng-doc-page")},dependencies:[y],encapsulation:2,changeDetection:0})}}return n})(),I=[t(p({},(0,k.isRoute)(l.route)?l.route:{}),{path:"",component:T,title:"Reconnect Edge"})],J=I;export{T as DynamicComponent,J as default};
