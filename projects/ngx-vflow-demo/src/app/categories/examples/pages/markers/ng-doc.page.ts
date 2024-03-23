import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category';
import { MarkersDemoComponent } from './demo/markers-demo.component';

const TestPage: NgDocPage = {
  title: `Markers`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { MarkersDemoComponent },
  order: 5
};

export default TestPage;
