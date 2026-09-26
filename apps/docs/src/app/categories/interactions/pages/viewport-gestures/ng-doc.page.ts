import { NgDocPage } from '@ng-doc/core';
import InteractionsCategory from '../../ng-doc.category';
import { ViewportGesturesDemoComponent } from './demo/viewport-gestures-demo.component';

const page: NgDocPage = {
  title: 'Viewport gestures',
  mdFile: './index.md',
  category: InteractionsCategory,
  demos: { ViewportGesturesDemoComponent },
  order: 4,
};

export default page;
