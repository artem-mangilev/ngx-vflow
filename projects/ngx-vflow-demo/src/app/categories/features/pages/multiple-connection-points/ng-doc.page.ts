import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { MultipleConnectionPointsDemoComponent } from './demo/multiple-connection-points-demo.component';

const TestPage: NgDocPage = {
  title: `Multiple connection points`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { MultipleConnectionPointsDemoComponent },
  order: 2
};

export default TestPage;
