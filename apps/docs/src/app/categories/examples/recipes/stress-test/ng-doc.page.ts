import { NgDocPage } from '@ng-doc/core';
import { StressTestDemoComponent } from './demo/stress-test-demo.component';
import RecipesCategory from '../ng-doc.category';

const TestPage: NgDocPage = {
  title: 'Stress test',
  mdFile: './index.md',
  category: RecipesCategory,
  demos: { StressTestDemoComponent },
  order: 10,
};

export default TestPage;
