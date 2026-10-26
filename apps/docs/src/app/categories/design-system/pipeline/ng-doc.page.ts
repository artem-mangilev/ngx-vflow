import { NgDocPage } from '@ng-doc/core';
import DesignSystemCategory from '../ng-doc.category';
import { PipelineDemoComponent } from './pipeline-demo.component';

const page: NgDocPage = {
  title: 'Image pipeline',
  mdFile: './index.md',
  category: DesignSystemCategory,
  order: 4,
  demos: { PipelineDemoComponent },
};

export default page;
