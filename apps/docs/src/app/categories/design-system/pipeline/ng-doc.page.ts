import { NgDocPage } from '@ng-doc/core';
import DesignSystemCategory from '../ng-doc.category';
import { PipelineDemoComponent } from './pipeline-demo.component';

const page: NgDocPage = {
  title: 'Data and media pipeline',
  mdFile: './index.md',
  category: DesignSystemCategory,
  order: 3,
  demos: { PipelineDemoComponent },
};

export default page;
