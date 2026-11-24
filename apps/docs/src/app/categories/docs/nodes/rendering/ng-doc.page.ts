import { NgDocPage } from '@ng-doc/core';
import NodesCategory from '../ng-doc.category';
import { TemplateNodesDemoComponent } from './demo/template-nodes-demo.component';
import { ComponentNodesDemoComponent } from './demo/component-nodes-demo.component';
import { DefaultNodesDemoComponent } from './demo/default-nodes-demo.component';

const RenderingNodesPage: NgDocPage = {
  title: 'Rendering nodes',
  mdFile: './index.md',
  category: NodesCategory,
  demos: { TemplateNodesDemoComponent, ComponentNodesDemoComponent, DefaultNodesDemoComponent },
  order: 1,
};

export default RenderingNodesPage;
