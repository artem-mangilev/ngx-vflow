import{a as R}from"./chunk-NGK3AQVU.js";import{a as A}from"./chunk-GTR7OBKN.js";import{a as M}from"./chunk-VD73JAKW.js";import{i as T,k as P,z as O}from"./chunk-3LUJV2NR.js";import{k as V}from"./chunk-NA7FJBPQ.js";import{a as N}from"./chunk-ZBKCENK6.js";import"./chunk-G5N4YGVJ.js";import{a as b}from"./chunk-AKRIWIS4.js";import{T as H}from"./chunk-QMHLIXQX.js";import{$b as l,Ac as g,Ga as r,Gb as w,Ha as h,Ia as y,Ob as C,Pb as k,Qb as v,Sb as D,ac as p,bc as t,fc as j,hc as m,ic as u,pb as _,tc as S,wa as c,zc as E}from"./chunk-Z42XPK5A.js";import{a as f,b as x,g as G}from"./chunk-ODLL2QMY.js";var L=G(H());function $(s,i){if(s&1){let n=j();l(0,"div",3),m("keydown.backspace",function(){let e=r(n).$implicit,o=u();return h(e.selected()&&o.deleteNode(e.node))}),l(1,"button",4),S(2,"Select here"),p(),t(3,"handle",5)(4,"handle",6),p()}if(s&2){let n=i.$implicit;D("custom-node_selected",n.selected())}}function z(s,i){if(s&1){let n=j();y(),l(0,"g",7),m("keydown.backspace",function(){let e=r(n).$implicit,o=u();return h(e.selected()&&o.deleteEdge(e.edge))}),t(1,"path",8),p()}if(s&2){let n=i.$implicit;_(),k("d",n.path())("stroke",n.selected()?"#0f4c75":"#bbe1fa")}}var F=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:10,y:150},type:"html-template"},{id:"2",point:{x:290,y:50},type:"html-template"},{id:"3",point:{x:290,y:300},type:"html-template"}],this.edges=[{id:"1 -> 2",source:"1",target:"2",type:"template"},{id:"1 -> 3",source:"1",target:"3",type:"template"}]}deleteNode(n){this.nodes=this.nodes.filter(a=>a.id!==n.id)}deleteEdge(n){this.edges=this.edges.filter(a=>a.id!==n.id)}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=c({type:s,selectors:[["ng-component"]],standalone:!0,features:[g],decls:3,vars:2,consts:[["view","auto",3,"nodes","edges"],["nodeHtml",""],["edge",""],["tabindex","0",1,"custom-node","without-tab-index",3,"keydown.backspace"],["selectable","",1,"custom-node__button"],["type","source","position","right"],["type","target","position","left"],["tabindex","0","customTemplateEdge","","selectable","",1,"without-tab-index","custom-template-edge",3,"keydown.backspace"],["fill","none","stroke-width","2"]],template:function(a,e){a&1&&(l(0,"vflow",0),C(1,$,5,2,"ng-template",1)(2,z,2,2,"ng-template",2),p()),a&2&&v("nodes",e.nodes)("edges",e.edges)},dependencies:[O,V,M,A,P,T],styles:["[_nghost-%COMP%]{width:100%;height:100%}.custom-node[_ngcontent-%COMP%]{width:150px;height:100px;background:#bbe1fa;border:1px solid gray;border-radius:5px;display:flex;align-items:center;justify-content:center}.custom-node__button[_ngcontent-%COMP%]{border:0;outline:0;cursor:pointer;color:#fff;background-color:#1b262c;border-radius:4px;font-size:14px;font-weight:500;padding:4px 8px;display:inline-block;min-height:28px}.custom-node_selected[_ngcontent-%COMP%]{border-color:#1b262c}.without-tab-index[_ngcontent-%COMP%]{outline:none}"],changeDetection:0})}}return s})();var W={title:"Delete selected",mdFile:"./index.md",category:R,demos:{DeleteSelectedDemoComponent:F},order:2},d=W;var U=[];var q={DeleteSelectedDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">templateUrl</span>: <span class="hljs-string ngde">'./delete-selected-demo.component.html'</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styleUrls</span>: [<span class="hljs-string ngde">'./delete-selected-demo.component.scss'</span>],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">DeleteSelectedDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">150</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">290</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">50</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">290</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">300</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'template'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'template'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">deleteNode</span>(<span class="hljs-params ngde">node: <a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">nodes</span> = <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">nodes</span>.<span class="hljs-title function_ ngde">filter</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">n</span>) =></span> n.<span class="hljs-property ngde">id</span> !== node.<span class="hljs-property ngde">id</span>);
</span><span class="line ngde">  }
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">deleteEdge</span>(<span class="hljs-params ngde">edge: <a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span> = <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span>.<span class="hljs-title function_ ngde">filter</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">e</span>) =></span> e.<span class="hljs-property ngde">id</span> !== edge.<span class="hljs-property ngde">id</span>);
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre>`},{title:"HTML",code:`<pre class="ngde hljs"><code lang="html" class="hljs language-html code-lines ngde"><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">vflow</span> <span class="hljs-attr ngde">view</span>=<span class="hljs-string ngde">"auto"</span> [<span class="hljs-attr ngde">nodes</span>]=<span class="hljs-string ngde">"nodes"</span> [<span class="hljs-attr ngde">edges</span>]=<span class="hljs-string ngde">"edges"</span>></span>
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-template</span> <span class="hljs-attr ngde">let-ctx</span> <span class="hljs-attr ngde">nodeHtml</span>></span>
</span><span class="line ngde">    &#x3C;<span class="hljs-name ngde">div</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">      </span><span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"custom-node without-tab-index"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">      </span><span class="hljs-attr ngde">tabindex</span>=<span class="hljs-string ngde">"0"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">      [</span><span class="hljs-attr ngde">class.custom-node_selected</span>]=<span class="hljs-string ngde">"ctx.selected()"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">      (</span><span class="hljs-attr ngde">keydown.backspace</span>)=<span class="hljs-string ngde">"ctx.selected() &#x26;&#x26; deleteNode(ctx.node)"</span>>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">button</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"custom-node__button"</span> <span class="hljs-attr ngde">selectable</span>></span>Select here<span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">button</span>></span>
</span><span class="line ngde">
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"source"</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"right"</span> /></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"target"</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"left"</span> /></span>
</span><span class="line ngde">    <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">ng-template</span>></span>
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-template</span> <span class="hljs-attr ngde">let-ctx</span> <span class="hljs-attr ngde">edge</span>></span>
</span><span class="line ngde">    &#x3C;<span class="hljs-name ngde">svg:g</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">      </span><span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"without-tab-index custom-template-edge"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">      </span><span class="hljs-attr ngde">tabindex</span>=<span class="hljs-string ngde">"0"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">      </span><span class="hljs-attr ngde">customTemplateEdge</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">      </span><span class="hljs-attr ngde">selectable</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">      (</span><span class="hljs-attr ngde">keydown.backspace</span>)=<span class="hljs-string ngde">"ctx.selected() &#x26;&#x26; deleteEdge(ctx.edge)"</span>>
</span><span class="line ngde">      &#x3C;<span class="hljs-name ngde">svg:path</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">        </span><span class="hljs-attr ngde">fill</span>=<span class="hljs-string ngde">"none"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">        </span><span class="hljs-attr ngde">stroke-width</span>=<span class="hljs-string ngde">"2"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">        [</span><span class="hljs-attr ngde">attr.d</span>]=<span class="hljs-string ngde">"ctx.path()"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">        [</span><span class="hljs-attr ngde">attr.stroke</span>]=<span class="hljs-string ngde">"ctx.selected() ? '#0f4c75' : '#bbe1fa'"</span> />
</span><span class="line ngde">    <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">svg:g</span>></span>
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">ng-template</span>></span>
</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">vflow</span>></span>
</span></code></pre>`},{title:"SCSS",code:`<pre class="ngde hljs"><code lang="scss" class="hljs language-scss code-lines ngde"><span class="line ngde"><span class="hljs-selector-pseudo ngde">:host</span> {
</span><span class="line ngde">  <span class="hljs-attribute ngde">width</span>: <span class="hljs-number ngde">100%</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">height</span>: <span class="hljs-number ngde">100%</span>;
</span><span class="line ngde">}
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-selector-class ngde">.custom-node</span> {
</span><span class="line ngde">  <span class="hljs-attribute ngde">width</span>: <span class="hljs-number ngde">150px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">height</span>: <span class="hljs-number ngde">100px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">background</span>: <span class="hljs-number ngde">#bbe1fa</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">border</span>: <span class="hljs-number ngde">1px</span> solid gray;
</span><span class="line ngde">  <span class="hljs-attribute ngde">border-radius</span>: <span class="hljs-number ngde">5px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">display</span>: flex;
</span><span class="line ngde">  <span class="hljs-attribute ngde">align-items</span>: center;
</span><span class="line ngde">  <span class="hljs-attribute ngde">justify-content</span>: center;
</span><span class="line ngde">
</span><span class="line ngde">  &#x26;__button {
</span><span class="line ngde">    <span class="hljs-attribute ngde">border</span>: <span class="hljs-number ngde">0</span>;
</span><span class="line ngde">    <span class="hljs-attribute ngde">outline</span>: <span class="hljs-number ngde">0</span>;
</span><span class="line ngde">    <span class="hljs-attribute ngde">cursor</span>: pointer;
</span><span class="line ngde">    <span class="hljs-attribute ngde">color</span>: white;
</span><span class="line ngde">    <span class="hljs-attribute ngde">background-color</span>: <span class="hljs-number ngde">#1b262c</span>;
</span><span class="line ngde">    <span class="hljs-attribute ngde">border-radius</span>: <span class="hljs-number ngde">4px</span>;
</span><span class="line ngde">    <span class="hljs-attribute ngde">font-size</span>: <span class="hljs-number ngde">14px</span>;
</span><span class="line ngde">    <span class="hljs-attribute ngde">font-weight</span>: <span class="hljs-number ngde">500</span>;
</span><span class="line ngde">    <span class="hljs-attribute ngde">padding</span>: <span class="hljs-number ngde">4px</span> <span class="hljs-number ngde">8px</span>;
</span><span class="line ngde">    <span class="hljs-attribute ngde">display</span>: inline-block;
</span><span class="line ngde">    <span class="hljs-attribute ngde">min-height</span>: <span class="hljs-number ngde">28px</span>;
</span><span class="line ngde">  }
</span><span class="line ngde">
</span><span class="line ngde">  &#x26;_selected {
</span><span class="line ngde">    <span class="hljs-attribute ngde">border-color</span>: <span class="hljs-number ngde">#1b262c</span>;
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-selector-class ngde">.without-tab-index</span> {
</span><span class="line ngde">  <span class="hljs-attribute ngde">outline</span>: none;
</span><span class="line ngde">}
</span></code></pre>`}]},I=q;var B='<h1 id="delete-selected" class="ngde">Delete selected<a title="Link to heading" class="ng-doc-header-link ngde" href="/workshops/delete-selected#delete-selected"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">This workshop will show you how to implement deletion of nodes and edges.</p><ng-doc-demo-pane componentname="DeleteSelectedDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>',J=(()=>{class s extends b{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=B,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/workshops/pages/delete-selected/index.md?message=docs(delete-selected): describe your changes here...",this.page=d,this.demoAssets=I}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=c({type:s,selectors:[["ng-doc-page-workshops-delete-selected"]],standalone:!0,features:[E([{provide:b,useExisting:s},U,d.providers??[]]),w,g],decls:1,vars:0,template:function(a,e){a&1&&t(0,"ng-doc-page")},dependencies:[N],encapsulation:2,changeDetection:0})}}return s})(),K=[x(f({},(0,L.isRoute)(d.route)?d.route:{}),{path:"",component:J,title:"Delete selected"})],gs=K;export{J as DynamicComponent,gs as default};
