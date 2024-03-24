import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { LabelsDemoComponent } from './demo/labels-demo.component';

const TestPage: NgDocPage = {
  title: `Labels`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { LabelsDemoComponent },
  order: 2
};

export default TestPage;
