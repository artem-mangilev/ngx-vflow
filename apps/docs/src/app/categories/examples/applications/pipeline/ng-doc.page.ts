import { NgDocPage } from '@ng-doc/core';
import ApplicationsCategory from '../ng-doc.category';
import { PipelineDemoComponent } from './pipeline-demo.component';

const page: NgDocPage = {
  title: 'Image pipeline',
  mdFile: './index.md',
  category: ApplicationsCategory,
  order: 4,
  demos: { PipelineDemoComponent },
};

export default page;
