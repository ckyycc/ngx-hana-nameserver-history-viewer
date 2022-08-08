import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { TimezoneSelectorService } from './timezone-selector.service';
import moment from 'moment-timezone';


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

  private static _formatNumber(number): string {
    return number < 10 || !number ? `0${number}` : `${number}`;
  }

  constructor(private service: TimezoneSelectorService) {
    const defaultTZ = this.service.getDefaultTimezone();
    this.timezones = this.service.getZones().map(tz => ({group: tz.region, items: tz.zones.map(zone =>
        ({id: zone, value: zone, text: this._getFormattedZone(tz.region, zone), selected: zone === defaultTZ}))}));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.timezone && changes.timezone.currentValue) {
      if (this.timezones) {
        this.timezones = this.service.getZones().map(tz => ({group: tz.region, items: tz.zones.map(zone =>
            ({id: zone, value: zone, text: this._getFormattedZone(tz.region, zone), selected: zone === changes.timezone.currentValue}))}));
      }
    }
  }

  private _getFormattedZone(region, zone) {
    return `${region} - ${this._formatTimezone(zone)} ${this._getOffset(zone)}`;
  }

  private _formatTimezone(zone: string): string {
    const tz = zone.split('/');
    return tz[tz.length - 1].replace('_', ' ');
  }

  private _getOffset(zone: string): string {
    let offset = moment.tz(zone).utcOffset();
    const neg = offset < 0;
    if (neg) {
      offset = -1 * offset;
    }
    const hours = Math.floor(offset / 60);
    const minutes = (offset / 60 - hours) * 60;
    return `(GMT${neg ? '-' : '+'}${TimezoneSelectorComponent._formatNumber(hours)}:${TimezoneSelectorComponent._formatNumber(minutes)})`;
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
