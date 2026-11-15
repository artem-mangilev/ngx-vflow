import { NgDocPage } from '@ng-doc/core';
import RecipesCategory from '../ng-doc.category';
import { EasyConnectDemoComponent } from './demo/easy-connect-demo.component';

const EasyConnectPage: NgDocPage = {
  title: `Easy connect`,
  mdFile: './index.md',
  category: RecipesCategory,
  demos: { EasyConnectDemoComponent },
  order: 3,
};

export default EasyConnectPage;
