import { NgDocPage } from '@ng-doc/core';
import GettingStartedCategory from '../ng-doc.category';
import { ConfigurationDemoComponent } from './demo/configuration-demo.component';

const ConfigurationPage: NgDocPage = {
  title: `Configuration`,
  mdFile: './index.md',
  category: GettingStartedCategory,
  order: 4,
  demos: { ConfigurationDemoComponent },
};

export default ConfigurationPage;
