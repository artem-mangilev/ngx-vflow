import { NgDocPage } from '@ng-doc/core';
import WorkshopsCategory from '../ng-doc.category';
import { PersistingGraphDemoComponent } from './demo/persisting-graph-demo.component';

/**
 * @status:info NEW
 */
const PersistingGraphPage: NgDocPage = {
  title: `Persisting a graph`,
  mdFile: './index.md',
  category: WorkshopsCategory,
  demos: { PersistingGraphDemoComponent },
  order: 1,
};

export default PersistingGraphPage;
