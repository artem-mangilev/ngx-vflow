import { NgDocPage } from '@ng-doc/core';
import GettingStartedCategory from '../../ng-doc.category';
import { RoadmapListComponent } from './roadmap-list/roadmap-list.component';

const TestPage: NgDocPage = {
  title: `Roadmap`,
  mdFile: './index.md',
  category: GettingStartedCategory,
  order: 3,
  demos: { RoadmapListComponent },
};

export default TestPage;
