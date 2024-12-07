import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { CustomBackgroundDemoComponent } from './demo/custom-background-demo.component';
import { DotsCustomBackgroundDemoComponent } from './demo/dots-custom-background-demo.component';
import { ImageCustomBackgroundDemoComponent } from './demo/image-custom-background-demo.component';

const TestPage: NgDocPage = {
  title: `Custom background`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: {
    CustomBackgroundDemoComponent,
    DotsCustomBackgroundDemoComponent,
    ImageCustomBackgroundDemoComponent
  },
  order: 11
};

export default TestPage;
