import { isDevMode } from '@angular/core';
import { getIgnoredLineNumFromTail } from './ui-util';
import { ChartContentTime } from '../types';
import * as momentImported from 'moment-timezone';

// workaround for fixing following error when doing packagr: Cannot call a namespace ('moment')
const moment = momentImported;
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
}

/**
 * get default local time zone
 */
export function getDefaultTimezone(): string {
  return moment.tz.guess();
}

/**
 * Get time from provided timezone, using this only because chart.js doesn't support timezone.
 * This function will be removed when chart.js starts to support timezone feature.
 * @param time time in seconds (Epoch time)
 * @param timezone timezone string, uses local timezone if this is null.
 */
export function getTimeFromTimeZone (time: number, timezone: string): number {
  if (timezone == null) {
    timezone = getDefaultTimezone();
    console.warn(`getTimeFromTimeZone - Input timezone is null, returning the local (${timezone}) time. `);
  }
  const utcOffset = moment.tz.zone(timezone).utcOffset(time * 1000);
  const currentOffset = moment.tz.zone(getDefaultTimezone()).utcOffset(time * 1000);
  // convert to utc and then to selected timezone
  return time + currentOffset * 60 - utcOffset * 60;
}

/**
 * Get time formatted with the provided timezone
 */
export function getTimeString (time: number): string {
  return moment(time).format('YYYY-MM-DD HH:mm:ss');
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
