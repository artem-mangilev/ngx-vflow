"use strict";(self.webpackChunkngx_vflow_demo=self.webpackChunkngx_vflow_demo||[]).push([[108],{108:(b,g,c)=>{c.r(g),c.d(g,{DynamicComponent:()=>j,default:()=>_});var i=c(6286),f=c(7134),u=c(9143),m=c(2936),o=c(2898),s=c(5879),r=c(9203);let y=(()=>{class a{constructor(){this.nodes=[{id:"1",point:{x:100,y:100},type:"default",text:"1"},{id:"2",point:{x:200,y:200},type:"default",text:"2"}],this.edges=[]}createEdge({source:e,target:n}){this.edges=[...this.edges,{id:`${e} -> ${n}`,source:e,target:n}]}static#s=this.\u0275fac=function(n){return new(n||a)};static#n=this.\u0275cmp=s.Xpm({type:a,selectors:[["ng-component"]],standalone:!0,features:[s.jDz],decls:1,vars:2,consts:[["view","auto",3,"nodes","edges","onConnect"]],template:function(n,l){1&n&&(s.TgZ(0,"vflow",0),s.NdJ("onConnect",function(p){return l.createEdge(p)}),s.qZA()),2&n&&s.Q6J("nodes",l.nodes)("edges",l.edges)},dependencies:[o.p,r.t],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}return a})();var C=c(5220),w=c(2274);let v=(()=>{class a{constructor(){this.nodes=[{id:"1",point:{x:100,y:100},type:h,data:{text:"Node 1"}},{id:"2",point:{x:200,y:200},type:h,data:{text:"Node 2"}}],this.edges=[],this.connection={mode:"loose"}}createEdge(e){const{source:n,target:l,sourceHandle:t,targetHandle:p}=e;this.edges=[...this.edges,{id:`${n}${t} -> ${l}${p}`,...e,markers:{end:{type:"arrow-closed"}}}]}static#s=this.\u0275fac=function(n){return new(n||a)};static#n=this.\u0275cmp=s.Xpm({type:a,selectors:[["ng-component"]],standalone:!0,features:[s.jDz],decls:1,vars:3,consts:[["view","auto",3,"nodes","edges","connection","onConnect"]],template:function(n,l){1&n&&(s.TgZ(0,"vflow",0),s.NdJ("onConnect",function(p){return l.createEdge(p)}),s.qZA()),2&n&&s.Q6J("nodes",l.nodes)("edges",l.edges)("connection",l.connection)},dependencies:[o.p,r.t],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}return a})(),h=(()=>{class a extends C.L{static#s=this.\u0275fac=function(){let e;return function(l){return(e||(e=s.n5z(a)))(l||a)}}();static#n=this.\u0275cmp=s.Xpm({type:a,selectors:[["ng-component"]],standalone:!0,features:[s.qOj,s.jDz],decls:6,vars:1,consts:[[1,"node"],["type","source","position","top","id","a"],["type","source","position","right","id","b"],["type","source","position","bottom","id","c"],["type","source","position","left","id","d"]],template:function(n,l){if(1&n&&(s.TgZ(0,"div",0),s._uU(1),s._UZ(2,"handle",1)(3,"handle",2)(4,"handle",3)(5,"handle",4),s.qZA()),2&n){let t;s.xp6(1),s.hij(" ",null==(t=l.data())?null:t.text," ")}},dependencies:[o.p,w.M],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}return a})();const d={title:"Connection",mdFile:"./index.md",category:m.Z,demos:{DefaultConnectionDemoComponent:y,LooseConnectionDemoComponent:v},order:3},x=[],k={DefaultConnectionDemoComponent:[{title:"TypeScript",code:'<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/core\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'projects/ngx-vflow-lib/src/public-api\'</span>;\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({\n</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">`&#x3C;vflow view="auto" [nodes]="nodes" [edges]="edges"</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    (onConnect)="createEdge($event)"/></span>\n</span><span class="line ngde"><span class="hljs-string ngde">  `</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [<span class="hljs-string ngde">`</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    :host {</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      width: 100%;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      height: 100%;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    }</span>\n</span><span class="line ngde"><span class="hljs-string ngde">  `</span>],\n</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>]\n</span><span class="line ngde">})\n</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">DefaultConnectionDemoComponent</span> {\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">100</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">`1`</span>,\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">`2`</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = []\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">createEdge</span>(<span class="hljs-params ngde">{ source, target }: <a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>) {\n</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span> = [...<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span>, {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">`<span class="hljs-subst ngde">${source}</span> -> <span class="hljs-subst ngde">${target}</span>`</span>,\n</span><span class="line ngde">      source,\n</span><span class="line ngde">      target\n</span><span class="line ngde">    }]\n</span><span class="line ngde">  }\n</span><span class="line ngde">}\n</span></code></pre>'}],LooseConnectionDemoComponent:[{title:"TypeScript",code:'<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/core\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/CustomNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomNodeComponent</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">VflowComponent</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'projects/ngx-vflow-lib/src/public-api\'</span>;\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({\n</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">`</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;vflow</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      view="auto"</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      [nodes]="nodes"</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      [edges]="edges"</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      [connection]="connection"</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      (onConnect)="createEdge($event)"</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    /></span>\n</span><span class="line ngde"><span class="hljs-string ngde">  `</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [<span class="hljs-string ngde">`</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    :host {</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      width: 100%;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      height: 100%;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    }</span>\n</span><span class="line ngde"><span class="hljs-string ngde">  `</span>],\n</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>]\n</span><span class="line ngde">})\n</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">LooseConnectionDemoComponent</span> {\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">100</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">LooseConnectionNode</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'<a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a> 1\'</span>\n</span><span class="line ngde">      }\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">LooseConnectionNode</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'<a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a> 2\'</span>\n</span><span class="line ngde">      }\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = []\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">connection</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></span> = {\n</span><span class="line ngde">    <span class="hljs-attr ngde">mode</span>: <span class="hljs-string ngde">\'loose\'</span>\n</span><span class="line ngde">  }\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">createEdge</span>(<span class="hljs-params ngde">connection: <a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>) {\n</span><span class="line ngde">    <span class="hljs-keyword ngde">const</span> { source, target, sourceHandle, targetHandle } = connection\n</span><span class="line ngde">\n</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span> = [...<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span>, {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">`<span class="hljs-subst ngde">${source}</span><span class="hljs-subst ngde">${sourceHandle}</span> -> <span class="hljs-subst ngde">${target}</span><span class="hljs-subst ngde">${targetHandle}</span>`</span>,\n</span><span class="line ngde">      ...connection,\n</span><span class="line ngde">      <span class="hljs-attr ngde">markers</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">end</span>: {\n</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'arrow-closed\'</span>\n</span><span class="line ngde">        }\n</span><span class="line ngde">      }\n</span><span class="line ngde">    }]\n</span><span class="line ngde">  }\n</span><span class="line ngde">}\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-keyword ngde">interface</span> <span class="hljs-title class_ ngde">LooseConnectionNodeData</span> {\n</span><span class="line ngde">  <span class="hljs-attr ngde">text</span>: <span class="hljs-built_in ngde">string</span>;\n</span><span class="line ngde">}\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({\n</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">`&#x3C;div class="node"></span>\n</span><span class="line ngde"><span class="hljs-string ngde">    {{ data()?.text }}</span>\n</span><span class="line ngde"><span class="hljs-string ngde"></span>\n</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;handle type="source" position="top" id="a" /></span>\n</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;handle type="source" position="right" id="b" /></span>\n</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;handle type="source" position="bottom" id="c" /></span>\n</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;handle type="source" position="left" id="d" /></span>\n</span><span class="line ngde"><span class="hljs-string ngde">  &#x3C;/div>`</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [<span class="hljs-string ngde">`</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    .node {</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      width: 100px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      height: 50px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      border: 1.5px solid #1b262c;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      border-radius: 5px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      display: flex;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      align-items: center;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      justify-content: center;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      color: black;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      background-color: white;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    }</span>\n</span><span class="line ngde"><span class="hljs-string ngde">  `</span>],\n</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>]\n</span><span class="line ngde">})\n</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">LooseConnectionNode</span> <span class="hljs-keyword ngde">extends</span> <span class="hljs-title class_ inherited__ ngde"><a href="/api/ngx-vflow/classes/CustomNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomNodeComponent</a></span>&#x3C;<span class="hljs-title class_ ngde">LooseConnectionNodeData</span>> { }\n</span></code></pre>'}]};let j=(()=>{class a extends i.a{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent='<h1 id="connection" class="ngde">Connection<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/connection#connection"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">Edges are not creating automatically. To create a new edge, follow these steps:</p><ol class="ngde"><li class="ngde">Create handler to the <code class="ngde">(onConnect)</code> event</li><li class="ngde">This handler accepts a <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></code> argument. <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></code> is similar to an <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></code>, but it doesn\'t exists in the flow, you need to "convert" it into a new <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></code></li><li class="ngde">Update the <code class="ngde">Edge[]</code> list with the new edge that was created from the <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></code>.</li></ol><h2 id="strict-connections" class="ngde">Strict connections<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/connection#strict-connections"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">In the default <code class="ngde">\'strict\'</code> <code class="ngde">mode</code> of <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></code>, edges are created from connections with strict adherence to the <code class="ngde">source</code> and <code class="ngde">target</code> types of the <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/HandleComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">HandleComponent</a></code>. This means connections can only be established in one direction based on these properties.</p><ng-doc-demo-pane componentname="DefaultConnectionDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane><h2 id="loose-connections" class="ngde">Loose connections<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/connection#loose-connections"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">This is the <code class="ngde">\'loose\'</code> <code class="ngde">mode</code> of <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></code>, where the flow ignores the handle <code class="ngde">type</code> and allows any handle to connect with any other handle. In this mode, an <code class="ngde">id</code> must be provided for the <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/HandleComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">HandleComponent</a></code> to function correctly.</p><ng-doc-demo-pane componentname="LooseConnectionDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>',this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/pages/connection/index.md?message=docs(connection): describe your changes here...",this.page=d,this.demoAssets=k}static#s=this.\u0275fac=function(n){return new(n||a)};static#n=this.\u0275cmp=s.Xpm({type:a,selectors:[["ng-doc-page-features-connection"]],standalone:!0,features:[s._Bn([{provide:i.a,useExisting:a},x,d.providers??[]]),s.qOj,s.jDz],decls:1,vars:0,template:function(n,l){1&n&&s._UZ(0,"ng-doc-page")},dependencies:[f.z],encapsulation:2,changeDetection:0})}return a})();const _=[{...(0,u.isRoute)(d.route)?d.route:{},path:"",component:j,title:"Connection"}]}}]);