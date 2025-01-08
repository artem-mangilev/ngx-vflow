import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category';
import { KeyboardShortcutsDemoComponent } from './demo/keyboard-shortcuts-demo.component';

const TestPage: NgDocPage = {
  title: `Keyboard shortcuts`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { KeyboardShortcutsDemoComponent },
  order: 1,
};

export default TestPage;
