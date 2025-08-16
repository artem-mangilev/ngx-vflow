import { NgDocPage } from '@ng-doc/core';
import EdgesCategory from '../ng-doc.category';
import { FloatingEdgesDemoComponent } from './demo/floating-edges-demo.component';

const TestPage: NgDocPage = {
  title: `Floating Edges`,
  mdFile: './index.md',
  category: EdgesCategory,
  demos: { FloatingEdgesDemoComponent },
  order: 2,
};

export default TestPage;
