import{a as N}from"./chunk-S3I3S5BX.js";import{B as $,D as M,l as V,w as I}from"./chunk-3HD2ZSF6.js";import{a as O}from"./chunk-XEAWODMG.js";import"./chunk-5DYL7VP6.js";import{a as b}from"./chunk-PKRD3RVL.js";import{Ba as S,Ea as m,Fa as x,Ga as d,Ia as H,Ma as y,R as j,Ra as c,Sa as g,Ta as e,Xa as T,Y as k,Z as D,Za as P,_ as f,_a as i,ib as C,jb as o,na as t,pb as E,qb as u,wc as L,yb as v}from"./chunk-CG7QMWE5.js";import{a as _,b as w,g as U}from"./chunk-ODLL2QMY.js";var G=U(L());function z(n,p){if(n&1&&(c(0,"div",4)(1,"div",5),o(2," Output 1 "),e(3,"handle",6),g(),c(4,"div",5),o(5," Output 2 "),e(6,"handle",6),g()()),n&2){let s=i().$implicit;i();let a=C(3);t(3),d("id",s.node.data.output1)("template",a),t(3),d("id",s.node.data.output2)("template",a)}}function B(n,p){if(n&1&&(c(0,"div",4)(1,"div",5),o(2," Input 1 "),e(3,"handle",7),g(),c(4,"div",5),o(5," Input 2 "),e(6,"handle",7),g()()),n&2){let s=i().$implicit;i();let a=C(5);t(3),d("id",s.node.data.input1)("template",a),t(3),d("id",s.node.data.input2)("template",a)}}function J(n,p){if(n&1&&m(0,z,7,4,"div",4)(1,B,7,4,"div",4),n&2){let s=p.$implicit;y(0,s.node.data.type==="output"?0:-1),t(),y(1,s.node.data.type==="input"?1:-1)}}function K(n,p){if(n&1&&(f(),e(0,"circle",8)),n&2){let s=p.$implicit;x("cx",s.point().x)("cy",s.point().y)}}function Q(n,p){if(n&1&&(f(),e(0,"rect",9)),n&2){let s=p.$implicit;H("handle_idle",s.state()==="idle")("handle_valid",s.state()==="valid")("handle_invalid",s.state()==="invalid"),x("x",s.point().x-5)("y",s.point().y-5)}}var R=(()=>{class n{constructor(){this.nodes=[{id:"1",point:{x:0,y:150},type:"html-template",data:{type:"output",output1:"output1",output2:"output2"}},{id:"2",point:{x:250,y:100},type:"html-template",data:{type:"input",input1:"input1",input2:"input2"}}],this.edges=[],this.connectionSettings={validator:s=>s.target==="2"&&s.targetHandle==="input1"}}createEdge({source:s,target:a,sourceHandle:l,targetHandle:h}){this.edges=[...this.edges,{id:`${s} -> ${a}${l??""}${h??""}`,markers:{start:{type:"arrow-closed"},end:{type:"arrow-closed"}},source:s,target:a,sourceHandle:l,targetHandle:h}]}static{this.\u0275fac=function(a){return new(a||n)}}static{this.\u0275cmp=j({type:n,selectors:[["ng-component"]],standalone:!0,features:[u],decls:6,vars:3,consts:[["handleTemplate",""],["squareHandleTemplate",""],["view","auto",3,"onConnect","nodes","edges","connection"],["nodeHtml",""],[1,"custom-node"],[1,"data-block"],["position","right","type","source",3,"id","template"],["position","left","type","target",3,"id","template"],["stroke-width","1","stroke","black","r","6","fill","#1b262c"],["width","10","height","10","stroke-width","1","stroke","black","rx","1","ry","1"]],template:function(a,l){if(a&1){let h=T();c(0,"vflow",2),P("onConnect",function(q){return k(h),D(l.createEdge(q))}),m(1,J,2,2,"ng-template",3),g(),m(2,K,1,2,"ng-template",null,0,v)(4,Q,1,8,"ng-template",null,1,v)}a&2&&d("nodes",l.nodes)("edges",l.edges)("connection",l.connectionSettings)},dependencies:[M,$,I,V],styles:["[_nghost-%COMP%]{width:100%;height:100%}.custom-node[_ngcontent-%COMP%]{width:150px;height:100px;background-color:#0f4c75;border:1px solid gray;border-radius:5px;align-items:center;padding-left:7px;padding-right:7px}.data-block[_ngcontent-%COMP%]{background-color:#fff;color:#1b262c;margin-top:15px;border-radius:5px;text-align:center}.handle_idle[_ngcontent-%COMP%]{fill:#fff}.handle_valid[_ngcontent-%COMP%]{fill:green}.handle_invalid[_ngcontent-%COMP%]{fill:red}"],changeDetection:0})}}return n})();var W={title:"Custom handles",mdFile:"./index.md",category:N,demos:{CustomHandlesDemoComponent:R}},r=W;var A=[];var X={CustomHandlesDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'ngx-vflow'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">templateUrl</span>: <span class="hljs-string ngde">'./custom-handles-demo.component.html'</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styleUrls</span>: [<span class="hljs-string ngde">'./custom-handles-demo.styles.scss'</span>],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">CustomHandlesDemoComponent</span> {
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
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">connectionSettings</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></span> = {
</span><span class="line ngde">    <span class="hljs-attr ngde">validator</span>: <span class="hljs-function ngde">(<span class="hljs-params ngde">connection</span>) =></span> {
</span><span class="line ngde">      <span class="hljs-keyword ngde">return</span> connection.<span class="hljs-property ngde">target</span> === <span class="hljs-string ngde">'2'</span> &#x26;&#x26; connection.<span class="hljs-property ngde">targetHandle</span> === <span class="hljs-string ngde">'input1'</span>;
</span><span class="line ngde">    },
</span><span class="line ngde">  };
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">createEdge</span>(<span class="hljs-params ngde">{ source, target, sourceHandle, targetHandle }: <a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>) {
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span> = [
</span><span class="line ngde">      ...<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span>,
</span><span class="line ngde">      {
</span><span class="line ngde">        <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\`<span class="hljs-subst ngde">\${source}</span> -> <span class="hljs-subst ngde">\${target}</span><span class="hljs-subst ngde">\${sourceHandle ?? <span class="hljs-string ngde">''</span>}</span><span class="hljs-subst ngde">\${targetHandle ?? <span class="hljs-string ngde">''</span>}</span>\`</span>,
</span><span class="line ngde">        <span class="hljs-attr ngde">markers</span>: {
</span><span class="line ngde">          <span class="hljs-attr ngde">start</span>: { <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'arrow-closed'</span> },
</span><span class="line ngde">          <span class="hljs-attr ngde">end</span>: { <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'arrow-closed'</span> },
</span><span class="line ngde">        },
</span><span class="line ngde">        source,
</span><span class="line ngde">        target,
</span><span class="line ngde">        sourceHandle,
</span><span class="line ngde">        targetHandle,
</span><span class="line ngde">      },
</span><span class="line ngde">    ];
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre>`},{title:"HTML",code:`<pre class="ngde hljs"><code lang="html" class="hljs language-html code-lines ngde"><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">vflow</span> <span class="hljs-attr ngde">view</span>=<span class="hljs-string ngde">"auto"</span> [<span class="hljs-attr ngde">nodes</span>]=<span class="hljs-string ngde">"nodes"</span> [<span class="hljs-attr ngde">edges</span>]=<span class="hljs-string ngde">"edges"</span> [<span class="hljs-attr ngde">connection</span>]=<span class="hljs-string ngde">"connectionSettings"</span> (<span class="hljs-attr ngde">onConnect</span>)=<span class="hljs-string ngde">"createEdge($event)"</span>></span>
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-template</span> <span class="hljs-attr ngde">let-ctx</span> <span class="hljs-attr ngde">nodeHtml</span>></span>
</span><span class="line ngde">    @if (ctx.node.data.type === 'output') {
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"custom-node"</span>></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"data-block"</span>></span>
</span><span class="line ngde">          Output 1
</span><span class="line ngde">          <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"right"</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"source"</span> [<span class="hljs-attr ngde">id</span>]=<span class="hljs-string ngde">"ctx.node.data.output1"</span> [<span class="hljs-attr ngde">template</span>]=<span class="hljs-string ngde">"handleTemplate"</span> /></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"data-block"</span>></span>
</span><span class="line ngde">          Output 2
</span><span class="line ngde">          <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"right"</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"source"</span> [<span class="hljs-attr ngde">id</span>]=<span class="hljs-string ngde">"ctx.node.data.output2"</span> [<span class="hljs-attr ngde">template</span>]=<span class="hljs-string ngde">"handleTemplate"</span> /></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">    }
</span><span class="line ngde">
</span><span class="line ngde">    @if (ctx.node.data.type === 'input') {
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"custom-node"</span>></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"data-block"</span>></span>
</span><span class="line ngde">          Input 1
</span><span class="line ngde">          <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"left"</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"target"</span> [<span class="hljs-attr ngde">id</span>]=<span class="hljs-string ngde">"ctx.node.data.input1"</span> [<span class="hljs-attr ngde">template</span>]=<span class="hljs-string ngde">"squareHandleTemplate"</span> /></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"data-block"</span>></span>
</span><span class="line ngde">          Input 2
</span><span class="line ngde">          <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"left"</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"target"</span> [<span class="hljs-attr ngde">id</span>]=<span class="hljs-string ngde">"ctx.node.data.input2"</span> [<span class="hljs-attr ngde">template</span>]=<span class="hljs-string ngde">"squareHandleTemplate"</span> /></span>
</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">    }
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">ng-template</span>></span>
</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">vflow</span>></span>
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-template</span> #<span class="hljs-attr ngde">handleTemplate</span> <span class="hljs-attr ngde">let-ctx</span>></span>
</span><span class="line ngde">  &#x3C;<span class="hljs-name ngde">svg:circle</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">stroke-width</span>=<span class="hljs-string ngde">"1"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">stroke</span>=<span class="hljs-string ngde">"black"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">r</span>=<span class="hljs-string ngde">"6"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">fill</span>=<span class="hljs-string ngde">"#1b262c"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    [</span><span class="hljs-attr ngde">attr.cx</span>]=<span class="hljs-string ngde">"ctx.point().x"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    [</span><span class="hljs-attr ngde">attr.cy</span>]=<span class="hljs-string ngde">"ctx.point().y"</span> />
</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">ng-template</span>></span>
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-template</span> #<span class="hljs-attr ngde">squareHandleTemplate</span> <span class="hljs-attr ngde">let-ctx</span>></span>
</span><span class="line ngde">  &#x3C;<span class="hljs-name ngde">svg:rect</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">width</span>=<span class="hljs-string ngde">"10"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">height</span>=<span class="hljs-string ngde">"10"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">stroke-width</span>=<span class="hljs-string ngde">"1"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">stroke</span>=<span class="hljs-string ngde">"black"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">rx</span>=<span class="hljs-string ngde">"1"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">ry</span>=<span class="hljs-string ngde">"1"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    [</span><span class="hljs-attr ngde">attr.x</span>]=<span class="hljs-string ngde">"ctx.point().x - 5"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    [</span><span class="hljs-attr ngde">attr.y</span>]=<span class="hljs-string ngde">"ctx.point().y - 5"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    [</span><span class="hljs-attr ngde">class.handle_idle</span>]=<span class="hljs-string ngde">"ctx.state() === 'idle'"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    [</span><span class="hljs-attr ngde">class.handle_valid</span>]=<span class="hljs-string ngde">"ctx.state() === 'valid'"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    [</span><span class="hljs-attr ngde">class.handle_invalid</span>]=<span class="hljs-string ngde">"ctx.state() === 'invalid'"</span> />
</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">ng-template</span>></span>
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
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-selector-class ngde">.handle</span> {
</span><span class="line ngde">  &#x26;_idle {
</span><span class="line ngde">    fill: <span class="hljs-number ngde">#fff</span>;
</span><span class="line ngde">  }
</span><span class="line ngde">
</span><span class="line ngde">  &#x26;_valid {
</span><span class="line ngde">    fill: green;
</span><span class="line ngde">  }
</span><span class="line ngde">
</span><span class="line ngde">  &#x26;_invalid {
</span><span class="line ngde">    fill: red;
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span></code></pre>`}]},F=X;var Z=`<h1 id="custom-handles" class="ngde">Custom handles<a title="Link to heading" class="ng-doc-header-link ngde" href="/features/custom-handles#custom-handles"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">You can pass a <code class="ngde">[template]</code> to <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/HandleComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">HandleComponent</a></code> with custom handle.</p><ng-doc-blockquote type="info" class="ngde"><p class="ngde">I't important to note that template must be made with SVG.</p></ng-doc-blockquote><ul class="ngde"><li class="ngde">Custom handles are not positioned automatically, but the library provides a useful template context property to position your handle.</li><li class="ngde">Custom handles know if validation of <code class="ngde">ConnectionSettings.validator()</code> has failed or succeeded, so you can use <code class="ngde">state()</code> signal in <code class="ngde">let-ctx</code> to add some behavior based on validation result.</li></ul><p class="ngde">Refer to this interface for <code class="ngde">let-ctx</code> when crafting your handle template:</p><pre class="ngde hljs"><code class="hljs language-ts code-lines ngde" lang="ts" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">interface</span> <span class="hljs-title class_ ngde">HandleTemplateImplicitContext</span> {
</span><span class="line ngde">  <span class="hljs-comment ngde">/**</span>
</span><span class="line ngde"><span class="hljs-comment ngde">   * <a href="/api/ngx-vflow/interfaces/Point" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Point</a> from library where you should put your handle.</span>
</span><span class="line ngde"><span class="hljs-comment ngde">   * Pass it in proper SVG element properties</span>
</span><span class="line ngde"><span class="hljs-comment ngde">   */</span>
</span><span class="line ngde">  <span class="hljs-attr ngde">point</span>: <span class="hljs-title class_ ngde">Signal</span>&#x3C;{ <span class="hljs-attr ngde">x</span>: <span class="hljs-built_in ngde">number</span>; <span class="hljs-attr ngde">y</span>: <span class="hljs-built_in ngde">number</span> }>;
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-comment ngde">/**</span>
</span><span class="line ngde"><span class="hljs-comment ngde">   * Helper signal to get validation state for current handle. 'idle' by default.</span>
</span><span class="line ngde"><span class="hljs-comment ngde">   * You can use it do apply some styles based on state</span>
</span><span class="line ngde"><span class="hljs-comment ngde">   */</span>
</span><span class="line ngde">  <span class="hljs-attr ngde">state</span>: <span class="hljs-title class_ ngde">Signal</span>&#x3C;<span class="hljs-string ngde">'valid'</span> | <span class="hljs-string ngde">'invalid'</span> | <span class="hljs-string ngde">'idle'</span>>;
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-comment ngde">/**</span>
</span><span class="line ngde"><span class="hljs-comment ngde">   * The parent node of this handle</span>
</span><span class="line ngde"><span class="hljs-comment ngde">   */</span>
</span><span class="line ngde">  <span class="hljs-attr ngde">node</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span> | <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/DynamicNode" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">DynamicNode</a></span>;
</span><span class="line ngde">}
</span></code></pre><ng-doc-demo-pane componentname="CustomHandlesDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>`,ss=(()=>{class n extends b{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=Z,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/features/pages/custom-handles/index.md?message=docs(custom-handles): describe your changes here...",this.page=r,this.demoAssets=F}static{this.\u0275fac=function(a){return new(a||n)}}static{this.\u0275cmp=j({type:n,selectors:[["ng-doc-page-features-custom-handles"]],standalone:!0,features:[E([{provide:b,useExisting:n},A,r.providers??[]]),S,u],decls:1,vars:0,template:function(a,l){a&1&&e(0,"ng-doc-page")},dependencies:[O],encapsulation:2,changeDetection:0})}}return n})(),ns=[w(_({},(0,G.isRoute)(r.route)?r.route:{}),{path:"",component:ss,title:"Custom handles"})],ms=ns;export{ss as DynamicComponent,ms as default};
