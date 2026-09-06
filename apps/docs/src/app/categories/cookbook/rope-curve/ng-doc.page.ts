import { NgDocPage } from '@ng-doc/core';
import WorkshopsCategory from '../ng-doc.category';
import { RopeCurveDemoComponent } from './demo/rope-curve-demo.component';

const Page: NgDocPage = {
  title: `Rope curve`,
  mdFile: './index.md',
  category: WorkshopsCategory,
  demos: { RopeCurveDemoComponent },
  order: 9,
};

export default Page;
