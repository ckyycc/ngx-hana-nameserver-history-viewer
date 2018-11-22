import {TimezoneSelectorService} from './timezone-selector.service';

describe('TimezoneSelectorService', () => {
  const service = new TimezoneSelectorService();
  it('#01 getZones: should return all timezones of 15 different regions ', () => {
    const zones = service.getZones();
    expect([
      'Africa', 'America', 'Antarctica', 'Arctic', 'Asia', 'Atlantic', 'Australia',
      'Brazil', 'Canada', 'Chile', 'Etc', 'Europe', 'Indian', 'Mexico', 'Pacific'
    ].every(region => zones.findIndex(zone => zone.region === region) >= 0)).toBe(true);
  });
});
