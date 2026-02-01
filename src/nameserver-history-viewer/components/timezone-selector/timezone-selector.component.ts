import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { TimezoneSelectorService } from './timezone-selector.service';
import { DropdownListComponent } from 'ngx-dropdown-list';


@Component({
  selector: 'timezone-selector',
  template: `
    <ngx-dropdown-list (selectionChange)="onChange($event)"
                       [items]="timezones"
                       [multiSelection]="false"
                       [placeHolder]="'Timezones'"
                       [(selectedValue)]="timezone"
                       [filterBox]="true"
                       [disabled]="disabled"
                       [allowClear]="false">
    </ngx-dropdown-list>
  `,
  providers: [ TimezoneSelectorService ],
  imports: [ DropdownListComponent ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimezoneSelectorComponent implements OnChanges {

  @Input() disabled = false;
  @Input() timezone: string;
  @Output() timezoneChange = new EventEmitter<string>();

  /**
   * all time zones for each region
   */
  timezones: any[];

  constructor(private service: TimezoneSelectorService) {
    const defaultTZ = this.service.defaultTimezone;
    this.timezones = this.service.getZones().map(tz => ({group: tz.region, items: tz.zones.map(zone =>
        ({id: zone, value: zone, text: this.service.getFormattedZone(tz.region, zone), selected: zone === defaultTZ}))}));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['timezone'] && changes['timezone'].currentValue) {
      if (this.timezones) {
        this.timezones = this.service.getZones().map(tz => ({group: tz.region, items: tz.zones.map(zone =>
            ({id: zone, value: zone, text: this.service.getFormattedZone(tz.region, zone), selected: zone === changes['timezone'].currentValue}))}));
      }
    }
  }


  /**
   * onChange function called by the "ngx-select" element
   * @param selectedTimezone The timezone string selected
   */
  onChange(selectedTimezone: string) {
    this.timezone = selectedTimezone;
    this.timezoneChange.emit(this.timezone);
  }
}
