import { NgDocPage } from '@ng-doc/core';
import DesignSystemCategory from '../ng-doc.category';
import { TokensDemoComponent } from './tokens-demo.component';

const page: NgDocPage = {
  title: 'Tokens',
  mdFile: './index.md',
  category: DesignSystemCategory,
  order: 2,
  demos: { TokensDemoComponent },
};

export default page;
