import { NgDocPage } from '@ng-doc/core';
import ViewportCategory from '../ng-doc.category';
import { AlignmentHelperDemoComponent } from './demo/alignment-helper-demo.component';
import { SnapToGridDemoComponent } from './demo/snap-to-grid-demo.component';

const TestPage: NgDocPage = {
  title: 'Snapping and alignment',
  mdFile: './index.md',
  category: ViewportCategory,
  demos: { AlignmentHelperDemoComponent, SnapToGridDemoComponent },
  order: 6,
};

export default TestPage;
