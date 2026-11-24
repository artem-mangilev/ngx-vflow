import { NgDocPage } from '@ng-doc/core';
import RecipesCategory from '../ng-doc.category';
import { AccessibilityDemoComponent } from './demo/accessibility-demo.component';

const AccessibilityRecipePage: NgDocPage = {
  title: `Accessibility`,
  mdFile: './index.md',
  category: RecipesCategory,
  demos: { AccessibilityDemoComponent },
  order: 4,
};

export default AccessibilityRecipePage;
