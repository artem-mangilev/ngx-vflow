import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { withNgDocContentReady } from '@ng-doc/app';

import { AppComponent } from './app/app.component';
import { serverConfig } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, serverConfig, context);

// A page is serialized once NgDoc has loaded and processed its content: without the wait a prerendered page can
// miss it.
export default withNgDocContentReady(bootstrap);
