import { TimeZoneAbbrMapping } from './demo-service';
import { supportedTimezones } from '../nameserver-history-viewer';

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
  // if abbreviation is number, get GMT timezone
  if (!isNaN(Number(abbreviation))) {
    const tzNum = Number(abbreviation);
    const etcGMTTZ = `Etc/GMT${tzNum > 0 ? '-' : '+'}${Math.abs(tzNum)}`;
    // get GMT timezone
    for (const name of supportedTimezones()) {
      if (name === etcGMTTZ) {
        return name;
      }
    }
  }

  // get timezone base on timezone name
  for (const name of supportedTimezones()) {
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
        if (mapping.abbreviation === abbreviation && Math.abs(mapping.offset - offset) < 0.1) {
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


type HostPortServiceMap = Record<string, Record<string, string>>;

interface StackItem {
  indent: number;
  key: string;
}

type TimezoneInfo = {
  abbreviation: string | null; // timezone_name
  offset: number | null;       // timezone_offset / 3600 (小时)
};

type ParseResult = {
  hosts: HostPortServiceMap;
  timezone: TimezoneInfo;
};


/**
 * Get host -> port -> service from topology
 */
export function parseHostPortServices(text: string): HostPortServiceMap {
  const result: HostPortServiceMap = {};
  const stack: StackItem[] = [];

  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, ""); // trimRight
    if (!line.trim()) continue;
    if (line.trim() === "''") continue;

    const indent = (line.match(/^\s*/) ?? [""])[0].length;
    const content = line.trim();

    if (content.includes("=")) {
      continue;
    }

    while (stack.length > 0 && indent <= stack[stack.length - 1].indent) {
      stack.pop(); // back to parent level, pop all the level lower than current level
    }
    stack.push({ indent, key: content });

    // numbers only line（30001/30003...）
    if (!/^\d+$/.test(content)) continue;

    // pure numbers--> port, then, find closest host
    const hostIdx = stack.findIndex((x) => x.key === "host");
    if (hostIdx < 0) continue;

    // host -> hostName -> serviceName -> port
    // at least 3 items after: stack[hostIdx+1], stack[hostIdx+2], stack[hostIdx+3]
    // all above level services (if have) have already been pop out,
    // eg: first service is indexserver, secondary is namesever, when reaching nameserver, indexserver must be poped out.
    if (stack.length < hostIdx + 4) continue;

    const hostName = stack[hostIdx + 1]?.key;
    const serviceName = stack[hostIdx + 2]?.key;
    const port = stack[hostIdx + 3]?.key;

    // port should be number, host/service must exist
    if (!hostName || !serviceName || !port || !/^\d+$/.test(port)) continue;

    if (!result[hostName]) result[hostName] = {};
    result[hostName][port] = serviceName;
  }

  return result;
}

export function parseTopologyJson(obj: any): ParseResult {
  const hostRoot = obj?.topology?.host ?? {};

  const hosts: HostPortServiceMap = {};
  let abbreviation: string | null = null;
  let offset: number | null = null;

  for (const hostName of Object.keys(hostRoot)) {
    const hostNode = hostRoot[hostName];
    if (!hostNode || typeof hostNode !== "object") continue;

    hosts[hostName] = {};

    // serviceName: compileserver/daemon/indexserver/nameserver/...
    for (const serviceName of Object.keys(hostNode)) {
      const serviceNode = hostNode[serviceName];

      // serviceName -> { port -> { ... } }
      if (!serviceNode || typeof serviceNode !== "object") continue;

      for (const port of Object.keys(serviceNode)) {
        // only process number port
        if (!/^\d+$/.test(port)) continue;
        hosts[hostName][port] = serviceName;

        // timezone only exists in nameserver's port.info, get first one
        if (abbreviation == null || offset == null) {
          if (serviceName === "nameserver") {
            const info = serviceNode?.[port]?.info;
            if (info && typeof info === "object") {
              if (abbreviation == null && typeof info.timezone_name === "string") {
                abbreviation = info.timezone_name;
              }
              if (offset == null && info.timezone_offset != null) {
                offset = Number(info.timezone_offset) / 3600;
                if (!Number.isFinite(offset)) offset = null;
              }
            }
          }
        }
      }
    }
  }

  return {
    hosts,
    timezone: {
      abbreviation,
      offset,
    }
  };
}