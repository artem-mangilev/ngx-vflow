import { NgDocPage } from '@ng-doc/core';
import DesignSystemCategory from '../../ng-doc.category';
import { ThemesDemoComponent } from './themes-demo.component';

const page: NgDocPage = {
  title: 'Overview',
  mdFile: './index.md',
  category: DesignSystemCategory,
  order: 1,
  demos: { ThemesDemoComponent },
};
export default page;
