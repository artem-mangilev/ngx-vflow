import { NgDocPage } from '@ng-doc/core';
import WorkshopsCategory from '../../ng-doc.category'
import { WorkflowBuilderDemoComponent } from './demo/workflow-builder-demo.component';

const TestPage: NgDocPage = {
  title: `Workflow builder`,
  mdFile: './index.md',
  category: WorkshopsCategory,
  demos: { WorkflowBuilderDemoComponent },
  order: 2
};

export default TestPage;
