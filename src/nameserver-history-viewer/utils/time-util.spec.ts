import { getTimeFromTimeZone, getDefaultTimezone, getTimeString } from './time-util';
import moments from 'moment-timezone';


describe('Time Util', () => {
  it('#01 getTimeFromTimeZone: should return the time base on the offset of provided timezone and default timezone "time + (offset-of-the-provided-timezone - currentOffset) * 60)"', () => {
    const time = 1536101895.920;

    const currentOffset = moments.tz.zone(getDefaultTimezone()).utcOffset(time * 1000);
    let timezone = 'Asia/Shanghai';
    expect(getTimeFromTimeZone(time, timezone)).toEqual(time + (currentOffset - moments.tz.zone(timezone).utcOffset(time * 1000)) * 60);
    timezone = 'Australia/Sydney';
    expect(getTimeFromTimeZone(time, timezone)).toEqual(time + (currentOffset - moments.tz.zone(timezone).utcOffset(time * 1000)) * 60);
    timezone = 'Europe/Berlin';
    expect(getTimeFromTimeZone(time, timezone)).toEqual(time + (currentOffset - moments.tz.zone(timezone).utcOffset(time * 1000)) * 60);
    timezone = 'Pacific/Midway';
    expect(getTimeFromTimeZone(time, timezone)).toEqual(time + (currentOffset - moments.tz.zone(timezone).utcOffset(time * 1000)) * 60);
  });
});
