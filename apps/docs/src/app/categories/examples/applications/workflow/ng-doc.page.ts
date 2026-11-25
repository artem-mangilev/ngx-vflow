import { NgDocPage } from '@ng-doc/core';
import ApplicationsCategory from '../ng-doc.category';
import { WorkflowDemoComponent } from './workflow-demo.component';

const page: NgDocPage = {
  title: 'Workflow',
  mdFile: './index.md',
  category: ApplicationsCategory,
  order: 3,
  demos: { WorkflowDemoComponent },
};

export default page;
