import { NgDocPage } from '@ng-doc/core';
import InteractionsCategory from '../../ng-doc.category';
import { HandlingChangesDemoComponent } from './demo/handling-changes-demo/handling-changes-demo.component';
import { HandlingChangesFilteredDemoComponent } from './demo/handling-changes-filtered-demo/handling-changes-filtered-demo.component';

const TestPage: NgDocPage = {
  title: `Handling changes`,
  mdFile: './index.md',
  category: InteractionsCategory,
  demos: { HandlingChangesDemoComponent, HandlingChangesFilteredDemoComponent },
  order: 3,
};

export default TestPage;
