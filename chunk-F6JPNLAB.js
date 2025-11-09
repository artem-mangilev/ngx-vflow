import{a as H}from"./chunk-DV74VKYN.js";import{a as S}from"./chunk-SI4XWZPG.js";import"./chunk-S3I3S5BX.js";import{k,z as i}from"./chunk-AQENXFQJ.js";import{f as _,k as N}from"./chunk-NA7FJBPQ.js";import{a as C}from"./chunk-ZBKCENK6.js";import"./chunk-G5N4YGVJ.js";import{a as j}from"./chunk-AKRIWIS4.js";import{T as R}from"./chunk-QMHLIXQX.js";import{$b as r,Ac as t,Gb as x,Oa as y,Ob as w,Qb as c,Sb as D,ac as g,bc as p,ra as o,tc as h,wa as l,ya as b,zc as v}from"./chunk-Z42XPK5A.js";import{a as u,b as f,g as F}from"./chunk-ODLL2QMY.js";var E=F(R());var P=(()=>{class s{get model(){return this.nodeAccessor.model()}constructor(){this.nodeAccessor=o(_),this.model.dragHandlesCount.update(a=>a+1),o(y).onDestroy(()=>{this.model.dragHandlesCount.update(a=>a-1)})}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275dir=b({type:s,selectors:[["","dragHandle",""]],hostAttrs:[1,"vflow-drag-handle"],standalone:!0})}}return s})();var O=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:10,y:200},type:"default",text:"1"},{id:"2",point:{x:200,y:100},type:"default",text:"2",draggable:!1},{id:"3",point:{x:200,y:300},type:"default",text:"3",draggable:!1}],this.edges=[{id:"1 -> 2",source:"1",target:"2"},{id:"1 -> 3",source:"1",target:"3"}]}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=l({type:s,selectors:[["ng-component"]],standalone:!0,features:[t],decls:1,vars:2,consts:[["view","auto",3,"nodes","edges"]],template:function(n,e){n&1&&p(0,"vflow",0),n&2&&c("nodes",e.nodes)("edges",e.edges)},dependencies:[i],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return s})();function L(s,M){if(s&1&&(r(0,"div",2)(1,"button",3),h(2,"Drag here"),g(),p(3,"handle",4)(4,"handle",5),g()),s&2){let a=M.$implicit;D("custom-node_selected",a.selected())}}var T=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:10,y:150},type:"html-template"},{id:"2",point:{x:290,y:50},type:"html-template"},{id:"3",point:{x:290,y:300},type:"html-template"}],this.edges=[{id:"1 -> 2",source:"1",target:"2",type:"default"},{id:"1 -> 3",source:"1",target:"3",type:"default"}]}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=l({type:s,selectors:[["ng-component"]],standalone:!0,features:[t],decls:3,vars:2,consts:[["view","auto",3,"nodes","edges"],["nodeHtml",""],[1,"custom-node"],["dragHandle","","selectable","",1,"custom-node__button"],["type","source","position","right"],["type","target","position","left"]],template:function(n,e){n&1&&(r(0,"vflow",0),w(1,L,5,2,"ng-template",1),g(),h(2,"`\n")),n&2&&c("nodes",e.nodes)("edges",e.edges)},dependencies:[i,N,S,P,k],styles:["[_nghost-%COMP%]{width:100%;height:100%}.custom-node[_ngcontent-%COMP%]{width:150px;height:100px;background:#bbe1fa;border:1px solid gray;border-radius:5px;display:flex;align-items:center;justify-content:center}.custom-node__button[_ngcontent-%COMP%]{border:0;outline:0;cursor:pointer;color:#fff;background-color:#1b262c;border-radius:4px;font-size:14px;font-weight:500;padding:4px 8px;display:inline-block;min-height:28px}.custom-node_selected[_ngcontent-%COMP%]{border-color:#1b262c}"],changeDetection:0})}}return s})();var U={title:"Draggables",mdFile:"./index.md",category:H,demos:{DraggablesDemoComponent:O,DragHandleDemoComponent:T},order:6},d=U;var V=[];var Y={DraggablesDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;vflow view="auto" [nodes]="nodes" [edges]="edges" />\`</span>,
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
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">DraggablesDemoComponent</span> {
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
</span><span class="line ngde">      <span class="hljs-attr ngde">draggable</span>: <span class="hljs-literal ngde">false</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">200</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">300</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">draggable</span>: <span class="hljs-literal ngde">false</span>,
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
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">}
</span></code></pre>`}],DragHandleDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">templateUrl</span>: <span class="hljs-string ngde">'./drag-handle-demo.component.html'</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styleUrls</span>: [<span class="hljs-string ngde">'./drag-handle-demo.component.scss'</span>],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">DragHandleDemoComponent</span> {
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
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">}
</span></code></pre>`},{title:"HTML",code:`<pre class="ngde hljs"><code lang="html" class="hljs language-html code-lines ngde"><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">vflow</span> <span class="hljs-attr ngde">view</span>=<span class="hljs-string ngde">"auto"</span> [<span class="hljs-attr ngde">nodes</span>]=<span class="hljs-string ngde">"nodes"</span> [<span class="hljs-attr ngde">edges</span>]=<span class="hljs-string ngde">"edges"</span>></span>
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-template</span> <span class="hljs-attr ngde">let-ctx</span> <span class="hljs-attr ngde">nodeHtml</span>></span>
</span><span class="line ngde">    <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"custom-node"</span> [<span class="hljs-attr ngde">class.custom-node_selected</span>]=<span class="hljs-string ngde">"ctx.selected()"</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">button</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"custom-node__button"</span> <span class="hljs-attr ngde">dragHandle</span> <span class="hljs-attr ngde">selectable</span>></span>Drag here<span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">button</span>></span>
</span><span class="line ngde">
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"source"</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"right"</span> /></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"target"</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"left"</span> /></span>
</span><span class="line ngde">    <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
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
</span></code></pre>`}]},A=Y;var z=`<h1 id="draggables" class="ngde">Draggables<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/nodes/draggables#draggables"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><h2 id="disabling" class="ngde">Disabling<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/nodes/draggables#disabling"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">You can disable <code class="ngde">draggable</code> behavior on certain <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></code> or <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/type-aliases/DynamicNode" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">DynamicNode</a></code> by passing <code class="ngde">false</code>.</p><ng-doc-demo-pane componentname="DraggablesDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane><h2 id="drag-handle" class="ngde">Drag handle<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/nodes/draggables#drag-handle"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">You can restrict dragging to a specific part of node, by adding <code class="ngde">dragHandle</code> directive to this element. It's important to note that if a node contains at least one <code class="ngde">dragHandle</code>, it can only be dragged from those specific areas where <code class="ngde">dragHandle</code> was added. Otherwise, the entire node can be dragged, provided the <code class="ngde">draggable</code> property is set to <code class="ngde">true</code>.</p><ng-doc-demo-pane componentname="DragHandleDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>`,G=(()=>{class s extends j{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=z,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/categories/nodes/draggables/index.md?message=docs(draggables): describe your changes here...",this.page=d,this.demoAssets=A}static{this.\u0275fac=function(n){return new(n||s)}}static{this.\u0275cmp=l({type:s,selectors:[["ng-doc-page-features-nodes-draggables"]],standalone:!0,features:[v([{provide:j,useExisting:s},V,d.providers??[]]),x,t],decls:1,vars:0,template:function(n,e){n&1&&p(0,"ng-doc-page")},dependencies:[C],encapsulation:2,changeDetection:0})}}return s})(),$=[f(u({},(0,E.isRoute)(d.route)?d.route:{}),{path:"",component:G,title:"Draggables"})],gs=$;export{G as DynamicComponent,gs as default};
