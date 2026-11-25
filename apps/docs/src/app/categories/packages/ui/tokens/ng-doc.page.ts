import { NgDocPage } from '@ng-doc/core';
import UiCategory from '../ng-doc.category';
import { TokensDemoComponent } from './tokens-demo.component';

const page: NgDocPage = {
  title: 'Tokens',
  mdFile: './index.md',
  category: UiCategory,
  order: 2,
  demos: { TokensDemoComponent },
};

export default page;
