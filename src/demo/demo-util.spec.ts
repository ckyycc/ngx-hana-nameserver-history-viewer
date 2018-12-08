import {getAbbreviationAndOffset, getLocalStorage, getTimeZoneFromTopology, setLocalStorage} from './demo-util';
import {DemoService} from './demo-service';

describe('demo-util', () => {
  const service = new DemoService();
  it('#01 setLocalStorage: should save to local storage if data is not empty ', () => {
    const name = 'test';
    const data = 'test1';
    setLocalStorage(name, data);
    const dataFromStorage = localStorage.getItem(name);
    let savedData;
    if (dataFromStorage != null) {
       savedData = JSON.parse(dataFromStorage);
    } else {
      savedData = undefined;
    }
    expect(savedData).toEqual(data);
  });
  it('#02 setLocalStorage: should remove the item from local storage if data is empty ', () => {
    const name = 'test';
    const data = undefined;
    setLocalStorage(name, data);
    expect(localStorage.getItem(name)).toBeFalsy();
  });
  it('#03 getLocalStorage: should get the item from local storage if the item is saved to local storage ', () => {
    const name = 'test';
    const data = 'test1';
    localStorage.setItem(name, JSON.stringify(data));
    expect(getLocalStorage(name)).toEqual(data);
  });
  it('#04 getLocalStorage: should return undefined if the item is not saved to local storage ', () => {
    const name = 'testNew';
    expect(getLocalStorage(name)).toBeFalsy();
  });
  it('#05 getAbbreviationAndOffset: should return abbreviation and offset from the provided topology file content', () => {
    const content = `
            ssfs_masterkey_changed=01.01.1970 07:00:00
            ssfs_masterkey_systempki_changed=01.01.1970 07:00:00
            start_time=2018-12-01 17:11:10.685
            timezone_name=+07
            timezone_offset=25200
            topology_mem_info=<ok>
            topology_mem_type=shared
          pid=36214
          start_time=2018-12-01 17:11:10.685
          stonith=yes
          volume=1
      preprocessor
    `;
    expect(getAbbreviationAndOffset(content)).toEqual({abbreviation: '+07', offset: 7});
  });
  it('#06 getAbbreviationAndOffset: should return null for both abbreviation and offset if either abbreviation is missed or offset is null', () => {
    const content = `
            ssfs_masterkey_changed=01.01.1970 07:00:00
            ssfs_masterkey_systempki_changed=01.01.1970 07:00:00
            start_time=2018-12-01 17:11:10.685
            timezone1_name=+07
            timezone_offset=25200
            topology_mem_info=<ok>
            topology_mem_type=shared
          pid=36214
          start_time=2018-12-01 17:11:10.685
          stonith=yes
          volume=1
      preprocessor
    `;
    expect(getAbbreviationAndOffset(content)).toEqual({abbreviation: null, offset: null});

    const content1 = `
            ssfs_masterkey_changed=01.01.1970 07:00:00
            ssfs_masterkey_systempki_changed=01.01.1970 07:00:00
            start_time=2018-12-01 17:11:10.685
            timezone_name=+07
            timezone1_offset=25200
            topology_mem_info=<ok>
            topology_mem_type=shared
          pid=36214
          start_time=2018-12-01 17:11:10.685
          stonith=yes
          volume=1
      preprocessor
    `;
    expect(getAbbreviationAndOffset(content1)).toEqual({abbreviation: null, offset: null});

  });
  it('#07 getTimeZoneFromTopology: should return Etc/GMTxx if abbreviation is number', () => {
    expect(getTimeZoneFromTopology('+07', 7, service.getTimezoneAbbrMappings())).toEqual('Etc/GMT-7');
    expect(getTimeZoneFromTopology('-10', 10, service.getTimezoneAbbrMappings())).toEqual('Etc/GMT+10');
    expect(getTimeZoneFromTopology('+00', 0, service.getTimezoneAbbrMappings())).toEqual('Etc/GMT+0');
    expect(getTimeZoneFromTopology('-00', 0, service.getTimezoneAbbrMappings())).toEqual('Etc/GMT+0');
  });
  it('#08 getTimeZoneFromTopology: should return timezone directly if abbreviation is a value from standard timezone', () => {
    expect(getTimeZoneFromTopology('America/New_York', 25200, service.getTimezoneAbbrMappings())).toEqual('America/New_York');
  });
  it('#09 getTimeZoneFromTopology: should return the relative timezone directly base on abbreviation and offset', () => {
    expect(getTimeZoneFromTopology('CST', 8, service.getTimezoneAbbrMappings())).toEqual('Asia/Chongqing');
    expect(getTimeZoneFromTopology('CST', -6, service.getTimezoneAbbrMappings())).toEqual('America/Bahia_Banderas');
    expect(getTimeZoneFromTopology('CST', -5, service.getTimezoneAbbrMappings())).toEqual('America/Havana');
    expect(getTimeZoneFromTopology('PST', -8, service.getTimezoneAbbrMappings())).toEqual('America/Dawson');
    expect(getTimeZoneFromTopology('PDT', -7, service.getTimezoneAbbrMappings())).toEqual('America/Los_Angeles');
  });
  it('#10 getTimeZoneFromTopology: should return null if can not find the timezone base on abbreviation and offset', () => {
    expect(getTimeZoneFromTopology('CST', 9, service.getTimezoneAbbrMappings())).toEqual(null);
    expect(getTimeZoneFromTopology('PST', -7, service.getTimezoneAbbrMappings())).toEqual(null);
    expect(getTimeZoneFromTopology('PDT', -8, service.getTimezoneAbbrMappings())).toEqual(null);
  });
  it('#11 getTimeZoneFromTopology: should return null if abbreviation is null', () => {
    expect(getTimeZoneFromTopology(null, 9, service.getTimezoneAbbrMappings())).toEqual(null);
  });
  it('#12 getTimeZoneFromTopology: should return null if offset is null', () => {
    expect(getTimeZoneFromTopology('PST', null, service.getTimezoneAbbrMappings())).toEqual(null);
  });
});
