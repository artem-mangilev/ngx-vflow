import { NgDocPage } from '@ng-doc/core';
import WorkshopsCategory from '../ng-doc.category';
import { NodePositionAnimationPaidDemoComponent } from './demo/node-position-animation-paid-demo.component';

/**
 * @status:primary STUDIO
 */
const Page: NgDocPage = {
  title: `Node Position Animation`,
  mdFile: './index.md',
  category: WorkshopsCategory,
  order: 5,
  demos: { NodePositionAnimationPaidDemoComponent },
};

export default Page;
