import { NgDocPage } from '@ng-doc/core';
import ViewportCategory from '../ng-doc.category';
import { CustomBackgroundDemoComponent } from './demo/custom-background-demo.component';
import { DotsCustomBackgroundDemoComponent } from './demo/dots-custom-background-demo.component';
import { GridCustomBackgroundDemoComponent } from './demo/grid-custom-background-demo.component';
import { ImageCustomBackgroundDemoComponent } from './demo/image-custom-background-demo.component';

const TestPage: NgDocPage = {
  title: 'Background',
  mdFile: './index.md',
  category: ViewportCategory,
  demos: {
    CustomBackgroundDemoComponent,
    DotsCustomBackgroundDemoComponent,
    ImageCustomBackgroundDemoComponent,
    GridCustomBackgroundDemoComponent,
  },
  order: 4,
};

export default TestPage;
