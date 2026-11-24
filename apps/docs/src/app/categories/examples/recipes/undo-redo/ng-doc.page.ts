import { NgDocPage } from '@ng-doc/core';
import RecipesCategory from '../ng-doc.category';
import { UndoRedoDemoComponent } from './demo/undo-redo-demo.component';

const UndoRedoPage: NgDocPage = {
  title: `Undo and redo`,
  mdFile: './index.md',
  category: RecipesCategory,
  demos: { UndoRedoDemoComponent },
  order: 4,
};

export default UndoRedoPage;
