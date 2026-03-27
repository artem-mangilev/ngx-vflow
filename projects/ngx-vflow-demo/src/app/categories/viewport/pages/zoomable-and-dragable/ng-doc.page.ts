import { NgDocPage } from '@ng-doc/core';
import ViewportCategory from '../../ng-doc.category';
import { ZoomableDemoComponent } from './demo/zoomable.component';
import { DragableDemoComponent } from './demo/dragable.component';

const TestPage: NgDocPage = {
  title: `Zoomable and Dragable`,
  mdFile: './index.md',
  category: ViewportCategory,
  demos: { ZoomableDemoComponent, DragableDemoComponent },
  order: 6,
};

export default TestPage;
