import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { AllFeaturesDemoComponent } from './demo/all-features-demo.component';

const TestPage: NgDocPage = {
  title: 'Feature overview',
  mdFile: './index.md',
  category: ExamplesCategory,
  order: 1,
  demos: { AllFeaturesDemoComponent },
};

export default TestPage;
