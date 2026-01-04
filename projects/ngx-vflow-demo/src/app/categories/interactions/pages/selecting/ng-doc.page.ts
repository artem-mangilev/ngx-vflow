import { NgDocPage } from '@ng-doc/core';
import InteractionsCategory from '../../ng-doc.category';
import { SelectingDemoComponent } from './demo/selecting-demo.component';

const TestPage: NgDocPage = {
  title: `Selecting`,
  mdFile: './index.md',
  category: InteractionsCategory,
  demos: { SelectingDemoComponent },
  order: 1,
};

export default TestPage;
