"use strict";(self.webpackChunkngx_vflow_demo=self.webpackChunkngx_vflow_demo||[]).push([[7971],{7971:(D,p,a)=>{a.r(p),a.d(p,{DynamicComponent:()=>c,default:()=>w});var d=a(6286),g=a(7134),i=a(9143),r=a(8341),h=a(2898),s=a(5879),m=a(7580),u=a(8874);function j(n,v){if(1&n&&(s.TgZ(0,"div"),s._uU(1),s.qZA()),2&n){const l=v.$implicit;s.Gre("custom-node-",l.node.data.customType,""),s.xp6(1),s.hij(" ",l.node.data.text," ")}}const t={title:"Custom nodes",mdFile:"./index.md",category:r.Z,demos:{CustomNodesDemoComponent:(()=>{class n{constructor(){this.nodes=[{id:"1",point:{x:100,y:100},type:"html-template",data:{customType:"gradient",text:"I am a nice custom node with gradient"}},{id:"2",point:{x:250,y:250},type:"default",text:"Default"}]}static#s=this.\u0275fac=function(e){return new(e||n)};static#n=this.\u0275cmp=s.Xpm({type:n,selectors:[["ng-component"]],standalone:!0,features:[s.jDz],decls:2,vars:1,consts:[[3,"nodes"],["nodeHtml",""]],template:function(e,o){1&e&&(s.TgZ(0,"vflow",0),s.YNc(1,j,2,4,"ng-template",1),s.qZA()),2&e&&s.Q6J("nodes",o.nodes)},dependencies:[h.p,m.t,u.QC],styles:[".custom-node-gradient[_ngcontent-%COMP%]{width:150px;height:100px;background:linear-gradient(to right,#00d2ff,#3a7bd5);border:1px solid gray;border-radius:5px;display:flex;align-items:center;padding-left:5px;padding-right:5px}"],changeDetection:0})}return n})()},order:2},y=[],x={CustomNodesDemoComponent:[{title:"TypeScript",code:'<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">NgIf</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/common\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>, <span class="hljs-title class_ ngde">Component</span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'@angular/core\'</span>;\n</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> { <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>, <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span> } <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">\'projects/ngx-vflow-lib/src/public-api\'</span>;\n</span><span class="line ngde">\n</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({\n</span><span class="line ngde">  <span class="hljs-attr ngde">template</span>: <span class="hljs-string ngde">`&#x3C;vflow [nodes]="nodes"></span>\n</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;ng-template nodeHtml let-ctx></span>\n</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;div class="custom-node-{{ ctx.node.data.customType }}"></span>\n</span><span class="line ngde"><span class="hljs-string ngde">        {{ ctx.node.data.text }}</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      &#x3C;/div></span>\n</span><span class="line ngde"><span class="hljs-string ngde">    &#x3C;/ng-template></span>\n</span><span class="line ngde"><span class="hljs-string ngde">  &#x3C;/vflow>`</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">styles</span>: [\n</span><span class="line ngde">    <span class="hljs-string ngde">`</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      .custom-node-gradient {</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        width: 150px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        height: 100px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        background: linear-gradient(to right, #00d2ff, #3a7bd5);</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        border: 1px solid gray;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        border-radius: 5px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        display: flex;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        align-items: center;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        padding-left: 5px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">        padding-right: 5px;</span>\n</span><span class="line ngde"><span class="hljs-string ngde">      }</span>\n</span><span class="line ngde"><span class="hljs-string ngde">    `</span>\n</span><span class="line ngde">  ],\n</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,\n</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowModule" class="ng-doc-code-anchor ngde" data-link-type="NgModule" class="ngde">VflowModule</a></span>]\n</span><span class="line ngde">})\n</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">CustomNodesDemoComponent</span> {\n</span><span class="line ngde">  <span class="hljs-keyword ngde">public</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/Node" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">Node</a></span>[] = [\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'1\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">100</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">100</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'html-template\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: {\n</span><span class="line ngde">        <span class="hljs-attr ngde">customType</span>: <span class="hljs-string ngde">\'gradient\'</span>,\n</span><span class="line ngde">        <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'I am a nice custom node with gradient\'</span>\n</span><span class="line ngde">      }\n</span><span class="line ngde">    },\n</span><span class="line ngde">    {\n</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">\'2\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: { <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">250</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">250</span> },\n</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">\'default\'</span>,\n</span><span class="line ngde">      <span class="hljs-attr ngde">text</span>: <span class="hljs-string ngde">\'Default\'</span>\n</span><span class="line ngde">    },\n</span><span class="line ngde">  ]\n</span><span class="line ngde">}\n</span></code></pre>'}]};let c=(()=>{class n extends d.a{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent='<h1 id="custom-nodes" class="ngde">Custom nodes<a title="Link to heading" class="ng-doc-header-link ngde" href="/examples/custom-nodes#custom-nodes"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><ng-doc-blockquote type="warning" class="ngde"><p class="ngde">Be careful with CSS rules applied to node content; custom nodes are implemented with SVG\'s <code class="ngde">foreignObject</code> element, and Safari has issues with some CSS rules inside <code class="ngde">foreignObject</code>. Therefore, please check this browser when applying complex styling.</p></ng-doc-blockquote><p class="ngde">This is where things became a lot more interesting. You can create custom nodes with HTML and CSS.</p><p class="ngde">Do the following steps to archieve this:</p><ol class="ngde"><li class="ngde">Set <code class="ngde">type</code> of node to <code class="ngde">html-template</code></li><li class="ngde">Provide <code class="ngde">ng-template</code> with <code class="ngde">nodeHtml</code> selector inside <code class="ngde">vflow</code></li><li class="ngde">Write your HTML inside this template</li><li class="ngde">You can also pass any data with <code class="ngde">data</code> field on node, and then get it inside <code class="ngde">ng-template</code></li></ol><ng-doc-demo componentname="CustomNodesDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{"expanded":true}</div></ng-doc-demo>',this.page=t,this.demoAssets=x}static#s=this.\u0275fac=function(e){return new(e||n)};static#n=this.\u0275cmp=s.Xpm({type:n,selectors:[["ng-doc-page-examples-custom-nodes"]],standalone:!0,features:[s._Bn([{provide:d.a,useExisting:n},y,t.providers??[]]),s.qOj,s.jDz],decls:1,vars:0,template:function(e,o){1&e&&s._UZ(0,"ng-doc-page")},dependencies:[g.z],encapsulation:2,changeDetection:0})}return n})();const w=[{...(0,i.isRoute)(t.route)?t.route:{},path:"",component:c,title:"Custom nodes"}]}}]);