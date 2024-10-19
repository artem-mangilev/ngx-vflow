"use strict";(self.webpackChunkngx_vflow_demo=self.webpackChunkngx_vflow_demo||[]).push([[8110],{8110:(b,d,e)=>{e.r(d),e.d(d,{DynamicComponent:()=>i,default:()=>k});var c=e(6286),r=e(7134),h=e(9143),j=e(2936),g=e(2898),s=e(5879),o=e(7882);const u=function(){return{source:"left",target:"right"}},f=function(){return{source:"bottom",target:"top"}},t={title:"Choose direction",mdFile:"./index.md",category:j.Z,demos:{HandlePositionsRtlDemoComponent:(()=>{class n{constructor(){this.nodes=[{id:"1",point:{x:300,y:200},type:"default",text:"1"},{id:"2",point:{x:10,y:100},type:"default",text:"2"},{id:"3",point:{x:10,y:300},type:"default",text:"3"}],this.edges=[{id:"1 -> 2",source:"1",target:"2",markers:{end:{type:"arrow-closed"}}},{id:"1 -> 3",source:"1",target:"3",markers:{end:{type:"arrow-closed"}}}]}static#s=this.\u0275fac=function(a){return new(a||n)};static#n=this.\u0275cmp=s.Xpm({type:n,selectors:[["ng-component"]],standalone:!0,features:[s.jDz],decls:1,vars:4,consts:[["view","auto",3,"nodes","edges","handlePositions"]],template:function(a,l){1&a&&s._UZ(0,"vflow",0),2&a&&s.Q6J("nodes",l.nodes)("edges",l.edges)("handlePositions",s.DdM(3,u))},dependencies:[g.p,o.t],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}return n})(),HandlePositionsTtbDemoComponent:(()=>{class n{constructor(){this.nodes=[{id:"1",point:{x:150,y:10},type:"default",text:"1"},{id:"2",point:{x:10,y:200},type:"default",text:"2"},{id:"3",point:{x:290,y:200},type:"default",text:"3"}],this.edges=[{id:"1 -> 2",source:"1",target:"2",markers:{end:{type:"arrow-closed"}}},{id:"1 -> 3",source:"1",target:"3",markers:{end:{type:"arrow-closed"}}}]}static#s=this.\u0275fac=function(a){return new(a||n)};static#n=this.\u0275cmp=s.Xpm({type:n,selectors:[["ng-component"]],standalone:!0,features:[s.jDz],decls:1,vars:4,consts:[["view","auto",3,"nodes","edges","handlePositions"]],template:function(a,l){1&a&&s._UZ(0,"vflow",0),2&a&&s.Q6J("nodes",l.nodes)("edges",l.edges)("handlePositions",s.DdM(3,f))},dependencies:[g.p,o.t],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}return n})()},order:7},w=[],x={HandlePositionsRtlDemoComponent:[{title:"TypeScript",code:'<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/core\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'projects/ngx-vflow-lib/src/public-api\'</span>;\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({\n</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">`&#x3C;vflow view="auto" [nodes]="nodes" [edges]="edges"</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    [handlePositions]="{ source: \'left\', target: \'right\' }" />`</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [<span class="hljs-string ngde">`</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    :host {</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      width: 100%;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      height: 100%;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    }</span>\n</span><span class="line ngde"><span class="hljs-string ngde">  `</span>],\n</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>]\n</span><span class="line ngde">})\n</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">HandlePositionsRtlDemoComponent</span> {\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">300</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'1\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'2\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">300</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'3\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1 -> 2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">markers</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">end</span>: { <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'arrow-closed\'</span> }\n</span><span class="line ngde">      }\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1 -> 3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">\'3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">markers</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">end</span>: { <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'arrow-closed\'</span> }\n</span><span class="line ngde">      }\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">}\n</span></code></pre>'}],HandlePositionsTtbDemoComponent:[{title:"TypeScript",code:'<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/core\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'projects/ngx-vflow-lib/src/public-api\'</span>;\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({\n</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">`&#x3C;vflow view="auto" [nodes]="nodes" [edges]="edges"</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    [handlePositions]="{ source: \'bottom\', target: \'top\' }" />`</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [<span class="hljs-string ngde">`</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    :host {</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      width: 100%;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      height: 100%;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    }</span>\n</span><span class="line ngde"><span class="hljs-string ngde">  `</span>],\n</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>]\n</span><span class="line ngde">})\n</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">HandlePositionsTtbDemoComponent</span> {\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">150</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">10</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'1\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'2\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">290</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'3\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1 -> 2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">markers</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">end</span>: { <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'arrow-closed\'</span> }\n</span><span class="line ngde">      }\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1 -> 3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">\'3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">markers</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">end</span>: { <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'arrow-closed\'</span> }\n</span><span class="line ngde">      }\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">}\n</span></code></pre>'}]};let i=(()=>{class n extends c.a{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent='<h1 id="choose-direction" class="ngde">Choose direction<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/choose-direction#choose-direction"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><ng-doc-blockquote type="warning" class="ngde"><p class="ngde">This API may depricate in future releases</p></ng-doc-blockquote><p class="ngde">You can apply global setting for all handles with <code class="ngde">[handlePositions]</code> input where you set on which side source and target handles should be placed, you can select.</p><h2 id="right-to-left-direction" class="ngde">Right to left direction<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/choose-direction#right-to-left-direction"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">To archive this direction, you pass <code class="ngde">{ source: \'left\', target: \'right\' }</code> to <code class="ngde">[handlePositions]</code>.</p><ng-doc-demo-pane componentname="HandlePositionsRtlDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane><h2 id="top-to-bottom-direction" class="ngde">Top to bottom direction<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/choose-direction#top-to-bottom-direction"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">To archive this direction, you pass <code class="ngde">{ source: \'bottom\', target: \'top\' }</code> to <code class="ngde">[handlePositions]</code>.</p><ng-doc-demo-pane componentname="HandlePositionsTtbDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>',this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/pages/choose-direction/index.md?message=docs(choose-direction): describe your changes here...",this.page=t,this.demoAssets=x}static#s=this.\u0275fac=function(a){return new(a||n)};static#n=this.\u0275cmp=s.Xpm({type:n,selectors:[["ng-doc-page-features-choose-direction"]],standalone:!0,features:[s._Bn([{provide:c.a,useExisting:n},w,t.providers??[]]),s.qOj,s.jDz],decls:1,vars:0,template:function(a,l){1&a&&s._UZ(0,"ng-doc-page")},dependencies:[r.z],encapsulation:2,changeDetection:0})}return n})();const k=[{...(0,h.isRoute)(t.route)?t.route:{},path:"",component:i,title:"Choose direction"}]}}]);