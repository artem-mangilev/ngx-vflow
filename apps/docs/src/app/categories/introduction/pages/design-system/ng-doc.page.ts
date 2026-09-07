import { NgDocPage } from '@ng-doc/core';
import IntroductionCategory from '../../ng-doc.category';
import { WorkflowDemoComponent } from './workflow-demo.component';
import { EntitiesDemoComponent } from './entities-demo.component';
import { BpmnDemoComponent } from './bpmn-demo.component';

const page: NgDocPage = {
  title: 'Design system',
  mdFile: './index.md',
  category: IntroductionCategory,
  order: 2,
  demos: { WorkflowDemoComponent, EntitiesDemoComponent, BpmnDemoComponent },
};

export default page;
