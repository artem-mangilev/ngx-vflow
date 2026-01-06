import { NgDocPage } from '@ng-doc/core';
import PerformanceCategory from '../../ng-doc.category';
import { VirtualizationDemoComponent } from './demo/virtualization-demo.component';

const TestPage: NgDocPage = {
  title: `Virtualization`,
  mdFile: './index.md',
  category: PerformanceCategory,
  demos: { VirtualizationDemoComponent },
  order: 2,
};

export default TestPage;
