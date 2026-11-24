import { NgDocPage } from '@ng-doc/core';
import InteractionsCategory from '../ng-doc.category';
import { DeleteSelectedDemoComponent } from './demo/delete-selected-demo.component';

const DeletingPage: NgDocPage = {
  title: `Deleting`,
  mdFile: './index.md',
  category: InteractionsCategory,
  demos: { DeleteSelectedDemoComponent },
  order: 2,
};

export default DeletingPage;
