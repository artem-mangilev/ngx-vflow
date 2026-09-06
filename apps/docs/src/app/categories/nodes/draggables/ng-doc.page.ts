import { NgDocPage } from '@ng-doc/core';
import NodesCategory from '../ng-doc.category';
import { DraggablesDemoComponent } from './demo/draggables-demo.component';
import { DragHandleDemoComponent } from './demo/drag-handle-demo/drag-handle-demo.component';

const TestPage: NgDocPage = {
  title: `Draggables`,
  mdFile: './index.md',
  category: NodesCategory,
  demos: { DraggablesDemoComponent, DragHandleDemoComponent },
  order: 6,
};

export default TestPage;
