import { NgDocPage } from '@ng-doc/core';
import DesignSystemCategory from '../../ng-doc.category';
import { EntitiesDemoComponent } from '../../demos/entities-demo.component';

const page: NgDocPage = {
  title: 'ERD and schema mapping',
  mdFile: './index.md',
  category: DesignSystemCategory,
  order: 3,
  demos: { EntitiesDemoComponent },
};
export default page;
