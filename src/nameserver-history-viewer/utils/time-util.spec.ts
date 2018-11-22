import { getTimeFromTimeZone, getDefaultTimezone } from './time-util';
import * as momentImported from 'moment-timezone';

// workaround for fixing following error when doing packagr: Cannot call a namespace ('moment')
const moment = momentImported;

describe('Time Util', () => {
  it('#01 getTimeFromTimeZone: should return the time base on the offset of provided timezone and default timezone "time + (offset-of-the-provided-timezone - currentOffset) * 60)"', () => {
    const time = 1536101895920;
    const currentOffset = moment.tz(getDefaultTimezone()).utcOffset();
    let timezone = 'Asia/Shanghai';
    expect(getTimeFromTimeZone(time, timezone)).toEqual(time + (moment.tz(timezone).utcOffset() - currentOffset) * 60);
    timezone = 'Australia/Sydney';
    expect(getTimeFromTimeZone(time, timezone)).toEqual(time + (moment.tz(timezone).utcOffset() - currentOffset) * 60);
    timezone = 'Europe/Berlin';
    expect(getTimeFromTimeZone(time, timezone)).toEqual(time + (moment.tz(timezone).utcOffset() - currentOffset) * 60);
    timezone = 'Pacific/Midway';
    expect(getTimeFromTimeZone(time, timezone)).toEqual(time + (moment.tz(timezone).utcOffset() - currentOffset) * 60);
  });
});
