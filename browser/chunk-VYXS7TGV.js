import{a as p}from"./chunk-G45ERDUB.js";import{a as r}from"./chunk-VYAX5YUU.js";import"./chunk-WI2JOD2Y.js";import{a as t}from"./chunk-34LC2K2P.js";import{T as w}from"./chunk-MU5S45C6.js";import{Ac as l,Gb as c,bc as d,wa as i,zc as g}from"./chunk-WSOERDLG.js";import{a,b as s,g as v}from"./chunk-P2VZOJAX.js";var h=v(w());var x={title:"Migrations",mdFile:"./index.md",category:p},o=x;var m=[];var C={},f=C;var y='<h1 id="migrations" class="ngde">Migrations<a title="Link to heading" class="ng-doc-header-link ngde" href="/getting-started/migration#migrations"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><h2 id="migration-to--v10" class="ngde">Migration to >= v1.0<a title="Link to heading" class="ng-doc-header-link ngde" href="/getting-started/migration#migration-to--v10"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h2><ul class="ngde"><li class="ngde">remove imports of <code class="ngde">VflowModule</code> and use <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></code> instead (<code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></code> contains all public standalone components and directives).</li><li class="ngde">remove usage of the <code class="ngde">computeLayersOnInit</code> setting from the <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/interfaces/Optimization" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Optimization</a></code> interface</li><li class="ngde">remove usage of the <code class="ngde">handlePositions</code> input in the <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/VflowComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">VflowComponent</a></code></li><li class="ngde">for classes extending <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/CustomNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomNodeComponent</a></code> and <code class="ngde ng-doc-code-with-link" class="ngde"><a href="/api/ngx-vflow/classes/CustomDynamicNodeComponent" class="ng-doc-code-anchor ngde" data-link-type="Directive" class="ngde">CustomDynamicNodeComponent</a></code>:<ul class="ngde"><li class="ngde">replace <code class="ngde">this.node</code> to <code class="ngde">this.node()</code> due to signal input internal migration</li></ul></li></ul>',k=(()=>{class e extends t{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=y,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/getting-started/pages/migration/index.md?message=docs(migration): describe your changes here...",this.page=o,this.demoAssets=f}static{this.\u0275fac=function(n){return new(n||e)}}static{this.\u0275cmp=i({type:e,selectors:[["ng-doc-page-getting-started-migration"]],standalone:!0,features:[g([{provide:t,useExisting:e},m,o.providers??[]]),c,l],decls:1,vars:0,template:function(n,N){n&1&&d(0,"ng-doc-page")},dependencies:[r],encapsulation:2,changeDetection:0})}}return e})(),D=[s(a({},(0,h.isRoute)(o.route)?o.route:{}),{path:"",component:k,title:"Migrations"})],F=D;export{k as DynamicComponent,F as default};
