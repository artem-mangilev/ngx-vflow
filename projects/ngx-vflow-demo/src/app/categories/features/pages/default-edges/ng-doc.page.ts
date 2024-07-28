import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { DefaultEdgesDemoComponent } from './demo/default-edges-demo.component';

const TestPage: NgDocPage = {
  title: `Default edges`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { DefaultEdgesDemoComponent },
  order: 2
};

export default TestPage;
