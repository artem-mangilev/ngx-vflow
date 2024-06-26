"use strict";(self.webpackChunkngx_vflow_demo=self.webpackChunkngx_vflow_demo||[]).push([[2884],{2884:(z,d,e)=>{e.r(d),e.d(d,{DynamicComponent:()=>h,default:()=>v});var c=e(6286),j=e(7134),u=e(9143),m=e(8341),g=e(2898),n=e(5879),i=e(2454);let o=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:10,y:200},type:"default",text:"1"},{id:"2",point:{x:200,y:100},type:"default",text:"2"},{id:"3",point:{x:200,y:300},type:"default",text:"3"}],this.edges=[{id:"1 -> 2",source:"1",target:"2"},{id:"1 -> 3",source:"1",target:"3"}]}static#s=this.\u0275fac=function(a){return new(a||s)};static#n=this.\u0275cmp=n.Xpm({type:s,selectors:[["ng-component"]],standalone:!0,features:[n.jDz],decls:1,vars:2,consts:[["view","auto",3,"nodes","edges"]],template:function(a,l){1&a&&n._UZ(0,"vflow",0),2&a&&n.Q6J("nodes",l.nodes)("edges",l.edges)},dependencies:[g.p,i.t],styles:["[_nghost-%COMP%]{width:100vw;height:100vh}"],changeDetection:0})}return s})();const f=function(){return[600,600]};let r=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:10,y:200},type:"default",text:"1"},{id:"2",point:{x:200,y:100},type:"default",text:"2"},{id:"3",point:{x:200,y:300},type:"default",text:"3"}],this.edges=[{id:"1 -> 2",source:"1",target:"2"},{id:"1 -> 3",source:"1",target:"3"}]}static#s=this.\u0275fac=function(a){return new(a||s)};static#n=this.\u0275cmp=n.Xpm({type:s,selectors:[["ng-component"]],standalone:!0,features:[n.jDz],decls:1,vars:4,consts:[[3,"nodes","edges","view"]],template:function(a,l){1&a&&n._UZ(0,"vflow",0),2&a&&n.Q6J("nodes",l.nodes)("edges",l.edges)("view",n.DdM(3,f))},dependencies:[g.p,i.t],encapsulation:2,changeDetection:0})}return s})();const t={title:"View size",mdFile:"./index.md",category:m.Z,demos:{ViewSizeAutoDemoComponent:o,ViewSizeFixedDemoComponent:r},route:{children:[{path:"view-size-auto",component:o},{path:"view-size-fixed",component:r}]},order:2},y=[],w={ViewSizeAutoDemoComponent:[{title:"TypeScript",code:'<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/core\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'projects/ngx-vflow-lib/src/public-api\'</span>;\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({\n</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">`&#x3C;vflow [nodes]="nodes" [edges]="edges" view="auto" />`</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [<span class="hljs-string ngde">`</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    :host {</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      width: 100vw;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      height: 100vh;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    }</span>\n</span><span class="line ngde"><span class="hljs-string ngde">  `</span>],\n</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>]\n</span><span class="line ngde">})\n</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">ViewSizeAutoDemoComponent</span> {\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'1\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'2\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">300</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'3\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1 -> 2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">\'2\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1 -> 3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">\'3\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">}\n</span></code></pre>'}],ViewSizeFixedDemoComponent:[{title:"TypeScript",code:'<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/core\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'projects/ngx-vflow-lib/src/public-api\'</span>;\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({\n</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">`&#x3C;vflow [nodes]="nodes" [edges]="edges" [view]="[600, 600]" />`</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>]\n</span><span class="line ngde">})\n</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">ViewSizeFixedDemoComponent</span> {\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'1\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'2\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">300</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'3\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1 -> 2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">\'2\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1 -> 3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">\'3\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">}\n</span></code></pre>'}]};let h=(()=>{class s extends c.a{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent='<h1 id="view-size" class="ngde">View size<a title="Link to heading" class="ng-doc-header-link ngde" href="/examples/view-size#view-size"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><h2 id="auto-size" class="ngde">Auto size<a title="Link to heading" class="ng-doc-header-link ngde" href="/examples/view-size#auto-size"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde"><code class="ngde">vflow</code> automatically fits it container if you pass <code class="ngde">view="auto"</code> input</p><ng-doc-demo componentname="ViewSizeFullscreenDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{"fullscreenRoute":"view-size-auto"}</div></ng-doc-demo><h2 id="fixed-size" class="ngde">Fixed size<a title="Link to heading" class="ng-doc-header-link ngde" href="/examples/view-size#fixed-size"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde"><code class="ngde">vflow</code> can take fixed space if you pass <code class="ngde">[view]="[600, 600]"</code> input, where first item of array is width (in pixels), and the second is height (in pixels).</p><ng-doc-demo componentname="ViewSizeFixedDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{"fullscreenRoute":"view-size-fixed"}</div></ng-doc-demo>',this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/examples/pages/view-size/index.md?message=docs(view-size): describe your changes here...",this.page=t,this.demoAssets=w}static#s=this.\u0275fac=function(a){return new(a||s)};static#n=this.\u0275cmp=n.Xpm({type:s,selectors:[["ng-doc-page-examples-view-size"]],standalone:!0,features:[n._Bn([{provide:c.a,useExisting:s},y,t.providers??[]]),n.qOj,n.jDz],decls:1,vars:0,template:function(a,l){1&a&&n._UZ(0,"ng-doc-page")},dependencies:[j.z],encapsulation:2,changeDetection:0})}return s})();const v=[{...(0,u.isRoute)(t.route)?t.route:{},path:"",component:h,title:"View size"}]}}]);