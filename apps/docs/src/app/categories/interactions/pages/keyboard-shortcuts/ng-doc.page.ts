import { NgDocPage } from '@ng-doc/core';
import InteractionsCategory from '../../ng-doc.category';
import { KeyboardShortcutsDemoComponent } from './demo/keyboard-shortcuts-demo.component';
import { ShortcutsConfigurationDemoComponent } from './demo/shortcuts-configuration-demo.component';

const TestPage: NgDocPage = {
  title: `Keyboard shortcuts`,
  mdFile: './index.md',
  category: InteractionsCategory,
  demos: { KeyboardShortcutsDemoComponent, ShortcutsConfigurationDemoComponent },
  order: 3,
};

export default TestPage;
