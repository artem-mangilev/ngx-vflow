import { NgDocPage } from '@ng-doc/core';
import { VizdomLayoutDemoComponent } from './demo/vizdom-layout-demo.component';
import LayoutCategory from '../../ng-doc.category';

const TestPage: NgDocPage = {
  title: `Vizdom layout`,
  mdFile: './index.md',
  category: LayoutCategory,
  demos: { VizdomLayoutDemoComponent },
  order: 2
};

export default TestPage;
