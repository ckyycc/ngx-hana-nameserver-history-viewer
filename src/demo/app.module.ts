import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';

import { NameserverHistoryModule } from '../nameserver-history-viewer';
import { DropdownListModule } from 'ngx-dropdown-list';
import { AlertModule } from '../nameserver-history-viewer/components/alert';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    NameserverHistoryModule,
    DropdownListModule,
    AlertModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  entryComponents: [],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

