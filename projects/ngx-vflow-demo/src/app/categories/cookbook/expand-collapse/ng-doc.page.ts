import { NgDocPage } from '@ng-doc/core';
import WorkshopsCategory from '../ng-doc.category';
import { ExpandCollapsePaidDemoComponent } from './demo/expand-collapse-paid-demo.component';

const Page: NgDocPage = {
  title: `Expand Collapse`,
  mdFile: './index.md',
  category: WorkshopsCategory,
  order: 7,
  demos: { ExpandCollapsePaidDemoComponent },
};

export default Page;
