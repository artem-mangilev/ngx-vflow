import{a as k}from"./chunk-S3I3S5BX.js";import{d as w,n as C}from"./chunk-OTAEONLZ.js";import"./chunk-YV53NWFE.js";import"./chunk-IQL2UJ6C.js";import"./chunk-IO7LDB7E.js";import{a as x}from"./chunk-VYAX5YUU.js";import"./chunk-WI2JOD2Y.js";import{a as c}from"./chunk-34LC2K2P.js";import{T as P}from"./chunk-MU5S45C6.js";import{$b as f,Ac as p,Gb as r,Ia as o,Ob as h,Rb as m,Sb as j,ac as u,bc as t,wa as l,zc as y}from"./chunk-WSOERDLG.js";import{a as g,b as i,g as S}from"./chunk-P2VZOJAX.js";var b=S(P());function O(s,_){if(s&1&&(o(),t(0,"path",2)),s&2){let n=_.$implicit;m("d",n.path())("stroke-width",n.edge.data.strokeWidth)("stroke",n.edge.data.color)("marker-end",n.markerEnd())}}var v=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:10,y:200},type:"default",text:"1"},{id:"2",point:{x:200,y:100},type:"default",text:"2"},{id:"3",point:{x:200,y:300},type:"default",text:"3"}],this.edges=[{id:"1 -> 2",source:"1",target:"2",type:"template",data:{strokeWidth:4,color:"#ffeeaa"},markers:{end:{type:"arrow-closed",width:30,height:30,color:"#ffeeaa"}}},{id:"1 -> 3",source:"1",target:"3",type:"template",data:{strokeWidth:2,color:"#ec586e"}}]}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=l({type:s,selectors:[["ng-component"]],standalone:!0,features:[p],decls:2,vars:2,consts:[["view","auto",3,"nodes","edges"],["edge",""],["fill","none"]],template:function(a,d){a&1&&(f(0,"vflow",0),h(1,O,1,4,"ng-template",1),u()),a&2&&j("nodes",d.nodes)("edges",d.edges)},dependencies:[C,w],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return s})();var T={title:"Custom edges",mdFile:"./index.md",category:k,demos:{CustomEdgesDemoComponent:v},order:3},e=T;var D=[];var V={CustomEdgesDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'projects/ngx-vflow-lib/src/public-api'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;vflow view="auto" [nodes]="nodes" [edges]="edges"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;ng-template edge let-ctx></span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;svg:path</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [attr.d]="ctx.path()"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [attr.stroke-width]="ctx.edge.data.strokeWidth"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [attr.stroke]="ctx.edge.data.color"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [attr.marker-end]="ctx.markerEnd()"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        fill="none"</span>
</span><span class="line ngde"><span class="hljs-string ngde">      /></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/ng-template></span>
</span><span class="line ngde"><span class="hljs-string ngde">  &#x3C;/vflow>\`</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [<span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">    :host {</span>
</span><span class="line ngde"><span class="hljs-string ngde">      width: 100%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      height: 100%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">    }</span>
</span><span class="line ngde"><span class="hljs-string ngde">  \`</span>],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>]
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">CustomEdgesDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'1'</span>
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'2'</span>
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">300</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'3'</span>
</span><span class="line ngde">    },
</span><span class="line ngde">  ]
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'template'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">strokeWidth</span>: <span class="hljs-number ngde">4</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">color</span>: <span class="hljs-string ngde">'#ffeeaa'</span>
</span><span class="line ngde">      },
</span><span class="line ngde">      <span class="hljs-attr ngde">markers</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">end</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'arrow-closed'</span>,
</span><span class="line ngde">          <span class="hljs-attr ngde">width</span>: <span class="hljs-number ngde">30</span>,
</span><span class="line ngde">          <span class="hljs-attr ngde">height</span>: <span class="hljs-number ngde">30</span>,
</span><span class="line ngde">          <span class="hljs-attr ngde">color</span>: <span class="hljs-string ngde">'#ffeeaa'</span>
</span><span class="line ngde">        }
</span><span class="line ngde">      }
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'template'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">strokeWidth</span>: <span class="hljs-number ngde">2</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">color</span>: <span class="hljs-string ngde">'#ec586e'</span>
</span><span class="line ngde">      }
</span><span class="line ngde">    },
</span><span class="line ngde">  ]
</span><span class="line ngde">}
</span></code></pre>`}]},E=V;var A=`<h1 id="custom-edges" class="ngde">Custom edges<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/custom-edges#custom-edges"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">You can customize your edges. To achieve this, follow these steps:</p><ol class="ngde"><li class="ngde">Change the edge type to <code class="ngde">template</code></li><li class="ngde">Create an <code class="ngde">ng-template</code> with the <code class="ngde">edge</code> selector inside <code class="ngde">vflow</code></li><li class="ngde">Create an SVG path which you will customize</li><li class="ngde">In the <code class="ngde">ng-template</code>, the library provides <code class="ngde">let-ctx</code> with important data for you, such as the <code class="ngde">path</code> signal with current path. Additionally, the <code class="ngde">edge</code> field contains current edge from one the <code class="ngde">[edges]</code>, from which you can retrieve custom <code class="ngde">data</code>. Furthermore, you can access <code class="ngde">markerStart</code> and <code class="ngde">markerEnd</code> signals with markers for current <code class="ngde">edge</code>.</li></ol><h2 id="context" class="ngde">Context<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/custom-edges#context"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">It's tricky to infer type for <code class="ngde">let-ctx</code>, so here is an interface with available fields for this context.</p><pre class="ngde hljs"><code class="hljs language-ts code-lines ngde" lang="ts" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">interface</span> <span class="hljs-title class_ ngde">EdgeContext</span> {
</span><span class="line ngde">  <span class="hljs-attr ngde">edge</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>
</span><span class="line ngde">  <span class="hljs-attr ngde">path</span>: <span class="hljs-title class_ ngde">Signal</span>&#x3C;<span class="hljs-built_in ngde">string</span>>
</span><span class="line ngde">  <span class="hljs-attr ngde">markerStart</span>: <span class="hljs-title class_ ngde">Signal</span>&#x3C;<span class="hljs-built_in ngde">string</span>>
</span><span class="line ngde">  <span class="hljs-attr ngde">markerEnd</span>: <span class="hljs-title class_ ngde">Signal</span>&#x3C;<span class="hljs-built_in ngde">string</span>>
</span><span class="line ngde">}
</span></code></pre><h2 id="example" class="ngde">Example<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/custom-edges#example"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><ng-doc-demo-pane componentname="CustomEdgesDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>`,R=(()=>{class s extends c{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=A,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/pages/custom-edges/index.md?message=docs(custom-edges): describe your changes here...",this.page=e,this.demoAssets=E}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=l({type:s,selectors:[["ng-doc-page-features-custom-edges"]],standalone:!0,features:[y([{provide:c,useExisting:s},D,e.providers??[]]),r,p],decls:1,vars:0,template:function(a,d){a&1&&t(0,"ng-doc-page")},dependencies:[x],encapsulation:2,changeDetection:0})}}return s})(),F=[i(g({},(0,b.isRoute)(e.route)?e.route:{}),{path:"",component:R,title:"Custom edges"})],J=F;export{R as DynamicComponent,J as default};
