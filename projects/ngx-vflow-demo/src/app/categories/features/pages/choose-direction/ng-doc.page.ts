import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { HandlePositionsRtlDemoComponent } from './demo/handle-positions-rtl-demo.component';
import { HandlePositionsTtbDemoComponent } from './demo/handle-positions-ttb-demo.component';

const TestPage: NgDocPage = {
  title: `Choose direction`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: {
    HandlePositionsRtlDemoComponent,
    HandlePositionsTtbDemoComponent
  },
  order: 7
};

export default TestPage;
