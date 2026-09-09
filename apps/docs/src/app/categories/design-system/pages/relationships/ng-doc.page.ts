import { NgDocPage } from '@ng-doc/core';
import DesignSystemCategory from '../../ng-doc.category';
import { RelationshipsDemoComponent } from '../../demos/relationships-demo.component';

const page: NgDocPage = {
  title: 'Relationships and metrics',
  mdFile: './index.md',
  category: DesignSystemCategory,
  order: 5,
  demos: { RelationshipsDemoComponent },
};
export default page;
