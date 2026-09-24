import { NgDocPage } from '@ng-doc/core';
import EdgesCategory from '../ng-doc.category';
import { MarkersDemoComponent } from './demo/markers-demo.component';
import { CustomMarkersDemoComponent } from './demo/custom-markers-demo.component';

const TestPage: NgDocPage = {
  title: `Markers`,
  mdFile: './index.md',
  category: EdgesCategory,
  demos: { MarkersDemoComponent, CustomMarkersDemoComponent },
  order: 7,
};

export default TestPage;
