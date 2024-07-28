import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { ViewSizeAutoDemoComponent } from './demo/view-size-auto-demo.component';
import { ViewSizeFixedDemoComponent } from './demo/view-size-fixed-demo.component';

const TestPage: NgDocPage = {
  title: `View size`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { ViewSizeAutoDemoComponent, ViewSizeFixedDemoComponent },
  route: {
    children: [
      {
        path: 'view-size-auto',
        component: ViewSizeAutoDemoComponent,
      },
      {
        path: 'view-size-fixed',
        component: ViewSizeFixedDemoComponent,
      },
    ],
  },
  order: 2
};

export default TestPage;
