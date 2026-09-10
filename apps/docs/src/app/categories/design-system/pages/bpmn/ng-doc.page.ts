import { NgDocPage } from '@ng-doc/core';
import DesignSystemCategory from '../../ng-doc.category';
import { BpmnDemoComponent } from './bpmn-demo.component';

const page: NgDocPage = {
  title: 'BPMN',
  mdFile: './index.md',
  category: DesignSystemCategory,
  order: 6,
  demos: { BpmnDemoComponent },
};
export default page;
