import { NgDocPage } from '@ng-doc/core';
import WorkshopsCategory from '../../ng-doc.category';
import { DragAndDropNodesDemoComponent } from './demo/drag-and-drop-nodes-demo.component';

const TestPage: NgDocPage = {
  title: `Drag and drop nodes`,
  mdFile: './index.md',
  category: WorkshopsCategory,
  demos: { DragAndDropNodesDemoComponent },
  order: 2,
};

export default TestPage;
