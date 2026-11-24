import { NgDocPage } from '@ng-doc/core';
import RecipesCategory from '../ng-doc.category';
import { PersistingGraphDemoComponent } from './demo/persisting-graph-demo.component';

const PersistingGraphPage: NgDocPage = {
  title: `Persisting a graph`,
  mdFile: './index.md',
  category: RecipesCategory,
  demos: { PersistingGraphDemoComponent },
  order: 8,
};

export default PersistingGraphPage;
