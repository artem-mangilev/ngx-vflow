import { NgDocPage } from '@ng-doc/core';
import WorkshopsCategory from '../ng-doc.category';
import { DeleteSelectedDemoComponent } from './demo/delete-selected-demo.component';

const TestPage: NgDocPage = {
  title: `Delete selected`,
  mdFile: './index.md',
  category: WorkshopsCategory,
  demos: { DeleteSelectedDemoComponent },
  order: 2,
};

export default TestPage;
