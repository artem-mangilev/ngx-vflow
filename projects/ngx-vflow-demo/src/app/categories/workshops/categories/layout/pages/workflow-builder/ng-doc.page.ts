import { NgDocPage } from '@ng-doc/core';
import { WorkflowBuilderDemoComponent } from './demo/workflow-builder-demo.component';
import LayoutCategory from '../../ng-doc.category';

const TestPage: NgDocPage = {
  title: `Workflow builder`,
  mdFile: './index.md',
  category: LayoutCategory,
  demos: { WorkflowBuilderDemoComponent },
  order: 2
};

export default TestPage;
