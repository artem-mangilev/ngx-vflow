import {
  NgDocRootComponent,
  NgDocNavbarComponent,
  NgDocSidebarComponent,
  provideNgDocApp,
  provideSearchEngine,
  NgDocDefaultSearchEngine,
  providePageSkeleton,
  NG_DOC_DEFAULT_PAGE_SKELETON,
  provideMainPageProcessor,
  NG_DOC_DEFAULT_PAGE_PROCESSORS,
  NgDocThemeToggleComponent,
} from '@ng-doc/app';
import { NG_DOC_ROUTING, provideNgDocContext } from '@ng-doc/generated';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NgModule, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Vflow } from '../../../ngx-vflow-lib/src/public-api';
import { provideHttpClient } from '@angular/common/http';
import { NgDocButtonIconComponent, NgDocIconComponent, NgDocTooltipDirective } from '@ng-doc/ui-kit';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ...Vflow,
    NgDocRootComponent,
    NgDocNavbarComponent,
    NgDocSidebarComponent,
    NgDocThemeToggleComponent,
    NgDocIconComponent,
    NgDocButtonIconComponent,
    NgDocTooltipDirective,
  ],
  providers: [
    provideNgDocApp(),
    provideNgDocContext(),
    provideSearchEngine(NgDocDefaultSearchEngine),
    providePageSkeleton(NG_DOC_DEFAULT_PAGE_SKELETON),
    provideMainPageProcessor(NG_DOC_DEFAULT_PAGE_PROCESSORS),
    provideAnimations(),
    provideHttpClient(),
    provideRouter(
      [
        ...NG_DOC_ROUTING,
        {
          path: '**',
          redirectTo: 'introduction/overview',
          pathMatch: 'full',
        },
      ],
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
    provideExperimentalZonelessChangeDetection(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
