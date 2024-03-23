import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { CustomBackgroundDemoComponent } from './demo/custom-background-demo.component';

const TestPage: NgDocPage = {
  title: `Custom background`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { CustomBackgroundDemoComponent },
  order: 11
};

export default TestPage;
