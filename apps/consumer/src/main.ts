import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { UiAppComponent } from './app/ui-app.component';

// Consumer of the built packages: ngx-vflow, @vflow/ui and @vflow/ui/bpmn with the compiled stylesheet.
bootstrapApplication(UiAppComponent, { providers: [provideZonelessChangeDetection()] }).catch((error) =>
  console.error(error),
);
