import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { VflowDemoComponent } from './demo/vflow-demo.component'

const TestPage: NgDocPage = {
  title: `Nodes`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { VflowDemoComponent }
};

export default TestPage;
