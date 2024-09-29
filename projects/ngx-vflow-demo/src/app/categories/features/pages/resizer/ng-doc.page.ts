import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { DefaultGroupResizerDemoComponent } from './demo/default-group-resizer-demo.component';
import { TemplateGroupResizerDemoComponent } from './demo/template-group-resizer-demo.component';
import { TemplateNodeResizerDemoComponent } from './demo/template-node-resizer-demo.component';

const TestPage: NgDocPage = {
  title: `Resizer`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: {
    DefaultGroupResizerDemoComponent,
    TemplateGroupResizerDemoComponent,
    TemplateNodeResizerDemoComponent
  },
  order: 1
};

export default TestPage;
