import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { CustomNodesDemoComponent } from './demo/custom-nodes-demo.component';

const TestPage: NgDocPage = {
  title: `Custom nodes`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { CustomNodesDemoComponent },
  order: 2
};

export default TestPage;
