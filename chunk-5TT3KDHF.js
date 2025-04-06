import{a as _}from"./chunk-C2JXDQ77.js";import{a as M}from"./chunk-A33S2FMW.js";import{a as C}from"./chunk-S3I3S5BX.js";import{m as b,w as D,y as k}from"./chunk-UKKUZNX5.js";import{a as v}from"./chunk-R2FYFHTZ.js";import"./chunk-FGWLUFMG.js";import{a as r}from"./chunk-JLOZFYHF.js";import{Ba as u,Ea as f,Fa as y,Ga as d,Ha as x,R as p,Ra as g,Sa as c,Ta as e,_ as m,na as j,pb as w,qb as t,wc as T}from"./chunk-VFFNGGE6.js";import{a as o,b as h,g as I}from"./chunk-ODLL2QMY.js";var S=I(T());function V(s,E){if(s&1&&(m(),g(0,"rect",3),e(1,"handle",4),c()),s&2){let a=E.$implicit;x("stroke","red")("fill","red")("fill-opacity",.05)("stroke-width",a.selected()?3:1),y("width",a.width())("height",a.height())}}var P=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:10,y:10},type:"default",text:"1",parentId:"3"},{id:"2",point:{x:90,y:80},type:"default",text:"<strong>2</strong>",parentId:"3"},{id:"3",point:{x:10,y:10},type:"default-group",width:250,height:250},{id:"4",point:{x:280,y:10},type:"default",text:"4"},{id:"5",point:{x:10,y:160},type:"template-group",width:170,height:70,parentId:"3"},{id:"6",point:{x:10,y:10},type:"default",text:"6",parentId:"5"}],this.edges=[{source:"1",target:"2",id:"1 -> 2"},{source:"2",target:"4",id:"2 -> 4"},{source:"5",target:"4",id:"5 -> 4"}]}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=p({type:s,selectors:[["ng-component"]],standalone:!0,features:[t],decls:3,vars:3,consts:[["view","auto",3,"nodes","edges"],["groupNode",""],[3,"scaleOnHover"],["selectable","","rx","5","ry","5"],["type","source","position","right"]],template:function(n,i){n&1&&(g(0,"vflow",0),f(1,V,2,10,"ng-template",1),e(2,"mini-map",2),c()),n&2&&(d("nodes",i.nodes)("edges",i.edges),j(2),d("scaleOnHover",!0))},dependencies:[k,D,M,_,b],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return s})();var A={title:"Minimap",mdFile:"./index.md",category:C,demos:{MinimapDemoComponent:P}},l=A;var N=[];var F={MinimapDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;vflow view="auto" [nodes]="nodes" [edges]="edges"></span>
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
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;mini-map [scaleOnHover]="true" /></span>
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
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">MinimapDemoComponent</span> {
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
</span></code></pre>`}]},O=F;var G='<h1 id="minimap" class="ngde">Minimap<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/minimap#minimap"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">The library includes a minimap that offers an overview of the entire flow. To enable it, simply add a <code class="ngde">&#x3C;mini-map /></code> component as a direct child of <code class="ngde">&#x3C;vflow /></code>. For customization options, see the available inputs in <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/MiniMapComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">MiniMapComponent</a></code>.</p><p class="ngde">Planned enhancements for the minimap:</p><ul class="ngde"><li class="ngde">Develop an API to customize mini-node appearance (e.g., color, stroke)</li><li class="ngde">Enable panning and zooming within the minimap</li><li class="ngde">Render mini-nodes to visually match main nodes, using a simplified DOM structure to optimize performance</li></ul><ng-doc-demo-pane componentname="MinimapDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>',z=(()=>{class s extends r{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=G,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/pages/minimap/index.md?message=docs(minimap): describe your changes here...",this.page=l,this.demoAssets=O}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=p({type:s,selectors:[["ng-doc-page-features-minimap"]],standalone:!0,features:[w([{provide:r,useExisting:s},N,l.providers??[]]),u,t],decls:1,vars:0,template:function(n,i){n&1&&e(0,"ng-doc-page")},dependencies:[v],encapsulation:2,changeDetection:0})}}return s})(),L=[h(o({},(0,S.isRoute)(l.route)?l.route:{}),{path:"",component:z,title:"Minimap"})],ss=L;export{z as DynamicComponent,ss as default};
