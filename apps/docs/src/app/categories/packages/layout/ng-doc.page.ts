import { NgDocPage } from '@ng-doc/core';
import PackagesCategory from '../ng-doc.category';
import { LayoutDagreDemoComponent } from './demo/layout-dagre-demo.component';
import { LayoutElkDemoComponent } from './demo/layout-elk-demo.component';
import { LayoutForceDemoComponent } from './demo/layout-force-demo.component';

const Page: NgDocPage = {
  title: `Layout`,
  mdFile: './index.md',
  category: PackagesCategory,
  order: 3,
  demos: { LayoutDagreDemoComponent, LayoutElkDemoComponent, LayoutForceDemoComponent },
};

export default Page;
