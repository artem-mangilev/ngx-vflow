import{a as U}from"./chunk-66YZQWEL.js";import{A as H}from"./chunk-MHLT7763.js";import{C as L,Da as u,Ga as j,H as M,I as R,Ka as B,La as I,Q as q,Qa as E,Ra as N,Za as K,bb as W,ja as F,kb as v}from"./chunk-2YGWVKHB.js";import{b as _,c as V}from"./chunk-IGMHS2AO.js";import{j as $}from"./chunk-K4ALXBGI.js";function se(e,l){return!!e.children(l).length}function ie(e){return D(e.v)+":"+D(e.w)+":"+D(e.name)}var O=/:/g;function D(e){return e?String(e).replace(O,"\\:"):""}function X(e,l){l&&e.attr("style",l)}function ce(e,l,c){l&&e.attr("class",l).attr("class",c+" "+e.attr("class"))}function de(e,l){var c=l.graph();if(F(c)){var a=c.transition;if(q(a))return a(e)}return e}function J(e,l){var c=e.append("foreignObject").attr("width","100000"),a=c.append("xhtml:div");a.attr("xmlns","http://www.w3.org/1999/xhtml");var i=l.label;switch(typeof i){case"function":a.insert(i);break;case"object":a.insert(function(){return i});break;default:a.html(i)}X(a,l.labelStyle),a.style("display","inline-block"),a.style("white-space","nowrap");var d=a.node().getBoundingClientRect();return c.attr("width",d.width).attr("height",d.height),c}var Q={},te=function(e){let l=Object.keys(e);for(let c of l)Q[c]=e[c]},Y=function(e,l,c,a,i,d){return $(this,null,function*(){let w=a.select(`[id="${c}"]`),n=Object.keys(e);for(let p of n){let r=e[p],y="default";r.classes.length>0&&(y=r.classes.join(" ")),y=y+" flowchart-label";let h=N(r.styles),t=r.text!==void 0?r.text:r.id,s;if(u.info("vertex",r,r.labelType),r.labelType==="markdown")u.info("vertex",r,r.labelType);else if(j(v().flowchart.htmlLabels))s=J(w,{label:t}).node(),s.parentNode.removeChild(s);else{let k=i.createElementNS("http://www.w3.org/2000/svg","text");k.setAttribute("style",h.labelStyle.replace("color:","fill:"));let C=t.split(I.lineBreakRegex);for(let A of C){let S=i.createElementNS("http://www.w3.org/2000/svg","tspan");S.setAttributeNS("http://www.w3.org/XML/1998/namespace","xml:space","preserve"),S.setAttribute("dy","1em"),S.setAttribute("x","1"),S.textContent=A,k.appendChild(S)}s=k}let b=0,o="";switch(r.type){case"round":b=5,o="rect";break;case"square":o="rect";break;case"diamond":o="question";break;case"hexagon":o="hexagon";break;case"odd":o="rect_left_inv_arrow";break;case"lean_right":o="lean_right";break;case"lean_left":o="lean_left";break;case"trapezoid":o="trapezoid";break;case"inv_trapezoid":o="inv_trapezoid";break;case"odd_right":o="rect_left_inv_arrow";break;case"circle":o="circle";break;case"ellipse":o="ellipse";break;case"stadium":o="stadium";break;case"subroutine":o="subroutine";break;case"cylinder":o="cylinder";break;case"group":o="rect";break;case"doublecircle":o="doublecircle";break;default:o="rect"}let T=yield B(t,v());l.setNode(r.id,{labelStyle:h.labelStyle,shape:o,labelText:T,labelType:r.labelType,rx:b,ry:b,class:y,style:h.style,id:r.id,link:r.link,linkTarget:r.linkTarget,tooltip:d.db.getTooltip(r.id)||"",domId:d.db.lookUpDomId(r.id),haveCallback:r.haveCallback,width:r.type==="group"?500:void 0,dir:r.dir,type:r.type,props:r.props,padding:v().flowchart.padding}),u.info("setNode",{labelStyle:h.labelStyle,labelType:r.labelType,shape:o,labelText:T,rx:b,ry:b,class:y,style:h.style,id:r.id,domId:d.db.lookUpDomId(r.id),width:r.type==="group"?500:void 0,type:r.type,dir:r.dir,props:r.props,padding:v().flowchart.padding})}})},Z=function(e,l,c){return $(this,null,function*(){u.info("abc78 edges = ",e);let a=0,i={},d,w;if(e.defaultStyle!==void 0){let n=N(e.defaultStyle);d=n.style,w=n.labelStyle}for(let n of e){a++;let p="L-"+n.start+"-"+n.end;i[p]===void 0?(i[p]=0,u.info("abc78 new entry",p,i[p])):(i[p]++,u.info("abc78 new entry",p,i[p]));let r=p+"-"+i[p];u.info("abc78 new link id to be used is",p,r,i[p]);let y="LS-"+n.start,h="LE-"+n.end,t={style:"",labelStyle:""};switch(t.minlen=n.length||1,n.type==="arrow_open"?t.arrowhead="none":t.arrowhead="normal",t.arrowTypeStart="arrow_open",t.arrowTypeEnd="arrow_open",n.type){case"double_arrow_cross":t.arrowTypeStart="arrow_cross";case"arrow_cross":t.arrowTypeEnd="arrow_cross";break;case"double_arrow_point":t.arrowTypeStart="arrow_point";case"arrow_point":t.arrowTypeEnd="arrow_point";break;case"double_arrow_circle":t.arrowTypeStart="arrow_circle";case"arrow_circle":t.arrowTypeEnd="arrow_circle";break}let s="",b="";switch(n.stroke){case"normal":s="fill:none;",d!==void 0&&(s=d),w!==void 0&&(b=w),t.thickness="normal",t.pattern="solid";break;case"dotted":t.thickness="normal",t.pattern="dotted",t.style="fill:none;stroke-width:2px;stroke-dasharray:3;";break;case"thick":t.thickness="thick",t.pattern="solid",t.style="stroke-width: 3.5px;fill:none;";break;case"invisible":t.thickness="invisible",t.pattern="solid",t.style="stroke-width: 0;fill:none;";break}if(n.style!==void 0){let o=N(n.style);s=o.style,b=o.labelStyle}t.style=t.style+=s,t.labelStyle=t.labelStyle+=b,n.interpolate!==void 0?t.curve=E(n.interpolate,L):e.defaultInterpolate!==void 0?t.curve=E(e.defaultInterpolate,L):t.curve=E(Q.curve,L),n.text===void 0?n.style!==void 0&&(t.arrowheadStyle="fill: #333"):(t.arrowheadStyle="fill: #333",t.labelpos="c"),t.labelType=n.labelType,t.label=yield B(n.text.replace(I.lineBreakRegex,`
`),v()),n.style===void 0&&(t.style=t.style||"stroke: #333; stroke-width: 1.5px;fill:none;"),t.labelStyle=t.labelStyle.replace("color:","fill:"),t.id=r,t.classes="flowchart-link "+y+" "+h,l.setEdge(n.start,n.end,t,a)}})},re=function(e,l){return l.db.getClasses()},le=function(e,l,c,a){return $(this,null,function*(){u.info("Drawing flowchart");let i=a.db.getDirection();i===void 0&&(i="TD");let{securityLevel:d,flowchart:w}=v(),n=w.nodeSpacing||50,p=w.rankSpacing||50,r;d==="sandbox"&&(r=_("#i"+l));let y=d==="sandbox"?_(r.nodes()[0].contentDocument.body):_("body"),h=d==="sandbox"?r.nodes()[0].contentDocument:document,t=new H({multigraph:!0,compound:!0}).setGraph({rankdir:i,nodesep:n,ranksep:p,marginx:0,marginy:0}).setDefaultEdgeLabel(function(){return{}}),s,b=a.db.getSubGraphs();u.info("Subgraphs - ",b);for(let f=b.length-1;f>=0;f--)s=b[f],u.info("Subgraph - ",s),a.db.addVertex(s.id,{text:s.title,type:s.labelType},"group",void 0,s.classes,s.dir);let o=a.db.getVertices(),T=a.db.getEdges();u.info("Edges",T);let k=0;for(k=b.length-1;k>=0;k--){s=b[k],V("cluster").append("text");for(let f=0;f<s.nodes.length;f++)u.info("Setting up subgraphs",s.nodes[f],s.id),t.setParent(s.nodes[f],s.id)}yield Y(o,t,l,y,h,a),yield Z(T,t);let C=y.select(`[id="${l}"]`),A=y.select("#"+l+" g");if(yield U(A,t,["point","circle","cross"],"flowchart",l),K.insertTitle(C,"flowchartTitleText",w.titleTopMargin,a.db.getDiagramTitle()),W(t,C,w.diagramPadding,w.useMaxWidth),a.db.indexNodes("subGraph"+k),!w.htmlLabels){let f=h.querySelectorAll('[id="'+l+'"] .edgeLabel .label');for(let x of f){let m=x.getBBox(),g=h.createElementNS("http://www.w3.org/2000/svg","rect");g.setAttribute("rx",0),g.setAttribute("ry",0),g.setAttribute("width",m.width),g.setAttribute("height",m.height),x.insertBefore(g,x.firstChild)}}Object.keys(o).forEach(function(f){let x=o[f];if(x.link){let m=_("#"+l+' [id="'+f+'"]');if(m){let g=h.createElementNS("http://www.w3.org/2000/svg","a");g.setAttributeNS("http://www.w3.org/2000/svg","class",x.classes.join(" ")),g.setAttributeNS("http://www.w3.org/2000/svg","href",x.link),g.setAttributeNS("http://www.w3.org/2000/svg","rel","noopener"),d==="sandbox"?g.setAttributeNS("http://www.w3.org/2000/svg","target","_top"):x.linkTarget&&g.setAttributeNS("http://www.w3.org/2000/svg","target",x.linkTarget);let z=m.insert(function(){return g},":first-child"),G=m.select(".label-container");G&&z.append(function(){return G.node()});let P=m.select(".label");P&&z.append(function(){return P.node()})}}})})},ye={setConf:te,addVertices:Y,addEdges:Z,getClasses:re,draw:le},ae=(e,l)=>{let c=R,a=c(e,"r"),i=c(e,"g"),d=c(e,"b");return M(a,i,d,l)},oe=e=>`.label {
    font-family: ${e.fontFamily};
    color: ${e.nodeTextColor||e.textColor};
  }
  .cluster-label text {
    fill: ${e.titleColor};
  }
  .cluster-label span,p {
    color: ${e.titleColor};
  }

  .label text,span,p {
    fill: ${e.nodeTextColor||e.textColor};
    color: ${e.nodeTextColor||e.textColor};
  }

  .node rect,
  .node circle,
  .node ellipse,
  .node polygon,
  .node path {
    fill: ${e.mainBkg};
    stroke: ${e.nodeBorder};
    stroke-width: 1px;
  }
  .flowchart-label text {
    text-anchor: middle;
  }
  // .flowchart-label .text-outer-tspan {
  //   text-anchor: middle;
  // }
  // .flowchart-label .text-inner-tspan {
  //   text-anchor: start;
  // }

  .node .katex path {
    fill: #000;
    stroke: #000;
    stroke-width: 1px;
  }

  .node .label {
    text-align: center;
  }
  .node.clickable {
    cursor: pointer;
  }

  .arrowheadPath {
    fill: ${e.arrowheadColor};
  }

  .edgePath .path {
    stroke: ${e.lineColor};
    stroke-width: 2.0px;
  }

  .flowchart-link {
    stroke: ${e.lineColor};
    fill: none;
  }

  .edgeLabel {
    background-color: ${e.edgeLabelBackground};
    rect {
      opacity: 0.5;
      background-color: ${e.edgeLabelBackground};
      fill: ${e.edgeLabelBackground};
    }
    text-align: center;
  }

  /* For html labels only */
  .labelBkg {
    background-color: ${ae(e.edgeLabelBackground,.5)};
    // background-color: 
  }

  .cluster rect {
    fill: ${e.clusterBkg};
    stroke: ${e.clusterBorder};
    stroke-width: 1px;
  }

  .cluster text {
    fill: ${e.titleColor};
  }

  .cluster span,p {
    color: ${e.titleColor};
  }
  /* .cluster div {
    color: ${e.titleColor};
  } */

  div.mermaidTooltip {
    position: absolute;
    text-align: center;
    max-width: 200px;
    padding: 2px;
    font-family: ${e.fontFamily};
    font-size: 12px;
    background: ${e.tertiaryColor};
    border: 1px solid ${e.border2};
    border-radius: 2px;
    pointer-events: none;
    z-index: 100;
  }

  .flowchartTitleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${e.textColor};
  }
`,ke=oe;export{se as a,ie as b,X as c,ce as d,de as e,J as f,ye as g,ke as h};
