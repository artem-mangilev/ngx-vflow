import{a as L}from"./chunk-S3I3S5BX.js";import{j as _,w as D}from"./chunk-WPOQ3LVW.js";import{a as C}from"./chunk-GPBMHN32.js";import"./chunk-MUKF72JZ.js";import{a as g}from"./chunk-T6GQPSCF.js";import{Ba as m,Ea as j,Ga as f,Ha as u,R as t,Ra as d,Sa as c,Ta as y,Xa as x,Y as r,Z as h,Za as b,_a as w,jb as k,pb as v,qb as p,xc as A}from"./chunk-FDES3R26.js";import{a as i,b as o,g as V}from"./chunk-P2VZOJAX.js";var S=V(A());function M(s,O){if(s&1){let e=x();d(0,"div",2),b("click",function(){let a=r(e).$implicit,N=w();return h(N.deleteEdge(a.edge))}),k(1,"Delete"),c()}if(s&2){let e=O.$implicit;u("background-color",e.label.data.color)}}var E=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:10,y:200},type:"default",text:"1"},{id:"2",point:{x:200,y:100},type:"default",text:"2"},{id:"3",point:{x:200,y:300},type:"default",text:"3"}],this.edges=[{id:"1 -> 2",source:"1",target:"2",edgeLabels:{center:{type:"html-template",data:{color:"#122c26"}}}},{id:"1 -> 3",source:"1",target:"3",edgeLabels:{center:{type:"default",text:"Some Text",style:{color:"black",lineHeight:"80%",borderRadius:"5px"}}}}]}deleteEdge(e){this.edges=this.edges.filter(n=>n!==e)}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=t({type:s,selectors:[["ng-component"]],standalone:!0,features:[p],decls:2,vars:2,consts:[["view","auto",3,"nodes","edges"],["edgeLabelHtml",""],[1,"label",3,"click"]],template:function(n,a){n&1&&(d(0,"vflow",0),j(1,M,2,2,"ng-template",1),c()),n&2&&f("nodes",a.nodes)("edges",a.edges)},dependencies:[D,_],styles:["[_nghost-%COMP%]{width:100%;height:100%}.label[_ngcontent-%COMP%]{width:60px;height:25px;background-color:#122c26;border-radius:5px;text-align:center}"],changeDetection:0})}}return s})();var H={title:"Labels",mdFile:"./index.md",category:L,demos:{LabelsDemoComponent:E},order:2},l=H;var T=[];var F={LabelsDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
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
</span><span class="line ngde">          <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">          <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'Some Text'</span>,
</span><span class="line ngde">          <span class="hljs-attr ngde">style</span>: {
</span><span class="line ngde">            <span class="hljs-attr ngde">color</span>: <span class="hljs-string ngde">'black'</span>,
</span><span class="line ngde">            <span class="hljs-attr ngde">lineHeight</span>: <span class="hljs-string ngde">'80%'</span>,
</span><span class="line ngde">            <span class="hljs-attr ngde">borderRadius</span>: <span class="hljs-string ngde">'5px'</span>,
</span><span class="line ngde">          },
</span><span class="line ngde">        },
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">deleteEdge</span>(<span class="hljs-params ngde">edge: <a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span> = <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span>.<span class="hljs-title function_ ngde">filter</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">e</span>) =></span> e !== edge);
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre>`}]},P=F;var I=`<h1 id="labels" class="ngde">Labels<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/labels#labels"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">You can attach labels to edges by providing the <code class="ngde">edgeLabels</code> property to the <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></code>s. There are three slots available for labels on an edge: <code class="ngde">start</code>, <code class="ngde">center</code>, and <code class="ngde">end</code>.</p><p class="ngde">There are several ways a label can appear on an edge.</p><h2 id="default" class="ngde">Default<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/labels#default"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">This method renders simple static text on the edge. To achieve this, you need to:</p><ul class="ngde"><li class="ngde">Pass the <code class="ngde">default</code> type to <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/type-aliases/EdgeLabel" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">EdgeLabel</a></code>.</li><li class="ngde">Set the <code class="ngde">text</code>.</li><li class="ngde">Optionally add the <code class="ngde">style</code>, which supports any CSS property.</li></ul><h2 id="html-template" class="ngde">HTML Template<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/labels#html-template"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">This method renders complex HTML on the edge. To achieve this, you need to:</p><ul class="ngde"><li class="ngde">Pass the <code class="ngde">html-template</code> type to <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/type-aliases/EdgeLabel" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">EdgeLabel</a></code>.</li><li class="ngde">Provide the <code class="ngde">&#x3C;ng-template edgeLabelHtml></code> inside <code class="ngde">vflow</code>.</li><li class="ngde">Optionally pass any <code class="ngde">data</code> that will be accessible in the template context.</li></ul><h3 id="context" class="ngde">Context<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/labels#context"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h3><p class="ngde">You may access some data for label through <code class="ngde">let-ctx</code> according to this interface.</p><pre class="ngde hljs"><code class="hljs language-ts code-lines ngde" lang="ts" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">interface</span> <span class="hljs-title class_ ngde">EdgeLabelContext</span> {
</span><span class="line ngde">  <span class="hljs-comment ngde">// Host edge for current label</span>
</span><span class="line ngde">  <span class="hljs-attr ngde">edge</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>;
</span><span class="line ngde">  <span class="hljs-comment ngde">// Current label</span>
</span><span class="line ngde">  <span class="hljs-attr ngde">label</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/EdgeLabel" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">EdgeLabel</a></span>;
</span><span class="line ngde">}
</span></code></pre><h2 id="example" class="ngde">Example<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/labels#example"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><ng-doc-demo-pane componentname="LabelsDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>`,Y=(()=>{class s extends g{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=I,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/pages/labels/index.md?message=docs(labels): describe your changes here...",this.page=l,this.demoAssets=P}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=t({type:s,selectors:[["ng-doc-page-features-labels"]],standalone:!0,features:[v([{provide:g,useExisting:s},T,l.providers??[]]),m,p],decls:1,vars:0,template:function(n,a){n&1&&y(0,"ng-doc-page")},dependencies:[C],encapsulation:2,changeDetection:0})}}return s})(),z=[o(i({},(0,S.isRoute)(l.route)?l.route:{}),{path:"",component:Y,title:"Labels"})],ns=z;export{Y as DynamicComponent,ns as default};
