import { NgDocPage } from '@ng-doc/core';
import ViewportCategory from '../ng-doc.category';
import { PortalDemoComponent } from './demo/portal-demo.component';

const PortalPage: NgDocPage = {
  title: 'Content on the canvas',
  mdFile: './index.md',
  category: ViewportCategory,
  demos: { PortalDemoComponent },
  order: 7,
};

export default PortalPage;
