import { NgDocPage } from '@ng-doc/core';
import InteractionsCategory from '../../ng-doc.category';
import { KeyboardShortcutsDemoComponent } from './demo/keyboard-shortcuts-demo.component';

const TestPage: NgDocPage = {
  title: `Keyboard shortcuts`,
  mdFile: './index.md',
  category: InteractionsCategory,
  demos: { KeyboardShortcutsDemoComponent },
  order: 2,
};

export default TestPage;
