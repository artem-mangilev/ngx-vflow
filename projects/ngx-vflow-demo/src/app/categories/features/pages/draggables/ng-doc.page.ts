import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { DraggablesDemoComponent } from './demo/draggables-demo.component';
import { DragHandleDemoComponent } from './demo/drag-handle-demo/drag-handle-demo.component';

const TestPage: NgDocPage = {
  title: `Draggables`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { DraggablesDemoComponent, DragHandleDemoComponent },
  order: 9
};

export default TestPage;
