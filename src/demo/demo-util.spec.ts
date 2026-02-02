import {getAbbreviationAndOffset, getLocalStorage, getTimeZoneFromTopology, setLocalStorage, parseHostPortServices, parseTopologyJson} from './demo-util';
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
    expect(getTimeZoneFromTopology('+07', 7, service.timezoneAbbrMappings)).toEqual('Etc/GMT-7');
    expect(getTimeZoneFromTopology('-10', 10, service.timezoneAbbrMappings)).toEqual('Etc/GMT+10');
    expect(getTimeZoneFromTopology('+00', 0, service.timezoneAbbrMappings)).toEqual('Etc/GMT+0');
    expect(getTimeZoneFromTopology('-00', 0, service.timezoneAbbrMappings)).toEqual('Etc/GMT+0');
  });
  it('#08 getTimeZoneFromTopology: should return timezone directly if abbreviation is a value from standard timezone', () => {
    expect(getTimeZoneFromTopology('America/New_York', 25200, service.timezoneAbbrMappings)).toEqual('America/New_York');
  });
  it('#09 getTimeZoneFromTopology: should return the relative timezone directly base on abbreviation and offset', () => {
    expect(getTimeZoneFromTopology('CST', 8, service.timezoneAbbrMappings)).toEqual('Asia/Shanghai');
    expect(getTimeZoneFromTopology('CST', -6, service.timezoneAbbrMappings)).toEqual('America/Chicago');
    expect(getTimeZoneFromTopology('PST', -8, service.timezoneAbbrMappings)).toEqual('America/Vancouver');
    expect(getTimeZoneFromTopology('PDT', -7, service.timezoneAbbrMappings)).toEqual('America/Vancouver');
  });
  it('#10 getTimeZoneFromTopology: should return null if can not find the timezone base on abbreviation and offset', () => {
    expect(getTimeZoneFromTopology('CST', 9, service.timezoneAbbrMappings)).toEqual(null);
    expect(getTimeZoneFromTopology('PST', -7, service.timezoneAbbrMappings)).toEqual(null);
    expect(getTimeZoneFromTopology('PDT', -8, service.timezoneAbbrMappings)).toEqual(null);
  });
  it('#11 getTimeZoneFromTopology: should return null if abbreviation is null', () => {
    expect(getTimeZoneFromTopology(null, 9, service.timezoneAbbrMappings)).toEqual(null);
  });
  it('#12 getTimeZoneFromTopology: should return null if offset is null', () => {
    expect(getTimeZoneFromTopology('PST', null, service.timezoneAbbrMappings)).toEqual(null);
  });

  describe('parseHostPortServices', () => {
    it('#13 parseHostPortServices: should parse valid topology text correctly', () => {
      const mockTopologyText = `
        host
          host1
            indexserver
              30003
            nameserver
              30001
          host2
            indexserver
              30003
            xsengine
              30007
      `;

      const result = parseHostPortServices(mockTopologyText);

      expect(result).toEqual({
        host1: {
          '30003': 'indexserver',
          '30001': 'nameserver'
        },
        host2: {
          '30003': 'indexserver',
          '30007': 'xsengine'
        }
      });
    });

    it('#14 parseHostPortServices: should handle empty text', () => {
      const result = parseHostPortServices('');
      expect(result).toEqual({});
    });

    it('#15 parseHostPortServices: should handle text without host section', () => {
      const mockTopologyText = `
        some_other_section
          value1
          value2
      `;

      const result = parseHostPortServices(mockTopologyText);
      expect(result).toEqual({});
    });

    it('#16 parseHostPortServices: should ignore non-numeric ports', () => {
      const mockTopologyText = `
        host
          host1
            indexserver
              30003
              non_numeric_port
            nameserver
              30001
      `;

      const result = parseHostPortServices(mockTopologyText);

      expect(result).toEqual({
        host1: {
          '30003': 'indexserver',
          '30001': 'nameserver'
        }
      });
    });

    it('#17 parseHostPortServices: should handle lines with equals signs', () => {
      const mockTopologyText = `
        host
          host1
            indexserver
              30003
        timezone_name=+07
        timezone_offset=25200
      `;

      const result = parseHostPortServices(mockTopologyText);

      expect(result).toEqual({
        host1: {
          '30003': 'indexserver'
        }
      });
    });

    it('#18 parseHostPortServices: should handle empty quotes', () => {
      const mockTopologyText = `
        host
          host1
            indexserver
              30003
        ''
        
        other_section
      `;

      const result = parseHostPortServices(mockTopologyText);

      expect(result).toEqual({
        host1: {
          '30003': 'indexserver'
        }
      });
    });
  });

  describe('parseTopologyJson', () => {
    it('#19 parseTopologyJson: should parse valid topology JSON correctly', () => {
      const mockTopologyJson = {
        topology: {
          host: {
            host1: {
              indexserver: {
                '30003': { info: {} },
                '30004': { info: {} }
              },
              nameserver: {
                '30001': {
                  info: {
                    timezone_name: 'PST',
                    timezone_offset: -28800
                  }
                }
              }
            },
            host2: {
              xsengine: {
                '30007': { info: {} }
              }
            }
          }
        }
      };

      const result = parseTopologyJson(mockTopologyJson);

      expect(result).toEqual({
        hosts: {
          host1: {
            '30003': 'indexserver',
            '30004': 'indexserver',
            '30001': 'nameserver'
          },
          host2: {
            '30007': 'xsengine'
          }
        },
        timezone: {
          abbreviation: 'PST',
          offset: -8
        }
      });
    });

    it('#20 parseTopologyJson: should handle empty topology JSON', () => {
      const result = parseTopologyJson({});

      expect(result).toEqual({
        hosts: {},
        timezone: {
          abbreviation: null,
          offset: null
        }
      });
    });

    it('#21 parseTopologyJson: should handle null/undefined input', () => {
      expect(parseTopologyJson(null)).toEqual({
        hosts: {},
        timezone: {
          abbreviation: null,
          offset: null
        }
      });

      expect(parseTopologyJson(undefined)).toEqual({
        hosts: {},
        timezone: {
          abbreviation: null,
          offset: null
        }
      });
    });

    it('#22 parseTopologyJson: should ignore non-numeric ports', () => {
      const mockTopologyJson = {
        topology: {
          host: {
            host1: {
              indexserver: {
                '30003': { info: {} },
                'non_numeric': { info: {} },
                'another_string': { info: {} }
              }
            }
          }
        }
      };

      const result = parseTopologyJson(mockTopologyJson);

      expect(result).toEqual({
        hosts: {
          host1: {
            '30003': 'indexserver'
          }
        },
        timezone: {
          abbreviation: null,
          offset: null
        }
      });
    });

    it('#23 parseTopologyJson: should handle invalid timezone_offset', () => {
      const mockTopologyJson = {
        topology: {
          host: {
            host1: {
              nameserver: {
                '30001': {
                  info: {
                    timezone_name: 'PST',
                    timezone_offset: 'invalid_number'
                  }
                }
              }
            }
          }
        }
      };

      const result = parseTopologyJson(mockTopologyJson);

      expect(result).toEqual({
        hosts: {
          host1: {
            '30001': 'nameserver'
          }
        },
        timezone: {
          abbreviation: 'PST',
          offset: null
        }
      });
    });

    it('#24 parseTopologyJson: should get timezone from first nameserver found', () => {
      const mockTopologyJson = {
        topology: {
          host: {
            host1: {
              indexserver: {
                '30003': { info: {} }
              },
              nameserver: {
                '30001': {
                  info: {
                    timezone_name: 'PST',
                    timezone_offset: -28800
                  }
                }
              }
            },
            host2: {
              nameserver: {
                '30001': {
                  info: {
                    timezone_name: 'EST',
                    timezone_offset: -18000
                  }
                }
              }
            }
          }
        }
      };

      const result = parseTopologyJson(mockTopologyJson);

      expect(result.timezone).toEqual({
        abbreviation: 'PST',
        offset: -8
      });
    });

    it('#25 parseTopologyJson: should handle missing topology structure', () => {
      const mockTopologyJson = {
        other_data: {
          some_value: 'test'
        }
      };

      const result = parseTopologyJson(mockTopologyJson);

      expect(result).toEqual({
        hosts: {},
        timezone: {
          abbreviation: null,
          offset: null
        }
      });
    });

    it('#26 parseTopologyJson: should handle negative timezone offset correctly', () => {
      const mockTopologyJson = {
        topology: {
          host: {
            host1: {
              nameserver: {
                '30001': {
                  info: {
                    timezone_name: '-04',
                    timezone_offset: -14400
                  }
                }
              }
            }
          }
        }
      };

      const result = parseTopologyJson(mockTopologyJson);

      expect(result).toEqual({
        hosts: {
          host1: {
            '30001': 'nameserver'
          }
        },
        timezone: {
          abbreviation: '-04',
          offset: -4
        }
      });
    });

    it('#27 parseTopologyJson: should handle positive timezone offset correctly', () => {
      const mockTopologyJson = {
        topology: {
          host: {
            host1: {
              nameserver: {
                '30001': {
                  info: {
                    timezone_name: '+08',
                    timezone_offset: 28800
                  }
                }
              }
            }
          }
        }
      };

      const result = parseTopologyJson(mockTopologyJson);

      expect(result).toEqual({
        hosts: {
          host1: {
            '30001': 'nameserver'
          }
        },
        timezone: {
          abbreviation: '+08',
          offset: 8
        }
      });
    });
  });

  describe('getAbbreviationAndOffset - additional timezone cases', () => {
    it('#28 getAbbreviationAndOffset: should handle negative timezone correctly', () => {
      const content = `
            ssfs_masterkey_changed=01.01.1970 07:00:00
            ssfs_masterkey_systempki_changed=01.01.1970 07:00:00
            start_time=2018-12-01 17:11:10.685
            timezone_name=-04
            timezone_offset=-14400
            topology_mem_info=<ok>
            topology_mem_type=shared
          pid=36214
          start_time=2018-12-01 17:11:10.685
          stonith=yes
          volume=1
      preprocessor
      `;
      expect(getAbbreviationAndOffset(content)).toEqual({abbreviation: '-04', offset: -4});
    });

    it('#29 getAbbreviationAndOffset: should handle positive timezone correctly', () => {
      const content = `
            ssfs_masterkey_changed=01.01.1970 07:00:00
            ssfs_masterkey_systempki_changed=01.01.1970 07:00:00
            start_time=2018-12-01 17:11:10.685
            timezone_name=+08
            timezone_offset=28800
            topology_mem_info=<ok>
            topology_mem_type=shared
          pid=36214
          start_time=2018-12-01 17:11:10.685
          stonith=yes
          volume=1
      preprocessor
      `;
      expect(getAbbreviationAndOffset(content)).toEqual({abbreviation: '+08', offset: 8});
    });

    it('#30 getAbbreviationAndOffset: should handle zero timezone correctly', () => {
      const content = `
            ssfs_masterkey_changed=01.01.1970 07:00:00
            ssfs_masterkey_systempki_changed=01.01.1970 07:00:00
            start_time=2018-12-01 17:11:10.685
            timezone_name=+00
            timezone_offset=0
            topology_mem_info=<ok>
            topology_mem_type=shared
          pid=36214
          start_time=2018-12-01 17:11:10.685
          stonith=yes
          volume=1
      preprocessor
      `;
      expect(getAbbreviationAndOffset(content)).toEqual({abbreviation: '+00', offset: 0});
    });

    it('#31 getAbbreviationAndOffset: should handle fractional timezone offset', () => {
      const content = `
            ssfs_masterkey_changed=01.01.1970 07:00:00
            ssfs_masterkey_systempki_changed=01.01.1970 07:00:00
            start_time=2018-12-01 17:11:10.685
            timezone_name=+05:30
            timezone_offset=19800
            topology_mem_info=<ok>
            topology_mem_type=shared
          pid=36214
          start_time=2018-12-01 17:11:10.685
          stonith=yes
          volume=1
      preprocessor
      `;
      expect(getAbbreviationAndOffset(content)).toEqual({abbreviation: '+05:30', offset: 5.5});
    });

    it('#32 getAbbreviationAndOffset: should handle numeric timezone name as 0', () => {
      const content = `
            ssfs_masterkey_changed=01.01.1970 07:00:00
            ssfs_masterkey_systempki_changed=01.01.1970 07:00:00
            start_time=2018-12-01 17:11:10.685
            timezone_name=0
            timezone_offset=0
            topology_mem_info=<ok>
            topology_mem_type=shared
          pid=36214
          start_time=2018-12-01 17:11:10.685
          stonith=yes
          volume=1
      preprocessor
      `;
      expect(getAbbreviationAndOffset(content)).toEqual({abbreviation: '0', offset: 0});
    });
  });

  describe('parseTopologyJson - additional numeric timezone cases', () => {
    it('#33 parseTopologyJson: should handle numeric timezone name as 0', () => {
      const mockTopologyJson = {
        topology: {
          host: {
            host1: {
              nameserver: {
                '30001': {
                  info: {
                    timezone_name: '0',
                    timezone_offset: 0
                  }
                }
              }
            }
          }
        }
      };

      const result = parseTopologyJson(mockTopologyJson);

      expect(result).toEqual({
        hosts: {
          host1: {
            '30001': 'nameserver'
          }
        },
        timezone: {
          abbreviation: '0',
          offset: 0
        }
      });
    });
  });
});
