import { NgDocPage } from '@ng-doc/core';
import IntroductionCategory from '../../ng-doc.category';
import { DesignSystemDemoComponent } from './demo.component';

const page: NgDocPage = {
  title: 'Design system',
  mdFile: './index.md',
  category: IntroductionCategory,
  order: 2,
  demos: { DesignSystemDemoComponent },
};

export default page;
