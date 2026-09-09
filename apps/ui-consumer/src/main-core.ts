import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CoreScene } from './core-scene';
@Component({
  selector: 'app-root',
  host: { role: 'main' },
  imports: [CoreScene],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<h1>Core only</h1><core-scene />',
})
class App {}
bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] });
