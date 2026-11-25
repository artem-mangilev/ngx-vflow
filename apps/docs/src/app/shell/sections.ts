import { NgDocNavigation } from '@ng-doc/app/interfaces';

/** A top-level section of the site: a tab of the header with its own sidebar. */
export type Section = 'docs' | 'examples' | 'packages';

export interface SectionTab {
  title: string;
  /** Where the tab leads. */
  link: string;
  /** The section the tab opens, or the first URL segment of a page without a sidebar. */
  id: Section | 'showcase';
}

export const SECTION_TABS: SectionTab[] = [
  { id: 'docs', title: 'Docs', link: '/docs/getting-started/quickstart' },
  { id: 'examples', title: 'Examples', link: '/examples/feature-overview' },
  { id: 'packages', title: 'Packages', link: '/packages/ui/overview' },
  { id: 'showcase', title: 'Showcase', link: '/showcase' },
];

/** Where the site is published. */
const SITE = 'https://www.ngx-vflow.org';

/**
 * The public address of a page. A page is the `index.html` of its folder, which the hosting serves at the address
 * with a slash at the end, so that is the form the canonical link and the sitemap use.
 * @param url - The router URL.
 */
export function pageAddress(url: string): string {
  const path = url.split(/[?#]/)[0].replace(/\/+$/, '');

  return `${SITE}${path}/`;
}

/** The API reference has no category of its own; it belongs to the Docs section. */
const API_ROUTE = '/api';

/**
 * The tab a URL belongs to, by its first segment.
 * @param url - The router URL.
 */
export function tabOfUrl(url: string): SectionTab['id'] | null {
  const segment = url.split(/[/?#]/).filter(Boolean)[0];

  if (segment === 'api') return 'docs';

  return SECTION_TABS.find((tab) => tab.id === segment)?.id ?? null;
}

/**
 * The sidebar items of a section: the children of its category, and the API reference for Docs.
 * @param navigation - The navigation of the whole site.
 * @param section - The section to show.
 */
export function navigationOfSection(navigation: NgDocNavigation[], section: Section): NgDocNavigation[] {
  const children = navigation.find((item) => item.route === `/${section}`)?.children ?? [];

  return section === 'docs' ? [...children, ...navigation.filter((item) => item.route === API_ROUTE)] : children;
}
