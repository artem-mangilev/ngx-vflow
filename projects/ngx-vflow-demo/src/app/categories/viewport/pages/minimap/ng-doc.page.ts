import { NgDocPage } from '@ng-doc/core';
import ViewportCategory from '../../ng-doc.category';
import { MinimapDemoComponent } from './demo/minimap-demo.component';

const TestPage: NgDocPage = {
  title: `Minimap`,
  mdFile: './index.md',
  category: ViewportCategory,
  demos: { MinimapDemoComponent },
  order: 2,
};

export default TestPage;
