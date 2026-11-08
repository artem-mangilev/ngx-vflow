import { NgDocPage } from '@ng-doc/core';
import IntroductionCategory from '../../ng-doc.category';
import { ConfigurationDemoComponent } from './demo/configuration-demo.component';

/**
 * @status:info NEW
 */
const ConfigurationPage: NgDocPage = {
  title: `Configuration`,
  mdFile: './index.md',
  category: IntroductionCategory,
  order: 2,
  demos: { ConfigurationDemoComponent },
};

export default ConfigurationPage;
