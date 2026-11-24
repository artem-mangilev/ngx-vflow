import { NgDocPage } from '@ng-doc/core';
import RecipesCategory from '../ng-doc.category';
import { AddNodeOnDropDemoComponent } from './demo/add-node-on-drop-demo.component';

const AddNodeOnDropPage: NgDocPage = {
  title: `Add a node on drop`,
  mdFile: './index.md',
  category: RecipesCategory,
  demos: { AddNodeOnDropDemoComponent },
  order: 7,
};

export default AddNodeOnDropPage;
