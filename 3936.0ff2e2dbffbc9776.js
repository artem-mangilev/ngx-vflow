"use strict";(self.webpackChunkngx_vflow_demo=self.webpackChunkngx_vflow_demo||[]).push([[3936],{3936:(O,g,l)=>{l.r(g),l.d(g,{DynamicComponent:()=>h,default:()=>S});var i=l(6286),r=l(7134),j=l(9143),m=l(8341),o=l(6814),u=l(2898),s=l(5879),f=l(2454),x=l(2687),y=l(8874);function C(a,t){if(1&a&&(s.ynx(0),s.TgZ(1,"div",5)(2,"div",6),s._uU(3," Output 1 "),s._UZ(4,"handle",7),s.qZA(),s.TgZ(5,"div",6),s._uU(6," Output 2 "),s._UZ(7,"handle",7),s.qZA()(),s.BQk()),2&a){const n=s.oxw().$implicit;s.oxw();const e=s.MAs(3);s.xp6(4),s.Q6J("id",n.node.data.output1)("template",e),s.xp6(3),s.Q6J("id",n.node.data.output2)("template",e)}}function v(a,t){if(1&a&&(s.ynx(0),s.TgZ(1,"div",5)(2,"div",6),s._uU(3," Input 1 "),s._UZ(4,"handle",8),s.qZA(),s.TgZ(5,"div",6),s._uU(6," Input 2 "),s._UZ(7,"handle",8),s.qZA()(),s.BQk()),2&a){const n=s.oxw().$implicit;s.oxw();const e=s.MAs(5);s.xp6(4),s.Q6J("id",n.node.data.input1)("template",e),s.xp6(3),s.Q6J("id",n.node.data.input2)("template",e)}}function b(a,t){if(1&a&&(s.YNc(0,C,8,4,"ng-container",4),s.YNc(1,v,8,4,"ng-container",4)),2&a){const n=t.$implicit;s.Q6J("ngIf","output"===n.node.data.type),s.xp6(1),s.Q6J("ngIf","input"===n.node.data.type)}}function _(a,t){if(1&a&&(s.O4$(),s._UZ(0,"circle",9)),2&a){const n=t.$implicit;s.uIk("cx",n.point().x)("cy",n.point().y)}}function k(a,t){if(1&a&&(s.O4$(),s._UZ(0,"rect",10)),2&a){const n=t.$implicit;s.ekj("handle_idle","idle"===n.state())("handle_valid","valid"===n.state())("handle_invalid","invalid"===n.state()),s.uIk("x",n.point().x-5)("y",n.point().y-5)}}const d={title:"Custom handles",mdFile:"./index.md",category:m.Z,demos:{CustomHandlesDemoComponent:(()=>{class a{constructor(){this.nodes=[{id:"1",point:{x:0,y:150},type:"html-template",data:{type:"output",output1:"output1",output2:"output2"}},{id:"2",point:{x:250,y:100},type:"html-template",data:{type:"input",input1:"input1",input2:"input2"}}],this.edges=[],this.connectionSettings={validator:n=>"2"===n.target&&"input1"===n.targetHandle}}createEdge({source:n,target:e,sourceHandle:p,targetHandle:c}){this.edges=[...this.edges,{id:`${n} -> ${e}${p??""}${c??""}`,markers:{start:{type:"arrow-closed"},end:{type:"arrow-closed"}},source:n,target:e,sourceHandle:p,targetHandle:c}]}static#s=this.\u0275fac=function(e){return new(e||a)};static#n=this.\u0275cmp=s.Xpm({type:a,selectors:[["ng-component"]],standalone:!0,features:[s.jDz],decls:6,vars:3,consts:[[3,"nodes","edges","connection","onConnect"],["nodeHtml",""],["handleTemplate",""],["squareHandleTemplate",""],[4,"ngIf"],[1,"custom-node"],[1,"data-block"],["position","right","type","source",3,"id","template"],["position","left","type","target",3,"id","template"],["stroke-width","1","stroke","black","r","6","fill","#1b262c"],["width","10","height","10","stroke-width","1","stroke","black","rx","1","ry","1"]],template:function(e,p){1&e&&(s.TgZ(0,"vflow",0),s.NdJ("onConnect",function(I){return p.createEdge(I)}),s.YNc(1,b,2,2,"ng-template",1),s.qZA(),s.YNc(2,_,1,2,"ng-template",null,2,s.W1O),s.YNc(4,k,1,8,"ng-template",null,3,s.W1O)),2&e&&s.Q6J("nodes",p.nodes)("edges",p.edges)("connection",p.connectionSettings)},dependencies:[u.p,f.t,x.M,y.QC,o.ez,o.O5],styles:[".custom-node[_ngcontent-%COMP%]{width:150px;height:100px;background-color:#0f4c75;border:1px solid gray;border-radius:5px;align-items:center;padding-left:7px;padding-right:7px}.data-block[_ngcontent-%COMP%]{background-color:#fff;color:#1b262c;margin-top:15px;border-radius:5px;text-align:center}.handle_idle[_ngcontent-%COMP%]{fill:#fff}.handle_valid[_ngcontent-%COMP%]{fill:green}.handle_invalid[_ngcontent-%COMP%]{fill:red}"],changeDetection:0})}return a})()},order:2},T=[],H={CustomHandlesDemoComponent:[{title:"TypeScript",code:'<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">CommonModule</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/common\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/core\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'projects/ngx-vflow-lib/src/public-api\'</span>;\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({\n</span><span class="line ngde">  <span class="hljs-attr ngde">templateUrl</span>: <span class="hljs-string ngde">\'./custom-handles-demo.component.html\'</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">styleUrls</span>: [<span class="hljs-string ngde">\'./custom-handles-demo.styles.scss\'</span>],\n</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>, <span class="hljs-title class_ ngde">CommonModule</span>]\n</span><span class="line ngde">})\n</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">CustomHandlesDemoComponent</span> {\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">0</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">150</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'html-template\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'output\'</span>,\n</span><span class="line ngde">        <span class="hljs-attr ngde">output1</span>: <span class="hljs-string ngde">\'output1\'</span>,\n</span><span class="line ngde">        <span class="hljs-attr ngde">output2</span>: <span class="hljs-string ngde">\'output2\'</span>\n</span><span class="line ngde">      }\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">250</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'html-template\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'input\'</span>,\n</span><span class="line ngde">        <span class="hljs-attr ngde">input1</span>: <span class="hljs-string ngde">\'input1\'</span>,\n</span><span class="line ngde">        <span class="hljs-attr ngde">input2</span>: <span class="hljs-string ngde">\'input2\'</span>\n</span><span class="line ngde">      }\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = []\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">connectionSettings</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/ConnectionSettings" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">ConnectionSettings</a></span> = {\n</span><span class="line ngde">    <span class="hljs-attr ngde">validator</span>: <span class="hljs-function ngde">(<span class="hljs-params ngde">connection</span>) =></span> {\n</span><span class="line ngde">      <span class="hljs-keyword ngde">return</span> connection.<span class="hljs-property ngde">target</span> === <span class="hljs-string ngde">\'2\'</span> &#x26;&#x26; connection.<span class="hljs-property ngde">targetHandle</span> === <span class="hljs-string ngde">\'input1\'</span>;\n</span><span class="line ngde">    }\n</span><span class="line ngde">  }\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-title function_ ngde">createEdge</span>(<span class="hljs-params ngde">{ source, target, sourceHandle, targetHandle }: <a href="/api/ngx-vflow/interfaces/Connection" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Connection</a></span>) {\n</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span> = [...<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span>, {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">`<span class="hljs-subst ngde">${source}</span> -> <span class="hljs-subst ngde">${target}</span><span class="hljs-subst ngde">${sourceHandle ?? <span class="hljs-string ngde">\'\'</span>}</span><span class="hljs-subst ngde">${targetHandle ?? <span class="hljs-string ngde">\'\'</span>}</span>`</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">markers</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">start</span>: { <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'arrow-closed\'</span> },\n</span><span class="line ngde">        <span class="hljs-attr ngde">end</span>: { <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'arrow-closed\'</span> }\n</span><span class="line ngde">      },\n</span><span class="line ngde">      source,\n</span><span class="line ngde">      target,\n</span><span class="line ngde">      sourceHandle,\n</span><span class="line ngde">      targetHandle\n</span><span class="line ngde">    }]\n</span><span class="line ngde">  }\n</span><span class="line ngde">}\n</span></code></pre>'},{title:"HTML",code:'<pre class="ngde hljs"><code lang="html" class="hljs language-html code-lines ngde"><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">vflow</span> [<span class="hljs-attr ngde">nodes</span>]=<span class="hljs-string ngde">"nodes"</span> [<span class="hljs-attr ngde">edges</span>]=<span class="hljs-string ngde">"edges"</span> (<span class="hljs-attr ngde">onConnect</span>)=<span class="hljs-string ngde">"createEdge($event)"</span> [<span class="hljs-attr ngde">connection</span>]=<span class="hljs-string ngde">"connectionSettings"</span>></span>\n</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-template</span> <span class="hljs-attr ngde">nodeHtml</span> <span class="hljs-attr ngde">let-ctx</span>></span>\n</span><span class="line ngde">    <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-container</span> *<span class="hljs-attr ngde">ngIf</span>=<span class="hljs-string ngde">"ctx.node.data.type === \'output\'"</span>></span>\n</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"custom-node"</span>></span>\n</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"data-block"</span>></span>\n</span><span class="line ngde">          Output 1\n</span><span class="line ngde">          <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"right"</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"source"</span> [<span class="hljs-attr ngde">id</span>]=<span class="hljs-string ngde">"ctx.node.data.output1"</span> [<span class="hljs-attr ngde">template</span>]=<span class="hljs-string ngde">"handleTemplate"</span>/></span>\n</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>\n</span><span class="line ngde">\n</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"data-block"</span>></span>\n</span><span class="line ngde">          Output 2\n</span><span class="line ngde">          <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"right"</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"source"</span> [<span class="hljs-attr ngde">id</span>]=<span class="hljs-string ngde">"ctx.node.data.output2"</span> [<span class="hljs-attr ngde">template</span>]=<span class="hljs-string ngde">"handleTemplate"</span>/></span>\n</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>\n</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>\n</span><span class="line ngde">    <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">ng-container</span>></span>\n</span><span class="line ngde">\n</span><span class="line ngde">    <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-container</span> *<span class="hljs-attr ngde">ngIf</span>=<span class="hljs-string ngde">"ctx.node.data.type === \'input\'"</span>></span>\n</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"custom-node"</span>></span>\n</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"data-block"</span>></span>\n</span><span class="line ngde">          Input 1\n</span><span class="line ngde">          <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"left"</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"target"</span> [<span class="hljs-attr ngde">id</span>]=<span class="hljs-string ngde">"ctx.node.data.input1"</span> [<span class="hljs-attr ngde">template</span>]=<span class="hljs-string ngde">"squareHandleTemplate"</span>/></span>\n</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>\n</span><span class="line ngde">\n</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"data-block"</span>></span>\n</span><span class="line ngde">          Input 2\n</span><span class="line ngde">          <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"left"</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"target"</span> [<span class="hljs-attr ngde">id</span>]=<span class="hljs-string ngde">"ctx.node.data.input2"</span> [<span class="hljs-attr ngde">template</span>]=<span class="hljs-string ngde">"squareHandleTemplate"</span>/></span>\n</span><span class="line ngde">        <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>\n</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>\n</span><span class="line ngde">    <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">ng-container</span>></span>\n</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">ng-template</span>></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">vflow</span>></span>\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-template</span> #<span class="hljs-attr ngde">handleTemplate</span> <span class="hljs-attr ngde">let-ctx</span>></span>\n</span><span class="line ngde">  &#x3C;<span class="hljs-name ngde">svg:circle</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">    [</span><span class="hljs-attr ngde">attr.cx</span>]=<span class="hljs-string ngde">"ctx.point().x"</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">    [</span><span class="hljs-attr ngde">attr.cy</span>]=<span class="hljs-string ngde">"ctx.point().y"</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">stroke-width</span>=<span class="hljs-string ngde">"1"</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">stroke</span>=<span class="hljs-string ngde">"black"</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">r</span>=<span class="hljs-string ngde">"6"</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">fill</span>=<span class="hljs-string ngde">"#1b262c"</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">  /></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">ng-template</span>></span>\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-template</span> #<span class="hljs-attr ngde">squareHandleTemplate</span> <span class="hljs-attr ngde">let-ctx</span>></span>\n</span><span class="line ngde">  &#x3C;<span class="hljs-name ngde">svg:rect</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">width</span>=<span class="hljs-string ngde">"10"</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">height</span>=<span class="hljs-string ngde">"10"</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">stroke-width</span>=<span class="hljs-string ngde">"1"</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">stroke</span>=<span class="hljs-string ngde">"black"</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">rx</span>=<span class="hljs-string ngde">"1"</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">ry</span>=<span class="hljs-string ngde">"1"</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">    [</span><span class="hljs-attr ngde">attr.x</span>]=<span class="hljs-string ngde">"ctx.point().x - 5"</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">    [</span><span class="hljs-attr ngde">attr.y</span>]=<span class="hljs-string ngde">"ctx.point().y - 5"</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">    [</span><span class="hljs-attr ngde">class.handle_idle</span>]=<span class="hljs-string ngde">"ctx.state() === \'idle\'"</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">    [</span><span class="hljs-attr ngde">class.handle_valid</span>]=<span class="hljs-string ngde">"ctx.state() === \'valid\'"</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">    [</span><span class="hljs-attr ngde">class.handle_invalid</span>]=<span class="hljs-string ngde">"ctx.state() === \'invalid\'"</span><span class="hljs-tag ngde"></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">  /></span>\n</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">ng-template</span>></span>\n</span></code></pre>'},{title:"SCSS",code:'<pre class="ngde hljs"><code lang="scss" class="hljs language-scss code-lines ngde"><span class="line ngde"><span class="hljs-selector-class ngde">.custom-node</span> {\n</span><span class="line ngde">  <span class="hljs-attribute ngde">width</span>: <span class="hljs-number ngde">150px</span>;\n</span><span class="line ngde">  <span class="hljs-attribute ngde">height</span>: <span class="hljs-number ngde">100px</span>;\n</span><span class="line ngde">  <span class="hljs-attribute ngde">background-color</span>: <span class="hljs-number ngde">#0f4c75</span>;\n</span><span class="line ngde">  <span class="hljs-attribute ngde">border</span>: <span class="hljs-number ngde">1px</span> solid gray;\n</span><span class="line ngde">  <span class="hljs-attribute ngde">border-radius</span>: <span class="hljs-number ngde">5px</span>;\n</span><span class="line ngde">  <span class="hljs-attribute ngde">align-items</span>: center;\n</span><span class="line ngde">  <span class="hljs-attribute ngde">padding-left</span>: <span class="hljs-number ngde">7px</span>;\n</span><span class="line ngde">  <span class="hljs-attribute ngde">padding-right</span>: <span class="hljs-number ngde">7px</span>;\n</span><span class="line ngde">}\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-selector-class ngde">.data-block</span> {\n</span><span class="line ngde">  <span class="hljs-attribute ngde">background-color</span>: <span class="hljs-number ngde">#ffffff</span>;\n</span><span class="line ngde">  <span class="hljs-attribute ngde">color</span>: <span class="hljs-number ngde">#1b262c</span>;\n</span><span class="line ngde">  <span class="hljs-attribute ngde">margin-top</span>: <span class="hljs-number ngde">15px</span>;\n</span><span class="line ngde">  <span class="hljs-attribute ngde">border-radius</span>: <span class="hljs-number ngde">5px</span>;\n</span><span class="line ngde">  <span class="hljs-attribute ngde">text-align</span>: center;\n</span><span class="line ngde">}\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-selector-class ngde">.handle</span> {\n</span><span class="line ngde">  &#x26;_idle {\n</span><span class="line ngde">    fill: <span class="hljs-number ngde">#fff</span>;\n</span><span class="line ngde">  }\n</span><span class="line ngde">\n</span><span class="line ngde">  &#x26;_valid {\n</span><span class="line ngde">    fill: green;\n</span><span class="line ngde">  }\n</span><span class="line ngde">\n</span><span class="line ngde">  &#x26;_invalid {\n</span><span class="line ngde">    fill: red;\n</span><span class="line ngde">  }\n</span><span class="line ngde">}\n</span></code></pre>'}]};let h=(()=>{class a extends i.a{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent='<h1 id="custom-handles" class="ngde">Custom handles<a title="Link to heading" class="ng-doc-header-link ngde" href="/examples/custom-handles#custom-handles"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">You can pass a <code class="ngde">[template]</code> to <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/HandleComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">HandleComponent</a></code> with custom handle.</p><ng-doc-blockquote type="info" class="ngde"><p class="ngde">I\'t important to note that template must be made with SVG.</p></ng-doc-blockquote><ul class="ngde"><li class="ngde">Custom handles are not positioned automatically, but the library provides a useful template context property to position your handle.</li><li class="ngde">Custom handles know if validation of <code class="ngde">ConnectionSettings.validator()</code> has failed or succeeded, so you can use <code class="ngde">state()</code> signal in <code class="ngde">let-ctx</code> to add some behavior based on validation result.</li></ul><p class="ngde">Refer to this interface for <code class="ngde">let-ctx</code> when crafting your handle template:</p><pre class="ngde hljs"><code class="hljs language-ts code-lines ngde" lang="ts" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">interface</span> <span class="hljs-title class_ ngde">HandleTemplateImplicitContext</span> {\n</span><span class="line ngde">  <span class="hljs-comment ngde">/**</span>\n</span><span class="line ngde"><span class="hljs-comment ngde">   * <a href="/api/ngx-vflow/interfaces/Point" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Point</a> from library where you should put your handle.</span>\n</span><span class="line ngde"><span class="hljs-comment ngde">   * Pass it in proper SVG element properties</span>\n</span><span class="line ngde"><span class="hljs-comment ngde">   */</span>\n</span><span class="line ngde">  <span class="hljs-attr ngde">point</span>: <span class="hljs-title class_ ngde">Signal</span>&#x3C;{ <span class="hljs-attr ngde">x</span>: <span class="hljs-built_in ngde">number</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-built_in ngde">number</span> }>\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-comment ngde">/** </span>\n</span><span class="line ngde"><span class="hljs-comment ngde">   * Helper signal to get validation state for current handle. \'idle\' by default.</span>\n</span><span class="line ngde"><span class="hljs-comment ngde">   * You can use it do apply some styles based on state</span>\n</span><span class="line ngde"><span class="hljs-comment ngde">   */</span>\n</span><span class="line ngde">  <span class="hljs-attr ngde">state</span>: <span class="hljs-title class_ ngde">Signal</span>&#x3C;<span class="hljs-string ngde">\'valid\'</span> | <span class="hljs-string ngde">\'invalid\'</span> | <span class="hljs-string ngde">\'idle\'</span>>\n</span><span class="line ngde">}\n</span></code></pre><ng-doc-demo componentname="CustomHandlesDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{"expanded":true}</div></ng-doc-demo>',this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/examples/pages/custom-handles/index.md?message=docs(custom-handles): describe your changes here...",this.page=d,this.demoAssets=H}static#s=this.\u0275fac=function(e){return new(e||a)};static#n=this.\u0275cmp=s.Xpm({type:a,selectors:[["ng-doc-page-examples-custom-handles"]],standalone:!0,features:[s._Bn([{provide:i.a,useExisting:a},T,d.providers??[]]),s.qOj,s.jDz],decls:1,vars:0,template:function(e,p){1&e&&s._UZ(0,"ng-doc-page")},dependencies:[r.z],encapsulation:2,changeDetection:0})}return a})();const S=[{...(0,j.isRoute)(d.route)?d.route:{},path:"",component:h,title:"Custom handles"}]}}]);