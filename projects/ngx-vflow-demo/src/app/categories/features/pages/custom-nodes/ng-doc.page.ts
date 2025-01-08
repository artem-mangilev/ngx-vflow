import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category';
import { CustomNodesDemoComponent } from './demo/custom-nodes-demo.component';
import { CustomComponentNodesDemoComponent } from './demo/custom-component-nodes-demo.component';

const TestPage: NgDocPage = {
  title: `Custom nodes`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { CustomNodesDemoComponent, CustomComponentNodesDemoComponent },
  keyword: `FeaturesCustomNodes`,
  order: 2,
};

export default TestPage;
