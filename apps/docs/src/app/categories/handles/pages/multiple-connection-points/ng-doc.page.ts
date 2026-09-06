import { NgDocPage } from '@ng-doc/core';
import HandlesCategory from '../../ng-doc.category';
import { MultipleConnectionPointsDemoComponent } from './demo/multiple-connection-points-demo.component';

const TestPage: NgDocPage = {
  title: `Multiple connection points`,
  mdFile: './index.md',
  category: HandlesCategory,
  demos: { MultipleConnectionPointsDemoComponent },
  order: 2,
};

export default TestPage;
