import { NgDocPage } from '@ng-doc/core';
import ApplicationsCategory from '../ng-doc.category';
import { EntitiesDemoComponent } from './entities-demo.component';
import { ScrollCollapseDemoComponent } from './scroll-collapse-demo.component';

const page: NgDocPage = {
  title: 'ERD and schema mapping',
  mdFile: './index.md',
  category: ApplicationsCategory,
  order: 5,
  demos: { EntitiesDemoComponent, ScrollCollapseDemoComponent },
};

export default page;
