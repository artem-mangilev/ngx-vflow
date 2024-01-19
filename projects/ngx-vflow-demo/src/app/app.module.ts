import { NgDocRootComponent, NgDocNavbarComponent, NgDocSidebarComponent, provideNgDocApp, provideSearchEngine, NgDocDefaultSearchEngine, providePageSkeleton, NG_DOC_DEFAULT_PAGE_SKELETON, provideMainPageProcessor, NG_DOC_DEFAULT_PAGE_PROCESSORS } from "@ng-doc/app";
import { NG_DOC_ROUTING, provideNgDocContext } from "@ng-doc/generated";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VDocModule, VflowModule } from '../../../ngx-vflow-lib/src/public-api';
import { ButtonComponent } from './components/button/button.component';
import { FormComponent } from './components/form/form.component';
import { provideHttpClient } from "@angular/common/http";

@NgModule({
  declarations: [
    AppComponent,
    ButtonComponent,
    FormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    VDocModule,
    VflowModule,
    NgDocRootComponent,
    NgDocNavbarComponent,
    NgDocSidebarComponent,
  ],
  providers: [
    provideNgDocContext(),
    provideNgDocApp({ defaultThemeId: 'auto' }),
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
