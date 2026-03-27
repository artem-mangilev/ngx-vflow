import { NgDocPage } from '@ng-doc/core';
import WorkshopsCategory from '../ng-doc.category';
import { MermaidClonePaidDemoComponent } from './demo/mermaid-clone-paid-demo.component';

/**
 * @status:primary STUDIO
 */
const Page: NgDocPage = {
  title: `Mermaid Clone`,
  mdFile: './index.md',
  category: WorkshopsCategory,
  order: 3,
  demos: { MermaidClonePaidDemoComponent },
};

export default Page;
