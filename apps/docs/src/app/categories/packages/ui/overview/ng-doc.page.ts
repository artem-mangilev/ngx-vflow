import { NgDocPage } from '@ng-doc/core';
import UiCategory from '../ng-doc.category';
import { AnatomyDemoComponent } from './anatomy-demo.component';
import { ThemesDemoComponent } from './themes-demo.component';

const page: NgDocPage = {
  title: 'Overview',
  mdFile: './index.md',
  category: UiCategory,
  order: 1,
  demos: { AnatomyDemoComponent, ThemesDemoComponent },
};

export default page;
