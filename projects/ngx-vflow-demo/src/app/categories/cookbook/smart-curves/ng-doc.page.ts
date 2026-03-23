import { NgDocPage } from '@ng-doc/core';
import WorkshopsCategory from '../ng-doc.category';
import { SmartCurvesPaidDemoComponent } from './demo/smart-curves-paid-demo.component';

const Page: NgDocPage = {
  title: `Smart Curves`,
  mdFile: './index.md',
  category: WorkshopsCategory,
  order: 6,
  demos: { SmartCurvesPaidDemoComponent },
};

export default Page;
