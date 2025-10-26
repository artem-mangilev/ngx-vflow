import{a as f}from"./chunk-DV74VKYN.js";import"./chunk-S3I3S5BX.js";import{z as j}from"./chunk-3LUJV2NR.js";import"./chunk-NA7FJBPQ.js";import{a as m}from"./chunk-ZBKCENK6.js";import"./chunk-G5N4YGVJ.js";import{a as g}from"./chunk-AKRIWIS4.js";import{T as C}from"./chunk-QMHLIXQX.js";import{Ac as p,Gb as o,Qb as r,bc as l,wa as e,zc as h}from"./chunk-Z42XPK5A.js";import{a as c,b as i,g as v}from"./chunk-ODLL2QMY.js";var x=v(C());var u=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:10,y:10},type:"default",text:"1"},{id:"2",point:{x:90,y:80},type:"default",text:"<strong>2</strong>",parentId:"3"},{id:"3",point:{x:150,y:10},type:"default-group",width:250,height:250},{id:"4",point:{x:450,y:70},type:"default",text:"4"}],this.edges=[{source:"1",target:"2",id:"1 -> 2"},{source:"2",target:"4",id:"2 -> 4"},{source:"5",target:"4",id:"5 -> 4"}]}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=e({type:s,selectors:[["ng-component"]],standalone:!0,features:[p],decls:1,vars:3,consts:[["view","auto",3,"nodes","edges","alignmentHelper"]],template:function(n,d){n&1&&l(0,"vflow",0),n&2&&r("nodes",d.nodes)("edges",d.edges)("alignmentHelper",!0)},dependencies:[j],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return s})();var b={title:"Alignment Helper",mdFile:"./index.md",category:f,demos:{AlignmentHelperDemoComponent:u},order:3},a=b;var y=[];var k={AlignmentHelperDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;vflow view="auto" [nodes]="nodes" [edges]="edges" [alignmentHelper]="true" />\`</span>,
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
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">AlignmentHelperDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">10</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\`1\`</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">90</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">80</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-comment ngde">// it's possible to pass html in this field</span>
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\`&#x3C;strong>2&#x3C;/strong>\`</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">parentId</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">150</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">10</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default-group'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">width</span>: <span class="hljs-number ngde">250</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">height</span>: <span class="hljs-number ngde">250</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'4'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">450</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">70</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\`4\`</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 2'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'4'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2 -> 4'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'5'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'4'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'5 -> 4'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">}
</span></code></pre>`}]},w=k;var A='<h1 id="alignment-helper" class="ngde">Alignment Helper<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/nodes/alignment-helper#alignment-helper"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">The library supports <strong class="ngde">alignment lines</strong> that help align nodes relative to each other. To enable this feature, pass the <code class="ngde">[alignmentHelper]</code> input to the <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/VflowComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">VflowComponent</a></code>. Its value can be either:</p><ul class="ngde"><li class="ngde"><code class="ngde">true</code> \u2013 to enable the helper with default settings</li><li class="ngde">An <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/AlignmentHelperSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">AlignmentHelperSettings</a></code> object \u2013 to configure the helper with custom settings</li></ul><p class="ngde">Try aligning the following flow:</p><ng-doc-demo-pane componentname="AlignmentHelperDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>',H=(()=>{class s extends g{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=A,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/categories/nodes/alignment-helper/index.md?message=docs(alignment-helper): describe your changes here...",this.page=a,this.demoAssets=w}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=e({type:s,selectors:[["ng-doc-page-features-nodes-alignment-helper"]],standalone:!0,features:[h([{provide:g,useExisting:s},y,a.providers??[]]),o,p],decls:1,vars:0,template:function(n,d){n&1&&l(0,"ng-doc-page")},dependencies:[m],encapsulation:2,changeDetection:0})}}return s})(),N=[i(c({},(0,x.isRoute)(a.route)?a.route:{}),{path:"",component:H,title:"Alignment Helper"})],U=N;export{H as DynamicComponent,U as default};
