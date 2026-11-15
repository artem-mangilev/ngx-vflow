import { NgDocPage } from '@ng-doc/core';
import ApplicationsCategory from '../ng-doc.category';
import { RelationshipsDemoComponent } from './relationships-demo.component';

const page: NgDocPage = {
  title: 'Relationships and metrics map',
  mdFile: './index.md',
  category: ApplicationsCategory,
  order: 6,
  demos: { RelationshipsDemoComponent },
};

export default page;
