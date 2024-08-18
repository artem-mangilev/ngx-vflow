import { NgDocPage } from '@ng-doc/core';
import { ForceLayoutDemoComponent } from './demo/force-layout-demo.component';
import LayoutCategory from '../../ng-doc.category';

const TestPage: NgDocPage = {
  title: `D3 Force`,
  mdFile: './index.md',
  category: LayoutCategory,
  demos: { ForceLayoutDemoComponent },
  order: 2
};

export default TestPage;
