import { NgDocPage } from '@ng-doc/core';
import NodesCategory from '../ng-doc.category';
import { TemplateGroupResizerDemoComponent } from './demo/template-group-resizer-demo.component';
import { TemplateNodeResizerDemoComponent } from './demo/template-node-resizer-demo.component';

const TestPage: NgDocPage = {
  title: `Resizer`,
  mdFile: './index.md',
  category: NodesCategory,
  demos: {
    TemplateGroupResizerDemoComponent,
    TemplateNodeResizerDemoComponent,
  },
  order: 4,
};

export default TestPage;
