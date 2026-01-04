import { NgDocPage } from '@ng-doc/core';
import { VizdomLayoutDemoComponent } from './demo/vizdom-layout-demo.component';
import WorkshopsCategory from '../ng-doc.category';

const TestPage: NgDocPage = {
  title: `Vizdom layout`,
  mdFile: './index.md',
  category: WorkshopsCategory,
  demos: { VizdomLayoutDemoComponent },
  order: 2,
};

export default TestPage;
