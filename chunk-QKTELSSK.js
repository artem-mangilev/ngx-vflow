import{a as D}from"./chunk-S3I3S5BX.js";import{l as P,s as M,x as E,z as S}from"./chunk-W3CJT23T.js";import{a as k}from"./chunk-R2FYFHTZ.js";import"./chunk-FGWLUFMG.js";import{a as x}from"./chunk-JLOZFYHF.js";import{Ba as b,Ea as u,Ga as t,Ma as m,Ob as w,R as o,Ra as d,Sa as c,Ta as l,Za as v,_a as f,jb as i,na as p,pb as _,qb as r,wc as A}from"./chunk-VFFNGGE6.js";import{a as C,b as y,g as I}from"./chunk-ODLL2QMY.js";var N=I(A());function V(s,h){if(s&1&&(d(0,"div",2)(1,"div",3),i(2," Output 1 "),l(3,"handle",4),c(),d(4,"div",3),i(5," Output 2 "),l(6,"handle",4),c()()),s&2){let n=f().$implicit;p(3),t("id",n.node.data.output1),p(3),t("id",n.node.data.output2)}}function F(s,h){if(s&1&&(d(0,"div",2)(1,"div",3),i(2," Input 1 "),l(3,"handle",5),c(),d(4,"div",3),i(5," Input 2 "),l(6,"handle",5),c()()),s&2){let n=f().$implicit;p(3),t("id",n.node.data.input1),p(3),t("id",n.node.data.input2)}}function U(s,h){if(s&1&&u(0,V,7,2,"div",2)(1,F,7,2,"div",2),s&2){let n=h.$implicit;m(0,n.node.data.type==="output"?0:-1),p(),m(1,n.node.data.type==="input"?1:-1)}}var H=(()=>{class s{constructor(){this.nodes=[{id:"1",point:{x:0,y:150},type:"html-template",data:{type:"output",output1:"output1",output2:"output2"}},{id:"2",point:{x:250,y:100},type:"html-template",data:{type:"input",input1:"input1",input2:"input2"}}],this.edges=[{id:"1 -> 2 one",source:"1",target:"2",sourceHandle:"output1",targetHandle:"input1"},{id:"1 -> 2 two",source:"1",target:"2",sourceHandle:"output2",targetHandle:"input2"}]}createEdge({source:n,target:a,sourceHandle:e,targetHandle:j}){this.edges=[...this.edges,{id:`${n} -> ${a}${e??""}${j??""}`,source:n,target:a,sourceHandle:e,targetHandle:j}]}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=o({type:s,selectors:[["ng-component"]],standalone:!0,features:[r],decls:2,vars:2,consts:[["view","auto",3,"onConnect","nodes","edges"],["nodeHtml",""],[1,"custom-node"],[1,"data-block"],["position","right","type","source",3,"id"],["position","left","type","target",3,"id"]],template:function(a,e){a&1&&(d(0,"vflow",0),v("onConnect",function($){return e.createEdge($)}),u(1,U,2,2,"ng-template",1),c()),a&2&&t("nodes",e.nodes)("edges",e.edges)},dependencies:[S,E,M,P,w],styles:["[_nghost-%COMP%]{width:100%;height:100%}.custom-node[_ngcontent-%COMP%]{width:150px;height:100px;background-color:#0f4c75;border:1px solid gray;border-radius:5px;align-items:center;padding-left:7px;padding-right:7px}.data-block[_ngcontent-%COMP%]{background-color:#fff;color:#1b262c;margin-top:15px;border-radius:5px;text-align:center}"],changeDetection:0})}}return s})();var L={title:"Multiple connection points",mdFile:"./index.md",category:D,demos:{MultipleConnectionPointsDemoComponent:H}},g=L;var O=[];var G={MultipleConnectionPointsDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">CommonModule</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/common'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">templateUrl</span>: <span class="hljs-string ngde">'./multiple-connection-points-demo.component.html'</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styleUrls</span>: [<span class="hljs-string ngde">'./multiple-connection-points-demo.styles.scss'</span>],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>, <span class="hljs-title class_ ngde">CommonModule</span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">MultipleConnectionPointsDemoComponent</span> {
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
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">createEdge</span>(<span class="hljs-params ngde">{ source, target, sourceHandle, targetHandle }: <a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span> = [
</span><span class="line ngde">      ...<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span>,
</span><span class="line ngde">      {
</span><span class="line ngde">        <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\`<span class="hljs-subst ngde">\${source}</span> -> <span class="hljs-subst ngde">\${target}</span><span class="hljs-subst ngde">\${sourceHandle ?? <span class="hljs-string ngde">''</span>}</span><span class="hljs-subst ngde">\${targetHandle ?? <span class="hljs-string ngde">''</span>}</span>\`</span>,
</span><span class="line ngde">        source,
</span><span class="line ngde">        target,
</span><span class="line ngde">        sourceHandle,
</span><span class="line ngde">        targetHandle,
</span><span class="line ngde">      },
</span><span class="line ngde">    ];
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre>`},{title:"HTML",code:`<pre class="ngde hljs"><code lang="html" class="hljs language-html code-lines ngde"><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">vflow</span> <span class="hljs-attr ngde">view</span>=<span class="hljs-string ngde">"auto"</span> [<span class="hljs-attr ngde">nodes</span>]=<span class="hljs-string ngde">"nodes"</span> [<span class="hljs-attr ngde">edges</span>]=<span class="hljs-string ngde">"edges"</span> (<span class="hljs-attr ngde">onConnect</span>)=<span class="hljs-string ngde">"createEdge($event)"</span>></span>
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
</span></code></pre>`}]},T=G;var Y=`<h1 id="multiple-connection-points" class="ngde">Multiple connection points<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/multiple-connection-points#multiple-connection-points"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">Custom components provide the ability to control handles and their positions.</p><p class="ngde">All you need to do is take <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/HandleComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">HandleComponent</a></code> from library and place it somewhere in your custom node. This component automatically computes its position based on parent element's position.</p><ng-doc-demo-pane componentname="MultipleConnectionPointsDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>`,z=(()=>{class s extends x{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=Y,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/pages/multiple-connection-points/index.md?message=docs(multiple-connection-points): describe your changes here...",this.page=g,this.demoAssets=T}static{this.\u0275fac=function(a){return new(a||s)}}static{this.\u0275cmp=o({type:s,selectors:[["ng-doc-page-features-multiple-connection-points"]],standalone:!0,features:[_([{provide:x,useExisting:s},O,g.providers??[]]),b,r],decls:1,vars:0,template:function(a,e){a&1&&l(0,"ng-doc-page")},dependencies:[k],encapsulation:2,changeDetection:0})}}return s})(),q=[y(C({},(0,N.isRoute)(g.route)?g.route:{}),{path:"",component:z,title:"Multiple connection points"})],ts=q;export{z as DynamicComponent,ts as default};
