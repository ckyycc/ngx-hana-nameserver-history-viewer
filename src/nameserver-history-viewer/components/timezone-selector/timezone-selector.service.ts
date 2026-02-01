import { Injectable } from '@angular/core';
import { defaultTimezone, supportedTimezones, getOffset } from '../../utils';


export interface Timezone {
  region: string;
  zones: string[];
}

@Injectable()
export class TimezoneSelectorService {

  /**
   * get the default timezone
   */
  get defaultTimezone(): string {
    return defaultTimezone();
  }

  /**
   * Get all the timezones for each region
   */
  getZones(): Timezone[] {
    const timezones: Timezone[] = [];
    const zones = supportedTimezones();
    
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

  getFormattedZone(region, zone) {
    return `${region} - ${this._formatTimezone(zone)} ${this._getOffset(zone)}`;
  }

  private _getOffset(zone: string): string {
    const offsetMinutes = getOffset(zone, Date.now()) / 60;
    const absOffset = Math.abs(offsetMinutes);
    const hours = Math.floor(absOffset / 60);
    const minutes = absOffset % 60;
    
    return `(GMT${offsetMinutes < 0 ? '-' : '+'}${this._formatNumber(hours)}:${this._formatNumber(minutes)})`;
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

  private _formatTimezone(zone: string): string {
    const tz = zone.split('/');
    return tz[tz.length - 1].replace('_', ' ');
  }

  private _formatNumber(number): string {
    return number < 10 || !number ? `0${number}` : `${number}`;
  }
}
