import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { UiAppComponent } from './app/ui-app.component';

// Consumer of the built packages: ngx-vflow, and the parts and the theme the built @vflow/cli generated.
bootstrapApplication(UiAppComponent, { providers: [provideZonelessChangeDetection()] }).catch((error) =>
  console.error(error),
);
