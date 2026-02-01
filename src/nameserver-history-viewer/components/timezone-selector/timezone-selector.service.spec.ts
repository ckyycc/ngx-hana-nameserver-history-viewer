import {TimezoneSelectorService} from './timezone-selector.service';

describe('TimezoneSelectorService', () => {
  const service = new TimezoneSelectorService();
  it('#01 getZones: should return all timezones of 11 different regions ', () => {
    const zones = service.getZones();

    // switched to IANA timezone from moment
    // IANA timezone does not include 'Brazil', 'Canada', 'Chile', 'Mexico' and 'US'
    expect([
      'Africa', 'America', 'Antarctica', 'Arctic', 'Asia', 'Atlantic', 'Australia',
      'Etc', 'Europe', 'Indian', 'Pacific'
    ].every(region => zones.findIndex(zone => zone.region === region) >= 0)).toBe(true);
  });
});
