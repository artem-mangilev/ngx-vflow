import { NgDocPage } from '@ng-doc/core';
import UiCategory from '../ng-doc.category';
import { ThemesDemoComponent } from './themes-demo.component';

const page: NgDocPage = {
  title: 'Overview',
  mdFile: './index.md',
  category: UiCategory,
  order: 1,
  demos: { ThemesDemoComponent },
};

export default page;
