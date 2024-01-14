# {{ NgDocPage.title }}

Vector document (`vdoc`) is a utility that simplifies creating beautiful custom blocks using SVG, but abstracting you from its complexity.

Its goals are:

- take usage of `foreignObject` under control. Notify if CSS inside of it may lead to bugs in some browsers
- cover cases that can't be handled with `foreignObject` or lead to crossbrowser issues
- be extremely performant - later I'm going to research how to serialize `vdoc` entities into SVG image to decrease DOM nodes so performance should be great on large flows
- use signal-based styling DSL with naming similar to CSS

{{ NgDocActions.demo("VdocDemoComponent") }}

