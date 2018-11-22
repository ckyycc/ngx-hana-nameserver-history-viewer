import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import {
  NameServerHistoryComponent,
  ProgressBarComponent,
  AlertComponent,
  FileDropInputComponent,
  TimezoneSelectorComponent,
  InstructionComponent,
  PortSelectorComponent,
  TimeRangeSelectorComponent
} from './components';
import { SelectionTableModule } from 'ngx-selection-table';
import { DropdownListModule } from 'ngx-dropdown-list';

@NgModule({
  declarations: [
    NameServerHistoryComponent,
    FileDropInputComponent,
    ProgressBarComponent,
    AlertComponent,
    TimezoneSelectorComponent,
    PortSelectorComponent,
    InstructionComponent,
    TimeRangeSelectorComponent
  ],
  exports: [
    NameServerHistoryComponent
  ],
  imports: [
    SelectionTableModule,
    DropdownListModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    CommonModule,
    FormsModule
  ],
  entryComponents: [],
  providers: [],
  bootstrap: []
})
export class NameserverHistoryModule {}
