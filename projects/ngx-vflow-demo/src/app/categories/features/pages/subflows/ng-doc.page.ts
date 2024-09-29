import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { SubflowsDemoComponent } from './demo/subflows-demo.component';

const TestPage: NgDocPage = {
  title: `Subflows`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { SubflowsDemoComponent },
  keyword: 'FeaturesSubflows',
  order: 1
};

export default TestPage;
