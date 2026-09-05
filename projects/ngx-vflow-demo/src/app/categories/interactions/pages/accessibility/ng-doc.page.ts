import { NgDocPage } from '@ng-doc/core';
import InteractionsCategory from '../../ng-doc.category';
import { AccessibilityDemoComponent } from './demo/accessibility-demo.component';

const page: NgDocPage = {
  title: 'Accessibility',
  mdFile: './index.md',
  category: InteractionsCategory,
  demos: { AccessibilityDemoComponent },
  order: 4,
};

export default page;
