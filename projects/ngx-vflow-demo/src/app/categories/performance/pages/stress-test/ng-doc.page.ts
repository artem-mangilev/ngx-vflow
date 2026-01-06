import { NgDocPage } from '@ng-doc/core';
import { StressTestDemoComponent } from './demo/stress-test-demo.component';
import PerformanceCategory from '../../ng-doc.category';

const TestPage: NgDocPage = {
  title: `Stress Test`,
  mdFile: './index.md',
  category: PerformanceCategory,
  demos: { StressTestDemoComponent },
  order: 2,
};

export default TestPage;
