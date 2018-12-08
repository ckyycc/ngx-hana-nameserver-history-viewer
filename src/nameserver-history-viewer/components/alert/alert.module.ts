import {AlertComponent} from './alert.component';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [
    AlertComponent,
  ],
  exports: [AlertComponent],
  imports: [CommonModule],
  providers: [],
  bootstrap: [],
})
export class AlertModule {}
