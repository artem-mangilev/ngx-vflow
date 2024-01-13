import { NgDocPage } from '@ng-doc/core';
import { VdocDemoComponent } from './demo/vdoc-demo.component'
import ExamplesCategory from '../../ng-doc.category'

const TestPage: NgDocPage = {
  title: `Vector Document`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { VdocDemoComponent }
};

export default TestPage;
