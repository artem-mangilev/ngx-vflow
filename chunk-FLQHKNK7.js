import{a as us}from"./chunk-7PPUGJHC.js";import"./chunk-NGK3AQVU.js";import{a as gs,b as ds,k as os,u as hs,w as z}from"./chunk-C7YWV2J2.js";import{a as rs}from"./chunk-SH6HWCPG.js";import"./chunk-CQCG3KCY.js";import{a as q}from"./chunk-WT6KFS7F.js";import{Ba as ss,Ea as ns,Ga as as,Ha as es,Pa as P,Qa as T,R as O,Ra as R,Xa as ls,eb as ts,fb as ps,hb as U,jb as is,na as Q,nb as cs,ob as Y,vc as Ys,ya as w,za as Z}from"./chunk-VLX6VUPD.js";import{a as L,b as V,g as Rs}from"./chunk-P2VZOJAX.js";var Os=Rs(Ys());function B(s,a){var n,e=1;s==null&&(s=0),a==null&&(a=0);function t(){var p,r=n.length,l,o=0,h=0;for(p=0;p<r;++p)l=n[p],o+=l.x,h+=l.y;for(o=(o/r-s)*e,h=(h/r-a)*e,p=0;p<r;++p)l=n[p],l.x-=o,l.y-=h}return t.initialize=function(p){n=p},t.x=function(p){return arguments.length?(s=+p,t):s},t.y=function(p){return arguments.length?(a=+p,t):a},t.strength=function(p){return arguments.length?(e=+p,t):e},t}function fs(s){let a=+this._x.call(null,s),n=+this._y.call(null,s);return js(this.cover(a,n),a,n,s)}function js(s,a,n,e){if(isNaN(a)||isNaN(n))return s;var t,p=s._root,r={data:e},l=s._x0,o=s._y0,h=s._x1,j=s._y1,x,m,d,y,c,i,g,u;if(!p)return s._root=r,s;for(;p.length;)if((c=a>=(x=(l+h)/2))?l=x:h=x,(i=n>=(m=(o+j)/2))?o=m:j=m,t=p,!(p=p[g=i<<1|c]))return t[g]=r,s;if(d=+s._x.call(null,p.data),y=+s._y.call(null,p.data),a===d&&n===y)return r.next=p,t?t[g]=r:s._root=r,s;do t=t?t[g]=new Array(4):s._root=new Array(4),(c=a>=(x=(l+h)/2))?l=x:h=x,(i=n>=(m=(o+j)/2))?o=m:j=m;while((g=i<<1|c)===(u=(y>=m)<<1|d>=x));return t[u]=p,t[g]=r,s}function ms(s){var a,n,e=s.length,t,p,r=new Array(e),l=new Array(e),o=1/0,h=1/0,j=-1/0,x=-1/0;for(n=0;n<e;++n)isNaN(t=+this._x.call(null,a=s[n]))||isNaN(p=+this._y.call(null,a))||(r[n]=t,l[n]=p,t<o&&(o=t),t>j&&(j=t),p<h&&(h=p),p>x&&(x=p));if(o>j||h>x)return this;for(this.cover(o,h).cover(j,x),n=0;n<e;++n)js(this,r[n],l[n],s[n]);return this}function ys(s,a){if(isNaN(s=+s)||isNaN(a=+a))return this;var n=this._x0,e=this._y0,t=this._x1,p=this._y1;if(isNaN(n))t=(n=Math.floor(s))+1,p=(e=Math.floor(a))+1;else{for(var r=t-n||1,l=this._root,o,h;n>s||s>=t||e>a||a>=p;)switch(h=(a<e)<<1|s<n,o=new Array(4),o[h]=l,l=o,r*=2,h){case 0:t=n+r,p=e+r;break;case 1:n=t-r,p=e+r;break;case 2:t=n+r,e=p-r;break;case 3:n=t-r,e=p-r;break}this._root&&this._root.length&&(this._root=l)}return this._x0=n,this._y0=e,this._x1=t,this._y1=p,this}function xs(){var s=[];return this.visit(function(a){if(!a.length)do s.push(a.data);while(a=a.next)}),s}function _s(s){return arguments.length?this.cover(+s[0][0],+s[0][1]).cover(+s[1][0],+s[1][1]):isNaN(this._x0)?void 0:[[this._x0,this._y0],[this._x1,this._y1]]}function b(s,a,n,e,t){this.node=s,this.x0=a,this.y0=n,this.x1=e,this.y1=t}function vs(s,a,n){var e,t=this._x0,p=this._y0,r,l,o,h,j=this._x1,x=this._y1,m=[],d=this._root,y,c;for(d&&m.push(new b(d,t,p,j,x)),n==null?n=1/0:(t=s-n,p=a-n,j=s+n,x=a+n,n*=n);y=m.pop();)if(!(!(d=y.node)||(r=y.x0)>j||(l=y.y0)>x||(o=y.x1)<t||(h=y.y1)<p))if(d.length){var i=(r+o)/2,g=(l+h)/2;m.push(new b(d[3],i,g,o,h),new b(d[2],r,g,i,h),new b(d[1],i,l,o,g),new b(d[0],r,l,i,g)),(c=(a>=g)<<1|s>=i)&&(y=m[m.length-1],m[m.length-1]=m[m.length-1-c],m[m.length-1-c]=y)}else{var u=s-+this._x.call(null,d.data),_=a-+this._y.call(null,d.data),f=u*u+_*_;if(f<n){var v=Math.sqrt(n=f);t=s-v,p=a-v,j=s+v,x=a+v,e=d.data}}return e}function ws(s){if(isNaN(j=+this._x.call(null,s))||isNaN(x=+this._y.call(null,s)))return this;var a,n=this._root,e,t,p,r=this._x0,l=this._y0,o=this._x1,h=this._y1,j,x,m,d,y,c,i,g;if(!n)return this;if(n.length)for(;;){if((y=j>=(m=(r+o)/2))?r=m:o=m,(c=x>=(d=(l+h)/2))?l=d:h=d,a=n,!(n=n[i=c<<1|y]))return this;if(!n.length)break;(a[i+1&3]||a[i+2&3]||a[i+3&3])&&(e=a,g=i)}for(;n.data!==s;)if(t=n,!(n=n.next))return this;return(p=n.next)&&delete n.next,t?(p?t.next=p:delete t.next,this):a?(p?a[i]=p:delete a[i],(n=a[0]||a[1]||a[2]||a[3])&&n===(a[3]||a[2]||a[1]||a[0])&&!n.length&&(e?e[g]=n:this._root=n),this):(this._root=p,this)}function bs(s){for(var a=0,n=s.length;a<n;++a)this.remove(s[a]);return this}function Cs(){return this._root}function Ns(){var s=0;return this.visit(function(a){if(!a.length)do++s;while(a=a.next)}),s}function ks(s){var a=[],n,e=this._root,t,p,r,l,o;for(e&&a.push(new b(e,this._x0,this._y0,this._x1,this._y1));n=a.pop();)if(!s(e=n.node,p=n.x0,r=n.y0,l=n.x1,o=n.y1)&&e.length){var h=(p+l)/2,j=(r+o)/2;(t=e[3])&&a.push(new b(t,h,j,l,o)),(t=e[2])&&a.push(new b(t,p,j,h,o)),(t=e[1])&&a.push(new b(t,h,r,l,j)),(t=e[0])&&a.push(new b(t,p,r,h,j))}return this}function Ds(s){var a=[],n=[],e;for(this._root&&a.push(new b(this._root,this._x0,this._y0,this._x1,this._y1));e=a.pop();){var t=e.node;if(t.length){var p,r=e.x0,l=e.y0,o=e.x1,h=e.y1,j=(r+o)/2,x=(l+h)/2;(p=t[0])&&a.push(new b(p,r,l,j,x)),(p=t[1])&&a.push(new b(p,j,l,o,x)),(p=t[2])&&a.push(new b(p,r,x,j,h)),(p=t[3])&&a.push(new b(p,j,x,o,h))}n.push(e)}for(;e=n.pop();)s(e.node,e.x0,e.y0,e.x1,e.y1);return this}function Ms(s){return s[0]}function As(s){return arguments.length?(this._x=s,this):this._x}function Fs(s){return s[1]}function Ss(s){return arguments.length?(this._y=s,this):this._y}function I(s,a,n){var e=new X(a??Ms,n??Fs,NaN,NaN,NaN,NaN);return s==null?e:e.addAll(s)}function X(s,a,n,e,t,p){this._x=s,this._y=a,this._x0=n,this._y0=e,this._x1=t,this._y1=p,this._root=void 0}function Es(s){for(var a={data:s.data},n=a;s=s.next;)n=n.next={data:s.data};return a}var N=I.prototype=X.prototype;N.copy=function(){var s=new X(this._x,this._y,this._x0,this._y0,this._x1,this._y1),a=this._root,n,e;if(!a)return s;if(!a.length)return s._root=Es(a),s;for(n=[{source:a,target:s._root=new Array(4)}];a=n.pop();)for(var t=0;t<4;++t)(e=a.source[t])&&(e.length?n.push({source:e,target:a.target[t]=new Array(4)}):a.target[t]=Es(e));return s};N.add=fs;N.addAll=ms;N.cover=ys;N.data=xs;N.extent=_s;N.find=vs;N.remove=ws;N.removeAll=bs;N.root=Cs;N.size=Ns;N.visit=ks;N.visitAfter=Ds;N.x=As;N.y=Ss;function C(s){return function(){return s}}function A(s){return(s()-.5)*1e-6}function Qs(s){return s.index}function Ls(s,a){var n=s.get(a);if(!n)throw new Error("node not found: "+a);return n}function G(s){var a=Qs,n=x,e,t=C(30),p,r,l,o,h,j=1;s==null&&(s=[]);function x(i){return 1/Math.min(l[i.source.index],l[i.target.index])}function m(i){for(var g=0,u=s.length;g<j;++g)for(var _=0,f,v,k,D,M,F,E;_<u;++_)f=s[_],v=f.source,k=f.target,D=k.x+k.vx-v.x-v.vx||A(h),M=k.y+k.vy-v.y-v.vy||A(h),F=Math.sqrt(D*D+M*M),F=(F-p[_])/F*i*e[_],D*=F,M*=F,k.vx-=D*(E=o[_]),k.vy-=M*E,v.vx+=D*(E=1-E),v.vy+=M*E}function d(){if(r){var i,g=r.length,u=s.length,_=new Map(r.map((v,k)=>[a(v,k,r),v])),f;for(i=0,l=new Array(g);i<u;++i)f=s[i],f.index=i,typeof f.source!="object"&&(f.source=Ls(_,f.source)),typeof f.target!="object"&&(f.target=Ls(_,f.target)),l[f.source.index]=(l[f.source.index]||0)+1,l[f.target.index]=(l[f.target.index]||0)+1;for(i=0,o=new Array(u);i<u;++i)f=s[i],o[i]=l[f.source.index]/(l[f.source.index]+l[f.target.index]);e=new Array(u),y(),p=new Array(u),c()}}function y(){if(r)for(var i=0,g=s.length;i<g;++i)e[i]=+n(s[i],i,s)}function c(){if(r)for(var i=0,g=s.length;i<g;++i)p[i]=+t(s[i],i,s)}return m.initialize=function(i,g){r=i,h=g,d()},m.links=function(i){return arguments.length?(s=i,d(),m):s},m.id=function(i){return arguments.length?(a=i,m):a},m.iterations=function(i){return arguments.length?(j=+i,m):j},m.strength=function(i){return arguments.length?(n=typeof i=="function"?i:C(+i),y(),m):n},m.distance=function(i){return arguments.length?(t=typeof i=="function"?i:C(+i),c(),m):t},m}function Vs(){let s=1;return()=>(s=(1664525*s+1013904223)%4294967296)/4294967296}function Ps(s){return s.x}function Ts(s){return s.y}var Us=10,qs=Math.PI*(3-Math.sqrt(5));function $(s){var a,n=1,e=.001,t=1-Math.pow(e,1/300),p=0,r=.6,l=new Map,o=ds(x),h=gs("tick","end"),j=Vs();s==null&&(s=[]);function x(){m(),h.call("tick",a),n<e&&(o.stop(),h.call("end",a))}function m(c){var i,g=s.length,u;c===void 0&&(c=1);for(var _=0;_<c;++_)for(n+=(p-n)*t,l.forEach(function(f){f(n)}),i=0;i<g;++i)u=s[i],u.fx==null?u.x+=u.vx*=r:(u.x=u.fx,u.vx=0),u.fy==null?u.y+=u.vy*=r:(u.y=u.fy,u.vy=0);return a}function d(){for(var c=0,i=s.length,g;c<i;++c){if(g=s[c],g.index=c,g.fx!=null&&(g.x=g.fx),g.fy!=null&&(g.y=g.fy),isNaN(g.x)||isNaN(g.y)){var u=Us*Math.sqrt(.5+c),_=c*qs;g.x=u*Math.cos(_),g.y=u*Math.sin(_)}(isNaN(g.vx)||isNaN(g.vy))&&(g.vx=g.vy=0)}}function y(c){return c.initialize&&c.initialize(s,j),c}return d(),a={tick:m,restart:function(){return o.restart(x),a},stop:function(){return o.stop(),a},nodes:function(c){return arguments.length?(s=c,d(),l.forEach(y),a):s},alpha:function(c){return arguments.length?(n=+c,a):n},alphaMin:function(c){return arguments.length?(e=+c,a):e},alphaDecay:function(c){return arguments.length?(t=+c,a):+t},alphaTarget:function(c){return arguments.length?(p=+c,a):p},velocityDecay:function(c){return arguments.length?(r=1-c,a):1-r},randomSource:function(c){return arguments.length?(j=c,l.forEach(y),a):j},force:function(c,i){return arguments.length>1?(i==null?l.delete(c):l.set(c,y(i)),a):l.get(c)},find:function(c,i,g){var u=0,_=s.length,f,v,k,D,M;for(g==null?g=1/0:g*=g,u=0;u<_;++u)D=s[u],f=c-D.x,v=i-D.y,k=f*f+v*v,k<g&&(M=D,g=k);return M},on:function(c,i){return arguments.length>1?(h.on(c,i),a):h.on(c)}}}function W(){var s,a,n,e,t=C(-30),p,r=1,l=1/0,o=.81;function h(d){var y,c=s.length,i=I(s,Ps,Ts).visitAfter(x);for(e=d,y=0;y<c;++y)a=s[y],i.visit(m)}function j(){if(s){var d,y=s.length,c;for(p=new Array(y),d=0;d<y;++d)c=s[d],p[c.index]=+t(c,d,s)}}function x(d){var y=0,c,i,g=0,u,_,f;if(d.length){for(u=_=f=0;f<4;++f)(c=d[f])&&(i=Math.abs(c.value))&&(y+=c.value,g+=i,u+=i*c.x,_+=i*c.y);d.x=u/g,d.y=_/g}else{c=d,c.x=c.data.x,c.y=c.data.y;do y+=p[c.data.index];while(c=c.next)}d.value=y}function m(d,y,c,i){if(!d.value)return!0;var g=d.x-a.x,u=d.y-a.y,_=i-y,f=g*g+u*u;if(_*_/o<f)return f<l&&(g===0&&(g=A(n),f+=g*g),u===0&&(u=A(n),f+=u*u),f<r&&(f=Math.sqrt(r*f)),a.vx+=g*d.value*e/f,a.vy+=u*d.value*e/f),!0;if(d.length||f>=l)return;(d.data!==a||d.next)&&(g===0&&(g=A(n),f+=g*g),u===0&&(u=A(n),f+=u*u),f<r&&(f=Math.sqrt(r*f)));do d.data!==a&&(_=p[d.data.index]*e/f,a.vx+=g*_,a.vy+=u*_);while(d=d.next)}return h.initialize=function(d,y){s=d,n=y,j()},h.strength=function(d){return arguments.length?(t=typeof d=="function"?d:C(+d),j(),h):t},h.distanceMin=function(d){return arguments.length?(r=d*d,h):Math.sqrt(r)},h.distanceMax=function(d){return arguments.length?(l=d*d,h):Math.sqrt(l)},h.theta=function(d){return arguments.length?(o=d*d,h):Math.sqrt(o)},h}function J(s){var a=C(.1),n,e,t;typeof s!="function"&&(s=C(s==null?0:+s));function p(l){for(var o=0,h=n.length,j;o<h;++o)j=n[o],j.vx+=(t[o]-j.x)*e[o]*l}function r(){if(n){var l,o=n.length;for(e=new Array(o),t=new Array(o),l=0;l<o;++l)e[l]=isNaN(t[l]=+s(n[l],l,n))?0:+a(n[l],l,n)}}return p.initialize=function(l){n=l,r()},p.strength=function(l){return arguments.length?(a=typeof l=="function"?l:C(+l),r(),p):a},p.x=function(l){return arguments.length?(s=typeof l=="function"?l:C(+l),r(),p):s},p}function K(s){var a=C(.1),n,e,t;typeof s!="function"&&(s=C(s==null?0:+s));function p(l){for(var o=0,h=n.length,j;o<h;++o)j=n[o],j.vy+=(t[o]-j.y)*e[o]*l}function r(){if(n){var l,o=n.length;for(e=new Array(o),t=new Array(o),l=0;l<o;++l)e[l]=isNaN(t[l]=+s(n[l],l,n))?0:+a(n[l],l,n)}}return p.initialize=function(l){n=l,r()},p.strength=function(l){return arguments.length?(a=typeof l=="function"?l:C(+l),r(),p):a},p.y=function(l){return arguments.length?(s=typeof l=="function"?l:C(+l),r(),p):s},p}function Gs(s,a){if(s&1&&(P(0,"div",4),U(1),R(2,"handle",5)(3,"handle",6),T()),s&2){let n=a.$implicit;es("background-color",n.node.data()),Q(),is(" ",n.node.data()," ")}}var zs=(()=>{class s{constructor(){this.vflow=Z.required(z),this.nodes=[{id:"0",point:w({x:0,y:0}),type:"html-template",data:w(S()),draggable:w(!1)},{id:"1",point:w({x:0,y:0}),type:"html-template",data:w(S()),draggable:w(!1)},{id:"2",point:w({x:0,y:0}),type:"html-template",data:w(S()),draggable:w(!1)},{id:"3",point:w({x:0,y:0}),type:"html-template",data:w(S()),draggable:w(!1)},{id:"4",point:w({x:0,y:0}),type:"html-template",data:w(S()),draggable:w(!1)},{id:"5",point:w({x:0,y:0}),type:"html-template",data:w(S()),draggable:w(!1)}],this.edges=[{source:"0",target:"1",id:"0 -> 1"},{source:"0",target:"2",id:"0 -> 2"},{source:"0",target:"3",id:"0 -> 3"},{source:"0",target:"4",id:"0 -> 4"},{source:"0",target:"5",id:"0 -> 5"}],this.simulationNodes=this.nodes.map(n=>({id:n.id,get x(){return n.point().x},set x(e){n.point.update(t=>V(L({},t),{x:e}))},get y(){return n.point().y},set y(e){n.point.update(t=>V(L({},t),{y:e}))}})),this.linkForce=G(this.edges.map(n=>({source:n.source,target:n.target}))).id(n=>n.id).distance(50),this.simulation=$().force("charge",W().strength(-100)).force("x",J()).force("y",K()).force("center",B(200,200)).nodes(this.simulationNodes).force("link",this.linkForce)}onDistanceChange(n){let e=+n.target.value;this.linkForce.distance(e),this.simulation.alpha(.5).restart(),setTimeout(()=>{this.vflow().fitView({duration:500})},250)}static{this.\u0275fac=function(e){return new(e||s)}}static{this.\u0275cmp=O({type:s,selectors:[["ng-component"]],viewQuery:function(e,t){e&1&&ts(t.vflow,z,5),e&2&&ps()},standalone:!0,features:[Y],decls:6,vars:2,consts:[[1,"slider"],["type","range","min","0","step","1","max","200","value","50",3,"input"],["view","auto",3,"nodes","edges"],["nodeHtml",""],[1,"custom-node"],["type","source","position","bottom"],["type","target","position","top"]],template:function(e,t){e&1&&(P(0,"label",0)(1,"span"),U(2,"Distance"),T(),P(3,"input",1),ls("input",function(r){return t.onDistanceChange(r)}),T()(),P(4,"vflow",2),ns(5,Gs,4,3,"ng-template",3),T()),e&2&&(Q(4),as("nodes",t.nodes)("edges",t.edges))},dependencies:[z,hs,os],styles:["[_nghost-%COMP%]{width:100%;height:100%}.custom-node[_ngcontent-%COMP%]{width:100px;height:50px;background:#bbe1fa;border:1px solid gray;border-radius:5px;display:flex;align-items:center;justify-content:center}.slider[_ngcontent-%COMP%]{position:absolute;display:flex;padding:4px;gap:4px;background-color:#2e414c;border-bottom-right-radius:6px}"],changeDetection:0})}}return s})();function S(){let s=[0,1,2,3,4,5,6,7,8,9,"A","B","C","D","E","F"],a="#";for(let n=0;n<6;n++){let e=Math.floor(Math.random()*s.length);a+=s[e]}return a}var $s={title:"D3 Force",mdFile:"./index.md",category:us,demos:{ForceLayoutDemoComponent:zs},keyword:"WorkshopsLayoutForce",order:2},H=$s;var Is=[];var Ws={ForceLayoutDemoComponent:[{title:"TypeScript",code:`<pre class="ngde hljs"><code lang="typescript" class="hljs language-typescript code-lines ngde"><span class="line ngde"><span class="hljs-keyword ngde">import</span> {
</span><span class="line ngde">  <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>,
</span><span class="line ngde">  <span class="hljs-title class_ ngde">Component</span>,
</span><span class="line ngde">  signal,
</span><span class="line ngde">  viewChild,
</span><span class="line ngde">} <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'@angular/core'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> * <span class="hljs-keyword ngde">as</span> d3 <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'d3-force'</span>;
</span><span class="line ngde"><span class="hljs-keyword ngde">import</span> {
</span><span class="line ngde">  <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/DynamicNode" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">DynamicNode</a></span>,
</span><span class="line ngde">  <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>,
</span><span class="line ngde">  <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">VflowComponent</a></span>,
</span><span class="line ngde">  <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>,
</span><span class="line ngde">} <span class="hljs-keyword ngde">from</span> <span class="hljs-string ngde">'projects/ngx-vflow-lib/src/public-api'</span>;
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-meta ngde">@Component</span>({
</span><span class="line ngde">  <span class="hljs-attr ngde">templateUrl</span>: <span class="hljs-string ngde">'./force-layout-demo.component.html'</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">styleUrls</span>: [<span class="hljs-string ngde">'./force-layout-demo.component.scss'</span>],
</span><span class="line ngde">  <span class="hljs-attr ngde">changeDetection</span>: <span class="hljs-title class_ ngde">ChangeDetectionStrategy</span>.<span class="hljs-property ngde">OnPush</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">standalone</span>: <span class="hljs-literal ngde">true</span>,
</span><span class="line ngde">  <span class="hljs-attr ngde">imports</span>: [<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/variables/Vflow" class="ng-doc-code-anchor ngde" data-link-type="Variable" class="ngde">Vflow</a></span>],
</span><span class="line ngde">})
</span><span class="line ngde"><span class="hljs-keyword ngde">export</span> <span class="hljs-keyword ngde">class</span> <span class="hljs-title class_ ngde">ForceLayoutDemoComponent</span> {
</span><span class="line ngde">  vflow = viewChild.required(<span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/classes/VflowComponent" class="ng-doc-code-anchor ngde" data-link-type="Component" class="ngde">VflowComponent</a></span>);
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">protected</span> <span class="hljs-attr ngde">nodes</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/type-aliases/DynamicNode" class="ng-doc-code-anchor ngde" data-link-type="TypeAlias" class="ngde">DynamicNode</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'0'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">0</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">0</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-title function_ ngde">randomHex</span>()),
</span><span class="line ngde">      <span class="hljs-attr ngde">draggable</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-literal ngde">false</span>),
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">0</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">0</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-title function_ ngde">randomHex</span>()),
</span><span class="line ngde">      <span class="hljs-attr ngde">draggable</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-literal ngde">false</span>),
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">0</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">0</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-title function_ ngde">randomHex</span>()),
</span><span class="line ngde">      <span class="hljs-attr ngde">draggable</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-literal ngde">false</span>),
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">0</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">0</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-title function_ ngde">randomHex</span>()),
</span><span class="line ngde">      <span class="hljs-attr ngde">draggable</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-literal ngde">false</span>),
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'4'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">0</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">0</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-title function_ ngde">randomHex</span>()),
</span><span class="line ngde">      <span class="hljs-attr ngde">draggable</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-literal ngde">false</span>),
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'5'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">point</span>: <span class="hljs-title function_ ngde">signal</span>({ <span class="hljs-attr ngde">x</span>: <span class="hljs-number ngde">0</span>, <span class="hljs-attr ngde">y</span>: <span class="hljs-number ngde">0</span> }),
</span><span class="line ngde">      <span class="hljs-attr ngde">type</span>: <span class="hljs-string ngde">'html-template'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">data</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-title function_ ngde">randomHex</span>()),
</span><span class="line ngde">      <span class="hljs-attr ngde">draggable</span>: <span class="hljs-title function_ ngde">signal</span>(<span class="hljs-literal ngde">false</span>),
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">protected</span> <span class="hljs-attr ngde">edges</span>: <span class="hljs-title class_ ngde"><a href="/api/ngx-vflow/interfaces/Edge" class="ng-doc-code-anchor ngde" data-link-type="Interface" class="ngde">Edge</a></span>[] = [
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'0'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'1'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'0 -> 1'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'0'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'2'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'0 -> 2'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'0'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'3'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'0 -> 3'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'0'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'4'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'0 -> 4'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">    {
</span><span class="line ngde">      <span class="hljs-attr ngde">source</span>: <span class="hljs-string ngde">'0'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">target</span>: <span class="hljs-string ngde">'5'</span>,
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: <span class="hljs-string ngde">'0 -> 5'</span>,
</span><span class="line ngde">    },
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-comment ngde">// d3-force internally reads/writes to x and y properties</span>
</span><span class="line ngde">  <span class="hljs-comment ngde">// so to link d3-force state with ngx-vflow state, we just</span>
</span><span class="line ngde">  <span class="hljs-comment ngde">// proxy these properties to point signal</span>
</span><span class="line ngde">  <span class="hljs-keyword ngde">private</span> simulationNodes = <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">nodes</span>.<span class="hljs-title function_ ngde">map</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">n</span>) =></span> {
</span><span class="line ngde">    <span class="hljs-keyword ngde">return</span> {
</span><span class="line ngde">      <span class="hljs-attr ngde">id</span>: n.<span class="hljs-property ngde">id</span>,
</span><span class="line ngde">
</span><span class="line ngde">      <span class="hljs-keyword ngde">get</span> <span class="hljs-title function_ ngde">x</span>() {
</span><span class="line ngde">        <span class="hljs-keyword ngde">return</span> n.<span class="hljs-title function_ ngde">point</span>().<span class="hljs-property ngde">x</span>;
</span><span class="line ngde">      },
</span><span class="line ngde">
</span><span class="line ngde">      <span class="hljs-keyword ngde">set</span> <span class="hljs-title function_ ngde">x</span>(<span class="hljs-params ngde">x: <span class="hljs-built_in ngde">number</span></span>) {
</span><span class="line ngde">        n.<span class="hljs-property ngde">point</span>.<span class="hljs-title function_ ngde">update</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">state</span>) =></span> ({ ...state, x }));
</span><span class="line ngde">      },
</span><span class="line ngde">
</span><span class="line ngde">      <span class="hljs-keyword ngde">get</span> <span class="hljs-title function_ ngde">y</span>() {
</span><span class="line ngde">        <span class="hljs-keyword ngde">return</span> n.<span class="hljs-title function_ ngde">point</span>().<span class="hljs-property ngde">y</span>;
</span><span class="line ngde">      },
</span><span class="line ngde">
</span><span class="line ngde">      <span class="hljs-keyword ngde">set</span> <span class="hljs-title function_ ngde">y</span>(<span class="hljs-params ngde">y: <span class="hljs-built_in ngde">number</span></span>) {
</span><span class="line ngde">        n.<span class="hljs-property ngde">point</span>.<span class="hljs-title function_ ngde">update</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">state</span>) =></span> ({ ...state, y }));
</span><span class="line ngde">      },
</span><span class="line ngde">    };
</span><span class="line ngde">  });
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">private</span> linkForce = d3
</span><span class="line ngde">    .<span class="hljs-title function_ ngde">forceLink</span>(<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">edges</span>.<span class="hljs-title function_ ngde">map</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">e</span>) =></span> ({ <span class="hljs-attr ngde">source</span>: e.<span class="hljs-property ngde">source</span>, <span class="hljs-attr ngde">target</span>: e.<span class="hljs-property ngde">target</span> })))
</span><span class="line ngde">    <span class="hljs-comment ngde">// @ts-ignore</span>
</span><span class="line ngde">    .<span class="hljs-title function_ ngde">id</span>(<span class="hljs-function ngde">(<span class="hljs-params ngde">d</span>) =></span> d.<span class="hljs-property ngde">id</span>)
</span><span class="line ngde">    .<span class="hljs-title function_ ngde">distance</span>(<span class="hljs-number ngde">50</span>);
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">private</span> simulation = d3
</span><span class="line ngde">    .<span class="hljs-title function_ ngde">forceSimulation</span>()
</span><span class="line ngde">    .<span class="hljs-title function_ ngde">force</span>(<span class="hljs-string ngde">'charge'</span>, d3.<span class="hljs-title function_ ngde">forceManyBody</span>().<span class="hljs-title function_ ngde">strength</span>(-<span class="hljs-number ngde">100</span>))
</span><span class="line ngde">    .<span class="hljs-title function_ ngde">force</span>(<span class="hljs-string ngde">'x'</span>, d3.<span class="hljs-title function_ ngde">forceX</span>())
</span><span class="line ngde">    .<span class="hljs-title function_ ngde">force</span>(<span class="hljs-string ngde">'y'</span>, d3.<span class="hljs-title function_ ngde">forceY</span>())
</span><span class="line ngde">    <span class="hljs-comment ngde">// center of viewport</span>
</span><span class="line ngde">    .<span class="hljs-title function_ ngde">force</span>(<span class="hljs-string ngde">'center'</span>, d3.<span class="hljs-title function_ ngde">forceCenter</span>(<span class="hljs-number ngde">200</span>, <span class="hljs-number ngde">200</span>))
</span><span class="line ngde">    .<span class="hljs-title function_ ngde">nodes</span>(<span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">simulationNodes</span>)
</span><span class="line ngde">    .<span class="hljs-title function_ ngde">force</span>(<span class="hljs-string ngde">'link'</span>, <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">linkForce</span>);
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">protected</span> <span class="hljs-title function_ ngde">onDistanceChange</span>(<span class="hljs-params ngde">event: Event</span>) {
</span><span class="line ngde">    <span class="hljs-keyword ngde">const</span> distance = +(event.<span class="hljs-property ngde">target</span> <span class="hljs-keyword ngde">as</span> <span class="hljs-title class_ ngde">HTMLInputElement</span>).<span class="hljs-property ngde">value</span>;
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">linkForce</span>.<span class="hljs-title function_ ngde">distance</span>(distance);
</span><span class="line ngde">    <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-property ngde">simulation</span>.<span class="hljs-title function_ ngde">alpha</span>(<span class="hljs-number ngde">0.5</span>).<span class="hljs-title function_ ngde">restart</span>();
</span><span class="line ngde">
</span><span class="line ngde">    <span class="hljs-built_in ngde">setTimeout</span>(<span class="hljs-function ngde">() =></span> {
</span><span class="line ngde">      <span class="hljs-variable language_ ngde">this</span>.<span class="hljs-title function_ ngde">vflow</span>().<span class="hljs-title function_ ngde">fitView</span>({ <span class="hljs-attr ngde">duration</span>: <span class="hljs-number ngde">500</span> });
</span><span class="line ngde">    }, <span class="hljs-number ngde">250</span>);
</span><span class="line ngde">  }
</span><span class="line ngde">}
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-keyword ngde">function</span> <span class="hljs-title function_ ngde">randomHex</span>(<span class="hljs-params ngde"></span>) {
</span><span class="line ngde">  <span class="hljs-keyword ngde">const</span> hexValues = [
</span><span class="line ngde">    <span class="hljs-number ngde">0</span>,
</span><span class="line ngde">    <span class="hljs-number ngde">1</span>,
</span><span class="line ngde">    <span class="hljs-number ngde">2</span>,
</span><span class="line ngde">    <span class="hljs-number ngde">3</span>,
</span><span class="line ngde">    <span class="hljs-number ngde">4</span>,
</span><span class="line ngde">    <span class="hljs-number ngde">5</span>,
</span><span class="line ngde">    <span class="hljs-number ngde">6</span>,
</span><span class="line ngde">    <span class="hljs-number ngde">7</span>,
</span><span class="line ngde">    <span class="hljs-number ngde">8</span>,
</span><span class="line ngde">    <span class="hljs-number ngde">9</span>,
</span><span class="line ngde">    <span class="hljs-string ngde">'A'</span>,
</span><span class="line ngde">    <span class="hljs-string ngde">'B'</span>,
</span><span class="line ngde">    <span class="hljs-string ngde">'C'</span>,
</span><span class="line ngde">    <span class="hljs-string ngde">'D'</span>,
</span><span class="line ngde">    <span class="hljs-string ngde">'E'</span>,
</span><span class="line ngde">    <span class="hljs-string ngde">'F'</span>,
</span><span class="line ngde">  ];
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">let</span> hex = <span class="hljs-string ngde">'#'</span>;
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">for</span> (<span class="hljs-keyword ngde">let</span> i = <span class="hljs-number ngde">0</span>; i &#x3C; <span class="hljs-number ngde">6</span>; i++) {
</span><span class="line ngde">    <span class="hljs-keyword ngde">const</span> index = <span class="hljs-title class_ ngde">Math</span>.<span class="hljs-title function_ ngde">floor</span>(<span class="hljs-title class_ ngde">Math</span>.<span class="hljs-title function_ ngde">random</span>() * hexValues.<span class="hljs-property ngde">length</span>);
</span><span class="line ngde">    hex += hexValues[index];
</span><span class="line ngde">  }
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-keyword ngde">return</span> hex;
</span><span class="line ngde">}
</span></code></pre>`},{title:"HTML",code:`<pre class="ngde hljs"><code lang="html" class="hljs language-html code-lines ngde"><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">label</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"slider"</span>></span>
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">span</span>></span>Distance<span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">span</span>></span>
</span><span class="line ngde">  &#x3C;<span class="hljs-name ngde">input</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"range"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">min</span>=<span class="hljs-string ngde">"0"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">step</span>=<span class="hljs-string ngde">"1"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">max</span>=<span class="hljs-string ngde">"200"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    </span><span class="hljs-attr ngde">value</span>=<span class="hljs-string ngde">"50"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">    (</span><span class="hljs-attr ngde">input</span>)=<span class="hljs-string ngde">"onDistanceChange($event)"</span><span class="hljs-tag ngde"></span>
</span><span class="line ngde"><span class="hljs-tag ngde">  /></span>
</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">label</span>></span>
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">vflow</span> <span class="hljs-attr ngde">view</span>=<span class="hljs-string ngde">"auto"</span> [<span class="hljs-attr ngde">nodes</span>]=<span class="hljs-string ngde">"nodes"</span> [<span class="hljs-attr ngde">edges</span>]=<span class="hljs-string ngde">"edges"</span>></span>
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">ng-template</span> <span class="hljs-attr ngde">nodeHtml</span> <span class="hljs-attr ngde">let-ctx</span>></span>
</span><span class="line ngde">    <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">div</span> [<span class="hljs-attr ngde">style.background-color</span>]=<span class="hljs-string ngde">"ctx.node.data()"</span> <span class="hljs-attr ngde">class</span>=<span class="hljs-string ngde">"custom-node"</span>></span>
</span><span class="line ngde">      {{ ctx.node.data() }}
</span><span class="line ngde">
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"source"</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"bottom"</span> /></span>
</span><span class="line ngde">      <span class="hljs-tag ngde">&#x3C;<span class="hljs-name ngde">handle</span> <span class="hljs-attr ngde">type</span>=<span class="hljs-string ngde">"target"</span> <span class="hljs-attr ngde">position</span>=<span class="hljs-string ngde">"top"</span> /></span>
</span><span class="line ngde">    <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">div</span>></span>
</span><span class="line ngde">  <span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">ng-template</span>></span>
</span><span class="line ngde"><span class="hljs-tag ngde">&#x3C;/<span class="hljs-name ngde">vflow</span>></span>
</span></code></pre>`},{title:"SCSS",code:`<pre class="ngde hljs"><code lang="scss" class="hljs language-scss code-lines ngde"><span class="line ngde"><span class="hljs-selector-pseudo ngde">:host</span> {
</span><span class="line ngde">  <span class="hljs-attribute ngde">width</span>: <span class="hljs-number ngde">100%</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">height</span>: <span class="hljs-number ngde">100%</span>;
</span><span class="line ngde">}
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-selector-class ngde">.custom-node</span> {
</span><span class="line ngde">  <span class="hljs-attribute ngde">width</span>: <span class="hljs-number ngde">100px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">height</span>: <span class="hljs-number ngde">50px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">background</span>: <span class="hljs-number ngde">#bbe1fa</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">border</span>: <span class="hljs-number ngde">1px</span> solid gray;
</span><span class="line ngde">  <span class="hljs-attribute ngde">border-radius</span>: <span class="hljs-number ngde">5px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">display</span>: flex;
</span><span class="line ngde">  <span class="hljs-attribute ngde">align-items</span>: center;
</span><span class="line ngde">  <span class="hljs-attribute ngde">justify-content</span>: center;
</span><span class="line ngde">}
</span><span class="line ngde">
</span><span class="line ngde"><span class="hljs-selector-class ngde">.slider</span> {
</span><span class="line ngde">  <span class="hljs-attribute ngde">position</span>: absolute;
</span><span class="line ngde">  <span class="hljs-attribute ngde">display</span>: flex;
</span><span class="line ngde">  <span class="hljs-attribute ngde">padding</span>: <span class="hljs-number ngde">4px</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">gap</span>: <span class="hljs-number ngde">4px</span>;
</span><span class="line ngde">
</span><span class="line ngde">  <span class="hljs-attribute ngde">background-color</span>: <span class="hljs-number ngde">#2e414c</span>;
</span><span class="line ngde">  <span class="hljs-attribute ngde">border-bottom-right-radius</span>: <span class="hljs-number ngde">6px</span>;
</span><span class="line ngde">}
</span></code></pre>`}]},Hs=Ws;var Js='<h1 id="d3-force" class="ngde">D3 Force<a title="Link to heading" class="ng-doc-header-link ngde" href="/workshops/layout/force#d3-force"><ng-doc-icon icon="link-2" size="16" class="ngde"></ng-doc-icon></a></h1><p class="ngde">This is a simple example of using the <a href="https://github.com/d3/d3-force" class="ngde">d3-force</a> layout package.</p><ng-doc-demo-pane componentname="ForceLayoutDemoComponent" indexable="false" class="ngde"><div id="options" class="ngde">{}</div></ng-doc-demo-pane>',Ks=(()=>{class s extends q{constructor(){super(),this.routePrefix="",this.pageType="guide",this.pageContent=Js,this.editSourceFileUrl="https://github.com/artem-mangilev/ngx-vflow/edit/main/projects/ngx-vflow-demo/src/app/categories/workshops/categories/layout/pages/force/index.md?message=docs(force): describe your changes here...",this.page=H,this.demoAssets=Hs}static{this.\u0275fac=function(e){return new(e||s)}}static{this.\u0275cmp=O({type:s,selectors:[["ng-doc-page-workshops-layout-force"]],standalone:!0,features:[cs([{provide:q,useExisting:s},Is,H.providers??[]]),ss,Y],decls:1,vars:0,template:function(e,t){e&1&&R(0,"ng-doc-page")},dependencies:[rs],encapsulation:2,changeDetection:0})}}return s})(),Zs=[V(L({},(0,Os.isRoute)(H.route)?H.route:{}),{path:"",component:Ks,title:"D3 Force"})],wa=Zs;export{Ks as DynamicComponent,wa as default};
