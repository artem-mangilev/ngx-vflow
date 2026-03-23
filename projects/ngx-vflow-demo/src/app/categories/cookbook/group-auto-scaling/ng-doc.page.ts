import { NgDocPage } from '@ng-doc/core';
import WorkshopsCategory from '../ng-doc.category';
import { GroupAutoScalingPaidDemoComponent } from './demo/group-auto-scaling-paid-demo.component';

const Page: NgDocPage = {
  title: `Group Auto Scaling`,
  mdFile: './index.md',
  category: WorkshopsCategory,
  order: 4,
  demos: { GroupAutoScalingPaidDemoComponent },
};

export default Page;
