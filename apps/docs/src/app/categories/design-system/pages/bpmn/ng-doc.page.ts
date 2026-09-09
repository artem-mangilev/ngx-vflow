import { NgDocPage } from '@ng-doc/core';
import DesignSystemCategory from '../../ng-doc.category';
import { BpmnDemoComponent } from '../../demos/bpmn-demo.component';

const page: NgDocPage = {
  title: 'BPMN',
  mdFile: './index.md',
  category: DesignSystemCategory,
  order: 4,
  demos: { BpmnDemoComponent },
};
export default page;
