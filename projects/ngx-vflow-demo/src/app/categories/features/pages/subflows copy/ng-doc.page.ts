import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { MinimapDemoComponent } from './demo/minimap-demo.component';

const TestPage: NgDocPage = {
  title: `Minimap`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { MinimapDemoComponent },
  order: 1
};

export default TestPage;
