# {{ NgDocPage.title }}

NgxVflow is an Angular library for creating node-based editors. 

## Story behind the library

A couple of years ago a company where I worked decided to create a lowcode platform using Angular. The boss said, "You should create a solution that will allow us to describe some flows in a visual way". After several days of researching the best thing I could find was `NgxGraph`, but it lacks the features we needed, like creating new edges, initializing nodes in particular coordinates (the library uses several layout engines for initial node rendering, and then it allows to move them manually), it also lacks the ability to create subflows.

I decided to get the code of the lib into our private repo and add missing functionality, during this long way almost every subsystem was rewritten and new was added, so I got some ideas about what should be reachable for node-based editors.

Now it's time to pay back to the community and accumulate my specific experience into this library. 

## Observations during my work

- SVG is really fast for flows of decent size (at least 300 custom nodes in my experience)
- SVG is hard to write manually, so beautiful custom nodes are almost always made with `foreignObject`
- `foreignObject` (SVG element that allows to put HTML inside SVG) is great, but it's browser compatibility is not so great, so it should be used carefully
- Multilayer strategy (HTML layer with nodes and SVG layer with edges behind it) is cool, it entitles the creation of very attractive UIs, but may lack performance in large flows because of the DOM tree size

## Goals

Based on these observations I'm introducing the goals for `NgxVflow`

- it will have an HTML renderer (multilayer actually) for creating flows with beautiful visuals, but it may lead to performance issues on 100 or more nodes.
- it will have an SVG renderer for creating less visually complex flows (due to the complexity and limited abilities of SVG), but with the ability to render 1000 or more nodes without performance issues.
- it will have a tooling for SVG renderer that can simplify creating visually attractive SVG nodes. The API is similar to CSS, and this code will compile into cross-browser fast SVG.






