import { NgDocPage } from '@ng-doc/core';
import InteractionsCategory from '../ng-doc.category';
import { SelectingDemoComponent } from './demo/selecting-demo.component';
import { SelectionBoxDemoComponent } from './demo/selection-box-demo.component';

const TestPage: NgDocPage = {
  title: 'Selection',
  mdFile: './index.md',
  category: InteractionsCategory,
  demos: { SelectingDemoComponent, SelectionBoxDemoComponent },
  order: 1,
};

export default TestPage;
