import { NgDocPage } from '@ng-doc/core';
import ViewportCategory from '../ng-doc.category';
import { PanelDemoComponent } from './demo/panel-demo.component';

const PanelPage: NgDocPage = {
  title: 'Panels',
  mdFile: './index.md',
  category: ViewportCategory,
  demos: { PanelDemoComponent },
  order: 8,
};

export default PanelPage;
