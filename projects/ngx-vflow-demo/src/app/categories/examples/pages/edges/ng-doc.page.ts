import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { VflowEdgesDemoComponent } from './demo/vflow-edges-demo.component';

const TestPage: NgDocPage = {
  title: `Edges`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { VflowEdgesDemoComponent }
};

export default TestPage;
