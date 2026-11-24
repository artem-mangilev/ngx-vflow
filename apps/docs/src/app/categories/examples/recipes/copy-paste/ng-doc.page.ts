import { NgDocPage } from '@ng-doc/core';
import RecipesCategory from '../ng-doc.category';
import { CopyPasteDemoComponent } from './demo/copy-paste-demo.component';

const CopyPastePage: NgDocPage = {
  title: `Copy and paste`,
  mdFile: './index.md',
  category: RecipesCategory,
  demos: { CopyPasteDemoComponent },
  order: 5,
};

export default CopyPastePage;
