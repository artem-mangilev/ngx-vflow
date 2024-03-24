import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { CustomEdgesDemoComponent } from './demo/custom-edges-demo.component';

const TestPage: NgDocPage = {
  title: `Custom edges`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { CustomEdgesDemoComponent },
  order: 3
};

export default TestPage;
