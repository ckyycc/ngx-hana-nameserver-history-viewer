import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'nshviewer-angular-datetime-picker';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'time-range-selector',
  template: `
    <div class="time-range">
      <div class="time-range-from">
        <input placeholder="Date Time Range From:"
               [disabled]="disabled"
               [(ngModel)]="dateTimeRange"
               [selectMode]="'rangeFrom'"
               [owlDateTimeTrigger]="dtRange2" [owlDateTime]="dtRange2" #dateTime2="ngModel" readonly>
        <owl-date-time #dtRange2 (afterPickerClosed)="afterPickerClosed()"></owl-date-time>
      </div>
      <div class="time-range-to">
        <input placeholder="Date Time Range To:"
               [disabled]="disabled"
               [(ngModel)]="dateTimeRange"
               [selectMode]="'rangeTo'"
               [owlDateTimeTrigger]="dtRange3" [owlDateTime]="dtRange3" #dateTime3="ngModel" readonly>
        <owl-date-time #dtRange3 (afterPickerClosed)="afterPickerClosed()"></owl-date-time>
      </div>
    </div>
  `,
  styleUrls: [ './time-range-selector.component.scss' ],
  standalone: true,
  imports: [ CommonModule, FormsModule, OwlDateTimeModule, OwlNativeDateTimeModule ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeRangeSelectorComponent {

  @Input() disabled = false;
  /**
   * selected time range
   */
  @Input() dateTimeRange: Date[];
  /**
   * for two way binding.
   */
  @Output() dateTimeRangeChange = new EventEmitter<Date[]>();

  /**
   * triggered when picker closed
   */
  afterPickerClosed() {
    this.dateTimeRangeChange.emit(this.dateTimeRange);
  }
}
