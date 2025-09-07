import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category';
import { LazyLoadingDemoComponent } from './demo/lazy-loading-demo.component';

const TestPage: NgDocPage = {
  title: `Lazy Loading`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { LazyLoadingDemoComponent },
};

export default TestPage;
