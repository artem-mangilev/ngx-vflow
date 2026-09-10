import { NgDocPage } from '@ng-doc/core';
import DesignSystemCategory from '../../ng-doc.category';
import { WorkflowDemoComponent } from './workflow-demo.component';

const page: NgDocPage = {
  title: 'Workflow',
  mdFile: './index.md',
  category: DesignSystemCategory,
  order: 2,
  demos: { WorkflowDemoComponent },
};
export default page;
