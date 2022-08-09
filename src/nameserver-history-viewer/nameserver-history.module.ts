import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import {
  NameServerHistoryComponent,
  ProgressBarComponent,
  FileDropInputComponent,
  TimezoneSelectorComponent,
  InstructionComponent,
  PortSelectorComponent,
  TimeRangeSelectorComponent,
  AlertModule
} from './components';
import { SelectionTableModule } from 'ngx-selection-table';
import { DropdownListModule } from 'ngx-dropdown-list';

@NgModule({
  declarations: [
    NameServerHistoryComponent,
    FileDropInputComponent,
    ProgressBarComponent,
    TimezoneSelectorComponent,
    PortSelectorComponent,
    InstructionComponent,
    TimeRangeSelectorComponent
  ],
  exports: [
    NameServerHistoryComponent
  ],
  imports: [
    AlertModule,
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
