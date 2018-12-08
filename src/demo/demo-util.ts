import {TimeZoneAbbrMapping} from './demo-service';
import * as moment from 'moment-timezone';

/**
 * interface for the abbreviation and offset getting from topology.txt
 */
export interface TimeZoneAbbrOffset {
  abbreviation: string;
  offset: number;
}
/**
 * save data to related local storage
 * @param name local storage item name
 * @param data data that needs to be saved in local storage
 */
export function setLocalStorage(name, data) {
  if (name == null || name.length === 0) {
    return;
  }
  if (data) {
    localStorage.setItem(name, JSON.stringify(data));
  } else {
    localStorage.removeItem(name);
  }
}

/**
 * get data from local storage
 * @param name local storage item name
 */
export function getLocalStorage(name): any {
  if (name == null || name.length === 0) {
    return undefined;
  }

  const data = localStorage.getItem(name);
  if (data != null) {
    return JSON.parse(data);
  } else {
    return undefined;
  }
}

/**
 * get timezone from topology.txt
 * @param abbreviation the abbreviation of timezone
 * @param offset offset of timezone
 * @param tzAbbrMappings mappings of timezone and abbreviation
 */
export function getTimeZoneFromTopology(abbreviation: string, offset: number, tzAbbrMappings: TimeZoneAbbrMapping[]): string {
  if (abbreviation == null || offset == null) {
    return null;
  }
  // if abbreviation is number, get GMT timezone from moment.js
  if (!isNaN(Number(abbreviation))) {
    const tzNum = Number(abbreviation);
    const etcGMTTZ = `Etc/GMT${tzNum > 0 ? '-' : '+'}${Math.abs(tzNum)}`;
    // get GMT timezone
    for (const name of moment.tz.names()) {
      if (name === etcGMTTZ) {
        return name;
      }
    }
  }

  // get timezone base on timezone name
  for (const name of moment.tz.names()) {
    if (name.indexOf('/') > 0) {
      if (name === abbreviation) {
        return name;
      }
    }
  }

  // define all the regions
  const tzRegions = ['Etc', 'Europe', 'America', 'Africa', 'Antarctica', 'Arctic', 'Asia', 'Atlantic', 'Australia', 'Pacific', 'Indian'];
  // get timezone base on abbreviation and offset
  for (const region of tzRegions) {
    for (const mapping of tzAbbrMappings) {
      if (mapping.timezone.startsWith(region)) {
        if (mapping.abbreviation === abbreviation && Math.abs(mapping.offset - offset) < 1) {
          return mapping.timezone;
        }
      }
    }
  }
  return null;
}

/**
 * get the timezone(abbreviation) and offset from content of topology.txt
 * @param fileContent the content of topology.txt
 */
export function getAbbreviationAndOffset(fileContent: string): TimeZoneAbbrOffset {
  const timezoneNameString = 'timezone_name';
  const timezoneOffsetString = 'timezone_offset';
  let abbreviation;
  let offset;
  // split the content to array
  const allLines = fileContent.split(/\r\n|\n/);
  // get timezone (Abbreviation) and offset
  if (allLines) {
    for (const line of allLines) {
      if (line != null) {
        if (line.includes(timezoneNameString)) {
          abbreviation = line.split('=')[1];
        } else if (line.includes(timezoneOffsetString)) {
          offset = Number(line.split('=')[1]) / 3600;
        }
        if (abbreviation != null && offset != null) {
          break;
        }
      }
    }
  }
  if (abbreviation == null || offset == null) {
    abbreviation = null;
    offset = null;
  }
  return {abbreviation: abbreviation, offset: offset};

}
