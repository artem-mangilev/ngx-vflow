import { NgDocPage } from '@ng-doc/core';
import GraphCategory from '../ng-doc.category';
import { PersistingGraphDemoComponent } from './demo/persisting-graph-demo.component';

const PersistingGraphPage: NgDocPage = {
  title: `Persisting a graph`,
  mdFile: './index.md',
  category: GraphCategory,
  demos: { PersistingGraphDemoComponent },
  order: 3,
};

export default PersistingGraphPage;
