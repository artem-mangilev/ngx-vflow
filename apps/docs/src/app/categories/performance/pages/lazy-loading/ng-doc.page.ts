import { NgDocPage } from '@ng-doc/core';
import PerformanceCategory from '../../ng-doc.category';
import { LazyLoadingDemoComponent } from './demo/lazy-loading-demo.component';

const TestPage: NgDocPage = {
  title: `Lazy Loading`,
  mdFile: './index.md',
  category: PerformanceCategory,
  demos: { LazyLoadingDemoComponent },
  order: 1,
};

export default TestPage;
