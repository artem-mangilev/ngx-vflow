import{a as _}from"./chunk-S3I3S5BX.js";import{j as D,x as L}from"./chunk-C4BU5KRR.js";import{a as k}from"./chunk-SH6HWCPG.js";import"./chunk-CQCG3KCY.js";import{a as g}from"./chunk-WT6KFS7F.js";import{Ba as m,Ea as j,Ga as f,Ha as u,Pa as d,Qa as c,R as p,Ra as x,Va as y,Xa as b,Y as r,Ya as v,Z as h,hb as w,nb as C,ob as t,vc as R}from"./chunk-VLX6VUPD.js";import{a as i,b as o,g as V}from"./chunk-P2VZOJAX.js";var S=V(R());function I(s,T){if(s&1){let a=y();d(0,"div",2),b("click",function(){let e=r(a).$implicit,O=v();return h(O.deleteEdge(e.edge))}),w(1,"Delete"),c()}if(s&2){let a=T.$implicit;u("background-color",a.label.data.color)}}var E=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:10,y:200},type:"default",text:"1"},{id:"2",point:{x:200,y:100},type:"default",text:"2"},{id:"3",point:{x:200,y:300},type:"default",text:"3"}],this.edges=[{id:"1 -> 2",source:"1",target:"2",edgeLabels:{center:{type:"html-template",data:{color:"#122c26"}}}},{id:"1 -> 3",source:"1",target:"3",edgeLabels:{center:{type:"html-template",data:{color:"#8b599a"}}}}]}deleteEdge(a){this.edges=this.edges.filter(n=>n!==a)}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=p({type:s,selectors:[["ng-component"]],standalone:!0,features:[t],decls:2,vars:2,consts:[["view","auto",3,"nodes","edges"],["edgeLabelHtml",""],[1,"label",3,"click"]],template:function(n,e){n&1&&(d(0,"vflow",0),j(1,I,2,2,"ng-template",1),c()),n&2&&f("nodes",e.nodes)("edges",e.edges)},dependencies:[L,D],styles:["[_nghost-%COMP%]{width:100%;height:100%}.label[_ngcontent-%COMP%]{width:60px;height:25px;background-color:#122c26;border-radius:5px;text-align:center}"],changeDetection:0})}}return s})();var F={title:"Labels",mdFile:"./index.md",category:_,demos:{LabelsDemoComponent:E},order:2},l=F;var P=[];var M={LabelsDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;vflow view="auto" [nodes]="nodes" [edges]="edges"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;ng-template let-ctx edgeLabelHtml></span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;div class="label" [style.background-color]="ctx.label.data.color" (click)="deleteEdge(ctx.edge)">Delete&#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/ng-template></span>
</span><span class="line ngde"><span class="hljs-string ngde">  &#x3C;/vflow>\`</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [
</span><span class="line ngde">    <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">      :host {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 100%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 100%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      .label {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 60px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 25px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        background-color: #122c26;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        text-align: center;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde">    \`</span>,
</span><span class="line ngde">  ],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">LabelsDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">200</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">300</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">edgeLabels</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">center</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">          <span class="hljs-attr ngde">data</span>: { <span class="hljs-attr ngde">color</span>: <span class="hljs-string ngde">'#122c26'</span> },
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">edgeLabels</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">center</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">          <span class="hljs-attr ngde">data</span>: { <span class="hljs-attr ngde">color</span>: <span class="hljs-string ngde">'#8b599a'</span> },
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">deleteEdge</span>(<span class="hljs-params ngde">edge: <a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span> = <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span>.<span class="hljs-title function_ ngde">filter</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">e</span>) =></span> e !== edge);
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre>`}]},N=M;var Y=`<h1 id="labels" class="ngde">Labels<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/labels#labels"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">You can attach labels to edges by providing the <code class="ngde">edgeLabels</code> property to the needed <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></code>s. There are three slots available for labels on an edge: <code class="ngde">start</code>, <code class="ngde">center</code>, <code class="ngde">end</code>. The label is only of the <code class="ngde">html-template</code> type, so you have to provide <code class="ngde">&#x3C;ng-template edgeLabelHtml></code> inside <code class="ngde">vflow</code>.</p><h2 id="context" class="ngde">Context<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/labels#context"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">You may access some data for label through <code class="ngde">let-ctx</code> according to this interface.</p><pre class="ngde hljs"><code class="hljs language-ts code-lines ngde" lang="ts" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">interface</span> <span class="hljs-title class_ ngde">EdgeLabelContext</span> {
</span><span class="line ngde">  <span class="hljs-comment ngde">// Host edge for current label</span>
</span><span class="line ngde">  <span class="hljs-attr ngde">edge</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>;
</span><span class="line ngde">  <span class="hljs-comment ngde">// Current label</span>
</span><span class="line ngde">  <span class="hljs-attr ngde">label</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/EdgeLabel" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">EdgeLabel</a></span>;
</span><span class="line ngde">}
</span></code></pre><h2 id="example" class="ngde">Example<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/labels#example"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><ng-doc-demo-pane componentname="LabelsDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>`,H=(()=>{class s extends g{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=Y,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/pages/labels/index.md?message=docs(labels): describe your changes here...",this.page=l,this.demoAssets=N}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=p({type:s,selectors:[["ng-doc-page-features-labels"]],standalone:!0,features:[C([{provide:g,useExisting:s},P,l.providers??[]]),m,t],decls:1,vars:0,template:function(n,e){n&1&&x(0,"ng-doc-page")},dependencies:[k],encapsulation:2,changeDetection:0})}}return s})(),U=[o(i({},(0,S.isRoute)(l.route)?l.route:{}),{path:"",component:H,title:"Labels"})],ns=U;export{H as DynamicComponent,ns as default};
