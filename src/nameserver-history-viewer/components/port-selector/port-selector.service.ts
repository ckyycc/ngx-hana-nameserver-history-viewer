import { Injectable } from '@angular/core';
import { Port } from '../../types';

@Injectable()
export class PortSelectorService {

  private _defaultPorts: Port[];
  /**
   * generate the default ports from 3**01 to 3**99
   * the ports which used (3**01, 3**03, 3**07, 3**40, 3**43, 3*46， 3**49, 3**52, 3**55, 3*58, 3**61 ...)
   * by hana normally will be put in the first places
   */
  private _getDefaultPorts(): Port[] {
    if (this._defaultPorts) {
      return this._defaultPorts;
    }
    // name server, default index server and xsengine
    this._defaultPorts = [
      {id: '3**01', text: '3**01'},
      {id: '3**03', text: '3**03'},
      {id: '3**07', text: '3**07'}
    ];
    // tenant index servers
    for (let i = 40; i < 100; i += 3) {
      this._defaultPorts.push({id: `3**${i}`, text: `3**${i}`});
    }
    // others
    for (let i = 1; i < 100; i++) {
      const port = i > 9 ? `3**${i}` : `3**0${i}`;
      if (this._defaultPorts.findIndex(item => item.id === port) < 0) {
        this._defaultPorts.push({id: port, text: port});
      }
    }
    return this._defaultPorts;
  }

  getPorts(ports: Port[] = null): Port[] {
    return ports != null && ports.length > 0 ? ports : this._getDefaultPorts();
  }
}
