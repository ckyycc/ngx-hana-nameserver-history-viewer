import { getTimeFromTimeZone, defaultTimezone, getOffset } from './time-util';

describe('Time Util', () => {
  it('#01 getTimeFromTimeZone: should return the time base on the offset of provided timezone and default timezone "time + (offset-of-the-provided-timezone - currentOffset) * 60)"', () => {
    const time = 1536101895.920;
    const currentOffset = getOffset(defaultTimezone(), time * 1000);
    let timezone = 'Asia/Shanghai';
    expect(getTimeFromTimeZone(time, timezone)).toEqual(time - (currentOffset - getOffset(timezone, time * 1000)));
    timezone = 'Australia/Sydney';
    expect(getTimeFromTimeZone(time, timezone)).toEqual(time - (currentOffset - getOffset(timezone, time * 1000)));
    timezone = 'Europe/Berlin';
    expect(getTimeFromTimeZone(time, timezone)).toEqual(time - (currentOffset - getOffset(timezone, time * 1000)));
    timezone = 'Pacific/Midway';
    expect(getTimeFromTimeZone(time, timezone)).toEqual(time - (currentOffset - getOffset(timezone, time * 1000)));
  });
});
