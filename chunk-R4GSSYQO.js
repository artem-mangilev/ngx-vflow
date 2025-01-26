import{a as y}from"./chunk-S3I3S5BX.js";import{s as v,x as C}from"./chunk-JMEWMEDY.js";import{a as u}from"./chunk-SH6HWCPG.js";import"./chunk-CQCG3KCY.js";import{a as c}from"./chunk-WT6KFS7F.js";import{Ba as d,Ga as g,Pa as r,Qa as h,R as l,Ra as f,Xa as m,nb as j,ob as p,vc as S}from"./chunk-VLX6VUPD.js";import{a as o,b as i,g as b}from"./chunk-P2VZOJAX.js";var k=b(S());var w=(()=>{class n{constructor(){this.nodes=[{id:"1",point:{x:100,y:100},type:"default",text:"1"},{id:"2",point:{x:200,y:200},type:"default",text:"2"}],this.edges=[],this.conectionSettings={validator:a=>a.source==="1"&&a.target==="2"}}createEdge({source:a,target:s}){this.edges=[...this.edges,{id:`${a} -> ${s}`,source:a,target:s}]}static{this.\u0275fac=function(s){return new(s||n)}}static{this.\u0275cmp=l({type:n,selectors:[["ng-component"]],standalone:!0,features:[p],decls:1,vars:3,consts:[["view","auto",3,"onConnect","nodes","edges","connection"]],template:function(s,e){s&1&&(r(0,"vflow",0),m("onConnect",function(_){return e.createEdge(_)}),h()),s&2&&g("nodes",e.nodes)("edges",e.edges)("connection",e.conectionSettings)},dependencies:[C,v],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return n})();var E={title:"Connection validation",mdFile:"./index.md",category:y,demos:{ConnectionValidationDemoComponent:w},order:4},t=E;var x=[];var P={ConnectionValidationDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;vflow</span>
</span><span class="line ngde"><span class="hljs-string ngde">    view="auto"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [nodes]="nodes"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [edges]="edges"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [connection]="conectionSettings"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    (onConnect)="createEdge($event)" /> \`</span>,
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
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">ConnectionValidationDemoComponent</span> {
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
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">conectionSettings</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></span> = {
</span><span class="line ngde">    <span class="hljs-attr ngde">validator</span>: <span class="hljs-function ngde">(<span class="hljs-params ngde">connection</span>) =></span> connection.<span class="hljs-property ngde">source</span> === <span class="hljs-string ngde">'1'</span> &#x26;&#x26; connection.<span class="hljs-property ngde">target</span> === <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">  };
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">createEdge</span>(<span class="hljs-params ngde">{ source, target }: <a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span> = [
</span><span class="line ngde">      ...<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span>,
</span><span class="line ngde">      {
</span><span class="line ngde">        <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\`<span class="hljs-subst ngde">\${source}</span> -> <span class="hljs-subst ngde">\${target}</span>\`</span>,
</span><span class="line ngde">        source,
</span><span class="line ngde">        target,
</span><span class="line ngde">      },
</span><span class="line ngde">    ];
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre>`}]},D=P;var N=`<h1 id="connection-validation" class="ngde">Connection validation<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/connection-validation#connection-validation"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde"><code class="ngde">ngx-vflow</code> supports real-time synchronous validation of connections. Validation occurs when a user attempts to create a new edge. By default, every connection is valid, but you can provide a <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></code> with a <code class="ngde">validatior</code> callback where you specify the validation logic.</p><p class="ngde">For example, in this case, validation only passes connections from node 1 to node 2. If the <code class="ngde">validator</code> returns <code class="ngde">false</code>, the <code class="ngde">(onConnect)</code> event won't be triggered because there is no valid connection.</p><ng-doc-demo-pane componentname="ConnectionValidationDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>`,O=(()=>{class n extends c{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=N,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/pages/connection-validation/index.md?message=docs(connection-validation): describe your changes here...",this.page=t,this.demoAssets=D}static{this.\u0275fac=function(s){return new(s||n)}}static{this.\u0275cmp=l({type:n,selectors:[["ng-doc-page-features-connection-validation"]],standalone:!0,features:[j([{provide:c,useExisting:n},x,t.providers??[]]),d,p],decls:1,vars:0,template:function(s,e){s&1&&f(0,"ng-doc-page")},dependencies:[u],encapsulation:2,changeDetection:0})}}return n})(),I=[i(o({},(0,k.isRoute)(t.route)?t.route:{}),{path:"",component:O,title:"Connection validation"})],H=I;export{O as DynamicComponent,H as default};
