import{a as S}from"./chunk-QRC5YIKM.js";import{a as C}from"./chunk-S3I3S5BX.js";import{m as v,v as D,x as k}from"./chunk-2QT3XU5S.js";import{a as b}from"./chunk-U6QX7RQQ.js";import"./chunk-L6GABQZY.js";import{a as r}from"./chunk-DQZJVCWB.js";import{Ba as m,Ea as u,Fa as f,Ga as y,Ha as x,R as p,Ra as g,Sa as c,Ta as l,_ as j,pb as w,qb as t,rb as i,xc as V}from"./chunk-HS5QB4ZO.js";import{a as o,b as h,g as I}from"./chunk-ODLL2QMY.js";var E=I(V());var T=()=>[25,25],F=()=>({type:"dots",gap:25});function R(s,G){if(s&1&&(j(),g(0,"rect",2),l(1,"handle",3),c()),s&2){let a=G.$implicit;x("stroke","red")("fill","red")("fill-opacity",.05)("stroke-width",a.selected()?3:1),f("width",a.width())("height",a.height())}}var _=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:10,y:10},type:"default",text:"1",parentId:"3"},{id:"2",point:{x:90,y:80},type:"default",text:"<strong>2</strong>",parentId:"3"},{id:"3",point:{x:10,y:10},type:"default-group",width:250,height:250},{id:"4",point:{x:280,y:10},type:"default",text:"4"},{id:"5",point:{x:10,y:160},type:"template-group",width:170,height:70,parentId:"3"},{id:"6",point:{x:10,y:10},type:"default",text:"6",parentId:"5"}],this.edges=[{source:"1",target:"2",id:"1 -> 2"},{source:"2",target:"4",id:"2 -> 4"},{source:"5",target:"4",id:"5 -> 4"}]}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=p({type:s,selectors:[["ng-component"]],standalone:!0,features:[t],decls:2,vars:6,consts:[["view","auto",3,"nodes","edges","snapGrid","background"],["groupNode",""],["selectable","","rx","5","ry","5"],["type","source","position","right"]],template:function(n,d){n&1&&(g(0,"vflow",0),u(1,R,2,10,"ng-template",1),c()),n&2&&y("nodes",d.nodes)("edges",d.edges)("snapGrid",i(4,T))("background",i(5,F))},dependencies:[k,D,S,v],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return s})();var A={title:"Snap to Grid",mdFile:"./index.md",category:C,demos:{SubflowsDemoComponent:_}},e=A;var N=[];var M={SubflowsDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;vflow</span>
</span><span class="line ngde"><span class="hljs-string ngde">    view="auto"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [nodes]="nodes"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [edges]="edges"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [snapGrid]="[25, 25]"</span>
</span><span class="line ngde"><span class="hljs-string ngde">    [background]="{ type: 'dots', gap: 25 }"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;ng-template let-ctx groupNode></span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;svg:rect</span>
</span><span class="line ngde"><span class="hljs-string ngde">        selectable</span>
</span><span class="line ngde"><span class="hljs-string ngde">        rx="5"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        ry="5"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [attr.width]="ctx.width()"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [attr.height]="ctx.height()"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [style.stroke]="'red'"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [style.fill]="'red'"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [style.fill-opacity]="0.05"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [style.stroke-width]="ctx.selected() ? 3 : 1"></span>
</span><span class="line ngde"><span class="hljs-string ngde">        &#x3C;handle type="source" position="right" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;/svg:rect></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/ng-template></span>
</span><span class="line ngde"><span class="hljs-string ngde">  &#x3C;/vflow>\`</span>,
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
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">SubflowsDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">10</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\`1\`</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">parentId</span>: <span class="hljs-string ngde">'3'</span>,
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
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">10</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default-group'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">width</span>: <span class="hljs-number ngde">250</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">height</span>: <span class="hljs-number ngde">250</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'4'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">280</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">10</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\`4\`</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'5'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">160</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'template-group'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">width</span>: <span class="hljs-number ngde">170</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">height</span>: <span class="hljs-number ngde">70</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">parentId</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'6'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">10</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\`6\`</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">parentId</span>: <span class="hljs-string ngde">'5'</span>,
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
</span></code></pre>`}]},P=M;var L='<h1 id="snap-to-grid" class="ngde">Snap to Grid<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/snap-to-grid#snap-to-grid"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">You can snap nodes to the grid by passing the <code class="ngde">snapGrid</code> input to the <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/VflowComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">VflowComponent</a></code></p><ng-doc-demo-pane componentname="SubflowsDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>',U=(()=>{class s extends r{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=L,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/pages/snap-to-grid/index.md?message=docs(snap-to-grid): describe your changes here...",this.page=e,this.demoAssets=P}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=p({type:s,selectors:[["ng-doc-page-features-snap-to-grid"]],standalone:!0,features:[w([{provide:r,useExisting:s},N,e.providers??[]]),m,t],decls:1,vars:0,template:function(n,d){n&1&&l(0,"ng-doc-page")},dependencies:[b],encapsulation:2,changeDetection:0})}}return s})(),Y=[h(o({},(0,E.isRoute)(e.route)?e.route:{}),{path:"",component:U,title:"Snap to Grid"})],ns=Y;export{U as DynamicComponent,ns as default};
