import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { VflowDemoComponent } from './demo/vflow-demo.component'

const TestPage: NgDocPage = {
  title: `Nodes`,
  mdFile: './index.md',
  category: ExamplesCategory,
  playgrounds: {
    DemoPlayground: {
      target: VflowDemoComponent,
      template: `<ng-doc-selector></ng-doc-selector>`,
    }
  }
};

export default TestPage;
