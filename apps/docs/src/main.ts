import { mergeApplicationConfig } from '@angular/core';
import { bootstrapApplication, provideClientHydration, withNoIncrementalHydration } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// A prerendered page carries the state of its server render, and the application adopts its DOM. The development
// server and the fallback page for unknown addresses are rendered in the browser: there is nothing to adopt, and
// hydration would only warn about it.
const prerendered = !!document.getElementById('ng-state');
const config = prerendered
  ? mergeApplicationConfig(appConfig, { providers: [provideClientHydration(withNoIncrementalHydration())] })
  : appConfig;

bootstrapApplication(AppComponent, config).catch((err) => console.error(err));
