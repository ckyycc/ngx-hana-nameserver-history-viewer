import {PortSelectorService} from './port-selector.service';

describe('PortSelectorService', () => {
  const service = new PortSelectorService();
  it('#01 getPorts: should return the selected ports if the selected ports is not null/empty ', () => {
    const ports = [{id: '30001', text: '30001'}, {id: '30002', text: '30002'}];
    expect(service.getPorts(ports)).toEqual(ports);
  });
  it('#02 getPorts: should return the default ports if the selected ports is null/empty ', () => {
    expect(service.getPorts(null).length).toBe(99);
    expect(service.getPorts([]).length).toBe(99);
    expect(service.getPorts(null).findIndex(port => port.id === '3**01' && port.text === '3**01') >= 0).toBeTruthy();
    expect(service.getPorts([]).findIndex(port => port.id === '3**01' && port.text === '3**01') >= 0).toBeTruthy();
    expect(service.getPorts([]).findIndex(port => port.id === '3**99' && port.text === '3**99') >= 0).toBeTruthy();
  });
});
