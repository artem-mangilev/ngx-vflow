import { NgDocPage } from '@ng-doc/core';
import InteractionsCategory from '../../ng-doc.category';
import { KeyboardNavigationDemoComponent } from './demo/keyboard-navigation-demo.component';
import { AccessibilityDemoComponent } from './demo/accessibility-demo.component';

const page: NgDocPage = {
  title: 'Accessibility',
  mdFile: './index.md',
  category: InteractionsCategory,
  demos: { AccessibilityDemoComponent, KeyboardNavigationDemoComponent },
  order: 4,
};

export default page;
