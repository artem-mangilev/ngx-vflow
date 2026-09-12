import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CoreAppComponent } from './app/core-app.component';

// Consumer of the built ngx-vflow package only: own templates, no @vflow/ui import and no UI stylesheet.
bootstrapApplication(CoreAppComponent, { providers: [provideZonelessChangeDetection()] }).catch((error) =>
  console.error(error),
);
