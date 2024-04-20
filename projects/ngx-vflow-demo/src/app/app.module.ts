import { NG_DOC_DEFAULT_THEME_ID, NgDocRootComponent, NgDocNavbarComponent, NgDocSidebarComponent, provideNgDocApp, provideSearchEngine, NgDocDefaultSearchEngine, providePageSkeleton, NG_DOC_DEFAULT_PAGE_SKELETON, provideMainPageProcessor, NG_DOC_DEFAULT_PAGE_PROCESSORS, NG_DOC_THEME } from "@ng-doc/app";
import { NG_DOC_ROUTING, provideNgDocContext } from "@ng-doc/generated";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VflowModule } from '../../../ngx-vflow-lib/src/public-api';
import { provideHttpClient } from "@angular/common/http";

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    VflowModule,
    NgDocRootComponent,
    NgDocNavbarComponent,
    NgDocSidebarComponent,
  ],
  providers: [
    provideNgDocApp({
      defaultThemeId: 'vflow-theme-dark',
      themes: [
        {
          id: 'vflow-theme-dark',
          path: 'assets/themes/vflow-theme-dark.css'
        }
      ]
    }),
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
          redirectTo: 'getting-started/what-is-ngx-vflow',
          pathMatch: 'full',
        },
      ],
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
