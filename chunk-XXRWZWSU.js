import{a as k}from"./chunk-VXQ3KRB3.js";import{a as C}from"./chunk-DV74VKYN.js";import"./chunk-S3I3S5BX.js";import{m as b,z as D}from"./chunk-ATAPBDX7.js";import{k as v}from"./chunk-NA7FJBPQ.js";import{a as x}from"./chunk-ZBKCENK6.js";import"./chunk-G5N4YGVJ.js";import{a as i}from"./chunk-AKRIWIS4.js";import{T as G}from"./chunk-QMHLIXQX.js";import{$b as c,Ac as t,Gb as j,Ia as h,Ob as u,Pb as f,Qb as m,Rb as y,ac as g,bc as p,wa as l,zc as w}from"./chunk-Z42XPK5A.js";import{a as o,b as r,g as P}from"./chunk-ODLL2QMY.js";var T=P(G());function E(s,_){if(s&1&&(h(),c(0,"rect",2),p(1,"handle",3),g()),s&2){let a=_.$implicit;y("stroke","red")("fill","red")("fill-opacity",.05)("stroke-width",a.selected()?3:1),f("width",a.width())("height",a.height())}}var N=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:10,y:10},type:"default",text:"1",parentId:"3"},{id:"2",point:{x:90,y:80},type:"default",text:"<strong>2</strong>",parentId:"3"},{id:"3",point:{x:10,y:10},type:"default-group",width:250,height:250},{id:"4",point:{x:280,y:10},type:"default",text:"4"},{id:"5",point:{x:10,y:160},type:"template-group",width:170,height:70,parentId:"3"},{id:"6",point:{x:10,y:10},type:"default",text:"6",parentId:"5"}],this.edges=[{source:"1",target:"2",id:"1 -> 2"},{source:"2",target:"4",id:"2 -> 4"},{source:"5",target:"4",id:"5 -> 4"}]}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=l({type:s,selectors:[["ng-component"]],standalone:!0,features:[t],decls:2,vars:2,consts:[["view","auto",3,"nodes","edges"],["groupNode",""],["selectable","","rx","5","ry","5"],["type","source","position","right"]],template:function(n,d){n&1&&(c(0,"vflow",0),u(1,E,2,10,"ng-template",1),g()),n&2&&m("nodes",d.nodes)("edges",d.edges)},dependencies:[D,v,k,b],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return s})();var O={title:"Subflows",mdFile:"./index.md",category:C,demos:{SubflowsDemoComponent:N},keyword:"FeaturesSubflows",order:3},e=O;var S=[];var V={SubflowsDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
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
</span></code></pre>`}]},I=V;var R=`<h1 id="subflows" class="ngde">Subflows<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/nodes/subflows#subflows"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">A subflow is a node that can contain child nodes. Key things about subflows:</p><ul class="ngde"><li class="ngde">To create a subflow, you need to use a <code class="ngde">default-group</code> or <code class="ngde">template-group</code> <code class="ngde">type</code> on <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></code> or <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/type-aliases/DynamicNode" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">DynamicNode</a></code>.</li><li class="ngde">To associate a node with a subflow, set the <code class="ngde">parentId</code> to the ID of the subflow.</li><li class="ngde">Nodes within a subflow have coordinates <em class="ngde">relative</em> to that subflow.</li><li class="ngde">A subflow is itself a node, so it can act as a source or a target (this functionality is available only for <code class="ngde">template-group</code> subflows).</li><li class="ngde">Use the <code class="ngde">groupNode</code> directive on an <code class="ngde">ng-template</code> to define your custom subflow. While a custom subflow can theoretically be any SVG structure, it's recommended to use the <code class="ngde">&#x3C;rect /></code> element.</li></ul><ng-doc-demo-pane componentname="SubflowsDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane><h2 id="see-also" class="ngde">See also<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/nodes/subflows#see-also"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><ul class="ngde"><li class="ngde"><code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/DefaultGroupNode" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">DefaultGroupNode</a></code></li><li class="ngde"><code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/TemplateGroupNode" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">TemplateGroupNode</a></code></li><li class="ngde"><code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/DefaultDynamicGroupNode" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">DefaultDynamicGroupNode</a></code></li><li class="ngde"><code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/TemplateDynamicGroupNode" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">TemplateDynamicGroupNode</a></code></li></ul>`,F=(()=>{class s extends i{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=R,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/categories/nodes/subflows/index.md?message=docs(subflows): describe your changes here...",this.page=e,this.demoAssets=I}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=l({type:s,selectors:[["ng-doc-page-features-nodes-subflows"]],standalone:!0,features:[w([{provide:i,useExisting:s},S,e.providers??[]]),j,t],decls:1,vars:0,template:function(n,d){n&1&&p(0,"ng-doc-page")},dependencies:[x],encapsulation:2,changeDetection:0})}}return s})(),M=[r(o({},(0,T.isRoute)(e.route)?e.route:{}),{path:"",component:F,title:"Subflows"})],X=M;export{F as DynamicComponent,X as default};
