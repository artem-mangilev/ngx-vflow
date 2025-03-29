import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category';
import { CustomHandlesDemoComponent } from './demo/custom-handles-demo.component';

const TestPage: NgDocPage = {
  title: `Custom handles`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { CustomHandlesDemoComponent },
};

export default TestPage;
