import { NgDocPage } from '@ng-doc/core';
import { ForceLayoutDemoComponent } from './demo/force-layout-demo.component';
import WorkshopsCategory from '../ng-doc.category';

const Page: NgDocPage = {
  title: `D3 Force`,
  mdFile: './index.md',
  category: WorkshopsCategory,
  demos: { ForceLayoutDemoComponent },
  order: 2,
};

export default Page;
