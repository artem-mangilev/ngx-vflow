import{a as O}from"./chunk-DV74VKYN.js";import{a as V}from"./chunk-GMJAUCMF.js";import"./chunk-S3I3S5BX.js";import{A as j,B as S,D as o,l as N,n as R}from"./chunk-SNZ24GBX.js";import{a as T}from"./chunk-VNGQSAGH.js";import"./chunk-GJV5CTYC.js";import{a as x}from"./chunk-NAZP4O7G.js";import{Cc as L,Ga as b,Ja as h,Ka as k,La as e,Ma as D,Ra as f,W as t,Wa as d,Xa as i,Ya as l,da as z,db as y,ob as m,sa as g,ub as _,vb as c}from"./chunk-RKOZ65GA.js";import{a as v,b as C,g as F}from"./chunk-ODLL2QMY.js";var H=F(L());var P=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:10,y:10},type:"default",text:"1",parentId:"3"},{id:"2",point:{x:90,y:80},type:"default",text:"<strong>2</strong>",parentId:"3"},{id:"3",point:{x:10,y:10},type:"default-group",width:250,height:250,resizable:!0}],this.edges=[{source:"1",target:"2",id:"1 -> 2"}]}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=t({type:s,selectors:[["ng-component"]],standalone:!0,features:[c],decls:1,vars:2,consts:[["view","auto",3,"nodes","edges"]],template:function(a,p){a&1&&l(0,"vflow",0),a&2&&e("nodes",p.nodes)("edges",p.edges)},dependencies:[o],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return s})();function Y(s,r){if(s&1&&(z(),l(0,"rect",2)),s&2){let n=r.$implicit;D("stroke-width",n.selected()?3:1),e("resizable",n.selected()),k("width",n.width())("height",n.height())}}var E=(()=>{class s{constructor(){this.nodes=[{id:"5",point:{x:10,y:10},type:"template-group",width:170,height:70},{id:"6",point:{x:10,y:10},type:"default",text:"6",parentId:"5"}]}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=t({type:s,selectors:[["ng-component"]],standalone:!0,features:[c],decls:2,vars:1,consts:[["view","auto",3,"nodes"],["groupNode",""],["selectable","","rx","5","ry","5","stroke","red","fill","red","fill-opacity","0.05",3,"resizable"]],template:function(a,p){a&1&&(d(0,"vflow",0),h(1,Y,1,5,"ng-template",1),i()),a&2&&e("nodes",p.nodes)},dependencies:[o,j,V,R],styles:["[_nghost-%COMP%]{width:100%;height:100%}"],changeDetection:0})}}return s})();function U(s,r){if(s&1&&(d(0,"div",2)(1,"div",3),m(2," Output 1 "),l(3,"handle",4),i(),d(4,"div",3),m(5," Output 2 "),l(6,"handle",4),i()()),s&2){let n=y().$implicit;g(3),e("id",n.node.data.output1),g(3),e("id",n.node.data.output2)}}function $(s,r){if(s&1&&(d(0,"div",2)(1,"div",3),m(2," Input 1 "),l(3,"handle",5),i(),d(4,"div",3),m(5," Input 2 "),l(6,"handle",5),i()()),s&2){let n=y().$implicit;g(3),e("id",n.node.data.input1),g(3),e("id",n.node.data.input2)}}function B(s,r){if(s&1&&h(0,U,7,2,"div",2)(1,$,7,2,"div",2),s&2){let n=r.$implicit;f(0,n.node.data.type==="output"?0:-1),g(),f(1,n.node.data.type==="input"?1:-1)}}var G=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:0,y:150},type:"html-template",data:{type:"output",output1:"output1",output2:"output2"}},{id:"2",point:{x:250,y:100},type:"html-template",data:{type:"input",input1:"input1",input2:"input2"}}],this.edges=[{id:"1 -> 2 one",source:"1",target:"2",sourceHandle:"output1",targetHandle:"input1"},{id:"1 -> 2 two",source:"1",target:"2",sourceHandle:"output2",targetHandle:"input2"}]}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=t({type:s,selectors:[["ng-component"]],standalone:!0,features:[c],decls:2,vars:2,consts:[["view","auto",3,"nodes","edges"],["nodeHtml",""],["resizable","",1,"custom-node"],[1,"data-block"],["position","right","type","source",3,"id"],["position","left","type","target",3,"id"]],template:function(a,p){a&1&&(d(0,"vflow",0),h(1,B,2,2,"ng-template",1),i()),a&2&&e("nodes",p.nodes)("edges",p.edges)},dependencies:[o,S,j,N],styles:["[_nghost-%COMP%]{width:100%;height:100%}.custom-node[_ngcontent-%COMP%]{min-width:150px;min-height:100px;height:100%;background-color:#0f4c75;border:1px solid gray;border-radius:5px;padding-left:7px;padding-right:7px;display:flex;flex-direction:column;justify-content:space-around;align-items:stretch}.data-block[_ngcontent-%COMP%]{background-color:#fff;color:#1b262c;border-radius:5px;text-align:center}"],changeDetection:0})}}return s})();var q={title:"Resizer",mdFile:"./index.md",category:O,demos:{DefaultGroupResizerDemoComponent:P,TemplateGroupResizerDemoComponent:E,TemplateNodeResizerDemoComponent:G},order:4},u=q;var A=[];var J={DefaultGroupResizerDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
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
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">DefaultGroupResizerDemoComponent</span> {
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
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\`&#x3C;strong>2&#x3C;/strong>\`</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">parentId</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">10</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default-group'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">width</span>: <span class="hljs-number ngde">250</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">height</span>: <span class="hljs-number ngde">250</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">resizable</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1 -> 2'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">}
</span></code></pre>`}],TemplateGroupResizerDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`&#x3C;vflow view="auto" [nodes]="nodes"></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;ng-template let-ctx groupNode></span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;svg:rect</span>
</span><span class="line ngde"><span class="hljs-string ngde">        selectable</span>
</span><span class="line ngde"><span class="hljs-string ngde">        rx="5"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        ry="5"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        stroke="red"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        fill="red"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        fill-opacity="0.05"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [resizable]="ctx.selected()"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [style.stroke-width]="ctx.selected() ? 3 : 1"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [attr.width]="ctx.width()"</span>
</span><span class="line ngde"><span class="hljs-string ngde">        [attr.height]="ctx.height()" /></span>
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
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">TemplateGroupResizerDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'5'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">10</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'template-group'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">width</span>: <span class="hljs-number ngde">170</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">height</span>: <span class="hljs-number ngde">70</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'6'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">10</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">10</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'default'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\`6\`</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">parentId</span>: <span class="hljs-string ngde">'5'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">}
</span></code></pre>`}],TemplateNodeResizerDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;vflow view="auto" [nodes]="nodes" [edges]="edges"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;ng-template let-ctx nodeHtml></span>
</span><span class="line ngde"><span class="hljs-string ngde">        @if (ctx.node.data.type === 'output') {</span>
</span><span class="line ngde"><span class="hljs-string ngde">          &#x3C;div resizable class="custom-node"></span>
</span><span class="line ngde"><span class="hljs-string ngde">            &#x3C;div class="data-block"></span>
</span><span class="line ngde"><span class="hljs-string ngde">              Output 1</span>
</span><span class="line ngde"><span class="hljs-string ngde">              &#x3C;handle position="right" type="source" [id]="ctx.node.data.output1" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">            &#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde">            &#x3C;div class="data-block"></span>
</span><span class="line ngde"><span class="hljs-string ngde">              Output 2</span>
</span><span class="line ngde"><span class="hljs-string ngde">              &#x3C;handle position="right" type="source" [id]="ctx.node.data.output2" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">            &#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde">          &#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde">        }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">        @if (ctx.node.data.type === 'input') {</span>
</span><span class="line ngde"><span class="hljs-string ngde">          &#x3C;div resizable class="custom-node"></span>
</span><span class="line ngde"><span class="hljs-string ngde">            &#x3C;div class="data-block"></span>
</span><span class="line ngde"><span class="hljs-string ngde">              Input 1</span>
</span><span class="line ngde"><span class="hljs-string ngde">              &#x3C;handle position="left" type="target" [id]="ctx.node.data.input1" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">            &#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde">            &#x3C;div class="data-block"></span>
</span><span class="line ngde"><span class="hljs-string ngde">              Input 2</span>
</span><span class="line ngde"><span class="hljs-string ngde">              &#x3C;handle position="left" type="target" [id]="ctx.node.data.input2" /></span>
</span><span class="line ngde"><span class="hljs-string ngde">            &#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde">          &#x3C;/div></span>
</span><span class="line ngde"><span class="hljs-string ngde">        }</span>
</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;/ng-template></span>
</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/vflow></span>
</span><span class="line ngde"><span class="hljs-string ngde">  \`</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [
</span><span class="line ngde">    <span class="hljs-string ngde">\`</span>
</span><span class="line ngde"><span class="hljs-string ngde">      :host {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        width: 100%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 100%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      .custom-node {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        min-width: 150px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        min-height: 100px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        height: 100%;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        background-color: #0f4c75;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border: 1px solid gray;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        padding-left: 7px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        padding-right: 7px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        display: flex;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        flex-direction: column;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        justify-content: space-around;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        align-items: stretch;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde"></span>
</span><span class="line ngde"><span class="hljs-string ngde">      .data-block {</span>
</span><span class="line ngde"><span class="hljs-string ngde">        background-color: #ffffff;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        color: #1b262c;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>
</span><span class="line ngde"><span class="hljs-string ngde">        text-align: center;</span>
</span><span class="line ngde"><span class="hljs-string ngde">      }</span>
</span><span class="line ngde"><span class="hljs-string ngde">    \`</span>,
</span><span class="line ngde">  ],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">TemplateNodeResizerDemoComponent</span> {
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">0</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">150</span> },
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {
</span><span class="line ngde">        <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'output'</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">output1</span>: <span class="hljs-string ngde">'output1'</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">output2</span>: <span class="hljs-string ngde">'output2'</span>,
</span><span class="line ngde">      },
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">250</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },
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
</span><span class="line ngde">}
</span></code></pre>`}]},M=J;var K=`<h1 id="resizer" class="ngde">Resizer<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/nodes/resizer#resizer"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">You might want to resize your node. This functionality works with nearly all types of nodes.</p><h2 id="resize-default-group" class="ngde">Resize default group<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/nodes/resizer#resize-default-group"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">To resize a default group, simply pass the <code class="ngde">resizable</code> flag to a <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></code> (or <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/type-aliases/DynamicNode" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">DynamicNode</a></code>) of type <code class="ngde">default-group</code>.</p><ng-doc-demo-pane componentname="DefaultGroupResizerDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane><h2 id="resize-template-group" class="ngde">Resize template group<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/nodes/resizer#resize-template-group"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">This provides a way to have more control over the resizer:</p><ul class="ngde"><li class="ngde">Create a <code class="ngde">template-group</code> node.<ul class="ngde"><li class="ngde">If you want the resizer to appear consistently, add the <code class="ngde">resizable</code> directive to the SVG element (likely a <code class="ngde">&#x3C;svg:rect /></code>) representing your group.</li><li class="ngde">If you want the resizer to appear conditionally, apply the directive as <code class="ngde">[resizable]="yourCondition"</code>. You can bind the visibility of the resizer to the node\u2019s selection state (see the code below for an example).</li></ul></li><li class="ngde"><strong class="ngde">Important</strong>: Use the <code class="ngde">ctx.width()</code> and <code class="ngde">ctx.height()</code> signals from the context, not <code class="ngde">ctx.node.width</code> and <code class="ngde">ctx.node.height</code>. The latter properties are not reactive, so the node won\u2019t update its size based on the resizer.</li><li class="ngde">The resizer respects the <code class="ngde">min-width</code> and <code class="ngde">min-height</code> CSS properties of the resizable node.</li><li class="ngde">Optionally, you can customize the <code class="ngde">[resizerColor]</code> and the <code class="ngde">[gap]</code> between the node and the resizer, with more customization options coming in the future."</li></ul><ng-doc-demo-pane componentname="TemplateGroupResizerDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane><h2 id="resize-a-templatecomponent-regular-node" class="ngde">Resize a template/component regular node<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/nodes/resizer#resize-a-templatecomponent-regular-node"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">The algorithm is almost the same as for <code class="ngde">template-group</code> nodes:</p><ul class="ngde"><li class="ngde"><p class="ngde">Create a node of type <code class="ngde">html-template</code> or <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/CustomNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomNodeComponent</a></code> (<code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/CustomDynamicNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomDynamicNodeComponent</a></code>).</p><ul class="ngde"><li class="ngde">If you want the resizer to always appear, add the <code class="ngde">resizable</code> directive to the top-level element of your custom node (ideally, a wrapper for the entire node content).</li><li class="ngde">If you want the resizer to appear conditionally, apply the directive as <code class="ngde">[resizable]="yourCondition"</code>. Binding the visibility of the resizer to the node\u2019s selection state can be useful.</li></ul></li><li class="ngde"><p class="ngde">The resizer respects the <code class="ngde">min-width</code> and <code class="ngde">min-height</code> CSS properties of the element where the directive is applied.</p></li><li class="ngde"><p class="ngde">It's up to you to adjust the CSS of your custom node to ensure it renders correctly during resizing. The library only modifies the container size.</p></li><li class="ngde"><p class="ngde">Optionally, you can customize the <code class="ngde">[resizerColor]</code> and the <code class="ngde">[gap]</code> between the node and the resizer, with more customization options coming in the future.</p></li></ul><ng-doc-demo-pane componentname="TemplateNodeResizerDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane><h2 id="resize-event" class="ngde">Resize event<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/nodes/resizer#resize-event"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">You may want to perform some actions on resize. To do this, simply add handler to the <code class="ngde">(onNodesChange.size)</code> output of the <code class="ngde">&#x3C;vflow /></code> component.</p><h2 id="see-also" class="ngde">See also<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/nodes/resizer#see-also"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><ul class="ngde"><li class="ngde"><a href="/features/nodes/subflows" class="ngde">Subflows</a></li><li class="ngde"><a href="/features/nodes/custom-nodes" class="ngde">Custom nodes</a></li><li class="ngde"><a href="/features/handling-changes" class="ngde">Handling changes</a></li></ul>`,Q=(()=>{class s extends x{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=K,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/categories/nodes/resizer/index.md?message=docs(resizer): describe your changes here...",this.page=u,this.demoAssets=M}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=t({type:s,selectors:[["ng-doc-page-features-nodes-resizer"]],standalone:!0,features:[_([{provide:x,useExisting:s},A,u.providers??[]]),b,c],decls:1,vars:0,template:function(a,p){a&1&&l(0,"ng-doc-page")},dependencies:[T],encapsulation:2,changeDetection:0})}}return s})(),W=[C(v({},(0,H.isRoute)(u.route)?u.route:{}),{path:"",component:Q,title:"Resizer"})],hs=W;export{Q as DynamicComponent,hs as default};
