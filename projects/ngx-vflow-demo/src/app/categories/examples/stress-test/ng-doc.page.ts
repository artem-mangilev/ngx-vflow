import { NgDocPage } from '@ng-doc/core';
import WorkshopsCategory from '../ng-doc.category';
import { StressTestDemoComponent } from './demo/stress-test-demo.component';

const TestPage: NgDocPage = {
  title: `Stress Test`,
  mdFile: './index.md',
  category: WorkshopsCategory,
  demos: { StressTestDemoComponent },
  order: 2,
};

export default TestPage;
