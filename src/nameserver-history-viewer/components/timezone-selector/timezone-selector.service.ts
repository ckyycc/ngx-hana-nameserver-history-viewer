import { Injectable } from '@angular/core';
import { getDefaultTimezone } from '../../utils';
import moment from 'moment-timezone';


export interface Timezone {
  region: string;
  zones: string[];
}

@Injectable()
export class TimezoneSelectorService {

  /**
   * get the default timezone
   */
  getDefaultTimezone(): string {
    return getDefaultTimezone();
  }

  /**
   * Get all the timezones for each region
   */
  getZones(): Timezone[] {
    const timezones: Timezone[] = [];
    const zones = moment.tz.names();
    zones.forEach(zone => {
      // get region
      let region;
      if (zone.indexOf('/') > 0) {
        region = zone.slice(0, zone.indexOf('/'));
        this._buildTimezones(timezones, region, zone);
      }
    });
    return timezones;
  }

  /**
   * build timezone lists
   */
  private _buildTimezones(timezones: Timezone[], region: string, zone: string): void {
    if (timezones) {
      let timezoneRegion =  timezones.find(tz => tz.region === region);
      if (!timezoneRegion) {
        timezoneRegion = {region: region, zones: []};
        timezones.push(timezoneRegion);
      }
      timezoneRegion.zones.push(zone);
    }
  }
}
