"use strict";(self.webpackChunkngx_vflow_demo=self.webpackChunkngx_vflow_demo||[]).push([[5452],{5452:(D,p,n)=>{n.r(p),n.d(p,{DynamicComponent:()=>o,default:()=>x});var d=n(6286),g=n(7134),i=n(9143),r=n(8341),h=n(2898),a=n(5879),u=n(692);const l={title:"Default nodes",mdFile:"./index.md",category:r.Z,demos:{DefaultNodesDemoComponent:(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:100,y:100},type:"default",text:"1"},{id:"2",point:{x:200,y:200},type:"default",text:"<strong>2</strong>"}]}static#s=this.\u0275fac=function(e){return new(e||s)};static#n=this.\u0275cmp=a.Xpm({type:s,selectors:[["ng-component"]],standalone:!0,features:[a.jDz],decls:1,vars:1,consts:[[3,"nodes"]],template:function(e,c){1&e&&a._UZ(0,"vflow",0),2&e&&a.Q6J("nodes",c.nodes)},dependencies:[h.p,u.t],encapsulation:2,changeDetection:0})}return s})()},order:1},f=[],j={DefaultNodesDemoComponent:[{title:"TypeScript",code:'<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/core\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'projects/ngx-vflow-lib/src/public-api\'</span>;\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({\n</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">`&#x3C;vflow [nodes]="nodes" />`</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>]\n</span><span class="line ngde">})\n</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">DefaultNodesDemoComponent</span> {\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">100</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">`1`</span>,\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-comment ngde">// it\'s possible to pass html in this field</span>\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">`&#x3C;strong>2&#x3C;/strong>`</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">}\n</span></code></pre>'}]};let o=(()=>{class s extends d.a{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent='<h1 id="default-nodes" class="ngde">Default nodes<a title="Link to heading" class="ng-doc-header-link ngde" href="/examples/default-nodes#default-nodes"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">To get started, you just need to provide <code class="ngde">nodes</code> array to <code class="ngde">vflow</code> component.</p><ng-doc-demo componentname="DefaultNodesDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{"expanded":true}</div></ng-doc-demo>',this.page=l,this.demoAssets=j}static#s=this.\u0275fac=function(e){return new(e||s)};static#n=this.\u0275cmp=a.Xpm({type:s,selectors:[["ng-doc-page-examples-default-nodes"]],standalone:!0,features:[a._Bn([{provide:d.a,useExisting:s},f,l.providers??[]]),a.qOj,a.jDz],decls:1,vars:0,template:function(e,c){1&e&&a._UZ(0,"ng-doc-page")},dependencies:[g.z],encapsulation:2,changeDetection:0})}return s})();const x=[{...(0,i.isRoute)(l.route)?l.route:{},path:"",component:o,title:"Default nodes"}]}}]);