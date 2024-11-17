import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { NodeToolbarDemoComponent } from './demo/node-toolbar-demo.component';

const TestPage: NgDocPage = {
  title: `Node toolbar`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { NodeToolbarDemoComponent },
};

export default TestPage;
