import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VDocModule } from '../../../ngx-vflow-lib/src/public-api';
import { ButtonComponent } from './components/button/button.component';
import { FormComponent } from './components/form/form.component';

@NgModule({
  declarations: [
    AppComponent,
    ButtonComponent,
    FormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    VDocModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
