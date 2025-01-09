import { NgDocPage } from '@ng-doc/core';
import GettingStartedCategory from '../../ng-doc.category';
import { AllFeaturesDemoComponent } from './demo/all-features-demo.component';

const TestPage: NgDocPage = {
  title: `What is ngx-vflow`,
  mdFile: './index.md',
  category: GettingStartedCategory,
  order: 1,
  demos: { AllFeaturesDemoComponent },
};

export default TestPage;
