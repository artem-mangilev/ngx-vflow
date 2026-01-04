import { NgDocPage } from '@ng-doc/core';
import IntroductionCategory from '../../ng-doc.category';
import { AllFeaturesDemoComponent } from './demo/all-features-demo.component';

const TestPage: NgDocPage = {
  title: `Overview`,
  mdFile: './index.md',
  category: IntroductionCategory,
  order: 1,
  demos: { AllFeaturesDemoComponent },
};

export default TestPage;
