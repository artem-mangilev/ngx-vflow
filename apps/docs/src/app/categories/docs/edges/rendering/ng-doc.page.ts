import { NgDocPage } from '@ng-doc/core';
import EdgesCategory from '../ng-doc.category';
import { TemplateEdgesDemoComponent } from './demo/template-edges-demo.component';
import { ComponentEdgesDemoComponent } from './demo/component-edges-demo.component';
import { DefaultEdgesDemoComponent } from './demo/default-edges-demo.component';

const RenderingEdgesPage: NgDocPage = {
  title: 'Rendering edges',
  mdFile: './index.md',
  category: EdgesCategory,
  demos: { TemplateEdgesDemoComponent, ComponentEdgesDemoComponent, DefaultEdgesDemoComponent },
  order: 1,
};

export default RenderingEdgesPage;
