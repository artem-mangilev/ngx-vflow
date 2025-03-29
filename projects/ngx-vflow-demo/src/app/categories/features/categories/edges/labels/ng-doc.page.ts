import { NgDocPage } from '@ng-doc/core';
import EdgesCategory from '../ng-doc.category';
import { LabelsDemoComponent } from './demo/labels-demo.component';

const TestPage: NgDocPage = {
  title: `Labels`,
  mdFile: './index.md',
  category: EdgesCategory,
  demos: { LabelsDemoComponent },
  order: 5,
};

export default TestPage;
