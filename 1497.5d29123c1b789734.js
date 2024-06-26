"use strict";(self.webpackChunkngx_vflow_demo=self.webpackChunkngx_vflow_demo||[]).push([[1497],{1497:(k,c,n)=>{n.r(c),n.d(c,{DynamicComponent:()=>o,default:()=>x});var d=n(6286),g=n(7134),i=n(9143),r=n(8341),h=n(2898),a=n(5879),u=n(2454);const l={title:"Custom background",mdFile:"./index.md",category:r.Z,demos:{CustomBackgroundDemoComponent:(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:10,y:200},type:"default",text:"1"},{id:"2",point:{x:200,y:100},type:"default",text:"2"},{id:"3",point:{x:200,y:300},type:"default",text:"3"}],this.edges=[{id:"1 -> 2",source:"1",target:"2"},{id:"1 -> 3",source:"1",target:"3"}]}static#s=this.\u0275fac=function(e){return new(e||s)};static#n=this.\u0275cmp=a.Xpm({type:s,selectors:[["ng-component"]],standalone:!0,features:[a.jDz],decls:1,vars:2,consts:[["background","#9de19a",3,"nodes","edges"]],template:function(e,t){1&e&&a._UZ(0,"vflow",0),2&e&&a.Q6J("nodes",t.nodes)("edges",t.edges)},dependencies:[h.p,u.t],encapsulation:2,changeDetection:0})}return s})()},order:11},j=[],f={CustomBackgroundDemoComponent:[{title:"TypeScript",code:'<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/core\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'projects/ngx-vflow-lib/src/public-api\'</span>;\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({\n</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">`&#x3C;vflow [nodes]="nodes" [edges]="edges" background="#9de19a" />`</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>]\n</span><span class="line ngde">})\n</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">CustomBackgroundDemoComponent</span> {\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'1\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'2\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">300</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'3\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1 -> 2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">\'2\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1 -> 3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">\'3\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">}\n</span></code></pre>'}]};let o=(()=>{class s extends d.a{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent='<h1 id="custom-background" class="ngde">Custom background<a title="Link to heading" class="ng-doc-header-link ngde" href="/examples/custom-background#custom-background"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">You\'re able to select background color for your flow. Currently, it is limited to selecting a color, but in the future, it will be possible to set more complex backgrounds. To select a color, simply pass it to the <code class="ngde">[background]</code> input.</p><ng-doc-demo componentname="CustomBackgroundDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{"expanded":true}</div></ng-doc-demo>',this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/examples/pages/custom-background/index.md?message=docs(custom-background): describe your changes here...",this.page=l,this.demoAssets=f}static#s=this.\u0275fac=function(e){return new(e||s)};static#n=this.\u0275cmp=a.Xpm({type:s,selectors:[["ng-doc-page-examples-custom-background"]],standalone:!0,features:[a._Bn([{provide:d.a,useExisting:s},j,l.providers??[]]),a.qOj,a.jDz],decls:1,vars:0,template:function(e,t){1&e&&a._UZ(0,"ng-doc-page")},dependencies:[g.z],encapsulation:2,changeDetection:0})}return s})();const x=[{...(0,i.isRoute)(l.route)?l.route:{},path:"",component:o,title:"Custom background"}]}}]);