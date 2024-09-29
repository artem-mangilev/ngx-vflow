# {{ NgDocPage.title }}

This topic needs some clarification due to the design decisions behind the library.

The library renders the flow by combining two technologies:

- **SVG**, which is responsible for rendering curves, managing zoom, pan, and other tasks that SVG handles well.
- **HTML (with CSS)**, which is used to create the content for the nodes, allowing front-end engineers to design dynamic and visually appealing UIs more easily than with SVG.

The link between these two technologies is the `<svg:foreignObject />` element, which enables HTML to be rendered inside SVG. The diagram below illustrates how this element interacts with its content.

<img src="assets/size-schema.png" width="700px" />
