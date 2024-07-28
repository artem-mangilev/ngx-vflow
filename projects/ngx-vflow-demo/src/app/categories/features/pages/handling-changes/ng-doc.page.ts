import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category';
import { HandlingChangesDemoComponent } from './demo/handling-changes-demo/handling-changes-demo.component';
import { HandlingChangesFilteredDemoComponent } from './demo/handling-changes-filtered-demo/handling-changes-filtered-demo.component';

const TestPage: NgDocPage = {
  title: `Handling changes`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { HandlingChangesDemoComponent, HandlingChangesFilteredDemoComponent },
  order: 3
};

export default TestPage;
