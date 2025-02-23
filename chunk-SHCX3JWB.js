import{a as D}from"./chunk-HYYUKD64.js";import{a as P}from"./chunk-S3I3S5BX.js";import{r as E,w as S}from"./chunk-SAP5PBCS.js";import{a as O}from"./chunk-GPBMHN32.js";import"./chunk-MUKF72JZ.js";import{a as T}from"./chunk-T6GQPSCF.js";import{Ba as H,Ea as _,Ga as v,O as y,R as r,Ra as g,Sa as c,Ta as F,Xa as w,Y as p,Z as t,Za as f,_a as N,gb as x,hb as b,jb as h,kb as j,na as o,pb as I,qb as m,xc as Y,za as C,zb as k}from"./chunk-FDES3R26.js";import{a as V,b as A,g as Q}from"./chunk-P2VZOJAX.js";var L=Q(Y());var G=["toast"];function W(a,z){if(a&1&&(g(0,"h3"),h(1),c(),g(2,"pre"),h(3),c()),a&2){let s=N();o(),j(s.toastData==null?null:s.toastData.title),o(2),j(s.toastData==null?null:s.toastData.json)}}var R=(()=>{class a{constructor(){this.notifyService=y(D),this.toastTemplate=C("toast"),this.nodes=[{id:"1",point:{x:100,y:100},type:"default",text:"1"},{id:"2",point:{x:200,y:200},type:"default",text:"2"}],this.edges=[],this.toastData={}}createEdge({source:s,target:n}){this.edges=[...this.edges,{id:`${s} -> ${n}`,source:s,target:n}]}handleNodeChanges(s){this.toastData={title:"(onNodesChange)",json:JSON.stringify(s,null,2)},this.notifyService.notify(this.toastTemplate())}handleEdgeChanges(s){this.toastData={title:"(onEdgesChange)",json:JSON.stringify(s,null,2)},this.notifyService.notify(this.toastTemplate())}static{this.\u0275fac=function(n){return new(n||a)}}static{this.\u0275cmp=r({type:a,selectors:[["ng-component"]],viewQuery:function(n,e){n&1&&x(e.toastTemplate,G,5),n&2&&b()},standalone:!0,features:[m],decls:3,vars:2,consts:[["toast",""],["view","auto",3,"onConnect","onNodesChange","onEdgesChange","nodes","edges"]],template:function(n,e){if(n&1){let d=w();g(0,"vflow",1),f("onConnect",function(l){return p(d),t(e.createEdge(l))})("onNodesChange",function(l){return p(d),t(e.handleNodeChanges(l))})("onEdgesChange",function(l){return p(d),t(e.handleEdgeChanges(l))}),c(),_(1,W,4,2,"ng-template",null,0,k)}n&2&&v("nodes",e.nodes)("edges",e.edges)},dependencies:[S,E],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return a})();var B=["toast"];function K(a,z){if(a&1&&(g(0,"h3"),h(1),c(),g(2,"pre"),h(3),c()),a&2){let s=N();o(),j(s.toastData==null?null:s.toastData.title),o(2),j(s.toastData==null?null:s.toastData.json)}}var U=(()=>{class a{constructor(){this.notifyService=y(D),this.toastTemplate=C("toast"),this.nodes=[{id:"1",point:{x:100,y:100},type:"default",text:"1"},{id:"2",point:{x:200,y:200},type:"default",text:"2"}],this.edges=[],this.toastData={}}createEdge({source:s,target:n}){this.edges=[...this.edges,{id:`${s} -> ${n}`,source:s,target:n}]}handleNodePositionChange(s){this.toastData={title:"(onNodesChange.position.single)",json:JSON.stringify(s,null,2)},this.notifyService.notify(this.toastTemplate())}handleNodeSelectChange(s){this.toastData={title:"(onNodesChange.select.single)",json:JSON.stringify(s,null,2)},this.notifyService.notify(this.toastTemplate())}handleNodesAddChange(s){this.toastData={title:"(onNodesChange.add.many)",json:JSON.stringify(s,null,2)},this.notifyService.notify(this.toastTemplate())}handleEdgesAddChange(s){this.toastData={title:"(onEdgesChange.add)",json:JSON.stringify(s,null,2)},this.notifyService.notify(this.toastTemplate())}addNodes(){this.nodes=[...this.nodes,{id:crypto.randomUUID(),point:{x:0,y:0},type:"default",text:"random"},{id:crypto.randomUUID(),point:{x:300,y:300},type:"default",text:"random"}]}static{this.\u0275fac=function(n){return new(n||a)}}static{this.\u0275cmp=r({type:a,selectors:[["ng-component"]],viewQuery:function(n,e){n&1&&x(e.toastTemplate,B,5),n&2&&b()},standalone:!0,features:[m],decls:5,vars:2,consts:[["toast",""],[3,"click"],["view","auto",3,"onConnect","onNodesChange.position.single","onNodesChange.select.single","onNodesChange.add.many","onEdgesChange.add","nodes","edges"]],template:function(n,e){if(n&1){let d=w();g(0,"button",1),f("click",function(){return p(d),t(e.addNodes())}),h(1,"Add nodes"),c(),g(2,"vflow",2),f("onConnect",function(l){return p(d),t(e.createEdge(l))})("onNodesChange.position.single",function(l){return p(d),t(e.handleNodePositionChange(l))})("onNodesChange.select.single",function(l){return p(d),t(e.handleNodeSelectChange(l))})("onNodesChange.add.many",function(l){return p(d),t(e.handleNodesAddChange(l))})("onEdgesChange.add",function(l){return p(d),t(e.handleEdgesAddChange(l))}),c(),_(3,K,4,2,"ng-template",null,0,k)}n&2&&(o(2),v("nodes",e.nodes)("edges",e.edges))},dependencies:[S,E],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return a})();var X={title:"Handling changes",mdFile:"./index.md",category:P,keyword:"FeaturesHandlingChanges",demos:{HandlingChangesDemoComponent:R,HandlingChangesFilteredDemoComponent:U},order:3},u=X;var J=[];var Z={HandlingChangesDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span>, <span class="hljs-title class_ ngde">TemplateRef</span>, inject, viewChild } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">NgDocNotifyService</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@ng-doc/ui-kit'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/EdgeChange" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">EdgeChange</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/NodeChange" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">NodeChange</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">templateUrl</span>: <span class="hljs-string ngde">'./handling-changes-demo.component.html'</span>,
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
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">HandlingChangesDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">private</span> notifyService = <span class="hljs-title function_ ngde">inject</span>(<span class="hljs-title class_ ngde">NgDocNotifyService</span>);
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> toastTemplate = viewChild&#x3C;<span class="hljs-title class_ ngde">TemplateRef</span>&#x3C;<span class="hljs-built_in ngde">object</span>>>(<span class="hljs-string ngde">'toast'</span>);
</span><span class="line ngde">
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
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">toastData</span>: <span class="hljs-built_in ngde">any</span> = {};
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
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">handleNodeChanges</span>(<span class="hljs-params ngde">changes: <a href="/api/ngx-vflow/type-aliases/NodeChange" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">NodeChange</a>[]</span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">toastData</span> = {
</span><span class="line ngde">      <span class="hljs-attr ngde">title</span>: <span class="hljs-string ngde">'(onNodesChange)'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">json</span>: <span class="hljs-title class_ ngde">JSON</span>.<span class="hljs-title function_ ngde">stringify</span>(changes, <span class="hljs-literal ngde">null</span>, <span class="hljs-number ngde">2</span>),
</span><span class="line ngde">    };
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">notifyService</span>.<span class="hljs-title function_ ngde">notify</span>(<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-title function_ ngde">toastTemplate</span>());
</span><span class="line ngde">  }
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">handleEdgeChanges</span>(<span class="hljs-params ngde">changes: <a href="/api/ngx-vflow/type-aliases/EdgeChange" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">EdgeChange</a>[]</span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">toastData</span> = {
</span><span class="line ngde">      <span class="hljs-attr ngde">title</span>: <span class="hljs-string ngde">'(onEdgesChange)'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">json</span>: <span class="hljs-title class_ ngde">JSON</span>.<span class="hljs-title function_ ngde">stringify</span>(changes, <span class="hljs-literal ngde">null</span>, <span class="hljs-number ngde">2</span>),
</span><span class="line ngde">    };
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">notifyService</span>.<span class="hljs-title function_ ngde">notify</span>(<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-title function_ ngde">toastTemplate</span>());
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre>`},{title:"HTML",code:`<pre class="ngde hljs"><code lang="html" class="hljs language-html code-lines ngde"><span class="line ngde">&#x3C;<span class="hljs-name ngde">vflow</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">  </span><span class="hljs-attr ngde">view</span>=<span class="hljs-string ngde">"auto"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">  [</span><span class="hljs-attr ngde">nodes</span>]=<span class="hljs-string ngde">"nodes"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">  [</span><span class="hljs-attr ngde">edges</span>]=<span class="hljs-string ngde">"edges"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">  (</span><span class="hljs-attr ngde">onConnect</span>)=<span class="hljs-string ngde">"createEdge($event)"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">  (</span><span class="hljs-attr ngde">onNodesChange</span>)=<span class="hljs-string ngde">"handleNodeChanges($event)"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">  (</span><span class="hljs-attr ngde">onEdgesChange</span>)=<span class="hljs-string ngde">"handleEdgeChanges($event)"</span> />
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-template</span> #<span class="hljs-attr ngde">toast</span>></span>
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">h3</span>></span>{{ toastData?.title }}<span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">h3</span>></span>
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">pre</span>></span>{{ toastData?.json }}<span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">pre</span>></span>
</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">ng-template</span>></span>
</span></code></pre>`}],HandlingChangesFilteredDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span>, <span class="hljs-title class_ ngde">TemplateRef</span>, inject, viewChild } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">NgDocNotifyService</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@ng-doc/ui-kit'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> {
</span><span class="line ngde">  <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>,
</span><span class="line ngde">  <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>,
</span><span class="line ngde">  <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/EdgeChange" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">EdgeChange</a></span>,
</span><span class="line ngde">  <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>,
</span><span class="line ngde">  <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/NodeAddChange" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">NodeAddChange</a></span>,
</span><span class="line ngde">  <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/NodePositionChange" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">NodePositionChange</a></span>,
</span><span class="line ngde">  <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/NodeSelectedChange" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">NodeSelectedChange</a></span>,
</span><span class="line ngde">  <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>,
</span><span class="line ngde">} <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">templateUrl</span>: <span class="hljs-string ngde">'./handling-changes-filtered-demo.component.html'</span>,
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
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">HandlingChangesFilteredDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">private</span> notifyService = <span class="hljs-title function_ ngde">inject</span>(<span class="hljs-title class_ ngde">NgDocNotifyService</span>);
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> toastTemplate = viewChild&#x3C;<span class="hljs-title class_ ngde">TemplateRef</span>&#x3C;<span class="hljs-built_in ngde">object</span>>>(<span class="hljs-string ngde">'toast'</span>);
</span><span class="line ngde">
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
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">toastData</span>: <span class="hljs-built_in ngde">any</span> = {};
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
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">handleNodePositionChange</span>(<span class="hljs-params ngde">change: <a href="/api/ngx-vflow/interfaces/NodePositionChange" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">NodePositionChange</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">toastData</span> = {
</span><span class="line ngde">      <span class="hljs-attr ngde">title</span>: <span class="hljs-string ngde">'(onNodesChange.position.single)'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">json</span>: <span class="hljs-title class_ ngde">JSON</span>.<span class="hljs-title function_ ngde">stringify</span>(change, <span class="hljs-literal ngde">null</span>, <span class="hljs-number ngde">2</span>),
</span><span class="line ngde">    };
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">notifyService</span>.<span class="hljs-title function_ ngde">notify</span>(<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-title function_ ngde">toastTemplate</span>());
</span><span class="line ngde">  }
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">handleNodeSelectChange</span>(<span class="hljs-params ngde">change: <a href="/api/ngx-vflow/interfaces/NodeSelectedChange" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">NodeSelectedChange</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">toastData</span> = {
</span><span class="line ngde">      <span class="hljs-attr ngde">title</span>: <span class="hljs-string ngde">'(onNodesChange.select.single)'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">json</span>: <span class="hljs-title class_ ngde">JSON</span>.<span class="hljs-title function_ ngde">stringify</span>(change, <span class="hljs-literal ngde">null</span>, <span class="hljs-number ngde">2</span>),
</span><span class="line ngde">    };
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">notifyService</span>.<span class="hljs-title function_ ngde">notify</span>(<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-title function_ ngde">toastTemplate</span>());
</span><span class="line ngde">  }
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">handleNodesAddChange</span>(<span class="hljs-params ngde">changes: <a href="/api/ngx-vflow/interfaces/NodeAddChange" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">NodeAddChange</a>[]</span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">toastData</span> = {
</span><span class="line ngde">      <span class="hljs-attr ngde">title</span>: <span class="hljs-string ngde">'(onNodesChange.add.many)'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">json</span>: <span class="hljs-title class_ ngde">JSON</span>.<span class="hljs-title function_ ngde">stringify</span>(changes, <span class="hljs-literal ngde">null</span>, <span class="hljs-number ngde">2</span>),
</span><span class="line ngde">    };
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">notifyService</span>.<span class="hljs-title function_ ngde">notify</span>(<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-title function_ ngde">toastTemplate</span>());
</span><span class="line ngde">  }
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">handleEdgesAddChange</span>(<span class="hljs-params ngde">changes: <a href="/api/ngx-vflow/type-aliases/EdgeChange" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">EdgeChange</a>[]</span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">toastData</span> = {
</span><span class="line ngde">      <span class="hljs-attr ngde">title</span>: <span class="hljs-string ngde">'(onEdgesChange.add)'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">json</span>: <span class="hljs-title class_ ngde">JSON</span>.<span class="hljs-title function_ ngde">stringify</span>(changes, <span class="hljs-literal ngde">null</span>, <span class="hljs-number ngde">2</span>),
</span><span class="line ngde">    };
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">notifyService</span>.<span class="hljs-title function_ ngde">notify</span>(<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-title function_ ngde">toastTemplate</span>());
</span><span class="line ngde">  }
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">addNodes</span>(<span class="hljs-params ngde"></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">nodes</span> = [
</span><span class="line ngde">      ...<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">nodes</span>,
</span><span class="line ngde">      {
</span><span class="line ngde">        <span class="hljs-attr ngde">id</span>: crypto.<span class="hljs-title function_ ngde">randomUUID</span>(),
</span><span class="line ngde">        <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">0</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">0</span> },
</span><span class="line ngde">        <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\`random\`</span>,
</span><span class="line ngde">      },
</span><span class="line ngde">      {
</span><span class="line ngde">        <span class="hljs-attr ngde">id</span>: crypto.<span class="hljs-title function_ ngde">randomUUID</span>(),
</span><span class="line ngde">        <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">300</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">300</span> },
</span><span class="line ngde">        <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\`random\`</span>,
</span><span class="line ngde">      },
</span><span class="line ngde">    ];
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre>`},{title:"HTML",code:`<pre class="ngde hljs"><code lang="html" class="hljs language-html code-lines ngde"><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">button</span> (<span class="hljs-attr ngde">click</span>)=<span class="hljs-string ngde">"addNodes()"</span>></span>Add nodes<span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">button</span>></span>
</span><span class="line ngde">
</span><span class="line ngde">&#x3C;<span class="hljs-name ngde">vflow</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">  </span><span class="hljs-attr ngde">view</span>=<span class="hljs-string ngde">"auto"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">  [</span><span class="hljs-attr ngde">nodes</span>]=<span class="hljs-string ngde">"nodes"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">  [</span><span class="hljs-attr ngde">edges</span>]=<span class="hljs-string ngde">"edges"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">  (</span><span class="hljs-attr ngde">onConnect</span>)=<span class="hljs-string ngde">"createEdge($event)"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">  (</span><span class="hljs-attr ngde">onNodesChange.position.single</span>)=<span class="hljs-string ngde">"handleNodePositionChange($event)"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">  (</span><span class="hljs-attr ngde">onNodesChange.select.single</span>)=<span class="hljs-string ngde">"handleNodeSelectChange($event)"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">  (</span><span class="hljs-attr ngde">onNodesChange.add.many</span>)=<span class="hljs-string ngde">"handleNodesAddChange($event)"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">  (</span><span class="hljs-attr ngde">onEdgesChange.add</span>)=<span class="hljs-string ngde">"handleEdgesAddChange($event)"</span> />
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-template</span> #<span class="hljs-attr ngde">toast</span> <span class="hljs-attr ngde">let-ctx</span>></span>
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">h3</span>></span>{{ toastData?.title }}<span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">h3</span>></span>
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">pre</span>></span>{{ toastData?.json }}<span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">pre</span>></span>
</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">ng-template</span>></span>
</span></code></pre>`}]},M=Z;var ss=`<h1 id="handling-changes" class="ngde">Handling changes<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/handling-changes#handling-changes"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><ng-doc-blockquote type="info" class="ngde"><p class="ngde">You can observe changes in the toasts.</p></ng-doc-blockquote><p class="ngde">You can observe various changes in nodes and edges.</p><p class="ngde">Types of <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/type-aliases/NodeChange" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">NodeChange</a></code>s:</p><ul class="ngde"><li class="ngde"><code class="ngde">position</code> - new node position after drag and drop</li><li class="ngde"><code class="ngde">size</code> - new node size</li><li class="ngde"><code class="ngde">add</code> - when node was created</li><li class="ngde"><code class="ngde">remove</code> - when node was removed</li><li class="ngde"><code class="ngde">select</code> - when node was selected (also triggers for unselected nodes)</li></ul><p class="ngde">Types of <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/type-aliases/EdgeChange" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">EdgeChange</a></code>s:</p><ul class="ngde"><li class="ngde"><code class="ngde">add</code> - when edge was created</li><li class="ngde"><code class="ngde">remove</code> - when edge was removed</li><li class="ngde"><code class="ngde">select</code> - when edge was selected (also triggers for unselected edges)</li><li class="ngde"><code class="ngde">detached</code> - when edge became invisible due to the absence of the source or target node. Use this to delete such edges from the edges list</li></ul><p class="ngde">There are a several ways to receive these changes:</p><h2 id="from-onnodeschange-and-onedgeschange-outputs" class="ngde">From (onNodesChange) and (onEdgesChange) outputs<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/handling-changes#from-onnodeschange-and-onedgeschange-outputs"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">This is a way to get every possible change. Changes came as non empty arrays:</p><ul class="ngde"><li class="ngde"><code class="ngde">(onNodesChange)</code> emits <code class="ngde">NodeChange[]</code></li><li class="ngde"><code class="ngde">(onEdgesChange)</code> emits <code class="ngde">EdgeChange[]</code></li></ul><ng-doc-demo-pane componentname="HandlingChangesDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane><h2 id="from-filtered-outputs" class="ngde">From filtered outputs<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/handling-changes#from-filtered-outputs"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">For your convenience, here is the filtering scheme for changes based on the <code class="ngde">(onNodesChange)</code> and <code class="ngde">(onEdgesChange)</code> events:</p><ul class="ngde"><li class="ngde"><code class="ngde">(onNodesChange.[NodeChangeType])</code> - a list of node changes of a certain type</li><li class="ngde"><code class="ngde">(onNodesChange.[EdgeChangeType])</code> - a list of edge changes of a certain type</li><li class="ngde"><code class="ngde">(onNodesChange.[NodeChangeType].[Count])</code> - a list (<code class="ngde">many</code>) or single (<code class="ngde">single</code>) node change of a certain type</li><li class="ngde"><code class="ngde">(onEdgesChange.[EdgeChangeType].[Count])</code> - a list (<code class="ngde">many</code>) or single (<code class="ngde">single</code>) edge change of a certain type</li></ul><p class="ngde">Where:</p><pre class="ngde hljs"><code class="hljs language-ts code-lines ngde" lang="ts" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">type</span> <span class="hljs-title class_ ngde">NodeChangeType</span> = <span class="hljs-string ngde">'position'</span> | <span class="hljs-string ngde">'add'</span> | <span class="hljs-string ngde">'remove'</span> | <span class="hljs-string ngde">'select'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-keyword ngde">type</span> <span class="hljs-title class_ ngde">EdgeChangeType</span> = <span class="hljs-string ngde">'detached'</span> | <span class="hljs-string ngde">'add'</span> | <span class="hljs-string ngde">'remove'</span> | <span class="hljs-string ngde">'select'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-comment ngde">// single - when there is only one change of this type (for example if you drag and drop some node, it's consireder as single change)</span>
</span><span class="line ngde"><span class="hljs-comment ngde">// many - when there is more than one change of this type (for example if you deleted several nodes at the same time)</span>
</span><span class="line ngde"><span class="hljs-keyword ngde">type</span> <span class="hljs-title class_ ngde">Count</span> = <span class="hljs-string ngde">'single'</span> | <span class="hljs-string ngde">'many'</span>;
</span></code></pre><ng-doc-demo-pane componentname="HandlingChangesFilteredDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane><p class="ngde">List of all possible filter outputs:</p><pre class="ngde hljs"><code class="hljs language-ts code-lines ngde" lang="undefined" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-string ngde">'onNodesChange.position'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onNodesChange.position.single'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onNodesChange.position.many'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onNodesChange.size'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onNodesChange.size.single'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onNodesChange.size.many'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onNodesChange.add'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onNodesChange.add.single'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onNodesChange.add.many'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onNodesChange.remove'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onNodesChange.remove.single'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onNodesChange.remove.many'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onNodesChange.select'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onNodesChange.select.single'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onNodesChange.select.many'</span>,
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-string ngde">'onEdgesChange.detached'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onEdgesChange.detached.single'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onEdgesChange.detached.many'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onEdgesChange.add'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onEdgesChange.add.single'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onEdgesChange.add.many'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onEdgesChange.remove'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onEdgesChange.remove.single'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onEdgesChange.remove.many'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onEdgesChange.select'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onEdgesChange.select.single'</span>,
</span><span class="line ngde"><span class="hljs-string ngde">'onEdgesChange.select.many'</span>,
</span></code></pre><h2 id="from-componenet-itself" class="ngde">From componenet itself<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/handling-changes#from-componenet-itself"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><pre class="ngde hljs"><code class="hljs language-ts code-lines ngde" lang="ts" name="" icon="" highlightedlines="[]"><span class="line ngde">{
</span><span class="line ngde">  ...
</span><span class="line ngde">  <span class="hljs-meta ngde">@ViewChild</span>(<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">VflowComponent</a></span>)
</span><span class="line ngde">  <span class="hljs-attr ngde">vflow</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">VflowComponent</a></span>
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-title function_ ngde">ngAfterViewInit</span>(<span class="hljs-params ngde"></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">vflow</span>.<span class="hljs-property ngde">nodesChange$</span>.<span class="hljs-title function_ ngde">subscribe</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">changes</span>) =></span> {
</span><span class="line ngde">      <span class="hljs-comment ngde">// handle node changes</span>
</span><span class="line ngde">    })
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">vflow</span>.<span class="hljs-property ngde">edgesChange$</span>.<span class="hljs-title function_ ngde">subscribe</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">changes</span>) =></span> {
</span><span class="line ngde">      <span class="hljs-comment ngde">// handle edges changes</span>
</span><span class="line ngde">    })
</span><span class="line ngde">  }
</span><span class="line ngde">  ...
</span><span class="line ngde">}
</span></code></pre>`,ns=(()=>{class a extends T{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=ss,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/pages/handling-changes/index.md?message=docs(handling-changes): describe your changes here...",this.page=u,this.demoAssets=M}static{this.\u0275fac=function(n){return new(n||a)}}static{this.\u0275cmp=r({type:a,selectors:[["ng-doc-page-features-handling-changes"]],standalone:!0,features:[I([{provide:T,useExisting:a},J,u.providers??[]]),H,m],decls:1,vars:0,template:function(n,e){n&1&&F(0,"ng-doc-page")},dependencies:[O],encapsulation:2,changeDetection:0})}}return a})(),as=[A(V({},(0,L.isRoute)(u.route)?u.route:{}),{path:"",component:ns,title:"Handling changes"})],xs=as;export{ns as DynamicComponent,xs as default};
