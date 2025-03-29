import { NgDocPage } from '@ng-doc/core';
import EdgesCategory from '../ng-doc.category';
import { CurvesDemoComponent } from './demo/curves-demo.component';

const TestPage: NgDocPage = {
  title: `Curves`,
  mdFile: './index.md',
  category: EdgesCategory,
  demos: { CurvesDemoComponent },
  order: 8,
};

export default TestPage;
