import { NgDocPage } from '@ng-doc/core';
import HandlesCategory from '../../ng-doc.category';
import { CustomHandlesDemoComponent } from './demo/custom-handles-demo.component';

const TestPage: NgDocPage = {
  title: `Custom handles`,
  mdFile: './index.md',
  category: HandlesCategory,
  demos: { CustomHandlesDemoComponent },
  order: 1,
};

export default TestPage;
