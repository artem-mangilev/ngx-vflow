import { NgDocPage } from '@ng-doc/core';
import GettingStartedCategory from '../ng-doc.category';
import { FirstFlowComponent } from './demo/first-flow.component';

const QuickstartPage: NgDocPage = {
  title: 'Quickstart',
  mdFile: './index.md',
  category: GettingStartedCategory,
  demos: { FirstFlowComponent },
  order: 1,
};

export default QuickstartPage;
