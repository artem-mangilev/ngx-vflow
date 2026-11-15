/** A project built with ngx-vflow, shown on the landing page and on the Showcase page. */
export interface ShowcaseProject {
  name: string;
  description: string;
  image: string;
  website: string;
  repository: string;
}

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    name: 'Google ADK Web',
    description:
      'The developer UI of Google Agent Development Kit. Its Visual Builder is a workflow design environment for creating, wiring and testing agents.',
    image: 'https://google.github.io/adk-docs/assets/visual-builder.png',
    website: 'https://google.github.io/adk-docs/visual-builder/',
    repository: 'https://github.com/google/adk-web',
  },
  {
    name: 'Microcks',
    description:
      'The open source, cloud native tool for API mocking and testing, a Cloud Native Computing Foundation sandbox project. It draws live traces of API calls as a graph.',
    image: 'https://microcks.io/images/blog/microcks-1.13.0-live-traces-graph.png',
    website: 'https://microcks.io',
    repository: 'https://github.com/microcks/microcks',
  },
];
