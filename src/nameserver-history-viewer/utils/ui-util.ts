import { getRealPorts } from './file-util';
import {UnitType, Port, ChartContentData} from '../types';

/**
 * For some reason, hana studio will abandon the last line of nameserver history trace file
 */
const _IGNORED_LINE_FROM_TAIL = 1;

/**
 * None index server ports in name server history,
 * 01: name server; 02: preprocessor; 04: script server; 05: statistics server / diserver;
 * 06: web dispatcher; 07: xsengine; 10 compileserver; 11 dpserver; 12 esserver; 29 xscontroller
 */
const _NON_INDEX_SERVER_PORTS = ['01', '02', '04', '05', '06', '07', '10', '11', '12', '29'];

/**
 * Get the ignored line number from tail (For some reason, hana studio will abandon the last line of nameserver history trace file).
 */
export function getIgnoredLineNumFromTail() {
    return _IGNORED_LINE_FROM_TAIL;
}

/**
 * get the port that needs to be displayed from ports list via the selected port
 * @param ports overall ports list
 * @param port the selected port
 */
export function getDisplayPort(ports: string[], port: string): string {
  if (ports != null && ports.length > 0) {
    if (port == null || port.length === 0) {
      // if no port is selected
      if (ports.length === 1) {
        // not mdc system, will display the only one
        port = ports[0];
      } else {
        // select the first service (not in _NON_INDEX_SERVER_PORTS list)
        port = getRealPorts(ports).find(p => _NON_INDEX_SERVER_PORTS.indexOf(p.slice(-2)) < 0);
        if (port == null) {
          port = getRealPorts(ports)[0];
        }
      }
    } else {
      // get real port is port is some thing like 3**03
      if (port.slice(1, 3) === '**') {
        port = ports.find(key => key.slice(-2) === port.slice(-2));
      } else {
        port = ports.find(key => key === port);
      }
    }
  } else {
    port = void 0;
  }
  return port;
}

/**
 * Generate the ports for ngx-select.
 * If the provided ports is not null and no port has been selected,
 * will choose the first item which is not 01 (nameserver) or 07 (xsengine)
 *
 */
export function generatePorts(ports: string[] = null, selectedPort: string = null): Port[] {
  if (ports == null) {
    return null;
  } else {
    // if no selection, choose the first item which is not 01 (nameserver) or 07 (xsengine)
    if (selectedPort == null || selectedPort === '') {
      const firstIndexServer = ports.find(p => _NON_INDEX_SERVER_PORTS.indexOf(p.slice(-2)) < 0);
      selectedPort = firstIndexServer ? firstIndexServer : ports[0];
    }

    let index = ports.findIndex(port => port === selectedPort);
    if (index === -1) {
      // selection is not exists in the file
      index = 0;
    }
    const newPorts: Port[] = ports.map(port => ({id: port, text: port}));
    newPorts[index].selected = true;
    return newPorts;
  }
}

/**
 * get unit factor by unit
 */
export function getUnitFactor(unitType: UnitType): number {
  let unitFactor = 1;
  switch (unitType) {
    case UnitType.TypeGB:
      // BYTE to GB
      unitFactor = 1024 * 1024 * 1024;
      break;
    case UnitType.TypeMB:
    case UnitType.TypeMBSec:
      // BYTE to MB
      unitFactor = 1024 * 1024;
      break;
    case UnitType.TypeSecSec:
      // micro second to second
      unitFactor = 1000000;
  }
  return unitFactor;
}
/**
 * get value by unit (divided by the unit factor).
 */
export function getValueByUnit(value: number, unit: UnitType): number {
  return (value / getUnitFactor(unit));
}

/**
 * get rounded value: if value >= 10, round to integer; if value < 10, round to at most 2 decimal places
 */
export function getRoundedValue(value: number): number {
  return value >= 10 ? Math.round (value) : Math.round(value * 100) / 100;
}

/**
 * check whether unit is time related.
 */
export function isUnitTimeRelated (unit: UnitType): boolean {
  return unit === UnitType.TypeMBSec || unit === UnitType.TypeSec || unit === UnitType.TypeSecSec;
}

/**
 * calculate YScale base on the provided value
 */
export function calculateYScale(value: number): number {
  // round up to next 2,5,10,20,50,100,...
  if (value <= 0) {
    return 100;
  }
  const scale = Math.pow( 10, Math.floor(Math.log10(value)));
  if (scale >= value) {
    return scale;
  }
  if (2 * scale >= value) {
    return 2 * scale;
  }
  if ( 5 * scale >= value) {
    return 5 * scale;
  }

  return 10 * scale;
}

export function isEmptyData(data: ChartContentData): boolean {
  if (data) {
    return Object.keys(data).findIndex(port => {
      if (port != null && data[port]) {
        return data[port].findIndex(row => row && row.length > 0) >= 0;
      }
      return false;
    }) < 0;
  }
  return true;
}

export function sleep (time: number): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function setChartHeight(nsAll, nsContent): void {
  // const item1 = (document.getElementsByClassName('nameserver-history-all') as HTMLCollectionOf<HTMLElement>)[0];
  // const item2 = (document.getElementsByClassName('nameserver-history-content') as HTMLCollectionOf<HTMLElement>)[0];
  if (nsAll && nsContent) {
    const chartHeight = nsAll.offsetWidth * 0.75 / 2 + 10;
    nsContent.style.height = `${chartHeight}px`;
  }
}

