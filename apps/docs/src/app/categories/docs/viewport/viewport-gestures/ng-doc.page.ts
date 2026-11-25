import { NgDocPage } from '@ng-doc/core';
import ViewportCategory from '../ng-doc.category';
import { ViewportGesturesDemoComponent } from './demo/viewport-gestures-demo.component';

const page: NgDocPage = {
  title: 'Gestures',
  mdFile: './index.md',
  category: ViewportCategory,
  demos: { ViewportGesturesDemoComponent },
  order: 2,
};

export default page;
