import { NgDocPage } from '@ng-doc/core';
import EdgesCategory from '../ng-doc.category';
import { DefaultEdgesDemoComponent } from './demo/default-edges-demo.component';

const TestPage: NgDocPage = {
  title: `Default edges`,
  mdFile: './index.md',
  category: EdgesCategory,
  demos: { DefaultEdgesDemoComponent },
  order: 1,
};

export default TestPage;
