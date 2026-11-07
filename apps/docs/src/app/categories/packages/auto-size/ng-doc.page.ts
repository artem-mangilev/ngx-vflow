import { NgDocPage } from '@ng-doc/core';
import PackagesCategory from '../ng-doc.category';
import { AutoSizeDemoComponent } from './demo/auto-size-demo.component';

const Page: NgDocPage = {
  title: `Auto size`,
  mdFile: './index.md',
  category: PackagesCategory,
  order: 2,
  demos: { AutoSizeDemoComponent },
};

export default Page;
