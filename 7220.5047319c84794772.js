"use strict";(self.webpackChunkngx_vflow_demo=self.webpackChunkngx_vflow_demo||[]).push([[7220],{7220:(v,d,a)=>{a.r(d),a.d(d,{DynamicComponent:()=>g,default:()=>C});var c=a(6286),o=a(7134),i=a(9143),r=a(8341),h=a(2898),s=a(5879),j=a(7580),m=a(8874);function u(n,w){if(1&n&&(s.O4$(),s._UZ(0,"path",2)),2&n){const e=w.$implicit;s.uIk("d",e.path())("stroke-width",e.edge.data.strokeWidth)("stroke",e.edge.data.color)("marker-end",e.markerEnd())}}const t={title:"Custom edges",mdFile:"./index.md",category:r.Z,demos:{CustomEdgesDemoComponent:(()=>{class n{constructor(){this.nodes=[{id:"1",point:{x:10,y:200},type:"default",text:"1"},{id:"2",point:{x:200,y:100},type:"default",text:"2"},{id:"3",point:{x:200,y:300},type:"default",text:"3"}],this.edges=[{id:"1 -> 2",source:"1",target:"2",type:"template",data:{strokeWidth:4,color:"#ffeeaa"},markers:{end:{type:"arrow-closed",width:30,height:30,color:"#ffeeaa"}}},{id:"1 -> 3",source:"1",target:"3",type:"template",data:{strokeWidth:2,color:"#ec586e"}}]}static#s=this.\u0275fac=function(l){return new(l||n)};static#n=this.\u0275cmp=s.Xpm({type:n,selectors:[["ng-component"]],standalone:!0,features:[s.jDz],decls:2,vars:2,consts:[[3,"nodes","edges"],["edge",""],["fill","none"]],template:function(l,p){1&l&&(s.TgZ(0,"vflow",0),s.YNc(1,u,1,4,"ng-template",1),s.qZA()),2&l&&s.Q6J("nodes",p.nodes)("edges",p.edges)},dependencies:[h.p,j.t,m.o6],encapsulation:2,changeDetection:0})}return n})()},order:3},y=[],x={CustomEdgesDemoComponent:[{title:"TypeScript",code:'<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/core\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'projects/ngx-vflow-lib/src/public-api\'</span>;\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({\n</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">`&#x3C;vflow [nodes]="nodes" [edges]="edges"></span>\n</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;ng-template edge let-ctx></span>\n</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;svg:path</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        [attr.d]="ctx.path()"</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        [attr.stroke-width]="ctx.edge.data.strokeWidth"</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        [attr.stroke]="ctx.edge.data.color"</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        [attr.marker-end]="ctx.markerEnd()"</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        fill="none"</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      /></span>\n</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/ng-template></span>\n</span><span class="line ngde"><span class="hljs-string ngde">  &#x3C;/vflow>`</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>]\n</span><span class="line ngde">})\n</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">CustomEdgesDemoComponent</span> {\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'1\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'2\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">300</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'3\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1 -> 2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'template\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">strokeWidth</span>: <span class="hljs-number ngde">4</span>,\n</span><span class="line ngde">        <span class="hljs-attr ngde">color</span>: <span class="hljs-string ngde">\'#ffeeaa\'</span>\n</span><span class="line ngde">      },\n</span><span class="line ngde">      <span class="hljs-attr ngde">markers</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">end</span>: {\n</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'arrow-closed\'</span>,\n</span><span class="line ngde">          <span class="hljs-attr ngde">width</span>: <span class="hljs-number ngde">30</span>,\n</span><span class="line ngde">          <span class="hljs-attr ngde">height</span>: <span class="hljs-number ngde">30</span>,\n</span><span class="line ngde">          <span class="hljs-attr ngde">color</span>: <span class="hljs-string ngde">\'#ffeeaa\'</span>\n</span><span class="line ngde">        }\n</span><span class="line ngde">      }\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1 -> 3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">\'3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'template\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">strokeWidth</span>: <span class="hljs-number ngde">2</span>,\n</span><span class="line ngde">        <span class="hljs-attr ngde">color</span>: <span class="hljs-string ngde">\'#ec586e\'</span>\n</span><span class="line ngde">      }\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">}\n</span></code></pre>'}]};let g=(()=>{class n extends c.a{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent='<h1 id="custom-edges" class="ngde">Custom edges<a title="Link to heading" class="ng-doc-header-link ngde" href="/examples/custom-edges#custom-edges"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">You can customize your edges. To achieve this you need to do this:</p><ol class="ngde"><li class="ngde">Change edge type to <code class="ngde">template</code></li><li class="ngde">Create <code class="ngde">ng-template</code> with <code class="ngde">edge</code> selector inside <code class="ngde">vflow</code></li><li class="ngde">Create svg path which you will customize</li><li class="ngde">In the <code class="ngde">ng-template</code>, the library provides <code class="ngde">let-ctx</code> with some important data for you, such as the <code class="ngde">path</code> signal with the current path. Additionally, <code class="ngde">edge</code> field contains current edge from one the <code class="ngde">[edges]</code>, from which you can also retrieve custom <code class="ngde">data</code>. Furthermore, you can access <code class="ngde">markerStart</code> and <code class="ngde">markerEnd</code> signals with markers for current <code class="ngde">edge</code>.</li></ol><h2 id="context" class="ngde">Context<a title="Link to heading" class="ng-doc-header-link ngde" href="/examples/custom-edges#context"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">It\'s tricky to infer type for <code class="ngde">let-ctx</code>, so here is an interface with available fields for this context.</p><pre class="ngde hljs"><code class="hljs language-ts code-lines ngde" lang="ts" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">interface</span> <span class="hljs-title class_ ngde">EdgeContext</span> {\n</span><span class="line ngde">  <span class="hljs-attr ngde">edge</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>\n</span><span class="line ngde">  <span class="hljs-attr ngde">path</span>: <span class="hljs-title class_ ngde">Signal</span>&#x3C;<span class="hljs-built_in ngde">string</span>>\n</span><span class="line ngde">  <span class="hljs-attr ngde">markerStart</span>: <span class="hljs-title class_ ngde">Signal</span>&#x3C;<span class="hljs-built_in ngde">string</span>>\n</span><span class="line ngde">  <span class="hljs-attr ngde">markerEnd</span>: <span class="hljs-title class_ ngde">Signal</span>&#x3C;<span class="hljs-built_in ngde">string</span>>\n</span><span class="line ngde">}\n</span></code></pre><h2 id="example" class="ngde">Example<a title="Link to heading" class="ng-doc-header-link ngde" href="/examples/custom-edges#example"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><ng-doc-demo componentname="CustomEdgesDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{"expanded":true}</div></ng-doc-demo>',this.page=t,this.demoAssets=x}static#s=this.\u0275fac=function(l){return new(l||n)};static#n=this.\u0275cmp=s.Xpm({type:n,selectors:[["ng-doc-page-examples-custom-edges"]],standalone:!0,features:[s._Bn([{provide:c.a,useExisting:n},y,t.providers??[]]),s.qOj,s.jDz],decls:1,vars:0,template:function(l,p){1&l&&s._UZ(0,"ng-doc-page")},dependencies:[o.z],encapsulation:2,changeDetection:0})}return n})();const C=[{...(0,i.isRoute)(t.route)?t.route:{},path:"",component:g,title:"Custom edges"}]}}]);