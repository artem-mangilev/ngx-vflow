import{a as k}from"./chunk-DV74VKYN.js";import"./chunk-S3I3S5BX.js";import{A as N,D as V,m as b}from"./chunk-YYEXNRCA.js";import{a as D}from"./chunk-R2FYFHTZ.js";import"./chunk-FGWLUFMG.js";import{a as m}from"./chunk-JLOZFYHF.js";import{Ba as x,Ea as g,Fa as o,Ga as v,Ma as r,R as p,Ra as _,Sa as w,Ta as l,_ as d,_a as h,na as y,pb as C,qb as i,rb as S,wc as A,ya as a}from"./chunk-VFFNGGE6.js";import{a as f,b as u,g as R}from"./chunk-ODLL2QMY.js";var O=R(A());var E=()=>[10,10];function M(s,c){if(s&1&&(d(),l(0,"ellipse",2)),s&2){let n=h().$implicit;o("cx",n.width()/2)("cy",n.height()/2)("rx",n.width()/2)("ry",n.height()/2)}}function z(s,c){if(s&1&&(d(),l(0,"rect",3)),s&2){let n=h().$implicit;o("width",n.width())("height",n.height())}}function U(s,c){if(s&1&&g(0,M,1,4,":svg:ellipse",2)(1,z,1,2,":svg:rect",3),s&2){let n=c.$implicit;r(0,n.node.data().type==="ellipse"?0:-1),y(),r(1,n.node.data().type==="rect"?1:-1)}}var G=(()=>{class s{constructor(){this.nodes=[{id:"1",point:a({x:100,y:100}),type:"svg-template",width:a(100),height:a(100),data:a({type:"ellipse"})},{id:"2",point:a({x:250,y:100}),type:"svg-template",width:a(100),height:a(100),data:a({type:"rect"})}]}static{this.\u0275fac=function(e){return new(e||s)}}static{this.\u0275cmp=p({type:s,selectors:[["ng-component"]],standalone:!0,features:[i],decls:2,vars:3,consts:[["view","auto",3,"nodes","snapGrid"],["nodeSvg",""],["resizable","","fill","#0f4c75"],["resizable","","fill","#bbe1fa"]],template:function(e,j){e&1&&(_(0,"vflow",0),g(1,U,2,2,"ng-template",1),w()),e&2&&v("nodes",j.nodes)("snapGrid",S(2,E))},dependencies:[V,N,b],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return s})();var L={title:"SVG Nodes",mdFile:"./index.md",category:k,demos:{SvgNodesDemoComponent:G}},t=L;var P=[];var Y={SvgNodesDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span>, signal } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/DynamicNode" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">DynamicNode</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;vflow view="auto" [nodes]="nodes" [snapGrid]="[10, 10]"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;ng-template let-ctx nodeSvg></span>
</span><span class="line ngde"><span class="hljs-string ngde">      @if (ctx.node.data().type === 'ellipse') {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        &#x3C;svg:ellipse</span>
</span><span class="line ngde"><span class="hljs-string ngde">          resizable</span>
</span><span class="line ngde"><span class="hljs-string ngde">          fill="#0f4c75"</span>
</span><span class="line ngde"><span class="hljs-string ngde">          [attr.cx]="ctx.width() / 2"</span>
</span><span class="line ngde"><span class="hljs-string ngde">          [attr.cy]="ctx.height() / 2"</span>
</span><span class="line ngde"><span class="hljs-string ngde">          [attr.rx]="ctx.width() / 2"</span>
</span><span class="line ngde"><span class="hljs-string ngde">          [attr.ry]="ctx.height() / 2" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      @if (ctx.node.data().type === 'rect') {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        &#x3C;svg:rect resizable fill="#bbe1fa" [attr.width]="ctx.width()" [attr.height]="ctx.height()" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
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
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">SvgNodesDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/DynamicNode" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">DynamicNode</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">100</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'svg-template'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">width</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-number ngde">100</span>),
</span><span class="line ngde">      <span class="hljs-attr ngde">height</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-number ngde">100</span>),
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: <span class="hljs-title function_ ngde">signal</span>({
</span><span class="line ngde">        <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'ellipse'</span>,
</span><span class="line ngde">      }),
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">250</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'svg-template'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">width</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-number ngde">100</span>),
</span><span class="line ngde">      <span class="hljs-attr ngde">height</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-number ngde">100</span>),
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: <span class="hljs-title function_ ngde">signal</span>({
</span><span class="line ngde">        <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'rect'</span>,
</span><span class="line ngde">      }),
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">}
</span></code></pre>`}]},T=Y;var I=`<h1 id="svg-nodes" class="ngde">SVG Nodes<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/nodes/svg-nodes#svg-nodes"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">SVG nodes allow you to create custom node shapes using SVG elements. To create an SVG node:</p><ol class="ngde"><li class="ngde">Define a node with <code class="ngde">type: 'svg-template'</code></li><li class="ngde">Use the <code class="ngde">nodeSvg</code> template in your Vflow component</li><li class="ngde">Access node properties via the template context (<code class="ngde">ctx</code>)</li></ol><p class="ngde">The template context has the following type:</p><pre class="ngde hljs"><code class="hljs language-typescript code-lines ngde" lang="typescript" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">interface</span> <span class="hljs-title class_ ngde">SvgNodeContext</span> {
</span><span class="line ngde">  <span class="hljs-attr ngde">node</span>: <span class="hljs-built_in ngde">any</span>;
</span><span class="line ngde">  <span class="hljs-attr ngde">selected</span>: <span class="hljs-title class_ ngde">Signal</span>&#x3C;<span class="hljs-built_in ngde">boolean</span>>;
</span><span class="line ngde">  <span class="hljs-attr ngde">width</span>: <span class="hljs-title class_ ngde">Signal</span>&#x3C;<span class="hljs-built_in ngde">number</span>>;
</span><span class="line ngde">  <span class="hljs-attr ngde">height</span>: <span class="hljs-title class_ ngde">Signal</span>&#x3C;<span class="hljs-built_in ngde">number</span>>;
</span><span class="line ngde">}
</span></code></pre><ng-doc-demo-pane componentname="SvgNodesDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>`,$=(()=>{class s extends m{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=I,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/categories/nodes/svg-nodes/index.md?message=docs(svg-nodes): describe your changes here...",this.page=t,this.demoAssets=T}static{this.\u0275fac=function(e){return new(e||s)}}static{this.\u0275cmp=p({type:s,selectors:[["ng-doc-page-features-nodes-svg-nodes"]],standalone:!0,features:[C([{provide:m,useExisting:s},P,t.providers??[]]),x,i],decls:1,vars:0,template:function(e,j){e&1&&l(0,"ng-doc-page")},dependencies:[D],encapsulation:2,changeDetection:0})}}return s})(),q=[u(f({},(0,O.isRoute)(t.route)?t.route:{}),{path:"",component:$,title:"SVG Nodes"})],is=q;export{$ as DynamicComponent,is as default};
