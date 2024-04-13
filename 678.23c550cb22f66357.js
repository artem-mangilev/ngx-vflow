"use strict";(self.webpackChunkngx_vflow_demo=self.webpackChunkngx_vflow_demo||[]).push([[678],{678:(L,c,e)=>{e.r(c),e.d(c,{DynamicComponent:()=>g,default:()=>v});var d=e(6286),o=e(7134),i=e(9143),r=e(8341),h=e(2898),s=e(5879),j=e(692),m=e(8874);function f(n,k){if(1&n){const l=s.EpF();s.TgZ(0,"div",2),s.NdJ("click",function(){const C=s.CHM(l).$implicit,w=s.oxw();return s.KtG(w.deleteEdge(C.edge))}),s._uU(1,"Delete"),s.qZA()}2&n&&s.Udp("background-color",k.$implicit.label.data.color)}const p={title:"Labels",mdFile:"./index.md",category:r.Z,demos:{LabelsDemoComponent:(()=>{class n{constructor(){this.nodes=[{id:"1",point:{x:10,y:200},type:"default",text:"1"},{id:"2",point:{x:200,y:100},type:"default",text:"2"},{id:"3",point:{x:200,y:300},type:"default",text:"3"}],this.edges=[{id:"1 -> 2",source:"1",target:"2",edgeLabels:{center:{type:"html-template",data:{color:"#122c26"}}}},{id:"1 -> 3",source:"1",target:"3",edgeLabels:{center:{type:"html-template",data:{color:"#8b599a"}}}}]}deleteEdge(l){this.edges=this.edges.filter(a=>a!==l)}static#s=this.\u0275fac=function(a){return new(a||n)};static#n=this.\u0275cmp=s.Xpm({type:n,selectors:[["ng-component"]],standalone:!0,features:[s.jDz],decls:2,vars:2,consts:[[3,"nodes","edges"],["edgeLabelHtml",""],[1,"label",3,"click"]],template:function(a,t){1&a&&(s.TgZ(0,"vflow",0),s.YNc(1,f,2,2,"ng-template",1),s.qZA()),2&a&&s.Q6J("nodes",t.nodes)("edges",t.edges)},dependencies:[h.p,j.t,m.B],styles:[".label[_ngcontent-%COMP%]{width:60px;height:25px;background-color:#122c26;border-radius:5px;text-align:center}"],changeDetection:0})}return n})()},order:2},x=[],y={LabelsDemoComponent:[{title:"TypeScript",code:'<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/core\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'projects/ngx-vflow-lib/src/public-api\'</span>;\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({\n</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">`&#x3C;vflow [nodes]="nodes" [edges]="edges"></span>\n</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;ng-template edgeLabelHtml let-ctx></span>\n</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;div</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        class="label"</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        [style.background-color]="ctx.label.data.color"</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        (click)="deleteEdge(ctx.edge)">Delete&#x3C;/div></span>\n</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/ng-template></span>\n</span><span class="line ngde"><span class="hljs-string ngde">  &#x3C;/vflow>`</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [<span class="hljs-string ngde">`</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    .label {</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      width: 60px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      height: 25px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      background-color: #122c26;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      border-radius: 5px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      text-align: center;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    }</span>\n</span><span class="line ngde"><span class="hljs-string ngde">  `</span>],\n</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>]\n</span><span class="line ngde">})\n</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">LabelsDemoComponent</span> {\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'1\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'2\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">300</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'3\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1 -> 2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">edgeLabels</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">center</span>: {\n</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'html-template\'</span>,\n</span><span class="line ngde">          <span class="hljs-attr ngde">data</span>: { <span class="hljs-attr ngde">color</span>: <span class="hljs-string ngde">\'#122c26\'</span> }\n</span><span class="line ngde">        }\n</span><span class="line ngde">      }\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1 -> 3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">\'3\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">edgeLabels</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">center</span>: {\n</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'html-template\'</span>,\n</span><span class="line ngde">          <span class="hljs-attr ngde">data</span>: { <span class="hljs-attr ngde">color</span>: <span class="hljs-string ngde">\'#8b599a\'</span> }\n</span><span class="line ngde">        }\n</span><span class="line ngde">      }\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">deleteEdge</span>(<span class="hljs-params ngde">edge: <a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>) {\n</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span> = <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span>.<span class="hljs-title function_ ngde">filter</span>(<span class="hljs-function ngde"><span class="hljs-params ngde">e</span> =></span> e !== edge)\n</span><span class="line ngde">  }\n</span><span class="line ngde">}\n</span></code></pre>'}]};let g=(()=>{class n extends d.a{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent='<h1 id="labels" class="ngde">Labels<a title="Link to heading" class="ng-doc-header-link ngde" href="/examples/labels#labels"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">You can attach labels to edges by providing <code class="ngde">edgeLabels</code> property to needed <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></code>s. There\'s 3 slots available for lables on edge: <code class="ngde">start</code>, <code class="ngde">center</code>, <code class="ngde">end</code>. Label is only of a <code class="ngde">html-template</code> type, so you have to provide <code class="ngde">&#x3C;ng-template edgeLabelHtml></code> inside <code class="ngde">vflow</code>.</p><h2 id="context" class="ngde">Context<a title="Link to heading" class="ng-doc-header-link ngde" href="/examples/labels#context"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">You may access some data for label through <code class="ngde">let-ctx</code> according to this interface.</p><pre class="ngde hljs"><code class="hljs language-ts code-lines ngde" lang="ts" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">interface</span> <span class="hljs-title class_ ngde">EdgeLabelContext</span> {\n</span><span class="line ngde">  <span class="hljs-comment ngde">// Host edge for current label</span>\n</span><span class="line ngde">  <span class="hljs-attr ngde">edge</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>\n</span><span class="line ngde">  <span class="hljs-comment ngde">// Current label</span>\n</span><span class="line ngde">  <span class="hljs-attr ngde">label</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/EdgeLabel" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">EdgeLabel</a></span>\n</span><span class="line ngde">}\n</span></code></pre><h2 id="example" class="ngde">Example<a title="Link to heading" class="ng-doc-header-link ngde" href="/examples/labels#example"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><ng-doc-demo componentname="LabelsDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{"expanded":true}</div></ng-doc-demo>',this.page=p,this.demoAssets=y}static#s=this.\u0275fac=function(a){return new(a||n)};static#n=this.\u0275cmp=s.Xpm({type:n,selectors:[["ng-doc-page-examples-labels"]],standalone:!0,features:[s._Bn([{provide:d.a,useExisting:n},x,p.providers??[]]),s.qOj,s.jDz],decls:1,vars:0,template:function(a,t){1&a&&s._UZ(0,"ng-doc-page")},dependencies:[o.z],encapsulation:2,changeDetection:0})}return n})();const v=[{...(0,i.isRoute)(p.route)?p.route:{},path:"",component:g,title:"Labels"}]}}]);