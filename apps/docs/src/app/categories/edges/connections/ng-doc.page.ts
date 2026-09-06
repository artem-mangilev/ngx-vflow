import { NgDocPage } from '@ng-doc/core';
import EdgesCategory from '../ng-doc.category';
import { DefaultConnectionDemoComponent } from './demo/default-connection-demo.component';
import { LooseConnectionDemoComponent } from './demo/loose-connection-demo.component';
import { ConnectionValidationDemoComponent } from './demo/connection-validation-demo.component';
import { ReconnectionDemoComponent } from './demo/reconnection-demo.component';

const TestPage: NgDocPage = {
  title: `Connections`,
  mdFile: './index.md',
  category: EdgesCategory,
  demos: {
    DefaultConnectionDemoComponent,
    LooseConnectionDemoComponent,
    ConnectionValidationDemoComponent,
    ReconnectionDemoComponent,
  },
  order: 2,
};

export default TestPage;
