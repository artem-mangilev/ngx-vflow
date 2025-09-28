import{a as v}from"./chunk-7VWWWZFJ.js";import{a as O}from"./chunk-DV74VKYN.js";import"./chunk-S3I3S5BX.js";import{k as C,z as _}from"./chunk-ATAPBDX7.js";import{k as M}from"./chunk-NA7FJBPQ.js";import{a as V}from"./chunk-ZBKCENK6.js";import"./chunk-G5N4YGVJ.js";import{a as k}from"./chunk-AKRIWIS4.js";import{T as U}from"./chunk-QMHLIXQX.js";import{$b as e,Ac as r,Ga as j,Gb as T,Ha as m,Ob as u,Qb as o,Wb as w,ac as l,bc as d,fc as b,hc as f,ic as c,pb as i,tc as t,wa as g,zc as S}from"./chunk-Z42XPK5A.js";import{a as N,b as D,g as R}from"./chunk-ODLL2QMY.js";var I=R(U());function $(s,y){if(s&1){let n=b();e(0,"div",2)(1,"div",3),t(2," Output 1 "),d(3,"handle",4),l(),e(4,"div",3),t(5," Output 2 "),d(6,"handle",4),l()(),e(7,"node-toolbar",5)(8,"button",6),f("click",function(){j(n);let p=c().$implicit,h=c();return m(h.deleteNode(p.node))}),t(9,"Delete"),l()()}if(s&2){let n=c().$implicit;i(3),o("id",n.node.data.output1),i(3),o("id",n.node.data.output2)}}function Y(s,y){if(s&1){let n=b();e(0,"div",2)(1,"div",3),t(2," Input 1 "),d(3,"handle",7),l(),e(4,"div",3),t(5," Input 2 "),d(6,"handle",7),l()(),e(7,"node-toolbar",8)(8,"button",6),f("click",function(){j(n);let p=c().$implicit,h=c();return m(h.deleteNode(p.node))}),t(9,"Delete"),l()()}if(s&2){let n=c().$implicit;i(3),o("id",n.node.data.input1),i(3),o("id",n.node.data.input2)}}function G(s,y){if(s&1&&u(0,$,10,2)(1,Y,10,2),s&2){let n=y.$implicit;w(0,n.node.data.type==="output"?0:-1),i(),w(1,n.node.data.type==="input"?1:-1)}}var P=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:60,y:150},type:"html-template",data:{type:"output",output1:"output1",output2:"output2"}},{id:"2",point:{x:300,y:100},type:"html-template",data:{type:"input",input1:"input1",input2:"input2"}}],this.edges=[{id:"1 -> 2 one",source:"1",target:"2",sourceHandle:"output1",targetHandle:"input1"},{id:"1 -> 2 two",source:"1",target:"2",sourceHandle:"output2",targetHandle:"input2"}]}deleteNode(n){this.nodes=this.nodes.filter(a=>a.id!==n.id)}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=g({type:s,selectors:[["ng-component"]],standalone:!0,features:[r],decls:2,vars:2,consts:[["view","auto",3,"nodes","edges"],["nodeHtml",""],[1,"custom-node"],[1,"data-block"],["position","right","type","source",3,"id"],["position","left"],[3,"click"],["position","left","type","target",3,"id"],["position","right"]],template:function(a,p){a&1&&(e(0,"vflow",0),u(1,G,2,2,"ng-template",1),l()),a&2&&o("nodes",p.nodes)("edges",p.edges)},dependencies:[_,M,v,C],styles:["[_nghost-%COMP%]{width:100%;height:100%}.custom-node[_ngcontent-%COMP%]{width:150px;height:100px;background-color:#0f4c75;border:1px solid gray;border-radius:5px;align-items:center;padding-left:7px;padding-right:7px}.data-block[_ngcontent-%COMP%]{background-color:#fff;color:#1b262c;margin-top:15px;border-radius:5px;text-align:center}"],changeDetection:0})}}return s})();function z(s,y){if(s&1){let n=b();d(0,"div",2),e(1,"node-toolbar",3)(2,"button",4),f("click",function(){let p=j(n).$implicit,h=c();return m(h.deleteNode(p.node))}),t(3,"Delete"),l()(),e(4,"node-toolbar",5)(5,"button"),t(6,"Action"),l()()}}var H=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:150,y:150},type:"html-template"}]}deleteNode(n){this.nodes=this.nodes.filter(a=>a.id!==n.id)}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=g({type:s,selectors:[["ng-component"]],standalone:!0,features:[r],decls:2,vars:1,consts:[["view","auto",3,"nodes"],["nodeHtml",""],[1,"custom-node"],["position","top"],[3,"click"],["position","right"]],template:function(a,p){a&1&&(e(0,"vflow",0),u(1,z,7,0,"ng-template",1),l()),a&2&&o("nodes",p.nodes)},dependencies:[_,v,C],styles:["[_nghost-%COMP%]{width:100%;height:100%}.custom-node[_ngcontent-%COMP%]{width:150px;height:100px;background-color:#0f4c75;border:1px solid gray;border-radius:5px;align-items:center;padding-left:7px;padding-right:7px}"],changeDetection:0})}}return s})();var q={title:"Node toolbar",mdFile:"./index.md",category:O,demos:{NodeToolbarDemoComponent:P,MultipleNodeToolbarsDemoComponent:H},order:5},x=q;var A=[];var B={NodeToolbarDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">templateUrl</span>: <span class="hljs-string ngde">'./node-toolbar-demo.component.html'</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styleUrls</span>: [<span class="hljs-string ngde">'./node-toolbar-demo.styles.scss'</span>],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">NodeToolbarDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">60</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">150</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'output'</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">output1</span>: <span class="hljs-string ngde">'output1'</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">output2</span>: <span class="hljs-string ngde">'output2'</span>,
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">300</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'input'</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">input1</span>: <span class="hljs-string ngde">'input1'</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">input2</span>: <span class="hljs-string ngde">'input2'</span>,
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 2 one'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">sourceHandle</span>: <span class="hljs-string ngde">'output1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">targetHandle</span>: <span class="hljs-string ngde">'input1'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 2 two'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">sourceHandle</span>: <span class="hljs-string ngde">'output2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">targetHandle</span>: <span class="hljs-string ngde">'input2'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">deleteNode</span>(<span class="hljs-params ngde">node: <a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">nodes</span> = <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">nodes</span>.<span class="hljs-title function_ ngde">filter</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">n</span>) =></span> n.<span class="hljs-property ngde">id</span> !== node.<span class="hljs-property ngde">id</span>);
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre>`},{title:"HTML",code:`<pre class="ngde hljs"><code lang="html" class="hljs language-html code-lines ngde"><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">vflow</span> <span class="hljs-attr ngde">view</span>=<span class="hljs-string ngde">"auto"</span> [<span class="hljs-attr ngde">nodes</span>]=<span class="hljs-string ngde">"nodes"</span> [<span class="hljs-attr ngde">edges</span>]=<span class="hljs-string ngde">"edges"</span>></span>
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-template</span> <span class="hljs-attr ngde">let-ctx</span> <span class="hljs-attr ngde">nodeHtml</span>></span>
</span><span class="line ngde">    @if (ctx.node.data.type === 'output') {
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"custom-node"</span>></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"data-block"</span>></span>
</span><span class="line ngde">          Output 1
</span><span class="line ngde">          <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"right"</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"source"</span> [<span class="hljs-attr ngde">id</span>]=<span class="hljs-string ngde">"ctx.node.data.output1"</span> /></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"data-block"</span>></span>
</span><span class="line ngde">          Output 2
</span><span class="line ngde">          <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"right"</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"source"</span> [<span class="hljs-attr ngde">id</span>]=<span class="hljs-string ngde">"ctx.node.data.output2"</span> /></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">node-toolbar</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"left"</span>></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">button</span> (<span class="hljs-attr ngde">click</span>)=<span class="hljs-string ngde">"deleteNode(ctx.node)"</span>></span>Delete<span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">button</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">node-toolbar</span>></span>
</span><span class="line ngde">    }
</span><span class="line ngde">
</span><span class="line ngde">    @if (ctx.node.data.type === 'input') {
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"custom-node"</span>></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"data-block"</span>></span>
</span><span class="line ngde">          Input 1
</span><span class="line ngde">          <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"left"</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"target"</span> [<span class="hljs-attr ngde">id</span>]=<span class="hljs-string ngde">"ctx.node.data.input1"</span> /></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"data-block"</span>></span>
</span><span class="line ngde">          Input 2
</span><span class="line ngde">          <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"left"</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"target"</span> [<span class="hljs-attr ngde">id</span>]=<span class="hljs-string ngde">"ctx.node.data.input2"</span> /></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">node-toolbar</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"right"</span>></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">button</span> (<span class="hljs-attr ngde">click</span>)=<span class="hljs-string ngde">"deleteNode(ctx.node)"</span>></span>Delete<span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">button</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">node-toolbar</span>></span>
</span><span class="line ngde">    }
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
</span><span class="line ngde">  <span class="hljs-attribute ngde">background-color</span>: <span class="hljs-number ngde">#0f4c75</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">border</span>: <span class="hljs-number ngde">1px</span> solid gray;
</span><span class="line ngde">  <span class="hljs-attribute ngde">border-radius</span>: <span class="hljs-number ngde">5px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">align-items</span>: center;
</span><span class="line ngde">  <span class="hljs-attribute ngde">padding-left</span>: <span class="hljs-number ngde">7px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">padding-right</span>: <span class="hljs-number ngde">7px</span>;
</span><span class="line ngde">}
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-selector-class ngde">.data-block</span> {
</span><span class="line ngde">  <span class="hljs-attribute ngde">background-color</span>: <span class="hljs-number ngde">#ffffff</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">color</span>: <span class="hljs-number ngde">#1b262c</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">margin-top</span>: <span class="hljs-number ngde">15px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">border-radius</span>: <span class="hljs-number ngde">5px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">text-align</span>: center;
</span><span class="line ngde">}
</span></code></pre>`}],MultipleNodeToolbarsDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">templateUrl</span>: <span class="hljs-string ngde">'./multiple-node-toolbars-demo.component.html'</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styleUrls</span>: [<span class="hljs-string ngde">'./multiple-node-toolbars-demo.styles.scss'</span>],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">MultipleNodeToolbarsDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">150</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">150</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">deleteNode</span>(<span class="hljs-params ngde">node: <a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">nodes</span> = <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">nodes</span>.<span class="hljs-title function_ ngde">filter</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">n</span>) =></span> n.<span class="hljs-property ngde">id</span> !== node.<span class="hljs-property ngde">id</span>);
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre>`},{title:"HTML",code:`<pre class="ngde hljs"><code lang="html" class="hljs language-html code-lines ngde"><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">vflow</span> <span class="hljs-attr ngde">view</span>=<span class="hljs-string ngde">"auto"</span> [<span class="hljs-attr ngde">nodes</span>]=<span class="hljs-string ngde">"nodes"</span>></span>
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-template</span> <span class="hljs-attr ngde">let-ctx</span> <span class="hljs-attr ngde">nodeHtml</span>></span>
</span><span class="line ngde">    <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"custom-node"</span>></span><span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">    <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">node-toolbar</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"top"</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">button</span> (<span class="hljs-attr ngde">click</span>)=<span class="hljs-string ngde">"deleteNode(ctx.node)"</span>></span>Delete<span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">button</span>></span>
</span><span class="line ngde">    <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">node-toolbar</span>></span>
</span><span class="line ngde">    <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">node-toolbar</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"right"</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">button</span>></span>Action<span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">button</span>></span>
</span><span class="line ngde">    <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">node-toolbar</span>></span>
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
</span><span class="line ngde">  <span class="hljs-attribute ngde">background-color</span>: <span class="hljs-number ngde">#0f4c75</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">border</span>: <span class="hljs-number ngde">1px</span> solid gray;
</span><span class="line ngde">  <span class="hljs-attribute ngde">border-radius</span>: <span class="hljs-number ngde">5px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">align-items</span>: center;
</span><span class="line ngde">  <span class="hljs-attribute ngde">padding-left</span>: <span class="hljs-number ngde">7px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">padding-right</span>: <span class="hljs-number ngde">7px</span>;
</span><span class="line ngde">}
</span></code></pre>`}]},F=B;var J=`<h1 id="node-toolbar" class="ngde">Node toolbar<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/nodes/node-toolbar#node-toolbar"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">You can add a <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/NodeToolbarComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">NodeToolbarComponent</a></code> to your node. The content of this component is automatically positioned near one side of the node, based on the value of the <code class="ngde">position</code> input.</p><ng-doc-demo-pane componentname="NodeToolbarDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane><h2 id="multiple-toolbars" class="ngde">Multiple Toolbars<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/nodes/node-toolbar#multiple-toolbars"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">It's also possible to add multiple toolbars to the same node by simply including multiple <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/NodeToolbarComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">NodeToolbarComponent</a></code> instances with different <code class="ngde">position</code> inputs.</p><ng-doc-demo-pane componentname="MultipleNodeToolbarsDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>`,K=(()=>{class s extends k{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=J,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/categories/nodes/node-toolbar/index.md?message=docs(node-toolbar): describe your changes here...",this.page=x,this.demoAssets=F}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=g({type:s,selectors:[["ng-doc-page-features-nodes-node-toolbar"]],standalone:!0,features:[S([{provide:k,useExisting:s},A,x.providers??[]]),T,r],decls:1,vars:0,template:function(a,p){a&1&&d(0,"ng-doc-page")},dependencies:[V],encapsulation:2,changeDetection:0})}}return s})(),Q=[D(N({},(0,I.isRoute)(x.route)?x.route:{}),{path:"",component:K,title:"Node toolbar"})],gs=Q;export{K as DynamicComponent,gs as default};
