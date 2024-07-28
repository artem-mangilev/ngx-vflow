import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { DraggablesDemoComponent } from './demo/draggables-demo.component';

const TestPage: NgDocPage = {
  title: `Draggables`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { DraggablesDemoComponent },
  order: 9
};

export default TestPage;
