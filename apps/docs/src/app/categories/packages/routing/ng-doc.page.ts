import { NgDocPage } from '@ng-doc/core';
import PackagesCategory from '../ng-doc.category';
import { RoutingDemoComponent } from './demo/routing-demo.component';

const Page: NgDocPage = {
  title: `Routing`,
  mdFile: './index.md',
  category: PackagesCategory,
  order: 1,
  demos: { RoutingDemoComponent },
};

export default Page;
