import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideClientHydration, withNoIncrementalHydration } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

/**
 * The application as the build prerenders it: every route is rendered into its own `index.html`. The state of the
 * render is written into the page for the hydration that `main.ts` turns on when it finds that state.
 */
export const serverConfig: ApplicationConfig = mergeApplicationConfig(appConfig, {
  providers: [provideServerRendering(), provideClientHydration(withNoIncrementalHydration())],
});
