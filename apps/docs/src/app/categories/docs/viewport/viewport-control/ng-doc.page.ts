import { NgDocPage } from '@ng-doc/core';
import ViewportCategory from '../ng-doc.category';
import { ViewportControlDemoComponent } from './demo/viewport-control-demo.component';

const ViewportControlPage: NgDocPage = {
  title: 'Controlling the viewport',
  mdFile: './index.md',
  category: ViewportCategory,
  demos: { ViewportControlDemoComponent },
  order: 3,
};

export default ViewportControlPage;
