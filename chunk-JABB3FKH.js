import{a as w}from"./chunk-UUHU3CBA.js";import"./chunk-S3I3S5BX.js";import{t as y,z as k}from"./chunk-AQENXFQJ.js";import"./chunk-NA7FJBPQ.js";import{a as u}from"./chunk-ZBKCENK6.js";import"./chunk-G5N4YGVJ.js";import{a as o}from"./chunk-AKRIWIS4.js";import{T as b}from"./chunk-QMHLIXQX.js";import{$b as r,Ac as d,Gb as g,Qb as i,ac as h,bc as m,hc as f,wa as c,zc as j}from"./chunk-Z42XPK5A.js";import{a as t,b as p,g as S}from"./chunk-ODLL2QMY.js";var D=S(b());var C=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:100,y:100},type:"default",text:"1"},{id:"2",point:{x:200,y:200},type:"default",text:"2"}],this.edges=[],this.connectionSettings={marker:{type:"arrow"}}}createEdge(e){this.edges=[...this.edges,p(t({},e),{id:`${e.source} -> ${e.target}`,markers:{start:{type:"arrow-closed"},end:{type:"arrow"}}})]}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=c({type:s,selectors:[["ng-component"]],standalone:!0,features:[d],decls:1,vars:3,consts:[["view","auto",3,"connect","nodes","edges","connection"]],template:function(n,a){n&1&&(r(0,"vflow",0),f("connect",function(_){return a.createEdge(_)}),h()),n&2&&i("nodes",a.nodes)("edges",a.edges)("connection",a.connectionSettings)},dependencies:[k,y],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return s})();var M={title:"Markers",mdFile:"./index.md",category:w,demos:{MarkersDemoComponent:C},order:7},l=M;var v=[];var P={MarkersDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;vflow</span>
</span><span class="line ngde"><span class="hljs-string ngde">    view="auto"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [nodes]="nodes"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [edges]="edges"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [connection]="connectionSettings"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    (connect)="createEdge($event)" /> \`</span>,
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
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">MarkersDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">100</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\`1\`</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\`2\`</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">connectionSettings</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></span> = {
</span><span class="line ngde">    <span class="hljs-attr ngde">marker</span>: {
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'arrow'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  };
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">createEdge</span>(<span class="hljs-params ngde">connection: <a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span> = [
</span><span class="line ngde">      ...<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span>,
</span><span class="line ngde">      {
</span><span class="line ngde">        ...connection,
</span><span class="line ngde">        <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\`<span class="hljs-subst ngde">\${connection.source}</span> -> <span class="hljs-subst ngde">\${connection.target}</span>\`</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">markers</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">start</span>: {
</span><span class="line ngde">            <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'arrow-closed'</span>,
</span><span class="line ngde">          },
</span><span class="line ngde">          <span class="hljs-attr ngde">end</span>: {
</span><span class="line ngde">            <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'arrow'</span>,
</span><span class="line ngde">          },
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">    ];
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre>`}]},x=P;var N='<h1 id="markers" class="ngde">Markers<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/edges/markers#markers"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">You can create markers for both edges and connections.</p><ul class="ngde"><li class="ngde"><strong class="ngde">Edges</strong>: Specify <code class="ngde">start</code> and <code class="ngde">end</code> markers for corresponding parts of the edge. Currently, markers are limited to two <code class="ngde">type</code>s: <code class="ngde">arrow</code> and <code class="ngde">arrow-closed</code>.</li><li class="ngde"><strong class="ngde">Connections</strong>: You can specify an end marker using the <code class="ngde">marker</code> property in <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></code>.</li></ul><ng-doc-demo-pane componentname="MarkersDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>',O=(()=>{class s extends o{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=N,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/categories/edges/markers/index.md?message=docs(markers): describe your changes here...",this.page=l,this.demoAssets=x}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=c({type:s,selectors:[["ng-doc-page-features-edges-markers"]],standalone:!0,features:[j([{provide:o,useExisting:s},v,l.providers??[]]),g,d],decls:1,vars:0,template:function(n,a){n&1&&m(0,"ng-doc-page")},dependencies:[u],encapsulation:2,changeDetection:0})}}return s})(),I=[p(t({},(0,D.isRoute)(l.route)?l.route:{}),{path:"",component:O,title:"Markers"})],J=I;export{O as DynamicComponent,J as default};
