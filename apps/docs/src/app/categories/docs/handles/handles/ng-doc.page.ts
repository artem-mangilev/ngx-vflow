import { NgDocPage } from '@ng-doc/core';
import HandlesCategory from '../ng-doc.category';
import { CustomHandlesDemoComponent } from './demo/custom-handles-demo.component';
import { MultipleConnectionPointsDemoComponent } from './demo/multiple-connection-points-demo.component';
import { FloatingEdgesDemoComponent } from './demo/floating-edges-demo.component';

const TestPage: NgDocPage = {
  title: 'Handles',
  mdFile: './index.md',
  category: HandlesCategory,
  demos: { CustomHandlesDemoComponent, MultipleConnectionPointsDemoComponent, FloatingEdgesDemoComponent },
  order: 1,
};

export default TestPage;
