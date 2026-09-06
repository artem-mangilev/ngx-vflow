import { NgDocPage } from '@ng-doc/core';
import InteractionsCategory from '../../ng-doc.category';
import { SelectionBoxDemoComponent } from './demo/selection-box-demo.component';

const TestPage: NgDocPage = {
  title: `Selection box`,
  mdFile: './index.md',
  category: InteractionsCategory,
  demos: { SelectionBoxDemoComponent },
  order: 2,
};

export default TestPage;
