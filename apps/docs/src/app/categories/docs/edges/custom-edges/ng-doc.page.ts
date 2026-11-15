import { NgDocPage } from '@ng-doc/core';
import EdgesCategory from '../ng-doc.category';
import { CustomEdgesDemoComponent } from './demo/custom-edges-demo.component';
import { ComponentEdgesDemoComponent } from './demo/component-edges-demo.component';
import { DefaultEdgesDemoComponent } from './demo/default-edges-demo.component';

const TestPage: NgDocPage = {
  title: 'Custom edges',
  mdFile: './index.md',
  category: EdgesCategory,
  demos: { CustomEdgesDemoComponent, ComponentEdgesDemoComponent, DefaultEdgesDemoComponent },
  order: 1,
};

export default TestPage;
