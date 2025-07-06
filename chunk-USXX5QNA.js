import{a as P}from"./chunk-BE56E5XD.js";import{a as v}from"./chunk-S3I3S5BX.js";import{B as k,D,j as _,l as S}from"./chunk-DHHGZQV5.js";import{a as w}from"./chunk-R2FYFHTZ.js";import"./chunk-FGWLUFMG.js";import{a as r}from"./chunk-JLOZFYHF.js";import{Ba as u,Ea as b,Fa as f,Ga as x,Ia as y,R as p,Ra as i,Sa as t,Ta as e,_ as m,jb as o,pb as C,qb as c,wc as V}from"./chunk-VFFNGGE6.js";import{a as h,b as j,g as M}from"./chunk-ODLL2QMY.js";var T=M(V());function A(s,d){if(s&1&&(i(0,"div",3)(1,"button",4),o(2,"Select here"),t(),e(3,"handle",5),t()),s&2){let n=d.$implicit;y("custom-node_selected",n.selected())}}function F(s,d){if(s&1&&(m(),e(0,"path",6)),s&2){let n=d.$implicit;f("d",n.path())("stroke",n.selected()?"#0f4c75":"#bbe1fa")}}var N=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:10,y:150},type:"html-template"},{id:"2",point:{x:290,y:50},type:"default",text:"Selectable"},{id:"3",point:{x:290,y:300},type:"default",text:"Selectable"}],this.edges=[{id:"1 -> 2",source:"1",target:"2"},{id:"1 -> 3",source:"1",target:"3",type:"template"}]}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=p({type:s,selectors:[["ng-component"]],standalone:!0,features:[c],decls:4,vars:2,consts:[["view","auto",3,"nodes","edges"],["nodeHtml",""],["edge",""],[1,"custom-node"],["selectable","",1,"custom-node__button"],["type","source","position","right"],["selectable","","fill","none","stroke-width","2"]],template:function(a,g){a&1&&(i(0,"vflow",0),b(1,A,4,2,"ng-template",1)(2,F,1,2,"ng-template",2),t(),o(3,"`\n")),a&2&&x("nodes",g.nodes)("edges",g.edges)},dependencies:[D,k,P,S,_],styles:["[_nghost-%COMP%]{width:100%;height:100%}.custom-node[_ngcontent-%COMP%]{width:150px;height:100px;background:#bbe1fa;border:1px solid gray;border-radius:5px;display:flex;align-items:center;justify-content:center}.custom-node__button[_ngcontent-%COMP%]{border:0;outline:0;cursor:pointer;color:#fff;background-color:#1b262c;border-radius:4px;font-size:14px;font-weight:500;padding:4px 8px;display:inline-block;min-height:28px}.custom-node_selected[_ngcontent-%COMP%]{border-color:#1b262c}"],changeDetection:0})}}return s})();var L={title:"Selecting",mdFile:"./index.md",category:v,demos:{SelectingDemoComponent:N}},l=L;var E=[];var U={SelectingDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">templateUrl</span>: <span class="hljs-string ngde">'./selecting-demo.component.html'</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styleUrls</span>: [<span class="hljs-string ngde">'./selecting-demo.component.scss'</span>],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">SelectingDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">150</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">290</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">50</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'Selectable'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">290</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">300</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'Selectable'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'template'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">}
</span></code></pre>`},{title:"HTML",code:`<pre class="ngde hljs"><code lang="html" class="hljs language-html code-lines ngde"><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">vflow</span> <span class="hljs-attr ngde">view</span>=<span class="hljs-string ngde">"auto"</span> [<span class="hljs-attr ngde">nodes</span>]=<span class="hljs-string ngde">"nodes"</span> [<span class="hljs-attr ngde">edges</span>]=<span class="hljs-string ngde">"edges"</span>></span>
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-template</span> <span class="hljs-attr ngde">let-ctx</span> <span class="hljs-attr ngde">nodeHtml</span>></span>
</span><span class="line ngde">    <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"custom-node"</span> [<span class="hljs-attr ngde">class.custom-node_selected</span>]=<span class="hljs-string ngde">"ctx.selected()"</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">button</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"custom-node__button"</span> <span class="hljs-attr ngde">selectable</span>></span>Select here<span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">button</span>></span>
</span><span class="line ngde">
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"source"</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"right"</span> /></span>
</span><span class="line ngde">    <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">ng-template</span>></span>
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-template</span> <span class="hljs-attr ngde">let-ctx</span> <span class="hljs-attr ngde">edge</span>></span>
</span><span class="line ngde">    &#x3C;<span class="hljs-name ngde">svg:path</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">      </span><span class="hljs-attr ngde">selectable</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">      </span><span class="hljs-attr ngde">fill</span>=<span class="hljs-string ngde">"none"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">      </span><span class="hljs-attr ngde">stroke-width</span>=<span class="hljs-string ngde">"2"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">      [</span><span class="hljs-attr ngde">attr.d</span>]=<span class="hljs-string ngde">"ctx.path()"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">      [</span><span class="hljs-attr ngde">attr.stroke</span>]=<span class="hljs-string ngde">"ctx.selected() ? '#0f4c75' : '#bbe1fa'"</span> />
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">ng-template</span>></span> &#x3C;/vflow
</span><span class="line ngde">>\`
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
</span></code></pre>`}]},O=U;var G='<h1 id="selecting" class="ngde">Selecting<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/selecting#selecting"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">Nodes and edges can be selected!</p><ol class="ngde"><li class="ngde">Default nodes and edges are selectable by default; just click and see that one is selected.</li><li class="ngde">Custom nodes and edges are not selectable by default, you need to mark the element that triggers selection with the <code class="ngde">selectable</code> directive.</li></ol><ng-doc-blockquote class="ngde"><p class="ngde">Both custom nodes and edges have the <code class="ngde">selected()</code> signal in their template context for applying styles based on this state.</p></ng-doc-blockquote><h3 id="disable-selecting" class="ngde">Disable selecting<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/selecting#disable-selecting"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h3><p class="ngde">You can pass <code class="ngde">[entitiesSelectable]="false"</code> to <code class="ngde">&#x3C;vflow /></code> if you want disable selecting for whole flow.</p><ng-doc-demo-pane componentname="SelectingDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>',H=(()=>{class s extends r{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=G,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/pages/selecting/index.md?message=docs(selecting): describe your changes here...",this.page=l,this.demoAssets=O}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=p({type:s,selectors:[["ng-doc-page-features-selecting"]],standalone:!0,features:[C([{provide:r,useExisting:s},E,l.providers??[]]),u,c],decls:1,vars:0,template:function(a,g){a&1&&e(0,"ng-doc-page")},dependencies:[w],encapsulation:2,changeDetection:0})}}return s})(),I=[j(h({},(0,T.isRoute)(l.route)?l.route:{}),{path:"",component:H,title:"Selecting"})],ns=I;export{H as DynamicComponent,ns as default};
