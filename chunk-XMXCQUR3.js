import{a as b}from"./chunk-S3I3S5BX.js";import{n as N,r as y,u as E,w as u}from"./chunk-753PVMZZ.js";import{a as _}from"./chunk-GPBMHN32.js";import"./chunk-MUKF72JZ.js";import{a as C}from"./chunk-T6GQPSCF.js";import{Ba as h,Ga as f,R as l,Ra as o,Sa as d,Ta as j,Za as m,aa as w,jb as v,lb as k,na as x,pb as D,qb as t,xc as $}from"./chunk-FDES3R26.js";import{a as g,b as r,g as F}from"./chunk-P2VZOJAX.js";var O=F($());var I=(()=>{class n{constructor(){this.nodes=[{id:"1",point:{x:100,y:100},type:"default",text:"1"},{id:"2",point:{x:200,y:200},type:"default",text:"2"}],this.edges=[]}createEdge({source:e,target:s}){this.edges=[...this.edges,{id:`${e} -> ${s}`,source:e,target:s}]}static{this.\u0275fac=function(s){return new(s||n)}}static{this.\u0275cmp=l({type:n,selectors:[["ng-component"]],standalone:!0,features:[t],decls:1,vars:2,consts:[["view","auto",3,"onConnect","nodes","edges"]],template:function(s,a){s&1&&(o(0,"vflow",0),m("onConnect",function(p){return a.createEdge(p)}),d()),s&2&&f("nodes",a.nodes)("edges",a.edges)},dependencies:[u,y],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return n})();var T=(()=>{class n{constructor(){this.nodes=[{id:"1",point:{x:100,y:100},type:L,data:{text:"Node 1"}},{id:"2",point:{x:200,y:200},type:L,data:{text:"Node 2"}}],this.edges=[],this.connection={mode:"loose"}}createEdge(e){let{source:s,target:a,sourceHandle:c,targetHandle:p}=e;this.edges=[...this.edges,r(g({id:`${s}${c} -> ${a}${p}`},e),{markers:{end:{type:"arrow-closed"}}})]}static{this.\u0275fac=function(s){return new(s||n)}}static{this.\u0275cmp=l({type:n,selectors:[["ng-component"]],standalone:!0,features:[t],decls:1,vars:3,consts:[["view","auto",3,"onConnect","nodes","edges","connection"]],template:function(s,a){s&1&&(o(0,"vflow",0),m("onConnect",function(p){return a.createEdge(p)}),d()),s&2&&f("nodes",a.nodes)("edges",a.edges)("connection",a.connection)},dependencies:[u,y],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return n})(),L=(()=>{class n extends N{static{this.\u0275fac=(()=>{let e;return function(a){return(e||(e=w(n)))(a||n)}})()}static{this.\u0275cmp=l({type:n,selectors:[["ng-component"]],standalone:!0,features:[h,t],decls:6,vars:1,consts:[[1,"node"],["type","source","position","top","id","a"],["type","source","position","right","id","b"],["type","source","position","bottom","id","c"],["type","source","position","left","id","d"]],template:function(s,a){if(s&1&&(o(0,"div",0),v(1),j(2,"handle",1)(3,"handle",2)(4,"handle",3)(5,"handle",4),d()),s&2){let c;x(),k(" ",(c=a.data())==null?null:c.text," ")}},dependencies:[E],styles:[".node[_ngcontent-%COMP%]{width:100px;height:50px;border:1.5px solid #1b262c;border-radius:5px;display:flex;align-items:center;justify-content:center;color:#000;background-color:#fff}"],changeDetection:0})}}return n})();var M={title:"Connection",mdFile:"./index.md",category:b,demos:{DefaultConnectionDemoComponent:I,LooseConnectionDemoComponent:T},order:3},i=M;var V=[];var H={DefaultConnectionDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;vflow view="auto" [nodes]="nodes" [edges]="edges" (onConnect)="createEdge($event)" /> \`</span>,
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
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">DefaultConnectionDemoComponent</span> {
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
</span></code></pre>`}],LooseConnectionDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/CustomNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomNodeComponent</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;vflow view="auto" [nodes]="nodes" [edges]="edges" [connection]="connection" (onConnect)="createEdge($event)" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">  \`</span>,
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
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">LooseConnectionDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">100</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">LooseConnectionNodeComponent</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'<a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a> 1'</span>,
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">LooseConnectionNodeComponent</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'<a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a> 2'</span>,
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">connection</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></span> = {
</span><span class="line ngde">    <span class="hljs-attr ngde">mode</span>: <span class="hljs-string ngde">'loose'</span>,
</span><span class="line ngde">  };
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">createEdge</span>(<span class="hljs-params ngde">connection: <a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>) {
</span><span class="line ngde">    <span class="hljs-keyword ngde">const</span> { source, target, sourceHandle, targetHandle } = connection;
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span> = [
</span><span class="line ngde">      ...<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span>,
</span><span class="line ngde">      {
</span><span class="line ngde">        <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\`<span class="hljs-subst ngde">\${source}</span><span class="hljs-subst ngde">\${sourceHandle}</span> -> <span class="hljs-subst ngde">\${target}</span><span class="hljs-subst ngde">\${targetHandle}</span>\`</span>,
</span><span class="line ngde">        ...connection,
</span><span class="line ngde">        <span class="hljs-attr ngde">markers</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">end</span>: {
</span><span class="line ngde">            <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'arrow-closed'</span>,
</span><span class="line ngde">          },
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">    ];
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-keyword ngde">interface</span> <span class="hljs-title class_ ngde">LooseConnectionNodeData</span> {
</span><span class="line ngde">  <span class="hljs-attr ngde">text</span>: <span class="hljs-built_in ngde">string</span>;
</span><span class="line ngde">}
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;div class="node"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    {{ data()?.text }}</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;handle type="source" position="top" id="a" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;handle type="source" position="right" id="b" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;handle type="source" position="bottom" id="c" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;handle type="source" position="left" id="d" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">  &#x3C;/div>\`</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [
</span><span class="line ngde">    <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">      .node {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 100px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 50px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border: 1.5px solid #1b262c;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        display: flex;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        align-items: center;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        justify-content: center;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        color: black;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        background-color: white;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde">    \`</span>,
</span><span class="line ngde">  ],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">LooseConnectionNodeComponent</span> <span class="hljs-keyword ngde">extends</span> <span class="hljs-title class_ inherited__ ngde"><a href="/api/ngx-vflow/classes/CustomNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomNodeComponent</a></span>&#x3C;<span class="hljs-title class_ ngde">LooseConnectionNodeData</span>> {}
</span></code></pre>`}]},P=H;var R=`<h1 id="connection" class="ngde">Connection<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/connection#connection"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">Edges are not creating automatically. To create a new edge, follow these steps:</p><ol class="ngde"><li class="ngde">Create handler to the <code class="ngde">(onConnect)</code> event</li><li class="ngde">This handler accepts a <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></code> argument. <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></code> is similar to an <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></code>, but it doesn't exists in the flow, you need to "convert" it into a new <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></code></li><li class="ngde">Update the <code class="ngde">Edge[]</code> list with the new edge that was created from the <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></code>.</li></ol><h2 id="strict-connections" class="ngde">Strict connections<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/connection#strict-connections"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">In the default <code class="ngde">'strict'</code> <code class="ngde">mode</code> of <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></code>, edges are created from connections with strict adherence to the <code class="ngde">source</code> and <code class="ngde">target</code> types of the <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/HandleComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">HandleComponent</a></code>. This means connections can only be established in one direction based on these properties.</p><ng-doc-demo-pane componentname="DefaultConnectionDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane><h2 id="loose-connections" class="ngde">Loose connections<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/connection#loose-connections"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">This is the <code class="ngde">'loose'</code> <code class="ngde">mode</code> of <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></code>, where the flow ignores the handle <code class="ngde">type</code> and allows any handle to connect with any other handle. In this mode, an <code class="ngde">id</code> must be provided for the <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/HandleComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">HandleComponent</a></code> to function correctly.</p><ng-doc-demo-pane componentname="LooseConnectionDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>`,U=(()=>{class n extends C{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=R,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/pages/connection/index.md?message=docs(connection): describe your changes here...",this.page=i,this.demoAssets=P}static{this.\u0275fac=function(s){return new(s||n)}}static{this.\u0275cmp=l({type:n,selectors:[["ng-doc-page-features-connection"]],standalone:!0,features:[D([{provide:C,useExisting:n},V,i.providers??[]]),h,t],decls:1,vars:0,template:function(s,a){s&1&&j(0,"ng-doc-page")},dependencies:[_],encapsulation:2,changeDetection:0})}}return n})(),G=[r(g({},(0,O.isRoute)(i.route)?i.route:{}),{path:"",component:U,title:"Connection"})],cs=G;export{U as DynamicComponent,cs as default};
