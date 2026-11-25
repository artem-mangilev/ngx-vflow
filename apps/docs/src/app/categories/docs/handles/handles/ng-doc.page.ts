import { NgDocPage } from '@ng-doc/core';
import HandlesCategory from '../ng-doc.category';
import { HandleStatesDemoComponent } from './demo/handle-states-demo.component';
import { MultipleConnectionPointsDemoComponent } from './demo/multiple-connection-points-demo.component';
import { FloatingEdgesDemoComponent } from './demo/floating-edges-demo.component';

const TestPage: NgDocPage = {
  title: 'Handles',
  mdFile: './index.md',
  category: HandlesCategory,
  demos: { HandleStatesDemoComponent, MultipleConnectionPointsDemoComponent, FloatingEdgesDemoComponent },
  order: 1,
};

export default TestPage;
