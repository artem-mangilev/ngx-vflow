import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {
  NG_DOC_DEFAULT_PAGE_PROCESSORS,
  NG_DOC_DEFAULT_PAGE_SKELETON,
  NgDocDefaultSearchEngine,
  provideMainPageProcessor,
  provideNgDocApp,
  providePageSkeleton,
  provideSearchEngine,
} from '@ng-doc/app';
import { NG_DOC_ROUTING, provideNgDocContext } from '@ng-doc/generated';
import { SECTION_TABS } from './shell/sections';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgDocApp(),
    provideNgDocContext(),
    provideSearchEngine(NgDocDefaultSearchEngine),
    providePageSkeleton(NG_DOC_DEFAULT_PAGE_SKELETON),
    provideMainPageProcessor(NG_DOC_DEFAULT_PAGE_PROCESSORS),
    provideHttpClient(),
    provideRouter(
      [
        {
          path: '',
          pathMatch: 'full',
          title: 'ngx-vflow — Angular library for node-based flows and diagrams',
          loadComponent: () => import('./landing/landing.component').then((m) => m.LandingComponent),
        },
        {
          path: 'showcase',
          title: 'Showcase — ngx-vflow',
          loadComponent: () => import('./showcase/showcase.component').then((m) => m.ShowcaseComponent),
        },
        // A section has no page of its own: its address opens the first page of the section.
        ...SECTION_TABS.filter((tab) => tab.id !== 'showcase').map((tab) => ({
          path: tab.id,
          pathMatch: 'full' as const,
          redirectTo: tab.link,
        })),
        ...NG_DOC_ROUTING,
        {
          path: '**',
          redirectTo: '',
        },
      ],
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
    provideZonelessChangeDetection(),
  ],
};
