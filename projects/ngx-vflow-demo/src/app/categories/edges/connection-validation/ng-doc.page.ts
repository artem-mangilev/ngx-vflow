import { NgDocPage } from '@ng-doc/core';
import EdgesCategory from '../ng-doc.category';
import { ConnectionValidationDemoComponent } from './demo/connection-validation-demo.component';

const TestPage: NgDocPage = {
  title: `Connection validation`,
  mdFile: './index.md',
  category: EdgesCategory,
  demos: { ConnectionValidationDemoComponent },
  order: 4,
};

export default TestPage;
