import { NgDocPage } from '@ng-doc/core';
import RecipesCategory from '../ng-doc.category';
import { RopeCurveDemoComponent } from './demo/rope-curve-demo.component';

const Page: NgDocPage = {
  title: `Rope curve`,
  mdFile: './index.md',
  category: RecipesCategory,
  demos: { RopeCurveDemoComponent },
  order: 9,
};

export default Page;
