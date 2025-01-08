import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category';
import { SelectingDemoComponent } from './demo/selecting-demo.component';

const TestPage: NgDocPage = {
  title: `Selecting`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { SelectingDemoComponent },
  order: 2,
};

export default TestPage;
