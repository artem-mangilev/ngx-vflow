import { NgDocPage } from '@ng-doc/core';
import RecipesCategory from '../ng-doc.category';
import { ContextMenuDemoComponent } from './demo/context-menu-demo.component';

const ContextMenuPage: NgDocPage = {
  title: `Context menu`,
  mdFile: './index.md',
  category: RecipesCategory,
  demos: { ContextMenuDemoComponent },
  order: 6,
};

export default ContextMenuPage;
