import { NgDocPage } from '@ng-doc/core';
import RecipesCategory from '../ng-doc.category';
import { DeleteSelectedDemoComponent } from './demo/delete-selected-demo.component';

const TestPage: NgDocPage = {
  title: `Delete selected`,
  mdFile: './index.md',
  category: RecipesCategory,
  demos: { DeleteSelectedDemoComponent },
  order: 2,
};

export default TestPage;
