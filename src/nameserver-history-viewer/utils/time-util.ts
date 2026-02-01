import { isDevMode } from '@angular/core';
import { getIgnoredLineNumFromTail } from './ui-util';
import { ChartContentTime } from '../types';
import { format } from 'date-fns';
import { TZDateMini  } from '@date-fns/tz';

/**
 * get the time range for all ports
 */
function _getTotalTimeRange(time: ChartContentTime): {startTime: number, endTime: number} {
  if (time) {
    let startTime = 4102358400000; // 2099/12/31
    let endTime = 0;

    Object.keys(time).forEach(port => {
      if (time[port]) {
        const timeRangeCurrent = _getTimeRange(time[port]);
        startTime = startTime > timeRangeCurrent.startTime ? timeRangeCurrent.startTime : startTime;
        endTime = endTime < timeRangeCurrent.endTime ? timeRangeCurrent.endTime : endTime;
      }
    });

    return {startTime: startTime, endTime: endTime};
  }
  return undefined;
}

/**
 * get the time range (startTime ~ endTime) base on the time (the xScale)
 */
function _getTimeRange(time: number[]): {startTime: number, endTime: number} {
  const ignoredLineNumFromTail = getIgnoredLineNumFromTail();
  if (time) {
    let startTime = 4102358400000; // 2099/12/31
    let endTime = 0;

    const len = time.length;
    if (len > ignoredLineNumFromTail) {
      startTime = time[0] > startTime ? startTime : time[0];
      endTime = time[len - ignoredLineNumFromTail - 1] > endTime ? time[len - ignoredLineNumFromTail - 1] : endTime;
    }

    return {startTime: startTime, endTime: endTime};
  }
  return {startTime: 0, endTime: 0};
}
export function getEtcTimezones() {
        // Add Etc timezones manually since Intl doesn't include them
    const etcTimezones = [
      'Etc/GMT+0', 'Etc/GMT+1', 'Etc/GMT+2', 'Etc/GMT+3', 'Etc/GMT+4', 'Etc/GMT+5', 'Etc/GMT+6',
      'Etc/GMT+7', 'Etc/GMT+8', 'Etc/GMT+9', 'Etc/GMT+10', 'Etc/GMT+11', 'Etc/GMT+12','Etc/GMT-0',
      'Etc/GMT-1', 'Etc/GMT-2', 'Etc/GMT-3', 'Etc/GMT-4', 'Etc/GMT-5', 'Etc/GMT-6',
      'Etc/GMT-7', 'Etc/GMT-8', 'Etc/GMT-9', 'Etc/GMT-10', 'Etc/GMT-11', 'Etc/GMT-12',
      'Etc/GMT-13', 'Etc/GMT-14'
    ];

    return [...etcTimezones, ...getZeroOffsetEtcZones()];
  }
  /**
   * etc zones with 0 offset
   */
export function getZeroOffsetEtcZones() {
  return ['Etc/GMT', 'Etc/GMT0', 'Etc/Greenwich', 'Etc/UTC', 'Etc/UCT', 'Etc/Universal', 'Etc/Zulu']
}

/**
 * get default local time zone
 */
export function defaultTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * 
 * @returns get supported timezones from intl
 */
export function supportedTimezones() {
  const zones = Intl.supportedValuesOf('timeZone');
  // Combine Intl zones with Etc zones
  return [...zones, ...getEtcTimezones()];
}

/**
 * Get time from provided timezone, using this only because chart.js doesn't support timezone.
 * This function will be removed when chart.js starts to support timezone feature.
 * @param time time in seconds (Epoch time)
 * @param timezone timezone string, uses local timezone if this is null.
 */
export function getTimeFromTimeZone (time: number, timezone: string): number {
  if (timezone == null || timezone.length === 0) {
    timezone = defaultTimezone();
    console.warn(`getTimeFromTimeZone - Input timezone is null, returning the local (${timezone}) time. `);
  }
  // Get timezone offsets in milliseconds
  const utcOffset = getOffset(timezone, time * 1000);
  const currentOffset = getOffset(defaultTimezone(), time * 1000); // seconds
  // convert to utc and then to selected timezone
  return time + utcOffset - currentOffset;
}

/**
 * get timezone offsests in seconds
 */
export function getOffset(timezone: string, time: number): number {
  const date = new Date(time);
  let offset: number;
  // Handle Etc timezones specially since getTimezoneOffset doesn't support them
  if (getZeroOffsetEtcZones().includes(timezone)) {
    offset = 0;
  } else if (timezone.startsWith('Etc/GMT')) {
      // Extract the offset from the zone name
      // Note: Etc/GMT+X means UTC-X (opposite sign)
      const match = timezone.match(/Etc\/GMT([+-])(\d+)/);
      if (match) {
        const sign = match[1];
        const hours = parseInt(match[2], 10);
        offset = (sign === '+' ? -hours : +hours) * 60 * 60;
      } else {
        offset = 0;
      }
  } else {
    offset = (new TZDateMini(date, timezone)).getTimezoneOffset() * -60;
  }
  return offset;
}

/**
 * Get time formatted with the provided timezone
 */
export function getTimeString (time: number): string {
   return format(new Date(time), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Get the time range string by time array, eg: 2018-10-25 10:10:00 ~ 2018-10-25 12:12:00
 */
export function getTimeRangeString(time: any): string {
  let startTimeString = 'N/A';
  let endTimeString = 'N/A';
  let timeRange;
  if (Array.isArray(time)) {
    timeRange = _getTimeRange(time);
  } else {
    timeRange = _getTotalTimeRange(time);
  }

  if (timeRange) {
    if (timeRange.startTime < 4102358400000) {
      startTimeString = getTimeString(timeRange.startTime);
    }

    if (timeRange.endTime > 0) {
      endTimeString = getTimeString(timeRange.endTime);
    }
    return `${startTimeString} ~ ${endTimeString}`;
  }
  return 'N/A ~ N/A';
}

/**
 * print processed time from the provided beginTime, only works in dev mode
 */
export function printProcessedTime(beginTime: Date, step: string): void {
  if (isDevMode()) {
    // only do it in dev mode
    const timeAfter = new Date();
    const parsingTime = (timeAfter.getTime() - beginTime.getTime()) / 1000;
    console.log(`${step}, Parsing time: ${parsingTime} seconds`);
  }
}
