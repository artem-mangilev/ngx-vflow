import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VDocModule } from '../../../ngx-vflow-lib/src/public-api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    VDocModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
