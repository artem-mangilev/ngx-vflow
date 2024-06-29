"use strict";(self.webpackChunkngx_vflow_demo=self.webpackChunkngx_vflow_demo||[]).push([[7084],{7084:(M,o,p)=>{p.r(o),p.d(o,{DynamicComponent:()=>u,default:()=>q});var g=p(6286),j=p(7134),f=p(9143),y=p(8341),t=p(2898),s=p(5879),i=p(2454),c=p(2687),v=p(8874);function C(n,T){if(1&n&&(s.TgZ(0,"div",2),s._uU(1),s._UZ(2,"handle",3),s.qZA()),2&n){const a=T.$implicit;s.ekj("custom-node_selected",a.selected()),s.xp6(1),s.hij(" ",a.node.data.text," ")}}let x=(()=>{class n{constructor(){this.nodes=[{id:"1",point:{x:100,y:100},type:"html-template",data:{customType:"gradient",text:"I am a nice custom node with gradient"}},{id:"2",point:{x:250,y:250},type:"default",text:"Default"}],this.edges=[{id:"1 -> 2",source:"1",target:"2"}]}static#s=this.\u0275fac=function(e){return new(e||n)};static#n=this.\u0275cmp=s.Xpm({type:n,selectors:[["ng-component"]],standalone:!0,features:[s.jDz],decls:2,vars:2,consts:[[3,"nodes","edges"],["nodeHtml",""],[1,"custom-node"],["type","source","position","right"]],template:function(e,l){1&e&&(s.TgZ(0,"vflow",0),s.YNc(1,C,3,3,"ng-template",1),s.qZA()),2&e&&s.Q6J("nodes",l.nodes)("edges",l.edges)},dependencies:[t.p,i.t,c.M,v.QC],styles:[".custom-node[_ngcontent-%COMP%]{width:150px;height:100px;background:linear-gradient(to right,#00d2ff,#3a7bd5);border:1px solid gray;border-radius:5px;display:flex;align-items:center;padding-left:5px;padding-right:5px}.custom-node_selected[_ngcontent-%COMP%]{border:2px solid gray}"],changeDetection:0})}return n})();var w=p(1532),r=p(3870);const h=".blue-square[_ngcontent-%COMP%]{width:100px;height:100px;background-color:#0096ff;border-radius:5px;display:flex;align-items:center;justify-content:center;padding-left:5px;padding-right:5px}";let k=(()=>{class n{constructor(){this.toast=(0,s.f3M)(w.jE),this.nodes=[{id:"1",point:{x:100,y:100},type:_,data:{redSquareText:"Red"}},{id:"2",point:{x:250,y:250},type:N,data:{blueSquareText:"Blue"}}],this.edges=[{id:"1 -> 2",source:"1",target:"2"}]}handleComponentEvent(a){"redSquareEvent"===a.eventName&&this.toast.info(a.eventPayload),"blueSquareEvent"===a.eventName&&this.toast.info(`${a.eventPayload.x+a.eventPayload.y}`)}static#s=this.\u0275fac=function(e){return new(e||n)};static#n=this.\u0275cmp=s.Xpm({type:n,selectors:[["ng-component"]],standalone:!0,features:[s.jDz],decls:1,vars:2,consts:[[3,"nodes","edges","onComponentNodeEvent"]],template:function(e,l){1&e&&(s.TgZ(0,"vflow",0),s.NdJ("onComponentNodeEvent",function(D){return l.handleComponentEvent(D)}),s.qZA()),2&e&&s.Q6J("nodes",l.nodes)("edges",l.edges)},dependencies:[t.p,i.t],encapsulation:2,changeDetection:0})}return n})(),_=(()=>{class n extends r.L{constructor(){super(...arguments),this.redSquareEvent=new s.vpe}onClick(){this.redSquareEvent.emit("Click from red square")}static#s=this.\u0275fac=function(){let a;return function(l){return(a||(a=s.n5z(n)))(l||n)}}();static#n=this.\u0275cmp=s.Xpm({type:n,selectors:[["ng-component"]],outputs:{redSquareEvent:"redSquareEvent"},standalone:!0,features:[s.qOj,s.jDz],decls:3,vars:1,consts:[[1,"red-square",3,"click"],["type","source","position","right"]],template:function(e,l){1&e&&(s.TgZ(0,"div",0),s.NdJ("click",function(){return l.onClick()}),s._uU(1),s._UZ(2,"handle",1),s.qZA()),2&e&&(s.xp6(1),s.hij(" ",null==l.node.data?null:l.node.data.redSquareText," "))},dependencies:[t.p,c.M],styles:[h]})}return n})(),N=(()=>{class n extends r.L{constructor(){super(...arguments),this.blueSquareEvent=new s.vpe}onClick(){this.blueSquareEvent.emit({x:5,y:5})}static#s=this.\u0275fac=function(){let a;return function(l){return(a||(a=s.n5z(n)))(l||n)}}();static#n=this.\u0275cmp=s.Xpm({type:n,selectors:[["ng-component"]],outputs:{blueSquareEvent:"blueSquareEvent"},standalone:!0,features:[s.qOj,s.jDz],decls:3,vars:1,consts:[[1,"blue-square",3,"click"],["type","target","position","left"]],template:function(e,l){1&e&&(s.TgZ(0,"div",0),s.NdJ("click",function(){return l.onClick()}),s._uU(1),s._UZ(2,"handle",1),s.qZA()),2&e&&(s.xp6(1),s.hij(" ",null==l.node.data?null:l.node.data.blueSquareText," "))},dependencies:[t.p,c.M],styles:[h]})}return n})();const d={title:"Custom nodes",mdFile:"./index.md",category:y.Z,demos:{CustomNodesDemoComponent:x,CustomComponentNodesDemoComponent:k},order:2},b=[],S={CustomNodesDemoComponent:[{title:"TypeScript",code:'<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">NgIf</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/common\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/core\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'projects/ngx-vflow-lib/src/public-api\'</span>;\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({\n</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">`&#x3C;vflow [nodes]="nodes" [edges]="edges"></span>\n</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;ng-template nodeHtml let-ctx></span>\n</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;div class="custom-node" [class.custom-node_selected]="ctx.selected()"></span>\n</span><span class="line ngde"><span class="hljs-string ngde">        {{ ctx.node.data.text }}</span>\n</span><span class="line ngde"><span class="hljs-string ngde"></span>\n</span><span class="line ngde"><span class="hljs-string ngde">        &#x3C;handle type="source" position="right"/></span>\n</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;/div></span>\n</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/ng-template></span>\n</span><span class="line ngde"><span class="hljs-string ngde">  &#x3C;/vflow>`</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [\n</span><span class="line ngde">    <span class="hljs-string ngde">`</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      .custom-node {</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        width: 150px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        height: 100px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        background: linear-gradient(to right, #00d2ff, #3a7bd5);</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        border: 1px solid gray;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        display: flex;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        align-items: center;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        padding-left: 5px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        padding-right: 5px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde"></span>\n</span><span class="line ngde"><span class="hljs-string ngde">        &#x26;_selected {</span>\n</span><span class="line ngde"><span class="hljs-string ngde">          border: 2px solid gray;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        }</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      }</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    `</span>\n</span><span class="line ngde">  ],\n</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>]\n</span><span class="line ngde">})\n</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">CustomNodesDemoComponent</span> {\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">100</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'html-template\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">customType</span>: <span class="hljs-string ngde">\'gradient\'</span>,\n</span><span class="line ngde">        <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'I am a nice custom node with gradient\'</span>\n</span><span class="line ngde">      }\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">250</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">250</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'Default\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1 -> 2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">\'2\'</span>\n</span><span class="line ngde">    }\n</span><span class="line ngde">  ]\n</span><span class="line ngde">}\n</span></code></pre>'}],CustomComponentNodesDemoComponent:[{title:"TypeScript",code:'<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">NgIf</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/common\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span>, <span class="hljs-title class_ ngde">EventEmitter</span>, <span class="hljs-title class_ ngde">OnInit</span>, <span class="hljs-title class_ ngde">Output</span>, inject } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/core\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">HotToastService</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@ngneat/hot-toast\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/ComponentNodeEvent" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">ComponentNodeEvent</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/CustomNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomNodeComponent</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'projects/ngx-vflow-lib/src/public-api\'</span>;\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({\n</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">`&#x3C;vflow [nodes]="nodes" [edges]="edges" (onComponentNodeEvent)="handleComponentEvent($event)" />`</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>]\n</span><span class="line ngde">})\n</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">CustomComponentNodesDemoComponent</span> {\n</span><span class="line ngde">  <span class="hljs-keyword ngde">private</span> toast = <span class="hljs-title function_ ngde">inject</span>(<span class="hljs-title class_ ngde">HotToastService</span>);\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">100</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">RedSquareNodeComponent</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">redSquareText</span>: <span class="hljs-string ngde">\'Red\'</span>,\n</span><span class="line ngde">      } satisfies <span class="hljs-title class_ ngde">RedSquareData</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">250</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">250</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-title class_ ngde">BlueSquareNodeComponent</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">blueSquareText</span>: <span class="hljs-string ngde">\'Blue\'</span>,\n</span><span class="line ngde">      } satisfies <span class="hljs-title class_ ngde">BlueSquareData</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1 -> 2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">\'2\'</span>\n</span><span class="line ngde">    }\n</span><span class="line ngde">  ]\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-comment ngde">// Type-safe!</span>\n</span><span class="line ngde">  <span class="hljs-title function_ ngde">handleComponentEvent</span>(<span class="hljs-params ngde">event: <a href="/api/ngx-vflow/type-aliases/ComponentNodeEvent" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">ComponentNodeEvent</a>&#x3C;[RedSquareNodeComponent, BlueSquareNodeComponent]></span>) {\n</span><span class="line ngde">    <span class="hljs-keyword ngde">if</span> (event.<span class="hljs-property ngde">eventName</span> === <span class="hljs-string ngde">\'redSquareEvent\'</span>) {\n</span><span class="line ngde">      <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">toast</span>.<span class="hljs-title function_ ngde">info</span>(event.<span class="hljs-property ngde">eventPayload</span>)\n</span><span class="line ngde">    }\n</span><span class="line ngde">\n</span><span class="line ngde">    <span class="hljs-keyword ngde">if</span> (event.<span class="hljs-property ngde">eventName</span> === <span class="hljs-string ngde">\'blueSquareEvent\'</span>) {\n</span><span class="line ngde">      <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">toast</span>.<span class="hljs-title function_ ngde">info</span>(<span class="hljs-string ngde">`<span class="hljs-subst ngde">${event.eventPayload.x + event.eventPayload.y}</span>`</span>)\n</span><span class="line ngde">    }\n</span><span class="line ngde">  }\n</span><span class="line ngde">}\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-comment ngde">// --- Description of red square component node</span>\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-keyword ngde">interface</span> <span class="hljs-title class_ ngde">RedSquareData</span> {\n</span><span class="line ngde">  <span class="hljs-attr ngde">redSquareText</span>: <span class="hljs-built_in ngde">string</span>\n</span><span class="line ngde">}\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({\n</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">`</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;div class="red-square" (click)="onClick()"></span>\n</span><span class="line ngde"><span class="hljs-string ngde">      {{ node.data?.redSquareText }}</span>\n</span><span class="line ngde"><span class="hljs-string ngde"></span>\n</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;handle type="source" position="right"/></span>\n</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/div></span>\n</span><span class="line ngde"><span class="hljs-string ngde">  `</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [<span class="hljs-string ngde">`</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    .red-square {</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      width: 100px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      height: 100px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      background-color: #DE3163;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      border-radius: 5px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      display: flex;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      align-items: center;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      justify-content: center;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      padding-left: 5px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      padding-right: 5px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    }</span>\n</span><span class="line ngde"><span class="hljs-string ngde">  `</span>],\n</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>]\n</span><span class="line ngde">})\n</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">RedSquareNodeComponent</span> <span class="hljs-keyword ngde">extends</span> <span class="hljs-title class_ inherited__ ngde"><a href="/api/ngx-vflow/classes/CustomNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomNodeComponent</a></span>&#x3C;<span class="hljs-title class_ ngde">RedSquareData</span>> {\n</span><span class="line ngde">  <span class="hljs-meta ngde">@Output</span>()\n</span><span class="line ngde">  redSquareEvent = <span class="hljs-keyword ngde">new</span> <span class="hljs-title class_ ngde">EventEmitter</span>&#x3C;<span class="hljs-built_in ngde">string</span>>()\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-title function_ ngde">onClick</span>(<span class="hljs-params ngde"></span>) {\n</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">redSquareEvent</span>.<span class="hljs-title function_ ngde">emit</span>(<span class="hljs-string ngde">\'Click from red square\'</span>)\n</span><span class="line ngde">  }\n</span><span class="line ngde">}\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-comment ngde">// --- Description of blue square component node</span>\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-keyword ngde">interface</span> <span class="hljs-title class_ ngde">BlueSquareData</span> {\n</span><span class="line ngde">  <span class="hljs-attr ngde">blueSquareText</span>: <span class="hljs-built_in ngde">string</span>\n</span><span class="line ngde">}\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({\n</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">`</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;div class="blue-square" (click)="onClick()"></span>\n</span><span class="line ngde"><span class="hljs-string ngde">      {{ node.data?.blueSquareText }}</span>\n</span><span class="line ngde"><span class="hljs-string ngde"></span>\n</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;handle type="target" position="left"/></span>\n</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/div></span>\n</span><span class="line ngde"><span class="hljs-string ngde">  `</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [<span class="hljs-string ngde">`</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    .blue-square {</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      width: 100px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      height: 100px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      background-color: #0096FF;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      border-radius: 5px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      display: flex;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      align-items: center;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      justify-content: center;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      padding-left: 5px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      padding-right: 5px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    }</span>\n</span><span class="line ngde"><span class="hljs-string ngde">  `</span>],\n</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>]\n</span><span class="line ngde">})\n</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">BlueSquareNodeComponent</span> <span class="hljs-keyword ngde">extends</span> <span class="hljs-title class_ inherited__ ngde"><a href="/api/ngx-vflow/classes/CustomNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomNodeComponent</a></span>&#x3C;<span class="hljs-title class_ ngde">BlueSquareData</span>> {\n</span><span class="line ngde">  <span class="hljs-meta ngde">@Output</span>()\n</span><span class="line ngde">  blueSquareEvent = <span class="hljs-keyword ngde">new</span> <span class="hljs-title class_ ngde">EventEmitter</span>&#x3C;{ <span class="hljs-attr ngde">x</span>: <span class="hljs-built_in ngde">number</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-built_in ngde">number</span> }>()\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-title function_ ngde">onClick</span>(<span class="hljs-params ngde"></span>) {\n</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">blueSquareEvent</span>.<span class="hljs-title function_ ngde">emit</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">5</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">5</span> })\n</span><span class="line ngde">  }\n</span><span class="line ngde">}\n</span></code></pre>'}]};let u=(()=>{class n extends g.a{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent='<h1 id="custom-nodes" class="ngde">Custom nodes<a title="Link to heading" class="ng-doc-header-link ngde" href="/examples/custom-nodes#custom-nodes"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><ng-doc-blockquote type="warning" class="ngde"><p class="ngde">Be careful with CSS rules applied to node content. Custom nodes are implemented with SVG\'s <code class="ngde">foreignObject</code> element, and Safari has issues with some CSS rules inside <code class="ngde">foreignObject</code>. Therefore, please check this browser when applying complex styling.</p></ng-doc-blockquote><p class="ngde">This is where things become a lot more interesting. You can create custom nodes with HTML and CSS.</p><h2 id="template-nodes" class="ngde">Template nodes<a title="Link to heading" class="ng-doc-header-link ngde" href="/examples/custom-nodes#template-nodes"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">You can create custom nodes with <code class="ngde">ng-template</code></p><p class="ngde">Follow these steps to achieve this:</p><ol class="ngde"><li class="ngde">Set <code class="ngde">type</code> of node to <code class="ngde">html-template</code></li><li class="ngde">Provide <code class="ngde">ng-template</code> with <code class="ngde">nodeHtml</code> selector inside <code class="ngde">vflow</code></li><li class="ngde">Write your HTML inside this template</li><li class="ngde">You can also pass any data with <code class="ngde">data</code> field on node, and then get it inside <code class="ngde">ng-template</code></li></ol><ng-doc-demo componentname="CustomNodesDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{"expanded":true}</div></ng-doc-demo><h2 id="component-nodes" class="ngde">Component nodes<a title="Link to heading" class="ng-doc-header-link ngde" href="/examples/custom-nodes#component-nodes"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><p class="ngde">Another approach is to render nodes from components.</p><p class="ngde">Its benefits:</p><ul class="ngde"><li class="ngde">type-safe node data access</li><li class="ngde">good for complex flows with many different node types</li></ul><p class="ngde">Its limitations</p><ul class="ngde"><li class="ngde">it\'s harder to manage events because such nodes are rendered dynamically</li></ul><p class="ngde">How to create component node:</p><ol class="ngde"><li class="ngde">Create a regular angular standalone component</li><li class="ngde">Extend with <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/CustomNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomNodeComponent</a></code> (please see the reference of this base component to get an idea of what fields you could use in your custom component node), otherwise it won\'t work!</li><li class="ngde">Pass your data interface to generic of <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/CustomNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomNodeComponent</a></code> to use in component. This <code class="ngde">data</code> comes from <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></code> definition</li><li class="ngde">Use your new component in <code class="ngde">type</code> field of <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></code>. Library will render your node for you</li></ol><ng-doc-demo componentname="CustomComponentNodesDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{"expanded":true}</div></ng-doc-demo><h3 id="handling-events" class="ngde">Handling events<a title="Link to heading" class="ng-doc-header-link ngde" href="/examples/custom-nodes#handling-events"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h3><ng-doc-blockquote type="warning" class="ngde"><p class="ngde">This is an experimental API</p></ng-doc-blockquote><p class="ngde">There is a <code class="ngde">(onComponentNodeEvent)</code> event on <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/VflowComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">VflowComponent</a></code>. Here is how it works:</p><ol class="ngde"><li class="ngde">It accumulates every <code class="ngde">EventEmitter</code> of every component node of your flow</li><li class="ngde">It emits on every emit of those emitters</li></ol><p class="ngde">The shape of this accumulator-event contains following useful info:</p><pre class="ngde hljs"><code class="hljs language-ts code-lines ngde" lang="ts" name="" icon="" highlightedlines="[]"><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">type</span> <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/AnyComponentNodeEvent" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">AnyComponentNodeEvent</a></span> = {\n</span><span class="line ngde">  <span class="hljs-attr ngde">nodeId</span>: <span class="hljs-built_in ngde">string</span> <span class="hljs-comment ngde">// Id of node where event occurs</span>\n</span><span class="line ngde">  <span class="hljs-attr ngde">eventName</span>: <span class="hljs-built_in ngde">string</span>\n</span><span class="line ngde">  <span class="hljs-attr ngde">eventPayload</span>: <span class="hljs-built_in ngde">unknown</span>\n</span><span class="line ngde">}\n</span></code></pre><p class="ngde">The Library also includes <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/type-aliases/ComponentNodeEvent" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">ComponentNodeEvent</a></code> helper type to get type-safe event, where you just need to pass an array of your custom components in generic, and this type will infer proper types for <code class="ngde">eventName</code> and <code class="ngde">eventPayload</code>:</p><pre class="ngde hljs"><code class="hljs language-ts code-lines ngde" lang="ts" name="" icon="" highlightedlines="[]"><span class="line ngde">  ...\n</span><span class="line ngde">\n</span><span class="line ngde">  <span class="hljs-title function_ ngde">handleComponentEvent</span>(<span class="hljs-params ngde">event: <a href="/api/ngx-vflow/type-aliases/ComponentNodeEvent" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">ComponentNodeEvent</a>&#x3C;[RedSquareNodeComponent, BlueSquareNodeComponent]></span>) {\n</span><span class="line ngde">    <span class="hljs-keyword ngde">if</span> (event.<span class="hljs-property ngde">eventName</span> === <span class="hljs-string ngde">\'redSquareEvent\'</span>) {\n</span><span class="line ngde">      <span class="hljs-variable language_ ngde">console</span>.<span class="hljs-title function_ ngde">log</span>(event.<span class="hljs-property ngde">eventPayload</span>)\n</span><span class="line ngde">    }\n</span><span class="line ngde">\n</span><span class="line ngde">    <span class="hljs-keyword ngde">if</span> (event.<span class="hljs-property ngde">eventName</span> === <span class="hljs-string ngde">\'blueSquareEvent\'</span>) {\n</span><span class="line ngde">      <span class="hljs-variable language_ ngde">console</span>.<span class="hljs-title function_ ngde">log</span>(event.<span class="hljs-property ngde">eventPayload</span>.<span class="hljs-property ngde">x</span> + event.<span class="hljs-property ngde">eventPayload</span>.<span class="hljs-property ngde">y</span>)\n</span><span class="line ngde">    }\n</span><span class="line ngde">  }\n</span><span class="line ngde">\n</span><span class="line ngde">  ..\n</span></code></pre>',this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/examples/pages/custom-nodes/index.md?message=docs(custom-nodes): describe your changes here...",this.page=d,this.demoAssets=S}static#s=this.\u0275fac=function(e){return new(e||n)};static#n=this.\u0275cmp=s.Xpm({type:n,selectors:[["ng-doc-page-examples-custom-nodes"]],standalone:!0,features:[s._Bn([{provide:g.a,useExisting:n},b,d.providers??[]]),s.qOj,s.jDz],decls:1,vars:0,template:function(e,l){1&e&&s._UZ(0,"ng-doc-page")},dependencies:[j.z],encapsulation:2,changeDetection:0})}return n})();const q=[{...(0,f.isRoute)(d.route)?d.route:{},path:"",component:u,title:"Custom nodes"}]}}]);