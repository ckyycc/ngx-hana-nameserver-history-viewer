import { TestBed } from '@angular/core/testing';
import { FileService } from './file.service';
import { getDefaultTimezone } from '../utils';
import { Abort } from '../types';
import * as momentImported from 'moment-timezone';

// workaround for fixing following error when doing packagr: Cannot call a namespace ('moment')
const moment = momentImported;

describe('FileService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileService]
    });
  });
  const defaultPort = 'DEFAULT';
  let startTime = 0;
  let endTime = 4102358400000;
  let timezone = 'America/Los_Angeles';
  const firstLineTimes = {}, lastLineTimes = {};
  let port, maxRow, firstLineTime, lastLineTime;

  it('#01 getChartContentFromFile: check header for none MDC name server history', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    service.getChartContentFromFile(FSSpecHelper.getNonMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        expect(result.header[0]).toBe('indexserverCpu');
        expect(result.header[1]).toBe('indexserverCpuSys');
        expect(result.header[28]).toBe('totalThreads');
        expect(result.header[29]).toBe('activeSqlExecutors');
        expect(result.header[54]).toBe('swapIn');
        expect(result.header[55]).toBe('swapOut');
        done();
      });
  });
  it('#02 getChartContentFromFile: check header for MDC name server history', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    service.getChartContentFromFile(FSSpecHelper.getMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        expect(result.header[0]).toBe('indexserverCpu');
        expect(result.header[1]).toBe('indexserverCpuSys');
        expect(result.header[27]).toBe('totalThreads');
        expect(result.header[28]).toBe('activeSqlExecutors');
        expect(result.header[59]).toBe('swapIn');
        expect(result.header[60]).toBe('swapOut');
        done();
      });
  });
  it('#03 getChartContentFromFile: check host for none MDC name server history', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    service.getChartContentFromFile(FSSpecHelper.getNonMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        expect(result.host).toBe('hanaserver1');
        done();
      });
  });
  it('#04 getChartContentFromFile: check host for MDC name server history', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    service.getChartContentFromFile(FSSpecHelper.getMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        expect(result.host).toBe('hanaserver2');
        done();
      });
  });
  it('#05 getChartContentFromFile: check maxRowLimitation for none MDC name server history', (done: DoneFn) => {
    const maxRow1 = 20;
    const service = TestBed.get(FileService);
    service.getChartContentFromFile(FSSpecHelper.getNonMdcFile(), startTime, endTime, port, timezone, maxRow1, null)
      .then(result => {
        expect(result.aborted).toEqual(Abort.maxLineNumReached);
        expect(result.time[defaultPort].length).toEqual(maxRow1);
        expect(result.data[defaultPort][0].length).toEqual(maxRow1);
        expect(result.data[defaultPort][Math.floor((result.data[defaultPort].length - 1) / 2)].length).toEqual(maxRow1);
        expect(result.data[defaultPort][result.data[defaultPort].length - 1].length).toEqual(maxRow1);
        done();
      });

    const maxRow2 = undefined;
    service.getChartContentFromFile(FSSpecHelper.getNonMdcFile(), startTime, endTime, port, timezone, maxRow2, null)
      .then(result => {
        expect(result.time[defaultPort].length).toEqual(55);
        expect(result.data[defaultPort][0].length).toEqual(55);
        expect(result.data[defaultPort][Math.floor((result.data[defaultPort].length - 1) / 2)].length).toEqual(55);
        expect(result.data[defaultPort][result.data[defaultPort].length - 1].length).toEqual(55);
        expect(result.aborted).toBeFalsy();
        done();
      });
  });
  it('#06 getChartContentFromFile: check maxRowLimitation for MDC name server history', (done: DoneFn) => {
    const maxRow1 = 200;
    const service = TestBed.get(FileService);
    service.getChartContentFromFile(FSSpecHelper.getMdcFile(), startTime, endTime, port, timezone, maxRow1, null)
      .then(result => {
        let sum = 0;
        Object.keys(result.time).forEach(key => {
          if (result.time[key]) {
            sum += result.time[key].length;
          }
        });
        expect(sum).toEqual(maxRow1);
        sum = 0;
        Object.keys(result.data).forEach(key => {
          if (result.data[key]) {
            sum += result.data[key][0].length;
          }
        });
        expect(sum).toEqual(maxRow1);

        sum = 0;
        Object.keys(result.data).forEach(key => {
          if (result.data[key]) {
            sum += result.data[key][result.data[key].length - 1].length;
          }
        });
        expect(sum).toEqual(maxRow1);

        sum = 0;
        Object.keys(result.data).forEach(key => {
          if (result.data[key]) {
            sum += result.data[key][Math.floor((result.data[key].length - 1) / 2)].length;
          }
        });
        expect(sum).toEqual(maxRow1);

        expect(result.aborted).toEqual(Abort.maxLineNumReached);
        done();
      });

    maxRow = 20000;
    port = '';
    service.getChartContentFromFile(FSSpecHelper.getMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        expect(result.aborted).toBeFalsy();
        done();
      });
  });
  it('#07 getChartContentFromFile: check time of default timezone for Non-MDC name server history', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    // default timezone
    timezone = getDefaultTimezone();
    const servicePort = 'DEFAULT';
    service.getChartContentFromFile(FSSpecHelper.getNonMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        firstLineTime = Math.round(result.time[servicePort][0]);
        lastLineTime = Math.round(result.time[servicePort][result.time[servicePort].length - 1]);
        expect(firstLineTime).toBe(1536101633589);
        expect(lastLineTime).toBe(1536102179289);
        done();
      });
  });
  it('#08 getChartContentFromFile: check time of default timezone for Non-MDC name server history with startTime', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    // default timezone
    timezone = getDefaultTimezone();
    startTime = 1536101895920;
    const servicePort = 'DEFAULT';
    service.getChartContentFromFile(FSSpecHelper.getNonMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        expect(Math.round(result.time[servicePort][0])).toBe(1536101895930);
        expect(Math.round(result.time[servicePort][result.time[servicePort].length - 1])).toBe(1536102179289);
        done();
      });
    startTime = 0;
  });
  it('#09 getChartContentFromFile: check time of default timezone for Non-MDC name server history with endTime', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    // default timezone
    timezone = getDefaultTimezone();
    endTime = 1536102139238;
    const servicePort = 'DEFAULT';
    service.getChartContentFromFile(FSSpecHelper.getNonMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        expect(Math.round(result.time[servicePort][0])).toBe(1536101633589);
        expect(Math.round(result.time[servicePort][result.time[servicePort].length - 1])).toBe(1536102139235);
        expect(result.aborted).toEqual(Abort.maxTimeRangeReached);
        done();
      });
    endTime = 4102358400000;
  });
  it('#10 getChartContentFromFile: check time of default timezone for Non-MDC name server history with startTime and endTime', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    // default timezone
    timezone = getDefaultTimezone();
    startTime = 1536101895920;
    endTime = 1536102139238;

    const servicePort = 'DEFAULT';
    service.getChartContentFromFile(FSSpecHelper.getNonMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        expect(Math.round(result.time[servicePort][0])).toBe(1536101895930);
        expect(Math.round(result.time[servicePort][result.time[servicePort].length - 1])).toBe(1536102139235);
        expect(result.aborted).toEqual(Abort.maxTimeRangeReached);
        done();
      });
    startTime = 0;
    endTime = 4102358400000;
  });
  it('#11 getChartContentFromFile: check time of specific timezone for Non-MDC name server history', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    const servicePort = 'DEFAULT';
    // test timezone: Asia/Shanghai (GMT +8)
    let specTimezone = 'Asia/Shanghai';
    FSSpecHelper.checkNonMdcTimeZone(service, startTime, endTime, servicePort, specTimezone, maxRow, firstLineTime, lastLineTime, done);
    // test timezone: Australia/Sydney (GMT +11)
    specTimezone = 'Australia/Sydney';
    FSSpecHelper.checkNonMdcTimeZone(service, startTime, endTime, servicePort, specTimezone, maxRow, firstLineTime, lastLineTime, done);
    // test timezone: Europe/Berlin (GMT +1)
    specTimezone = 'Europe/Berlin';
    FSSpecHelper.checkNonMdcTimeZone(service, startTime, endTime, servicePort, specTimezone, maxRow, firstLineTime, lastLineTime, done);
    // test timezone: Pacific/Midway (GMT -11)
    specTimezone = 'Pacific/Midway';
    FSSpecHelper.checkNonMdcTimeZone(service, startTime, endTime, servicePort, specTimezone, maxRow, firstLineTime, lastLineTime, done);
  });
  it('#12 getChartContentFromFile: check time of default timezone for MDC name server history', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    // default timezone America/Los_Angeles (GMT -7)
    timezone = 'America/Los_Angeles';
    service.getChartContentFromFile(FSSpecHelper.getMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        let servicePort = '30201';
        FSSpecHelper.checkMdcTime(firstLineTimes, lastLineTimes, servicePort, result, 1527846647324, 1527853024165);

        servicePort = '30203';
        FSSpecHelper.checkMdcTime(firstLineTimes, lastLineTimes, servicePort, result, 1527846667425, 1527851134740);

        servicePort = '30207';
        FSSpecHelper.checkMdcTime(firstLineTimes, lastLineTimes, servicePort, result, 1527846667425, 1527851114703);

        servicePort = '30240';
        FSSpecHelper.checkMdcTime(firstLineTimes, lastLineTimes, servicePort, result, 1527851293900, 1527853024165);

        servicePort = '30243';
        FSSpecHelper.checkMdcTime(firstLineTimes, lastLineTimes, servicePort, result, 1527852224477, 1527853024165);

        servicePort = '30246';
        FSSpecHelper.checkMdcTime(firstLineTimes, lastLineTimes, servicePort, result, 1527852304684, 1527853024165);

        servicePort = '30249';
        FSSpecHelper.checkMdcTime(firstLineTimes, lastLineTimes, servicePort, result, 1527852634319, 1527853024165);
        done();
      });
   });
  it('#13 getChartContentFromFile: check time of default timezone for MDC name server history with startTime', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    // default timezone America/Los_Angeles (GMT -7)
    timezone = 'America/Los_Angeles';
    startTime = 1527850974471;
    service.getChartContentFromFile(FSSpecHelper.getMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        let servicePort = '30201';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527850974472, 1527853024165]);

        servicePort = '30203';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527850974472, 1527851134740]);

        servicePort = '30207';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527850974472, 1527851114703]);

        servicePort = '30240';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527851293900, 1527853024165]);

        servicePort = '30243';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527852224477, 1527853024165]);

        servicePort = '30246';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527852304684, 1527853024165]);

        servicePort = '30249';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527852634319, 1527853024165]);
        done();
      });
    startTime = 0;
  });
  it('#14 getChartContentFromFile: check time of default timezone for MDC name server history with endTime', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    // default timezone America/Los_Angeles (GMT -7)
    timezone = 'America/Los_Angeles';
    endTime = 1527853004116;
    service.getChartContentFromFile(FSSpecHelper.getMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        let servicePort = '30201';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527846647324, 1527853004115]);

        servicePort = '30203';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527846667425, 1527851134740]);

        servicePort = '30207';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527846667425, 1527851114703]);

        servicePort = '30240';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527851293900, 1527853004115]);

        servicePort = '30243';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527852224477, 1527853004115]);

        servicePort = '30246';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527852304684, 1527853004115]);

        servicePort = '30249';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527852634319, 1527853004115]);
        expect(result.aborted).toEqual(Abort.maxTimeRangeReached);
        done();
      });
    endTime = 4102358400000;
  });
  it('#15 getChartContentFromFile: check time of default timezone for MDC name server history with startTime and endTime', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    // default timezone America/Los_Angeles (GMT -7)
    timezone = 'America/Los_Angeles';
    startTime = 1527850974471;
    endTime = 1527853004116;
    service.getChartContentFromFile(FSSpecHelper.getMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        let servicePort = '30201';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527850974472, 1527853004115]);

        servicePort = '30203';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527850974472, 1527851134740]);

        servicePort = '30207';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527850974472, 1527851114703]);

        servicePort = '30240';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527851293900, 1527853004115]);

        servicePort = '30243';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527852224477, 1527853004115]);

        servicePort = '30246';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527852304684, 1527853004115]);

        servicePort = '30249';
        expect([Math.round(result.time[servicePort][0]), Math.round(result.time[servicePort][result.time[servicePort].length - 1])])
          .toEqual([1527852634319, 1527853004115]);
        expect(result.aborted).toEqual(Abort.maxTimeRangeReached);
        done();
      });
    startTime = 0;
    endTime = 4102358400000;
  });
  it('#16 getChartContentFromFile: check time of specific timezone for MDC name server history', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    // test timezone: Asia/Shanghai (GMT +8)
    let specTimezone = 'Asia/Shanghai';
    FSSpecHelper.checkMdcTimezone(service, startTime, endTime, port, specTimezone, maxRow, firstLineTimes, lastLineTimes, done);
    // test timezone: Australia/Sydney (GMT +11)
    specTimezone = 'Australia/Sydney';
    FSSpecHelper.checkMdcTimezone(service, startTime, endTime, port, specTimezone, maxRow, firstLineTimes, lastLineTimes, done);
    // test timezone: Europe/Berlin (GMT +1)Pacific/Midway
    specTimezone = 'Europe/Berlin';
    FSSpecHelper.checkMdcTimezone(service, startTime, endTime, port, specTimezone, maxRow, firstLineTimes, lastLineTimes, done);
    // test timezone: Pacific/Midway (GMT -11)
    specTimezone = 'Pacific/Midway';
    FSSpecHelper.checkMdcTimezone(service, startTime, endTime, port, specTimezone, maxRow, firstLineTimes, lastLineTimes, done);
  });
  it('#17 getChartContentFromFile: check data for Non-MDC name server history', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    // default timezone
    timezone = getDefaultTimezone();
    const servicePort = 'DEFAULT';
    service.getChartContentFromFile(FSSpecHelper.getNonMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        // indexserverMemUsed
        let dataLineFirst = result.data[servicePort][2][0];
        let dataLineLast = result.data[servicePort][2][result.data[servicePort][2].length - 1];

        expect({x: Math.round(dataLineFirst.x), y: Math.round(dataLineFirst.y)}).toEqual({x: 1536101633589, y: 27807184710});
        expect({x: Math.round(dataLineLast.x), y: Math.round(dataLineLast.y)}).toEqual({x: 1536102179289, y: 27812801062});

        // searchCount
        dataLineFirst = result.data[servicePort][22][0];
        dataLineLast = result.data[servicePort][22][result.data[servicePort][22].length - 1];

        expect({x: Math.round(dataLineFirst.x), y: Math.round(dataLineFirst.y)}).toEqual({x: 1536101633589, y: 29});
        expect({x: Math.round(dataLineLast.x), y: Math.round(dataLineLast.y)}).toEqual({x: 1536102179289, y: 2});

        // networkOut
        dataLineFirst = result.data[servicePort][53][0];
        dataLineLast = result.data[servicePort][53][result.data[servicePort][53].length - 1];

        expect({x: Math.round(dataLineFirst.x), y: Math.round(dataLineFirst.y)}).toEqual({x: 1536101633589, y: 922803});
        expect({x: Math.round(dataLineLast.x), y: Math.round(dataLineLast.y)}).toEqual({x: 1536102179289, y: 383743});

        done();
      });
  });
  it('#18 getChartContentFromFile: check data for Non-MDC name server history with startTime', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    // default timezone
    timezone = getDefaultTimezone();
    startTime = 1536102028096;
    const servicePort = 'DEFAULT';
    service.getChartContentFromFile(FSSpecHelper.getNonMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        // indexserverMemUsed
        let dataLineFirst = result.data[servicePort][2][0];
        let dataLineLast = result.data[servicePort][2][result.data[servicePort][2].length - 1];

        expect({x: Math.round(dataLineFirst.x), y: Math.round(dataLineFirst.y)}).toEqual({x: 1536102028096, y: 27839484600});
        expect({x: Math.round(dataLineLast.x), y: Math.round(dataLineLast.y)}).toEqual({x: 1536102179289, y: 27812801062});

        // searchCount
        dataLineFirst = result.data[servicePort][22][0];
        dataLineLast = result.data[servicePort][22][result.data[servicePort][22].length - 1];

        expect({x: Math.round(dataLineFirst.x), y: Math.round(dataLineFirst.y)}).toEqual({x: 1536102028096, y: 63});
        expect({x: Math.round(dataLineLast.x), y: Math.round(dataLineLast.y)}).toEqual({x: 1536102179289, y: 2});

        // networkOut
        dataLineFirst = result.data[servicePort][53][0];
        dataLineLast = result.data[servicePort][53][result.data[servicePort][53].length - 1];

        expect({x: Math.round(dataLineFirst.x), y: Math.round(dataLineFirst.y)}).toEqual({x: 1536102028096, y: 274387});
        expect({x: Math.round(dataLineLast.x), y: Math.round(dataLineLast.y)}).toEqual({x: 1536102179289, y: 383743});

        done();
      });
  });
  it('#19 getChartContentFromFile: check data for Non-MDC name server history with endTime', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    // default timezone
    timezone = getDefaultTimezone();
    startTime = 0;
    endTime = 1536102129224;
    const servicePort = 'DEFAULT';
    service.getChartContentFromFile(FSSpecHelper.getNonMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        // indexserverMemUsed

        let dataLineFirst = result.data[servicePort][2][0];
        let dataLineLast = result.data[servicePort][2][result.data[servicePort][2].length - 1];
        expect({x: Math.round(dataLineFirst.x), y: Math.round(dataLineFirst.y)}).toEqual({x: 1536101633589, y: 27807184710});
        expect({x: Math.round(dataLineLast.x), y: Math.round(dataLineLast.y)}).toEqual({x: 1536102129223, y: 27809021422});

        // searchCount
        dataLineFirst = result.data[servicePort][22][0];
        dataLineLast = result.data[servicePort][22][result.data[servicePort][22].length - 1];

        expect({x: Math.round(dataLineFirst.x), y: Math.round(dataLineFirst.y)}).toEqual({x: 1536101633589, y: 29});
        expect({x: Math.round(dataLineLast.x), y: Math.round(dataLineLast.y)}).toEqual({x: 1536102129223, y: 25938});

        // networkOut
        dataLineFirst = result.data[servicePort][53][0];
        dataLineLast = result.data[servicePort][53][result.data[servicePort][53].length - 1];

        expect({x: Math.round(dataLineFirst.x), y: Math.round(dataLineFirst.y)}).toEqual({x: 1536101633589, y: 922803});
        expect({x: Math.round(dataLineLast.x), y: Math.round(dataLineLast.y)}).toEqual({x: 1536102129223, y: 91061});

        done();
      });
  });
  it('#20 getChartContentFromFile: check data for Non-MDC name server history with startTime and endTime', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    // default timezone
    timezone = getDefaultTimezone();
    startTime = 1536102028096;
    endTime = 1536102129224;
    const servicePort = 'DEFAULT';
    service.getChartContentFromFile(FSSpecHelper.getNonMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        // indexserverMemUsed

        let dataLineFirst = result.data[servicePort][2][0];
        let dataLineLast = result.data[servicePort][2][result.data[servicePort][2].length - 1];

        expect({x: Math.round(dataLineFirst.x), y: Math.round(dataLineFirst.y)}).toEqual({x: 1536102028096, y: 27839484600});
        expect({x: Math.round(dataLineLast.x), y: Math.round(dataLineLast.y)}).toEqual({x: 1536102129223, y: 27809021422});
        // searchCount
        dataLineFirst = result.data[servicePort][22][0];
        dataLineLast = result.data[servicePort][22][result.data[servicePort][22].length - 1];

        expect({x: Math.round(dataLineFirst.x), y: Math.round(dataLineFirst.y)}).toEqual({x: 1536102028096, y: 63});
        expect({x: Math.round(dataLineLast.x), y: Math.round(dataLineLast.y)}).toEqual({x: 1536102129223, y: 25938});
        //
        // networkOut
        dataLineFirst = result.data[servicePort][53][0];
        dataLineLast = result.data[servicePort][53][result.data[servicePort][53].length - 1];

        expect({x: Math.round(dataLineFirst.x), y: Math.round(dataLineFirst.y)}).toEqual({x: 1536102028096, y: 274387});
        expect({x: Math.round(dataLineLast.x), y: Math.round(dataLineLast.y)}).toEqual({x: 1536102129223, y: 91061});

        done();
      });
  });
  it('#21 getChartContentFromFile: check data for MDC name server history', (done: DoneFn) => {
    startTime = 0;
    endTime = 4102358400000;
    const service = TestBed.get(FileService);
    timezone = getDefaultTimezone();
    service.getChartContentFromFile(FSSpecHelper.getMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        let servicePort = '30201';
        let expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527846647324, y: 3285994511}, lastLine: {x: 1527853024165, y: 5201941477}},
          searchCount:        {firstLine: {x: 1527846647324, y: 0},          lastLine: {x: 1527853024165, y: 499}},
          networkOut:         {firstLine: {x: 1527846647324, y: 450152},     lastLine: {x: 1527853024165, y: 2576381}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30203';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527846667425, y: 3999060521}, lastLine: {x: 1527851134740, y: 5598130783}},
          searchCount:        {firstLine: {x: 1527846667425, y: 0},          lastLine: {x: 1527851134740, y: 0}},
          networkOut:         {firstLine: {x: 1527846667425, y: 1364962},    lastLine: {x: 1527851134740, y: 72693}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30207';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527846667425, y: 2683597582}, lastLine: {x: 1527851114703, y: 3607910424}},
          searchCount:        {firstLine: {x: 1527846667425, y: 0},          lastLine: {x: 1527851114703, y: 0}},
          networkOut:         {firstLine: {x: 1527846667425, y: 1364962},    lastLine: {x: 1527851114703, y: 810421}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30240';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527851293900, y: 4216218953}, lastLine: {x: 1527853024165, y: 8205347019}},
          searchCount:        {firstLine: {x: 1527851293900, y: 0},          lastLine: {x: 1527853024165, y: 0}},
          networkOut:         {firstLine: {x: 1527851293900, y: 1089638},    lastLine: {x: 1527853024165, y: 2576381}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30243';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527852224477, y: 3370436034}, lastLine: {x: 1527853024165, y: 3538834746}},
          searchCount:        {firstLine: {x: 1527852224477, y: 0},          lastLine: {x: 1527853024165, y: 0}},
          networkOut:         {firstLine: {x: 1527852224477, y: 1545216},    lastLine: {x: 1527853024165, y: 2576381}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30246';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527852304684, y: 3447748168}, lastLine: {x: 1527853024165, y: 3565683728}},
          searchCount:        {firstLine: {x: 1527852304684, y: 0},          lastLine: {x: 1527853024165, y: 0}},
          networkOut:         {firstLine: {x: 1527852304684, y: 36538716},   lastLine: {x: 1527853024165, y: 2576381}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30249';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527852634319, y: 3022981072}, lastLine: {x: 1527853024165, y: 3254856185}},
          searchCount:        {firstLine: {x: 1527852634319, y: 0},          lastLine: {x: 1527853024165, y: 0}},
          networkOut:         {firstLine: {x: 1527852634319, y: 859454},     lastLine: {x: 1527853024165, y: 2576381}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        done();
      });
  });
  it('#22 getChartContentFromFile: check data for MDC name server history with startTime', (done: DoneFn) => {
    startTime = 1527852044158;
    endTime = 4102358400000;
    const service = TestBed.get(FileService);
    timezone = getDefaultTimezone();
    service.getChartContentFromFile(FSSpecHelper.getMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        let servicePort = '30201';
        let expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527852044159, y: 5112963348}, lastLine: {x: 1527853024165, y: 5201941477}},
          searchCount:        {firstLine: {x: 1527852044159, y: 0},          lastLine: {x: 1527853024165, y: 499}},
          networkOut:         {firstLine: {x: 1527852044159, y: 760796},     lastLine: {x: 1527853024165, y: 2576381}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30203';
        expect(result[servicePort]).toEqual(undefined);
        servicePort = '30207';
        expect(result[servicePort]).toEqual(undefined);
        servicePort = '30240';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527852044159, y: 11889402001}, lastLine: {x: 1527853024165, y: 8205347019}},
          searchCount:        {firstLine: {x: 1527852044159, y: 0},           lastLine: {x: 1527853024165, y: 0}},
          networkOut:         {firstLine: {x: 1527852044159, y: 760796},      lastLine: {x: 1527853024165, y: 2576381}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30243';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527852224477, y: 3370436034}, lastLine: {x: 1527853024165, y: 3538834746}},
          searchCount:        {firstLine: {x: 1527852224477, y: 0},          lastLine: {x: 1527853024165, y: 0}},
          networkOut:         {firstLine: {x: 1527852224477, y: 1545216},    lastLine: {x: 1527853024165, y: 2576381}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30246';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527852304684, y: 3447748168}, lastLine: {x: 1527853024165, y: 3565683728}},
          searchCount:        {firstLine: {x: 1527852304684, y: 0},          lastLine: {x: 1527853024165, y: 0}},
          networkOut:         {firstLine: {x: 1527852304684, y: 36538716},   lastLine: {x: 1527853024165, y: 2576381}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30249';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527852634319, y: 3022981072}, lastLine: {x: 1527853024165, y: 3254856185}},
          searchCount:        {firstLine: {x: 1527852634319, y: 0},          lastLine: {x: 1527853024165, y: 0}},
          networkOut:         {firstLine: {x: 1527852634319, y: 859454},     lastLine: {x: 1527853024165, y: 2576381}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        done();
      });
  });
  it('#23 getChartContentFromFile: check data for MDC name server history with endTime', (done: DoneFn) => {
    startTime = 0;
    endTime = 1527852984075;
    const service = TestBed.get(FileService);
    timezone = getDefaultTimezone();
    service.getChartContentFromFile(FSSpecHelper.getMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        let servicePort = '30201';
        let expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527846647324, y: 3285994511}, lastLine: {x: 1527852984074, y: 5201701125}},
          searchCount:        {firstLine: {x: 1527846647324, y: 0},          lastLine: {x: 1527852984074, y: 0}},
          networkOut:         {firstLine: {x: 1527846647324, y: 450152},     lastLine: {x: 1527852984074, y: 127046}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30203';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527846667425, y: 3999060521}, lastLine: {x: 1527851134740, y: 5598130783}},
          searchCount:        {firstLine: {x: 1527846667425, y: 0},          lastLine: {x: 1527851134740, y: 0}},
          networkOut:         {firstLine: {x: 1527846667425, y: 1364962},    lastLine: {x: 1527851134740, y: 72693}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30207';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527846667425, y: 2683597582}, lastLine: {x: 1527851114703, y: 3607910424}},
          searchCount:        {firstLine: {x: 1527846667425, y: 0},          lastLine: {x: 1527851114703, y: 0}},
          networkOut:         {firstLine: {x: 1527846667425, y: 1364962},    lastLine: {x: 1527851114703, y: 810421}}
        };

        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30240';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527851293900, y: 4216218953}, lastLine: {x: 1527852984074, y: 8203273459}},
          searchCount:        {firstLine: {x: 1527851293900, y: 0},          lastLine: {x: 1527852984074, y: 0}},
          networkOut:         {firstLine: {x: 1527851293900, y: 1089638},    lastLine: {x: 1527852984074, y: 127046}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30243';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527852224477, y: 3370436034}, lastLine: {x: 1527852984074, y: 3530968090}},
          searchCount:        {firstLine: {x: 1527852224477, y: 0},          lastLine: {x: 1527852984074, y: 0}},
          networkOut:         {firstLine: {x: 1527852224477, y: 1545216},    lastLine: {x: 1527852984074, y: 127046}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30246';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527852304684, y: 3447748168}, lastLine: {x: 1527852984074, y: 3562815616}},
          searchCount:        {firstLine: {x: 1527852304684, y: 0},          lastLine: {x: 1527852984074, y: 0}},
          networkOut:         {firstLine: {x: 1527852304684, y: 36538716},   lastLine: {x: 1527852984074, y: 127046}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30249';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527852634319, y: 3022981072}, lastLine: {x: 1527852984074, y: 3248750185}},
          searchCount:        {firstLine: {x: 1527852634319, y: 0},          lastLine: {x: 1527852984074, y: 0}},
          networkOut:         {firstLine: {x: 1527852634319, y: 859454},     lastLine: {x: 1527852984074, y: 127046}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        done();
      });
  });
  it('#24 getChartContentFromFile: check data for MDC name server history with startTime and endTime', (done: DoneFn) => {
    startTime = 1527852044158;
    endTime = 1527852984075;
    const service = TestBed.get(FileService);
    timezone = getDefaultTimezone();
    service.getChartContentFromFile(FSSpecHelper.getMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        let servicePort = '30201';
        let expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527852044159, y: 5112963348}, lastLine: {x: 1527852984074, y: 5201701125}},
          searchCount:        {firstLine: {x: 1527852044159, y: 0},          lastLine: {x: 1527852984074, y: 0}},
          networkOut:         {firstLine: {x: 1527852044159, y: 760796},     lastLine: {x: 1527852984074, y: 127046}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30203';
        expect(result[servicePort]).toEqual(undefined);
        servicePort = '30207';
        expect(result[servicePort]).toEqual(undefined);

        servicePort = '30240';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527852044159, y: 11889402001}, lastLine: {x: 1527852984074, y: 8203273459}},
          searchCount:        {firstLine: {x: 1527852044159, y: 0},           lastLine: {x: 1527852984074, y: 0}},
          networkOut:         {firstLine: {x: 1527852044159, y: 760796},      lastLine: {x: 1527852984074, y: 127046}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30243';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527852224477, y: 3370436034}, lastLine: {x: 1527852984074, y: 3530968090}},
          searchCount:        {firstLine: {x: 1527852224477, y: 0},          lastLine: {x: 1527852984074, y: 0}},
          networkOut:         {firstLine: {x: 1527852224477, y: 1545216},    lastLine: {x: 1527852984074, y: 127046}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30246';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527852304684, y: 3447748168}, lastLine: {x: 1527852984074, y: 3562815616}},
          searchCount:        {firstLine: {x: 1527852304684, y: 0},          lastLine: {x: 1527852984074, y: 0}},
          networkOut:         {firstLine: {x: 1527852304684, y: 36538716},   lastLine: {x: 1527852984074, y: 127046}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        servicePort = '30249';
        expectedResult = {
          indexserverMemUsed: {firstLine: {x: 1527852634319, y: 3022981072}, lastLine: {x: 1527852984074, y: 3248750185}},
          searchCount:        {firstLine: {x: 1527852634319, y: 0},          lastLine: {x: 1527852984074, y: 0}},
          networkOut:         {firstLine: {x: 1527852634319, y: 859454},     lastLine: {x: 1527852984074, y: 127046}}
        };
        FSSpecHelper.checkMdcData(result, servicePort, expectedResult);

        done();
      });
  });
  it('#25 getPortsFromFile: check loading ports for none MDC name server history', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    service.getPortsFromFile(FSSpecHelper.getNonMdcFile(), null)
      .then(result => {
        expect(result).toEqual(['DEFAULT']);
        done();
      });
  });
  it('#26 getPortsFromFile: check loading ports for MDC name server history', (done: DoneFn) => {
    const service = TestBed.get(FileService);
    service.getPortsFromFile(FSSpecHelper.getMdcFile(), null)
      .then(result => {
        expect(result).toEqual( ['30201', '30203', '30207', '30240', '30243', '30246', '30249']);
        done();
      });
  });
});

export class FSSpecHelper {
  private static _checkTimeZone(result, servicePort, firstLineTime, lastLineTime, hour) {
    const firstLineTimeNext = Math.round(result.time[servicePort][0]);
    const lastLineTimeNext = Math.round(result.time[servicePort][result.time[servicePort].length - 1]);
    expect(Math.round(firstLineTimeNext - firstLineTime)).toBe(hour * 3600 * 1000);
    expect(Math.round(lastLineTimeNext - lastLineTime)).toBe(hour * 3600 * 1000);
  }
  static getNonMdcFile(): File {
    const nonMdcFileContent = `host;tenant;time;indexserverCpu;indexserverCpuSys;indexserverMemUsed;indexserverMemLimit;indexserverHandles;indexserverPingtime;indexserverSwapIn;sqlConnections;internalConnections;externalConnections;idleConnections;sqlTransactions;internalTransactions;externalTransactions;userTransactions;sqlBlockedTrans;sqlStatements;cidRange;tidRange;mvccNum;pendingRequestCount;acquiredRecordLocks;searchCount;indexingCount;mergeCount;unloadCount;indexserverThreads;waitingThreads;totalThreads;activeSqlExecutors;waitingSqlExecutors;totalSqlExecutors;dataWriteSize;dataWriteTime;logWriteSize;logWriteTime;dataReadSize;dataReadTime;logReadSize;logReadTime;dataBackupWriteSize;dataBackupWriteTime;logBackupWriteSize;logBackupWriteTime;cpuUsed;memoryResident;memoryTotalResident;memoryUsed;memoryLimit;memorySize;diskUsed;diskSize;networkIn;networkOut;swapIn;swapOut
hanaserver1;;1536101633.589;0;0;27807184710;1042193105514;282;6;0;40;11;29;40;8;0;0;8;0;36;0;6153280;0;0;0;29;1276;95;124;1;0;278;0;0;160;0;0;8192;1504;0;0;0;0;-1;-1;-1;-1;1;104382361600;453841193888;32057086508;1046577225728;1084221976576;1379013472256;2710369517568;102667;922803;0;0
;;>10.013;;;>81829169;>1600;;;;;;;39;9;;;9;;38;;>3;;;;>25694;;;;4;2;>2;1;1;;;;>4096;>8024;;;;;;;;;;;<12333056;<2320;;;>11284480;;<6511;<831114;;
;;>10.014;;;<81756577;;;;;;;;40;8;;;8;;67;;>4;;;;39;;;;1;0;<2;0;0;;;;>4096;<7342;;;;;;;;;;;<4747264;>73312;;;>397312;;>1207734;>93768;;
;;>10.013;;;<11552;;;5;;;;;;;;;;;6;;>1;;;;27;;;;;;;;;;;;<12288;<1586;;;;;;;;;;;<5169152;<11552;;;>8192;;>918345;>263466;;
;;>10.013;;;>333672;<928;;6;;;;;;;;;;;>1122;;>74;;;;>423;;;;;;;;;;>35868672;>253067;>294912;>74417;;;;;;;;;;;>602112;>334600;;;>12288;;<2097921;<330208;;
;;>10.013;;;>2600;<672;;7;;;;;;;;;;;7;;>1;;;;36;;;;;;;;;;0;0;<294912;<74470;;;;;;;;;0;;>819200;>3272;;;>24576;;<14557;<13811;;
;;>10.011;;;>66832;>160;;6;;;;;;;;;;;35;;>2;;;;29;;;;;;;;;;;;>4096;>1804;;;;;;;;;1;;>258048;>66672;;;>462848;;<13630;>263528;;
;;>10.015;;;<3568;>1440;;;;;;;;;;;;;7;;>1;;;;>25701;;;;;;;;;;;;<4096;<1642;;;;;;;;;;;<4243456;<5008;;;>12288;;<58101;<333119;;
;;>10.013;;;>12480;>512;;;;;;;;;;;;;66;;>4;;;;30;;;;2;1;;;;;;;>12288;>1557;;;;;;;;;;;>2678784;>11968;;;>393216;;>61545;>65851;;
;;>10.013;;;<11200;;;;;;;;;;;;;;6;;>1;;;;27;;;;1;0;;;;;;;<12288;<1494;;;;;;;;;;;<2502656;<11200;;;>8192;;>1973070;>180984;;
;;>10.013;;;>483736;<1280;;;;;;;;;;;;;>1122;;>74;;;;>432;;;;;;;;;;;;>286720;>44771;;;;;;;;;;;<1593344;>485016;;;>12288;;<1952142;<168785;;
;;>11.015;;;>133144;<512;;;;;;;;;;;;;6;;>1;;;;27;;;;;;;;;;>2314240;>22066;<286720;<44998;;;;;;;;;0;;>745472;>133656;;;>16384;;<10682;<7690;;
;;>10.013;;;<3232;<688;;7;;;;;;;;;;;20;;>1;;;;28;;;;;;;;;;0;0;;>223;;;;;;;;;1;;>19202048;>308000;;;<1196032;;<7303;>541352;;
;;>10.013;;;>65456;>1440;;5;;;;;;;;;;;40;;>3;;;;>25704;;;;;;;;;;;;>8192;>1198;;;;;;;;;;;<16670720;<236944;;;>204800;;<57169;<602758;;
;;>10.012;;;>66912;>67072;;6;;;;;;;;;;;66;;>4;;;;30;;;;;;;;;;;;>4096;>237;;;;;;;;;2;;<3883008;>5216;;;>286720;;>56498;>56089;;
;;>10.013;;;<2304;<512;;;;;;;;;;;;;6;;>1;;;;27;;;;;;;;;;;;<12288;<1612;;;;;;;;;1;;<1261568;<13760;;;<10174464;;>1992036;>187940;;
;;>10.013;;;>1080736;<816;;;;;;;;;;;;;>1794;;>120;;;;>659;;;;;;;;;;;;>487424;>106235;;;;;;;;;;;<1712128;>1078632;;;>12288;;<1968045;<170176;;
;;>10.011;;;<160;<672;;5;;;;;;;;;;;6;;>1;;;;31;;;;;;;;;;>3174400;>26824;<487424;<106085;;;;;;;;;0;;<835584;>3432;;;>24576;;<19491;<18003;;
;;>10.014;;;>62480;<67504;;;;;;;;;;;;;20;;>1;;;;28;;;;;;;;;;0;0;;>1318;;;;;;;;;1;;<2920448;>132976;;;>118784;;<1226;>1097679;;
;;>10.014;;;>250168;<1632;;7;;;;;;;;;;;>652;2;>49;9;;;>25919;;;;;;;;;;;;>303104;>28848;>16384;>3441;;;;;;;;;<2473984;>25528312;;;>12288;;<67799;<1160175;;
;;>10.012;;;>25160;>4016;;6;;;;;;;;;;;99;0;>6;0;;;40;;;;;;;;;;;;<282624;<27630;0;0;;;;;;;;;>5709824;<25245360;;;>389120;;>63023;>60540;;
;;>10.013;;;<512;;;;;;;;;;;;;;6;;>1;;;;27;;;;;;;;;;;;<20480;<2606;;;;;;;;;;;<2633728;<13512;;;>8192;;>1981754;>1046697;;
;;>10.013;;;>224848;>224;;;;;;;;;;;;;>1123;;>74;;;;>432;;;;;;;;;;;;>290816;>52310;;;;;;;;;;;<831488;>221776;;;>12288;;<1952665;<1029911;;
;;>11.014;;;>1568;>160;;;;;;;;;;;;;6;;>1;;;;36;;;;;;;;;;>5890048;>50017;<290816;<52157;;;;;;;;;0;;>913408;<16;;;>45056;;<9667;<12117;;
;;>10.013;;;>64320;<512;;;;;;;;;;;;;52;;>3;;;;30;;;;;;;;;;0;0;>8192;>925;;;;;;;;;1;;>1843200;>81896001;;;>303104;;<24453;<8052;;
;;>10.013;;;<1936;>912;;;;;;;;;;;;;38;;>3;;;;>25693;;;;;;;;;;;;;>281;;;;;;;;;;;<1953792;<81832225;;;>208896;;<8608;<55867;;
;;>10.014;;;>11693683;<160;;;;;;;39;9;;;9;;66;;>4;;;;30;;;;2;1;;1;1;;;;>4096;>326;;;;;;;;;;;>1413120;>63744;;;>385024;;>17908;>65764;;
;;>11.013;;;<11634003;;;;;;;;40;8;;;8;;7;;>1;;;;36;;;;1;0;;0;0;;;;<12288;<1606;;;;;;;;;;;>1830912;<4416;;;>16953344;;>1913849;>170260;;
;;>10.013;;;>1057232;<416;;;;;;;;;;;;;>1121;;>74;;;;>414;;;;;;;;;;;;>294912;>64949;;;;;;;;;;;<708608;>1057656;;;>12288;;<1885192;<157285;;
;;>10.014;;;<3232;>672;;;;;;;;;;;;;6;;>1;;;;36;;;;;;;;;;>2334720;>20755;<294912;<64956;;;;;;;;;;;>2723840;<3912;;;>28672;;<22096;>4460;;
;;>10.011;;;<2352;<944;;5;;;;;;;;;;;20;;>1;;;;28;;;;;;;;;;0;0;;<5;;;;;;;;;;;<6012928;<1408;;;>118784;;<11035;>523905;;
;;>10.013;;;<1536;>928;;6;;;;;;;;;;;6;;>1;;;;>25693;;;;;;;;;;;;;<34;;;;;;;;;;;>110592;<2464;;;>8192;;<7824;<555389;;
;;>10.013;;;<1904;<160;;;;;;;;;;;;;67;;>4;;;;39;;;;;;;;;;;;>12288;>1317;;;;;;;;;;;>1015808;<1744;;;>389120;;>14557;>18493;;
;;>10.013;;;<1152;;;;;;;;;;;;;;6;;>1;;;;27;;;;;;;;;;;;<12288;<1273;;;;;;;;;;;>94208;<1152;;;>11341824;;>2119917;>338646;;
;;>10.012;;;>591104;<608;;5;;;;;;;;;;;>1211;;>82;;;;>446;;;;;;;;;;>39653376;>171066;>323584;>80341;;;;;;;;;;;>966656;>591720;;;>8192;;<2095801;<332196;;
;;>11.013;;;<863560;;<1;6;;39;;28;39;7;;;7;;7;;>1;;;;36;;;;;;;;;;0;0;<323584;<80370;;;;;;;;;;;<5099520;<863568;;;>1077248;;<28672;<12283;;
;;>10.014;;;<800456;<432;<1;7;;38;;27;38;6;;;6;;37;;>2;;;;38;;;;;;;;;;;;>4096;>735;;;;;;;;;;;<11730944;>928312;;;>237568;;<58313;>486028;;
;;>10.012;;;>1731040;>1600;>2;6;;40;;29;40;8;;;8;;38;;>3;;;;>25685;;;;;;;;;;;;>4096;<76;;;;;;;;;;;>30490624;<1888;;;>196608;;>58592;<484395;;
;;>10.013;;;>128608;>160;;5;;;;;;;;;;;65;;>4;;;;30;;;;;;;;;;;;>4096;>1138;;;;;;;;;;;<6397952;>131440;;;>380928;;>2979;<457;;
;;>10.012;;;>27494178;<160;>1;;;;;;35;13;;;13;;70;;>11;;;;63;;;;26;22;>20;;;;;;>8192;>63;;;;;;;;;;;<3792896;>1184;;;>8192;;>1960493;>169925;;
;;>10.013;;;<27820850;<1440;<1;;;;;;40;8;;;8;;>995;;>64;;;;>360;;;;1;0;<20;;;;;;>249856;>51486;;;;;;;;;;;>1388544;<326224;;;>16384;;<1933342;<154653;;
;;>10.013;;;<728632;>512;<1;6;;39;;28;39;7;;;7;;6;;>1;;;;27;;;;;;;;;;>2314240;>24224;<270336;<53278;;;;;;;;;;;<12595200;<731048;;;>36864;;<36622;<23937;;
;;>10.013;;;>861960;<784;>1;;;40;;29;40;8;;;8;;36;;>2;;;;38;;;;;;;;;;0;0;>4096;>380;;;;;;;;;;;>13017088;>864616;;;>450560;;<52822;>492625;;
;;>10.013;;;<544;>68512;;5;;;;;;;;;;;6;;>1;;;;>25683;;;;;;;;;;;;<4096;<431;;;;;;;;;2;;>3743744;<67104;;;>12288;;>55019;<489764;;
;;>10.013;;;<1280;<160;;6;;;;;;;;;;;66;;>4;;;;30;;;;;;;;;;;;>12288;>989;;;;;;;;;;;<6799360;<3072;;;>405504;;>2847;>7252;;
;;>10.009;;;>16415407;<63688;;;;;;;35;13;;;13;;>108;;>11;62;;;>76;;;;6;;;;;;;;>4096;>882;;;;;;;;;1;;<585728;>59784;;;>8192;;>1962295;>167182;;
;;>10.013;;;<16426863;>63272;;5;;;;;40;8;;;8;;>787;;>64;0;;;>274;;;;1;;;;;;;;>266240;>48967;;;;;;;;;;;>745472;<68824;;;>12288;;<1940366;<154767;;
;;>11.015;;;>81812425;;;6;;;;;39;9;;;9;;21;;>2;;;;28;;;;4;2;>2;1;1;;>2318336;>19428;<278528;<50228;;;;;;;;;;;>19083264;<19464;;;>208896;;<24845;<20066;;
;;>10.012;;;<82003689;<68016;;4;;;;;40;8;;;8;;34;2;>2;2;;;38;;;;1;0;<2;0;0;;0;0;;>7483;;;;;;;;;;;<8396800;<1576776;;;<1310720;;<62538;>492204;;
;;>10.013;;;<2571112;>608;<4;7;;36;;25;36;4;;;4;;>641;0;>49;0;;;>25900;;;;;;;;;;;;>299008;>23249;;;;;;;;;2;;<123654144;>2178360;;;>147456;;>57724;<499402;;
;;>10.012;;;>3341096;>16;>4;6;;40;;29;40;8;;;8;;67;;>4;;;;39;;;;;;;;;;;;<290816;<30011;;;;;;;;;1;;>110764032;>61992;;;>368640;;>1798;>11427;;
;;>10.016;;;>141368;<1760;;7;;;;;;;;;;;>1152;4;>83;4;;;>434;;;;;;;;;;;;>319488;>75533;;;;;;;;;;;>331776;>14071454;;;>16384;;>2003658;>1592494;;
;;>10.013;;;<4440;>1824;;6;;;;;;;;;;;4;0;;0;;;27;;;;;;;;;;;;0;0;;;;;;;;;0;;>7708672;<13931918;;;>12288;;<1974330;<1579746;;
;;>10.012;;;<3504;>1168;;;;;;;;;;;;;16;;>1;;;;1;;;;;;;;;;;;;>14889;;;;;;;;;;;>802816;<1712;;;>94208;;<1931;<59247;;
;;>10.013;;;>305120;<160;;;;;;;;;;;;;35;;>3;;;;2;;;;;;;;;;>2318336;>20330;>8192;>565;;;;;;;;;;;>1044480;>752;;;>204800;;>91;>327754;;
`;
    const nonMdcFileBlob = [new Blob([nonMdcFileContent], { type: 'text/plain' })];
    return new File(nonMdcFileBlob, 'NonMdcNameServerHistory.trc', {type: 'text/plain', lastModified: Number(new Date())});
  }
  static getMdcFile(): File {
    const mdcFileContent = `host;port;time;indexserverCpu;indexserverCpuSys;indexserverMemUsed;indexserverMemLimit;indexserverHandles;indexserverPingtime;indexserverSwapIn;sqlConnections;internalConnections;externalConnections;idleConnections;sqlTransactions;internalTransactions;externalTransactions;userTransactions;sqlBlockedTrans;sqlStatements;cidRange;mvccNum;pendingRequestCount;acquiredRecordLocks;searchCount;indexingCount;mergeCount;unloadCount;indexserverThreads;waitingThreads;totalThreads;activeSqlExecutors;waitingSqlExecutors;totalSqlExecutors;dataWriteSize;dataWriteTime;logWriteSize;logWriteTime;dataReadSize;dataReadTime;logReadSize;logReadTime;dataBackupWriteSize;dataBackupWriteTime;logBackupWriteSize;logBackupWriteTime;mutexCollisionCount;readWriteLockCollisionCount;admissinControlAdmitCount;admissionControlRejectCount;admissionControlWaitingRequests;admissionControlWaitTime;cpuUsed;memoryResident;memoryTotalResident;memoryUsed;memoryLimit;memorySize;diskUsed;diskSize;networkIn;networkOut;swapIn;swapOut
hanaserver2;;1527846629.804;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;5087236096;2093379585;4192065056768;4328006303744;282214400;4944847437824;0;0;0;0
;;>17.520;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1958043648;>1127363552;>1059710590;;;<16384;;>415313;>450152;;
;30201;;0;-1;3285994511;4192193917920;42;11;0;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;0;0;-1;-1;-1;-1;-1;-1;69631;1920;16347135;177398;75907071;66360;1396735;1629;-1;7396523308736180;-1;7396523308736180;204;34;0;0;0;0
;;>10.003;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>516403200;>497479680;>209019355;;;<4096;;<254355;>648422;;
;30201;;;0;>224694587;;48;16;;0;0;0;0;0;0;0;0;0;493;0;0;0;0;87;55;3;;3;2;115;0;0;5;>53249;<1019;<4644863;<26351;<75882495;<65741;0;0;;0;;0;>79;1;;;;
;;>10.098;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>6361636864;>4572475392;>1961157732;;;>1043210240;;>1184866;>266388;;
;30201;;;;>145968561;<1809444267;64;15;;4;4;;3;1;;;1;;>530;;;;;>29;4;0;;4;;>6;;;;<65536;>1347;<7331840;<77291;0;0;;;;-13754589;;-13754589;57;0;;;;
;30203;;;-1;>342402862;>204830505;43;16;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;>67608575;>171851;>969777151;>897604;-1;>7396523349468431;-1;>7396523349468431;;>7396523363223020;;>7396523363223020;21;;;;;
;30207;;;;<1315462939;<1306959390;40;14;;;;;;;;;;;;;;;;;;;;;;;;;;<67657728;<173650;-1;>7396523423650406;;>75153335;;>75153335;;>75153335;;>75153335;0;;;;;
;;>9.986;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>376770560;>323588096;>240428693;;;>1173356544;;<1309538;<1293818;;
;30201;;;0;>1126547133;>1024568912;65;9;;4;4;0;3;1;0;0;1;0;978;0;0;0;0;;;;;4;2;121;0;0;5;0;0;5947392;<7396523424528477;0;0;0;0;;0;;0;2;;;;;
;30203;;;;>254548502;>87099038;43;12;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;>1174458368;>1014603;-1;-52693542;-1;-52693542;;-52693542;;-52693542;0;;;;;
;30207;;;;<1373474403;<1335676291;40;7;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;-130721071;;-130721071;;-130721071;;-130721071;;-130721071;;;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>448729088;>443670528;>76423176;;;;;>2261;>706436;;
;30201;;;;>1183100197;>1229038213;65;;;4;4;0;3;1;0;0;1;0;1479;1;90;0;0;;3;3;;4;2;121;0;0;5;;;8073216;>130835348;0;0;0;0;;0;;0;4;;;;;
;30203;;;;>534486214;>41867414;43;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;0;0;;-1;-1;-1;-1;-1;-1;;;>6287360;<6163;-1;;-1;;;;;;>470;9;;;;
;30207;;;;<1716006827;<1345749219;40;1;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;0;;;;;;;;;0;0;;;;
;;>10.024;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>917708800;>1061770208;>851024168;;;>11964416;;<9429;<651610;;
;30201;;;;>1271861885;>553100717;65;10;;4;4;0;3;1;0;0;1;0;912;0;0;0;0;40;46;2;;4;2;121;0;0;5;;;5656576;>77491;0;;0;;;>10147328;;>10147328;3;;;;;
;30203;;;;>1156604152;>978117198;45;6;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;76;56;3;;-1;-1;-1;-1;-1;-1;>12902400;>21063;>4345856;>21301;>12287;-7396523296774447;-1;>7677913;;<2469415;;<2469415;>266;33;;;;
;30207;;;;<2422162997;<2377512931;40;2;;;;;;;;;;;;;;;;0;0;0;;;;;;;;0;0;-1;>9570064;-1;>7396523306443303;;>1990943;;>1990943;;>1990943;0;0;;;;
;;>12.627;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2471010304;>2326885344;>1447910803;;;>87117824;;>1157791;>7866598;;
;30201;;;;>1337083917;>80015519;68;6;;4;4;0;3;1;0;0;1;0;1014;0;0;0;0;1;;;;4;2;121;0;0;5;>20480;>737;6127616;<9575717;0;0;0;0;;0;;0;4;;;;;
;30203;;;;>1686642814;>1494958401;>274;17;;;;;;;;;;;>807;8;47;;;>163;6;;;;;>275;;;>283;<12288;<329;>1720320;>40584;>16384;>532;-1;;;;;;63;;;;;
;30207;;;;<2575930758;<2575126606;54;13;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;>68902912;>152731;>11829247;-7396523303514124;-1;0;;;;;;;19;;;;;
;;>7.037;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1;>1189179392;>1153753088;>2003433878;;;>24576;;<676455;>12130400;;
;30201;;;;>1271191099;<629153857;>139;17;;8;7;1;6;4;0;0;4;0;1886;76;1451;0;0;>2803;>433;;;5;2;121;1;0;5;<68882432;<152204;<7663615;>7396523303644112;0;;0;;;;;;>407;;51;;;
;30203;;;;>1384982747;>1271633217;>149;9;;4;4;0;3;1;;;1;;<1219;0;0;;;0;0;;;4;;>276;0;;>283;0;0;<7880704;<68368;;;-1;;;;;;0;;4;;;
;30207;;;;<2651409222;<2639537462;54;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;-1;;;;;;;;;;0;;;
;;>10.027;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1913630720;>1918787584;>743214746;;;>136048640;;<416842;<18402528;;
;30201;;;;>1631152080;>1020079862;>256;9;;9;8;1;7;4;0;0;4;0;2244;521;13478;0;0;>7094;>10778;;;6;5;122;1;1;6;>2510848;>9191;>290783232;>404065;20480;>659;0;;;;;;>2407;>1257;11;;;
;30203;;;;>1099575774;>966234150;>32;;;4;4;0;3;1;;;1;;<803;28;<13298;;;0;3;3;;4;2;>275;0;0;>282;0;0;<282988544;<277141;0;0;-1;-6570222;;-6570222;;-6570222;17;0;0;;;
;30207;;;;<2722850926;<2721651830;54;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;0;0;;-1;-1;-1;-1;-1;-1;;;0;0;-1;-8188770;;-8188770;;-8188770;;-8188770;0;;;;;
;;>10.029;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;5;>5475397632;>5511917568;>2196211479;;;>135114752;;>339794;>14517682;;
;30201;;1;;>2408383862;>297675925;>302;9;;13;12;1;6;8;0;0;8;0;283;1153;2863;0;0;>8905;>4390;;;9;2;142;1;1;6;>929792;>3992;>251510784;>382585;69632;>8189219;0;0;;0;;0;>3114;>293;36;;;
;30203;;0;;>416060480;>320458882;<14;;;4;4;0;3;1;;;1;;>544;2;2;;;40;46;2;;4;;>255;0;0;>282;0;0;<246312960;<302746;0;0;-1;;;;;;3;0;0;;;
;30207;;;;<2818143222;<2808045166;54;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;0;;-1;-1;-1;-1;-1;-1;;;0;0;-1;;;;;;;;0;;;;;
;;>10.026;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;3;>2722340864;>2693586944;<505628168;;;>745472;;>147170;<12973411;;
;30201;;;;>2549829742;>3207848046;>309;9;;14;13;1;12;3;0;0;3;0;6216;729;4208;0;0;>9302;>1598;;;2;0;126;1;0;6;>802816;>5000;>30294016;>123769;151552;>1356;0;;;;;;>3588;96;11;;;
;30203;;;;>345349352;>192435176;<19;10;;4;4;0;3;1;;;1;;<5098;6;<4093;;;1;0;;;4;2;>271;0;;>282;0;0;<23658496;<19486;0;0;-1;;;;;;1;0;0;;;
;30207;;;;<2873599446;<2873075406;54;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;0;0;-1;;;;;;;;0;;;;;
;;>10.029;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1;>614445056;>620015616;<2698486;;;>67665920;;<517336;<1651425;;
;30201;;;;>2625447017;>2779208479;>309;10;;14;13;1;13;3;0;0;3;0;1544;441;5279;0;0;>4567;>2277;1;;4;2;125;1;0;6;>638976;>4847;>99135488;>215682;8192;>495;0;;;-11085016;;-11085016;>856;19;45;;;
;30203;;;;>355571917;>201648717;<19;9;;4;4;0;3;1;;;1;;<279;19;<4935;;;0;0;0;;;;>272;0;;>282;0;0;<92164096;<120771;0;0;-1;;;0;;0;0;0;0;;;
;30207;;;;<2977865462;<2975005238;54;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;-1;;;;;;;;;;;;;
;;>10.028;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;0;>167899136;>163434496;>161672771;;;>4096;;<39764;<1558819;;
;30201;;;;>2658344332;>2610025665;>309;10;;14;13;1;12;3;0;0;3;0;1231;1197;13011;0;0;>431;>190;;;2;0;125;1;0;6;>4096;>224;>3678208;>57735;0;;0;;;;;;;;;;;
;30203;;;;>478428666;>360651338;<19;9;;4;4;0;3;1;;;1;;>934;26;<12880;;;0;0;;;4;2;>272;0;;>282;0;0;>9097216;>86792;;;-1;;;;;;36;;;;;
;30207;;;;<3135193542;<3130770318;54;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;-1;;;;;;;;0;;;;;
;;>10.027;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1;>2468966400;>2797629440;>1102710057;;;>201723904;;>1243272;>202862243;;
;30201;;;;>3392732901;>2355238462;>309;8;;13;12;1;12;3;0;0;3;0;41;3;0;0;0;>4903;>4452;;;4;2;124;1;0;5;>692224;>5056;>421310464;>414100;12288;>657;0;;;;;;>1395;93;>273;;;
;30203;;1;;>150813791;>78743949;<18;9;;;13;0;8;7;;;7;;>221;;2;;;15;2;;;7;0;>277;0;;>283;0;0;<419332096;<396348;0;0;-1;;;;;;<794;0;0;;;
;30207;;0;;<3541964980;<3535114964;54;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;0;0;-1;;;;;;;;0;;;;;
;;>11.027;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1583370240;>1567125504;>1730259953;;;>67637248;;<897085;<202532944;;
;30201;;;;>3963215496;>2378768058;>310;9;;13;12;1;11;3;0;0;3;0;14294;5;0;0;0;>4870;>13520;;;2;0;125;1;0;6;>798720;>3533;>111677440;>91765;12288;>744;0;;;;;;19;;;;;
;30203;;;;>571121193;>425375750;<5;;;;13;0;12;2;;;2;;>4952;0;;;;>9495;<6312;;;;;>283;0;;>282;<593920;<2801;<108478464;<28439;;<409;-1;-7836475;;-7836475;;-7836475;>1448;31;;;;
;30207;;;;<4473057649;<4473120513;60;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<3088384;<59869;-1;-1981731;;-1981731;;-1981731;;-1981731;30;0;;;;
;;>10.035;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2533793792;>2274349056;>1023963476;;;>884400128;;<342681;>222494;;
;30201;;;;>4040091403;>3691219343;>303;11;;135;133;2;19;117;0;0;107;0;1090;2;0;0;0;>6007;>36091;;;132;98;268;0;0;5;>10649600;>15080;>1749209088;>1416548;462848;>1984230;0;0;;0;;0;>1638;>4256;9;;;
;30203;;;;>922638392;>101686890;<4;;;13;13;0;12;2;;;2;;>7240;0;;;;<2813;<13040;;;2;0;>140;;;>283;<7708672;<1361;<1514516480;<1264058;<405504;<1165;-1;;;;;;<1546;0;0;;;
;30207;;;;<4959576579;<4813716493;60;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;0;0;-1;0;;;;;;;0;;;;;
;;>10.023;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;7;>6163849216;>5967044608;>2651348831;;;>274923520;;>1980828;>217510800;;
;30201;;1;;>4540549494;>2036657327;>302;9;;10;10;0;10;1;0;0;1;0;29;0;0;0;0;>29247;>5179;;;4;2;268;0;0;5;>2686976;>6696;>499220480;>457123;69632;>427;0;;;;;;>3744;>22353;>113;;;
;30203;;0;;>691213965;>388023437;<4;10;;14;14;;13;2;;;2;;>451;;;;;<27352;>37832;;;2;0;>140;;;>283;>3342336;>5167;>383008768;>131255;>176128;>1090;-1;;;;;;92;0;0;;;
;30207;;;;<5231361867;<5075602323;60;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;0;0;-1;0;;;;;;;0;;;;;
;;>10.031;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;20;>10086461440;>10138705920;>4398226837;;;>145108992;;>3699506;<105187298;;
;30201;;;;>5704819956;>1276526305;>303;10;;10;10;0;10;1;0;0;1;0;3;0;0;0;0;>14011;>786;;;3;1;147;0;0;5;>3518464;>18802;>292438016;>325679;0;;0;;;;;;>4138;15;;;;
;30203;;;;>22747861;>42458603;>22;11;;14;14;;13;2;;;2;;>1549;>156;>2136;;;<12987;<198;1;;2;0;>261;;;>283;>3866624;<11610;>115945472;<15264;;;-1;;;;;;>2433;0;;;;
;30207;;;;<5722846665;<5712516273;60;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;0;;-1;-1;-1;-1;-1;-1;0;0;0;0;-1;;;;;;;;0;;;;;
;;>10.045;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;4;>4087054336;>4065660928;<3496720112;;;>134266880;;<52550;<84876330;;
;30201;;;;>5905040443;>9536002731;>303;9;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;>698;13;;;1;0;128;0;0;5;;;>322064384;>238750;0;;0;;;;;;>554;81;;;;
;30203;;;;<108134142;<254462934;>22;20;;14;14;;13;2;;;2;;>3477;4;>9830;;;>730;>1668;;;2;;>280;;;>283;>65536;>3563;<300605440;<181015;;;-1;;;;;;92;0;;;;
;30207;;;;<5795328253;<5783240997;60;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;0;0;-1;;;;;;;;0;;;;;
;;>10.024;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2;>1278865408;>1278939136;<1380166483;;;>67112960;;>103192;>2825563;;
;30201;;;;>6058391386;>7572799405;>304;10;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;>139;11;;;1;0;125;0;0;5;;;>112439296;>89654;0;;0;;;;;;>145;5;;;;
;30203;;;;<251738063;<373659271;>23;;;14;14;;13;2;;;2;;>3170;10;>444;;;>2062;>527;;;2;;>283;;;>283;>4096;>327;<107454464;<5933;;;-1;;;;;;>395;;;;;
;30207;;;;<5795103995;<5807424803;60;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<4964352;<82979;-1;;;;;;;;7;0;;;;
;;>10.025;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;0;>202420224;>246296576;<632610889;;;;;<377545;>69520647;;
;30201;;;;>5680796397;>6447649302;>304;9;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;1;;;1;0;124;0;0;5;;;>5791744;>2058;0;;0;;;;;;0;;;;;
;30203;;;;>121677734;<15505122;>28;;;14;14;;13;2;;;2;;>803;4;>1420;;;>1003;70;;;2;;>284;;;>283;;;<4222976;>43372;;;-1;;;;;;42;;;;;
;30207;;;;<5797730435;<5794806155;60;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;0;0;-1;;;;;;;;0;;;;;
;;>10.036;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;11;>1978277888;>2223283232;>2924150686;;;>1314816;;<4324629;>47733719;;
;30201;;;;>5676566021;>2886673911;>305;8;;9;9;0;9;0;0;0;0;0;1007;0;0;0;0;>789;4;;;2;0;123;0;0;5;>20480;>787;>307200;>9342;0;;0;;;;;;>236;9;;;;
;30203;;1;;>809189515;>631754299;>280;10;;10;11;-1;11;1;;;3;;4;>1176;;;;>31722;>4370;;;6;2;>388;;;>253;>1290240;>1943;>117760000;>533645;;;-1;;;;;;>13000;>10958;;;;
;30207;;0;;<6627923848;<6582238296;57;12;;-1;-1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<118050816;<542485;-1;;;;;;;;4;0;;;;
;;>10.029;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;17;>481636352;>1067712512;>256575279;;;>114688;;<1006631;<147332841;;
;30201;;;;>5818716597;>5693890982;>306;8;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;123;0;0;5;>8192;>430;<8192;<62;0;;0;;;;;;1;;;;;
;30203;;1;;>1793565395;>1590048669;>272;10;;10;10;;10;1;;;1;;;>4250;;;;>22419;>3072;;;4;2;>151;;;21;>253952;>150;>179077120;>415511;;;-1;;;;;;>10056;19;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;10;>5522141184;>5517656064;>223412499;;;>105910272;;<18369;<714620;;
;30201;;0;;<1793582243;<1813478016;<274;9;;9;9;;9;0;;;0;;3;0;;;;0;0;;;1;0;<151;;;5;>101998592;>74260;<179081216;<415663;;;0;;;;;;0;0;;;;
;30203;;;;>1760898214;>1626656038;<14;;;6;6;;6;;;;;;0;>4257;;;;>14531;6;;;2;1;<13;;;0;<98459648;<65486;>197890048;>72647;;;-1;;;;;;>6017;62;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1;>1456680960;>1458544640;<2193636237;;;>1006112768;;>4653;>217907;;
;30201;;;;<1760941126;>566937287;>10;;;9;9;;9;;;;;;;0;;;;0;0;;;1;0;>13;;;5;0;0;0;0;;;0;;;-8308809;;-8308809;0;0;;;;
;30203;;;;>1815111689;>1680894105;<10;;;6;6;;6;;;;;;;>4261;;;;;4;;;3;2;<17;;;0;;;>1017135104;>953806;;;-1;;;0;;0;24;;;;;
;;>10.030;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;0;<116682752;<329982944;<5044509088;;;>2412457984;;>3415;>749271;;
;30201;;;;<1817195345;>3361531327;<118;;;9;9;;9;;;;;;3;0;;;;;0;;;1;0;>17;;;5;;;<1017131008;<953540;;;0;;;;;;0;;;;;
;30203;;;;<3818274310;<2983414518;>115;15;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;-1;>7396523289800475;>75874304;>81323;-1;>7396523290041945;-1;;;;;;>348;1;;;;
;;>28.226;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;0;<60253828064;<11669333034;;;>2157191168;;0;0;;
;;>12.342;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>5043105792;>3666281440;>2887042014;;;;;>953748;>1059145;;
;30201;;;-1;<213572434;>7668752992;50;13;;2;2;0;1;2;1;0;1;0;259;371;1594;0;0;55;8;;;5;2;113;0;0;5;73727;<7396523289798389;<73199617;<23128;554958847;<7396523288599561;1396735;>1032;;>7396523286696232;;>7396523286696232;<85;32;;;;
;;>10.036;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1;>6262493184;>5081412576;>2924884084;;;;;<563863;<600957;;
;30201;;;0;>382712521;<2557778803;55;6;;;;;;;;;;;>912;>851;>1998;;;0;0;;;;;;;;;<53247;<1313;>1101825;>37129;0;0;0;0;;-7237966;;-7237966;1;0;;;;
;30203;;;-1;<124982052;<173814346;45;12;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;1;;;-1;-1;-1;-1;-1;-1;>4095;<387;<3198977;<87862;>14725119;>21531;>1396735;>1679;;>7396523305413104;;>7396523305413104;>705;>196;;;;
;30207;;;;<2005549023;<2011536039;43;;;;;;;;;;;;;;;;;;0;;;;;;;;;;>135;<561152;<6885;>53047296;>19691;;>2;;>5685847;;>5685847;<312;0;;;;
;;>10.046;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2130960384;>2039156736;>1854246965;;;;;<330926;>343710;;
;30201;;;0;>2500655669;>777935912;56;14;;2;2;0;1;1;0;0;1;0;396;0;92;0;0;;1;;;4;2;114;0;0;5;0;0;>4624385;>49630;<65146879;<36305;0;0;;-8621465;;-8621465;>5513;;;;;
;30203;;;;>978083376;>827066163;47;18;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;53;6;;;-1;-1;-1;-1;-1;-1;;;<53248;>60426;>504168448;>1246974;;;;-16673447;;-16673447;83;;;;;
;30207;;;;<3477159461;<3456378208;43;8;;;;;;;;;;;;;;;;0;0;;;;;;;;;;;0;0;0;0;;;;-19697264;;-19697264;0;;;;;
;;>10.028;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>740712448;>719179776;>543650627;;;;;<30480;<738620;;
;30201;;;;>2502653853;>2116325346;56;7;;2;2;0;1;1;0;0;1;0;62;0;0;0;0;;;;;3;1;114;0;0;5;;;>1179648;>13909;;;;;;0;;0;;;;;;
;30203;;;;>1532129622;>1369573430;47;11;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;>6422528;>78500;;;;;;;;;7;;;;;
;30207;;;;<4034778675;<4029520011;43;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;0;0;;;;;;;;;0;;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;3;>4938383360;>4937953280;>1702892190;;;;;>10741;>90986;;
;30201;;;;>2551244277;>957025639;56;7;;2;2;0;1;1;0;0;1;0;41;0;0;0;0;;;;;3;1;114;0;0;5;;;>737280;>10576;;;;;;;;;;;;;;
;30203;;;;>1881910375;>1753479559;>273;6;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;>538;88;;;-1;-1;-1;-1;-1;-1;;;>20455424;>52149;>37359616;>78115;;;;>834270856;;>834270856;>903;63;;;;
;30207;;;;<4414245132;<4394528860;43;3;;;;;;;;;;;;;;;;0;0;;;;;;;;;;;0;0;0;0;;;;>5983997;;>5983997;0;0;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1;>886861824;>851709952;>18361514;;;;;<4945;>630560;;
;30201;;;;>2501343829;>2613049883;56;5;;2;2;0;1;1;0;0;1;0;34;0;0;0;0;;;;;3;1;114;0;0;5;;;>466944;>8808;;;;;;>557479068;;>557479068;;;;;;
;30203;;;;>1969181648;>1840451365;>273;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;1;;;-1;-1;-1;-1;-1;-1;;;>6213632;>18703;;;;;;0;;0;;;;;;
;30207;;;;<4457898853;<4459219738;43;3;;;;;;;;;;;;;;;;;0;;;;;;;;;;;0;0;;;;;;;;;;;;;;
;;>10.029;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;0;>247312384;>218722304;<539170017;;;;;<1739;<726314;;
;30201;;;;>2516616485;>3205980726;56;6;;2;2;0;1;1;0;0;1;0;27;0;0;0;0;;;;;3;1;114;0;0;5;;;>319488;>7044;;;;;;;;;;;;;;
;30203;;;;>2032280958;>1886387597;>274;14;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;1;;;-1;-1;-1;-1;-1;-1;;;>7954432;>31911;;;;;;;;;;;;;;
;30207;;;;<4547317859;<4551618722;43;4;;;;;;;;;;;;;;;;;0;;;;;;;;;;;0;0;;;;;;;;;;;;;;
;;>10.042;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1;>1002307584;>1296610272;>516194810;;;;;>192689;>727220;;
;30201;;;;>2479461509;>2142573547;57;6;;2;2;0;1;1;0;0;1;0;24;0;0;0;0;3;;;;3;1;114;0;0;5;>16384;>754;>344064;>6967;>352256;>1986;;;;;;;2;;;;;
;30203;;;;>2494189752;>2242088148;>567;18;;11;11;;6;6;;;6;;>3822;2;2;;;>282;1;;;7;0;>285;;;>283;0;0;>3313664;>35895;>1982464;>7710;;;;>835394957;;>835394957;>355;;;;;
;30207;;;;<4657195467;<4584400711;50;12;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<3551232;<39987;0;0;;;;<9571151;;<9571151;0;;;;;
;;>10.025;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2128625664;>1594482688;>764508271;;;;;>462671;>72053997;;
;30201;;;;>2226844547;>1591862467;59;6;;2;2;0;1;1;0;0;1;0;315;0;0;0;0;;;;;3;1;114;0;0;5;>8192;>307;>720896;>18809;;;;;;0;;0;;;;;;
;30203;;1;;>2663749863;>2534247672;>575;7;;9;9;;9;0;;;0;;>760;;;;;>1142;7;;;1;0;>290;;;>283;0;0;<65536;<11805;>15630336;>29517;;;;;;;>854;5;;;;
;30207;;0;;<4879150850;<4879150850;55;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<741376;<9195;0;0;;;;;;;11;0;;;;
;;>10.023;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;0;>107134976;>68132864;>70348843;;;;;>3010365;>524792321;;
;30201;;;;>2284954132;>2338609306;60;6;;2;2;0;1;1;0;0;1;0;378;0;0;0;0;;;;;3;1;114;0;0;5;>4096;>211;>835584;>22973;;;;;;;;;0;;;;;
;30203;;;;>2594204142;>2470200125;>574;7;;9;9;;9;0;;;0;;3;;;;;;;;;1;0;>290;;;>283;0;0;<851968;<23418;;;;;;;;;;;;;;
;30207;;;;<4879152578;<4879152578;55;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.028;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<35696640;<159780864;>1343996196;;;;;<3336687;<597227589;;
;30201;;;;>2344806921;>1135751141;61;14;;1;1;0;0;2;1;0;1;0;789;0;0;0;0;;;;;3;1;114;0;0;5;;;>3817472;>57301;;;;;;;;;2;;;;;
;30203;;;;>2534327177;>2399386761;>424;6;;9;9;;9;0;0;;0;;8;;;;;;;;;1;0;>290;;;>283;;;<3776512;<55554;;;;;;;;;12;;20;;;
;30207;;;;<4879128402;<4879128402;55;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;0;;0;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1;>1032851456;>951255040;>386484953;;;;;<61554;>373351;;
;30201;;1;;>2733330908;>2455747041;72;8;;9;9;0;4;5;0;0;5;0;1640;4;12;0;0;>1462;;;;7;1;123;0;0;5;>4096;>217;>1646592;>14355;>2609152;>7565;;;;;;;>1751;6;;;;
;30203;;0;;>2144340822;>2035440248;>288;7;;;;;9;0;;;0;;3;0;0;;;0;;;;1;0;>281;;;>283;0;0;<1642496;<14051;0;0;;;;;;;0;0;;;;
;30207;;;;<4877630274;<4877630786;55;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>11.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;0;>61202432;>47640576;>72183628;;;;;<279564;<693032;;
;30201;;;;>2761246134;>2823273466;72;5;;9;9;0;9;0;0;0;0;0;452;0;0;0;0;>326;12;;;1;0;122;0;0;5;;;>266240;>5984;>3862528;>16034;;;;>232209417;;>232209417;83;;;;;
;30203;;;;>2116391276;>1982180316;>288;6;;;;;;;;;;;0;;;;;0;0;;;;;>282;;;>283;;;0;0;0;0;;;;0;;0;0;;;;;
;30207;;;;<4877630818;<4877630818;55;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>86360064;>68124672;>26830284;;;;;>8351;>501350;;
;30201;;;;>2761261430;>2868648122;72;6;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>276;;;;;;;;;;;;;;
;30203;;;;>2117392248;>1983175272;>290;;;;;;;;;;;;>1004;;;;;>834;4;;;;;>282;;;>283;;;>299008;>9401;;;;;;-71863317;;-71863317;>284;10;;;;
;30207;;;;<4870279582;<4870279582;57;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<282624;<8697;;;;;;-69908665;;-69908665;13;0;;;;
;;>10.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>240459776;>219324416;>47664808;;;;;>161203;>327081;;
;30201;;;;>2752883430;>2839447614;71;6;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;0;;0;0;;;;;
;30203;;;;>2154058800;>2019829808;>291;;;;;;;;;;;;>666;;;;;>529;8;;;;;>282;;;>283;;;>315392;>7254;>2822144;>11061;;;;;;;>215;6;;;;
;30207;;;;<4905314614;<4905339206;57;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<303104;<6718;0;0;;;;;;;4;0;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3608576;>19406848;>3229896;;;;;<166539;<851949;;
;30201;;;;>2751262646;>2882273374;71;5;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;<8192;<251;;;;;;;;;0;;;;;
;30203;;;;>2154058264;>2019842232;>291;6;;;;;;;;;;;;;;;;;;;;;;>282;;;>283;;;;<40;;;;;;;;;;;;;;
;30207;;;;<4905317070;<4905317070;57;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>5742592;<2134016;>6303648;;;;;<9966;<18674;;
;30201;;;;>2752813078;>2879177062;71;4;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2152508920;>2019841288;>291;;;;;;;;;;;;;;;;;;;;;;;>282;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4905316302;<4905316302;57;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>41730048;>28184576;>19119048;;;>344064;;>21590;>726528;;
;30201;;;;>2754791374;>2871463798;76;5;;9;9;0;9;0;0;0;0;0;1007;0;0;0;0;>789;4;;;1;0;122;0;0;5;>1765376;>2359;>299008;>8265;;;;;;;;;>267;;;;;
;30203;;;;>2150572224;>2016355120;>287;6;;;;;;;;;;;3;;;;;0;0;;;;;>282;;;>283;0;0;<294912;<8056;;;;;;;;;0;;;;;
;30207;;;;<4905357326;<4905357326;57;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3710976;<1433600;>4819760;;;;;<17885;<712584;;
;30201;;;;>2754790030;>2882612878;76;5;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2150573120;>2016356144;>287;4;;;;;;;;;;;;;;;;;;;;;;>282;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4905357454;<4905357454;57;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>9.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>32743424;>27275264;>7554424;;;>31682560;;>6925;<7386;;
;30201;;;;>2754819086;>2881454534;78;4;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>280;;;;;;;;;;;;;;
;30203;;;;>2153213168;>2019043728;>292;6;;;;;;;;;;;>1004;;;;;>790;4;;;;;>284;;;>283;>34721792;>23290;>303104;>8113;;;;;;;;;>502;10;;;;
;30207;;;;<4907916390;<4907936662;59;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<286720;<7764;;;;;;;;;8;0;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2424832;<348160;>7960704;;;;;<2325;>709690;;
;30201;;;;>2754709046;>2880965286;78;5;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2153212528;>2018995424;>292;6;;;;;;;;;;;;;;;;;;;;;;>284;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4907917414;<4907917414;59;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1798144;>11997184;>119400;;;;;>54441;<394082;;
;30201;;;;>2754710878;>2888808582;78;5;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>196;;;;;;;;;;;;;;
;30203;;;;>2151748296;>2017531192;>290;6;;;;;;;;;;;;;;;;;;;;;;>284;;;>283;;;;<22;;;;;;;;;;;;;;
;30207;;;;<4906453478;<4906453478;59;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1130496;<352256;>1611232;;;;;<44595;<310002;;
;30201;;;;>2754711054;>2887316926;78;4;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2151750600;>2017533496;>290;5;;;;;;;;;;;;;;;;;;;;;;>284;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4906454550;<4906454550;59;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>35655680;>31711232;>20686112;;;;;>10539;>494242;;
;30201;;;;>2762690558;>2876220654;78;4;;9;9;0;9;0;0;0;0;0;1007;0;0;0;0;>789;4;;;1;0;122;0;0;5;>8192;>307;>299008;>7745;;;;;;;;;>208;3;;;;
;30203;;;;>2143809144;>2009592936;>290;6;;;;;;;;;;;3;;;;;0;0;;;;;>284;;;>283;0;0;<294912;<7437;;;;;;;;;0;0;;;;
;30207;;;;<4906494758;<4906494758;59;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>913408;<6926336;>84880;;;;;<24505;<488787;;
;30201;;;;>2762731534;>2896874430;78;4;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2143768728;>2009540952;>290;6;;;;;;;;;;;;;;;;;;;;;;>284;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4906494566;<4906483894;59;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>35823616;>22671360;>12846680;;;>1208320;;>10555;>5459;;
;30201;;;;>2762734302;>2884094534;78;2;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>282;;;;;;-124192898;;-124192898;;;;;;
;30203;;;;>2147289768;>2013092712;>293;7;;;;;;;;;;;>1082;;;;;>835;4;;;;;>284;;;>283;>1208320;>1542;>323584;>8429;;;;;;0;;0;>442;12;;;;
;30207;;;;<4907061422;<4907107150;62;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<307200;<7976;;;;;;;;;15;0;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>5320704;<815104;>7833872;;;;;<5257;>776602;;
;30201;;;;>2762901942;>2886185878;78;5;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2144164664;>2013072056;>293;4;;;;;;;;;;;;;;;;;;;;;;>284;;;>283;;;;;;;;;;-119386860;;-119386860;;;;;;
;30207;;;;<4905487662;<4905512254;62;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;-119044753;;-119044753;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>5890048;>79110144;>4781568;;;;;>177119;>3851700;;
;30201;;;;>2761354006;>2890814614;78;4;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>253;;;;;;0;;0;;;;;;
;30203;;;;>2144139768;>2009922184;>293;6;;;;;;;;;;;;;;;;;;;;;;>284;;;>283;;;;<1;;;;;;;;;;;;;;
;30207;;;;<4905488078;<4905488078;62;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>532480;<27230208;>1632192;;;;;<182396;<4640915;;
;30201;;;;>2761353670;>2893939062;78;2;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2144141768;>2009923416;>293;6;;;;;;;;;;;;;;;;;;;;;;>284;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4905489102;<4905489102;62;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>32968704;>34385920;>16179328;;;>9330688;;>130148;>6396787;;
;30201;;;;>2766418950;>2884457974;80;5;;9;9;0;9;0;0;0;0;0;1085;0;0;0;0;>834;4;;;1;0;122;0;0;5;>18874368;>10584;>335872;>9016;;;;;;;;;>262;4;;;;
;30203;;;;>2139076680;>2004859096;>291;7;;;;;;;;;;;3;;;;;0;0;;;;;>284;;;>283;0;0;<331776;<8780;;;;;;;;;0;0;;;;
;30207;;;;<4905453982;<4905453982;62;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2514944;<18722816;>73296;;;;;<122157;<5601516;;
;30201;;;;>2766402070;>2900546358;80;5;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2139057736;>2004840152;>291;6;;;;;;;;;;;;;;;;;;;;;;>284;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4905455006;<4905455006;62;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>76955648;>56008704;>9346136;;;>77524992;;>3851;<792692;;
;30201;;;;>2766398334;>2891269782;80;5;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>245;;;;;;;;;;;;;;
;30203;;;;>2141279536;>2007082264;>294;6;;;;;;;;;;;>1004;;;;;>790;4;;;;;>285;;;>283;>88592384;>116133;>299008;>8474;;;;;;;;;>412;10;;;;
;30207;;;;<4903728710;<4903748862;65;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;<87977984;<115124;<278528;<7896;;;;;;;;;17;0;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2215936;<2658304;>4706680;;;;;<10297;<1314;;
;30201;;;;>2762449814;>2891960558;80;5;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;0;0;0;0;;;;;;;;;0;;;;;
;30203;;;;>2141278432;>2007060848;>294;3;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4903728886;<4903728886;65;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.012;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>319488;>11767808;>1598832;;;;;>22281;>729327;;
;30201;;;;>2762451590;>2895070342;80;4;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>194;;;;;;;;;;;;;;
;30203;;;;>2141295664;>2007078080;>294;3;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;>90;;;;;;;;;;;;;;
;30207;;;;<4903747254;<4903747254;65;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.011;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>684032;<8298496;>7536;;;;;<24165;<729275;;
;30201;;;;>2762451078;>2896661126;80;4;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2141297888;>2007080304;>294;3;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4903747430;<4903747430;65;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>20881408;>20779008;>10208448;;;;;>23465;>25707;;
;30201;;;;>2764737558;>2887172806;80;6;;9;9;0;9;0;0;0;0;0;1007;0;0;0;0;>789;4;;;1;0;122;0;0;5;;;>299008;>8063;;;;;;;;;>232;3;;;;
;30203;;;;>2139029392;>2006385696;>294;;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;;;<294912;<7827;;;;;;;;;0;0;;;;
;30207;;;;<4903767558;<4903767558;65;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1724416;<6381568;>1603968;;;;;<14873;>693629;;
;30201;;;;>2764762758;>2897376374;80;5;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2139004976;>2004787392;>294;4;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4903767222;<4903767222;65;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>20946944;>14839808;>3598504;;;;;>7937;<702758;;
;30201;;;;>2764789318;>2895408398;80;5;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>190;;;;;;;;;;;;;;
;30203;;;;>2141140456;>2006943024;>294;6;;;;;;;;;;;>1004;;;;;>790;4;;;;;>285;;;>283;;;>294912;>7984;;;;;;;;;>448;6;;;;
;30207;;;;<4904584278;<4904603758;65;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<278528;<7402;;;;;;;;;9;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2396160;<573440;>3125336;;;;;<13915;<9958;;
;30201;;;;>2763443822;>2894535398;80;5;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2141139992;>2006922408;>294;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4904584966;<4904584966;65;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2166784;>10067968;>1576448;;;;;>14607;>708866;;
;30201;;;;>2763445934;>2896087070;80;3;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>202;;;;;;;;;;;;;;
;30203;;;;>2141140632;>2006923048;>294;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;>8;;;;;;;;;;;;;;
;30207;;;;<4904586566;<4904586566;65;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>61710336;>50446336;>5426888;;;;;>68799;<638261;;
;30201;;;;>2764223222;>2893013918;80;4;;9;9;0;9;0;0;0;0;0;29;0;0;0;0;27;;;;1;0;122;0;0;5;;;>8192;>448;;;;;;;;;7;;;;;
;30203;;;;>2140364288;>2006146704;>294;5;;;;;;;;;;;0;;;;;0;;;;;;>285;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<4903037446;<4903062038;65;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>179453952;>172707840;>17306416;;;;;>174689;>160019;;
;30201;;;;>2765723086;>2882658846;80;4;;9;9;0;9;0;0;0;0;0;1663;0;0;0;0;>1251;12;;;1;0;122;0;0;5;;;>569344;>14849;;;;;;;;;>343;2;;;;
;30203;;;;>2137334096;>2003116512;>294;5;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;;;<565248;<14640;;;;;;;;;0;0;;;;
;30207;;;;<4903057662;<4903057150;65;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>430080;<3461120;<336;;;;;<251669;>480072;;
;30201;;;;>2765723566;>2899940974;80;5;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2137334272;>2003116688;>294;;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4903057838;<4903057838;65;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>24694784;>17371136;>8424520;;;;;>4091;<715784;;
;30201;;;;>2765725518;>2891518582;80;5;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>244;;;;;;;;;;;;;;
;30203;;;;>2139328552;>2005131496;>295;6;;;;;;;;;;;>1082;;;;;>835;4;;;;;>285;;;>283;;;>327680;>8563;;;;;;;;;>492;10;;;;
;30207;;;;<4904993158;<4905013526;66;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<311296;<8110;;;;;;;;;26;0;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>241790976;>241455104;>5257992;;;;;>212675;>193920;;
;30201;;;;>2765664606;>2894624038;80;5;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2142976240;>2008758656;>295;6;;;;;;;;;;;>685;;;;;>489;8;;;;;>285;;;>283;>4096;>229;>319488;>6697;;;;;;;;;>213;2;;;;
;30207;;;;<4908596014;<4908596014;66;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<307200;<6135;;;;;;;;;1;0;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>184320;>11431936;>43696;;;;;<207920;>528714;;
;30201;;;;>2765620910;>2899794798;80;4;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;<8192;<301;;;;;;;;;0;;;;;
;30203;;;;>2142993072;>2008775488;>295;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;<31;;;;;;;;;;;;;;
;30207;;;;<4908613982;<4908613982;66;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>897024;<5758976;>176;;;;;<17189;<734980;;
;30201;;;;>2765620910;>2899838318;80;4;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2142993248;>2008775664;>295;5;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4908613646;<4908614158;66;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>16195584;>12472320;>5091680;;;;;>14896;>21224;;
;30201;;;;>2767571574;>2896697990;80;4;;9;9;0;9;0;0;0;0;0;1085;0;0;0;0;>834;4;;;1;0;122;0;0;5;>4096;>323;>331776;>8747;;;;;;;;;>208;4;;;;
;30203;;;;>2141061152;>2006843568;>295;5;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;0;0;<327680;<8513;;;;;;;;;0;0;;;;
;30207;;;;<4908634998;<4908634998;66;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;1;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1748992;>1486848;>1574080;;;;;>377;>709301;;
;30201;;;;>2767573334;>2900216838;80;5;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;0;;;;;
;30203;;;;>2141062368;>2006844784;>295;;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4908635702;<4908635702;66;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>26107904;>19161088;>13947160;;;;;<4045;<704519;;
;30201;;;;>2769123510;>2887844638;80;6;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>269;;;;;;;;;;;;;;
;30203;;;;>2140189096;>2007520744;>295;5;;;;;;;;;;;>1004;;3;;;>790;4;;;;;>285;;;>283;>4096;>261;>294912;>7606;;;;;;;;;>385;6;;;;
;30207;;;;<4903912766;<4903912542;66;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<278528;<7208;;;;;;;;;21;0;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2043904;>3608576;>1572864;;;;;<10137;<22686;;
;30201;;;;>2763748438;>2896392998;80;;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;-228185838;;-228185838;0;;;;;
;30203;;;;>2140163864;>2005946280;>295;5;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;0;;0;;;;;;
;30207;;;;<4903912942;<4903912942;66;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>364544;>5402624;>1936;;;;;>10849;>716138;;
;30201;;;;>2763750214;>2897965862;80;2;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>226;;;;;;;;;;;;;;
;30203;;;;>2140163528;>2005945944;>295;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;>52;;;;;;-268105630;;-268105630;;;;;;
;30207;;;;<4903913742;<4903913742;66;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;-270626691;;-270626691;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1855488;>7319552;>304;;;;;>793;<692641;;
;30201;;;;>2763750342;>2897967622;80;4;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;0;;0;;;;;;
;30203;;;;>2140163576;>2005945992;>295;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4903913406;<4903913918;66;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>19931136;>16859136;>8038664;;;;;>67;<4131;;
;30201;;;;>2765448086;>2891627518;80;4;;9;9;0;9;0;0;0;0;0;1007;0;0;0;0;>789;4;;;1;0;122;0;0;5;>2367488;>1925;>299008;>8204;;;;;;;;;>276;3;;;;
;30203;;;;>2138467968;>2004250384;>295;5;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;0;0;<294912;<7956;;;;;;;;;0;0;;;;
;30207;;;;<4903917366;<4903917366;66;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2838528;<139264;>1574592;;;;;<5593;>697024;;
;30201;;;;>2765449398;>2898092390;80;5;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2138468672;>2004251088;>295;4;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4903918070;<4903918070;66;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>22163456;>20418560;>9321624;;;;;>5113;<700948;;
;30201;;;;>2765450502;>2890346462;80;5;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>222;;;;;;;;;1;;;;;
;30203;;;;>2141611608;>2007430568;>295;4;;;;;;;;;;;>1004;;;;;>790;4;;;;;>285;;;>283;>4096;>226;>294912;>7779;;;;;;;;;>491;9;;;;
;30207;;;;<4905709582;<4905745966;66;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<278528;<7241;;;;;;;;;25;0;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>126976;<245760;<37808;;;;;<13037;<13370;;
;30201;;;;>2764097974;>2898353206;80;3;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2141611144;>2007393560;>295;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4905709758;<4905709758;66;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2494464;>6696960;>3256;;;;;>13619;>723544;;
;30201;;;;>2764100262;>2898314590;80;4;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>222;;;;;;;;;;;;;;
;30203;;;;>2141611104;>2007393520;>295;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;<40;;;;;;;;;;;;;;
;30207;;;;<4905711366;<4905711366;66;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>700416;>4067328;>1551088;;;;;<1409;<712325;;
;30201;;;;>2764099926;>2896766934;80;4;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2141613056;>2007394960;>295;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4905712982;<4905712982;66;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>32444416;>27025408;>6711656;;;>1245184;;<1279;<6745;;
;30201;;;;>2766021406;>2893527334;81;4;;10;10;0;10;0;0;0;0;0;1015;0;0;0;0;>789;4;;;1;0;122;0;0;5;>5066752;>3072;>303104;>7955;;;;;;;;;>216;2;;;;
;30203;;;;>2139748312;>2005530728;>294;7;;9;9;;9;;;;;;3;;;;;0;0;;;;;>285;;;>283;0;0;<299008;<7766;;;;;;;;;0;0;;;;
;30207;;;;<4905757942;<4905757430;67;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3571712;>2863104;>3150448;;;;;<1346;>720028;;
;30201;;;;>2766010158;>2897076782;81;5;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;2;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2139865880;>2005530376;>294;6;;9;9;;9;;;;;;;;;;;;;;;1;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4905875270;<4905758118;67;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>9.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>19402752;>9043968;>4082112;;;>2949120;;>3651;<707234;;
;30201;;;;>2766011006;>2896170014;81;5;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>233;;;;;;;;;;;;;;
;30203;;;;>2142755520;>2007872936;>294;6;;;;;;;;;;;>1090;47;>123;;;>835;4;;;;;>285;;;>283;>9748480;>4990;>344064;>9278;;;;;;;;;>365;1;;;;
;30207;;;;<4908737182;<4908094950;67;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;<9199616;<3935;<323584;<8667;;;;;;;;;28;0;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>253952;>5435392;>561216;;;;;<3828;<3149;;
;30201;;;;>2765981790;>2899638158;81;4;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;0;0;0;0;;;;;;;;;0;;;;;
;30203;;;;>2142735384;>2008517800;>294;5;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4908717974;<4908717974;67;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1003520;>8171520;>1056;;;;;>18070;>719990;;
;30201;;;;>2765983550;>2900200078;81;;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>222;;;;;;;;;;;;;;
;30203;;;;>2142734840;>2008517256;>294;4;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;<36;;;;;;;;;;;;;;
;30207;;;;<4908718710;<4908718710;67;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.012;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>389120;>5853184;<1104;;;;;<21382;<719583;;
;30201;;;;>2765983870;>2900202558;81;;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2142735016;>2008517432;>294;5;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4908720166;<4908720166;67;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>11546624;>15441920;>3184792;;;;;>21306;>22028;;
;30201;;;;>2769155526;>2900188318;81;4;;10;10;0;10;0;0;0;0;0;1085;0;0;0;0;>834;4;;;1;0;122;0;0;5;;;>327680;>9045;;;;;;;;;>257;6;;;;
;30203;;;;>2139573328;>2005355744;>294;5;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;;;<323584;<8831;;;;;;;;;0;0;;;;
;30207;;;;<4908729318;<4908729318;67;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>90112;<2228224;>24944;;;;;<17000;>677843;;
;30201;;;;>2769180758;>2903373398;81;3;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2139548736;>2005331152;>294;5;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4908729494;<4908729494;67;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>19075072;>9666560;>2141712;;;;;<1798;<707951;;
;30201;;;;>2769181734;>2901257606;81;5;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>238;;;;;;;;;;;;;;
;30203;;;;>2140043544;>2005825960;>294;;;;;;;;;;;;>1004;38;100;;;>790;4;;;;;>285;;;>283;;;>294912;>7637;;;;;;;;;>370;5;;;;
;30207;;;;<4909209790;<4909209790;67;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<278528;<7177;;;;;;;;;9;0;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1679360;>4595712;>6196048;;;;;<7108;>3004;;
;30201;;;;>2769166246;>2897187782;81;4;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2140023296;>2005805712;>294;;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4909190342;<4909190342;67;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>61440;>3534848;>27192;;;;;>11343;>711860;;
;30201;;;;>2769168134;>2903358526;81;;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>219;;;;;;;;;;;;;;
;30203;;;;>2140023720;>2005806136;>294;4;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;<22;;;;;;;;;;;;;;
;30207;;;;<4909191854;<4909191854;67;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>21008384;>17035264;>20827216;;;;;>20569;<696305;;
;30201;;;;>2788405942;>2901796310;81;5;;10;10;0;10;0;0;0;0;0;474;0;0;0;0;>392;2;;;1;0;122;0;0;5;;;>131072;>4046;>946176;>3480;;;;;;;>114;3;;;;
;30203;;;;>2120787688;>1986570104;>294;;;;;;;;;;;;0;;;;;0;0;;;;;>285;;;>283;;;0;0;0;0;;;;;;;0;0;;;;
;30207;;;;<4909155294;<4909155294;67;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>224075776;>221380608;>7854624;;;;;>229481;>223337;;
;30201;;;;>2789862838;>2916225798;81;5;;10;10;0;10;0;0;0;0;0;1663;0;0;0;0;>1251;12;;;1;0;122;0;0;5;;;>565248;>14434;;;;;;;;;>309;3;;;;
;30203;;;;>2119295832;>1985078248;>294;;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;;;<561152;<14247;;;;;;;;;0;0;;;;
;30207;;;;<4909159662;<4909159662;67;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>176128;<2703360;>208;;;;;<254239;>474914;;
;30201;;;;>2789863862;>2924081238;81;4;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2119295976;>1985078392;>294;5;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4909159838;<4909159838;67;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>11841536;>3489792;>1711472;;;;;>3779;<709610;;
;30201;;;;>2789864742;>2922370854;81;7;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>199;;;;;;;;;;;;;;
;30203;;;;>2119683960;>1985466328;>295;5;;;;;;;;;;;>1004;;;;;>790;4;;;;;>285;;;>283;;;>286720;>7445;;;;;;;;;>391;4;;;;
;30207;;;;<4908227086;<4908226878;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<270336;<6980;;;;;;;;;11;0;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>172605440;>173391872;>39774064;;;;;>168637;>153470;;
;30201;;;;>2788543126;>2882986486;81;5;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2142614008;>2008396424;>295;;;;;;;;;;;;>1130;;;;;>854;10;;;;;>285;;;>283;;;>454656;>10574;>655360;>2757;;;;;;;>323;4;;;;
;30207;;;;<4914313006;<4914337598;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<430080;<9568;0;0;;;;;;;26;0;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>253952;>22392832;>44352;;;;;<154218;>585768;;
;30201;;;;>2771699958;>2905897782;81;5;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;<20480;<805;;;;;;;;;0;;;;;
;30203;;;;>2142631848;>2008414264;>295;4;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;>74;;;;;;;;;;;;;;
;30207;;;;<4914331806;<4914331806;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1806336;>4055040;>1232;;;;;<22700;<750628;;
;30201;;;;>2771701014;>2905917366;81;5;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;-285679637;;-285679637;;;;;;
;30203;;;;>2142630968;>2008413384;>295;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;0;;0;;;;;;
;30207;;;;<4914331982;<4914331982;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>11251712;>3809280;>6514312;;;;;>12401;>16746;;
;30201;;;;>2771944110;>2899647382;81;4;;10;10;0;10;0;0;0;0;0;1007;0;0;0;0;>789;4;;;1;0;122;0;0;5;;;>299008;>8125;;;;;;;;;>246;5;;;;
;30203;;;;>2142390512;>2008172928;>295;5;;;;;;;;;;;3;;;;;0;0;;;2;;>285;;;>283;;;<294912;<7927;;;;;;-253671167;;-253671167;0;0;;;;
;30207;;;;<4914337006;<4914337006;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;-252735296;;-252735296;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1835008;>16384;<160;;;;;<5763;>704096;;
;30201;;;;>2771946670;>2906164414;81;5;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;>12288;>285;;;;;;;;0;;0;;;;;;
;30203;;;;>2142390512;>2008172928;>295;4;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;0;0;;;;;;;;;;;;;;;;
;30207;;;;<4914337694;<4914337694;68;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>11.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>25620480;>20336640;>11253440;;;;;>4657;<716952;;
;30201;;;;>2771948238;>2894912206;81;5;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>253;;;;;;;;;;;;;;
;30203;;;;>2150386656;>2016169248;>295;;;;;;;;;;;;>1082;;3;;;>835;4;;;;;>285;;;>283;>12288;>348;>323584;>8080;;;;;;;;;>432;6;;;;
;30207;;;;<4922251902;<4922251902;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<307200;<7603;;;;;;;;;9;0;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>319488;<3698688;<352;;;;;<12981;>2926;;
;30201;;;;>2771865246;>2906083182;81;5;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2150386768;>2016169184;>295;;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4922252654;<4922252654;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>20480;>4415488;>2416;;;;;>19318;>730071;;
;30201;;;;>2771867022;>2906082014;81;4;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>221;;;;;;;;;;;;;;
;30203;;;;>2150387088;>2016169680;>295;5;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;<26;;;;;;;;;;;;;;
;30207;;;;<4922254110;<4922254110;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1036288;>5660672;>5024;;;;;<6888;<724900;;
;30201;;;;>2771867198;>2906084254;81;4;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2150387088;>2016165008;>295;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4922254286;<4922254286;68;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4472832;<2555904;>360728;;;;;>12516;>14279;;
;30201;;;;>2772207926;>2906064782;81;5;;10;10;0;10;0;0;0;0;0;1085;0;0;0;0;>834;4;;;1;0;122;0;0;5;>2965504;>2000;>331776;>8875;;;;;;;;;>243;3;;;;
;30203;;;;>2150065672;>2015848088;>295;4;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;0;0;<327680;<8646;;;;;;;;;0;0;;;;
;30207;;;;<4922274558;<4922274558;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>102400;<1728512;>176;;;;;<18194;>693610;;
;30201;;;;>2772209062;>2906426294;81;4;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2150065672;>2015848264;>295;3;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4922274734;<4922274734;68;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>25141248;>21319680;>12052752;;;;;>4773;<701385;;
;30201;;;;>2772209942;>2894374774;81;4;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>238;;;;;;;;;;;;;;
;30203;;;;>2150651032;>2016433448;>295;6;;;;;;;;;;;>1004;;;;;>790;4;;;;;>285;;;>283;;;>294912;>7702;;;;;;;;;>421;8;;;;
;30207;;;;<4916154558;<4916178638;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<278528;<7250;;;;;;;;;15;0;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>204800;<5197824;>22976;;;;;<11925;<24229;;
;30201;;;;>2765503526;>2899722214;81;5;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2150650568;>2016432984;>295;;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4916154734;<4916154734;68;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>65536;>4329472;>18944;;;;;>11325;>727130;;
;30201;;;;>2765505302;>2899703766;81;4;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>186;;;;;;;;;;;;;;
;30203;;;;>2150667416;>2016450008;>295;5;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;>8;;;;;;;;;;;;;;
;30207;;;;<4916172718;<4916172718;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>868352;>262144;>1776;;;;;<10694;<714748;;
;30201;;;;>2765505478;>2899721110;81;5;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2150668840;>2016451432;>295;;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4916174318;<4916174318;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>9682944;>22323200;>1893344;;;>524288;;>33899;>33740;;
;30201;;;;>2765804182;>2898128422;80;5;;10;10;0;10;0;0;0;0;0;1007;0;0;0;0;>789;4;;;1;0;122;0;0;5;>4886528;>2991;>307200;>8445;;;;;;;;;>283;4;;;;
;30203;;;;>2150389064;>2016171480;>296;4;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;0;0;<303104;<8221;;;;;;;;;0;0;;;;
;30207;;;;<4916193902;<4916193390;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.012;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1421312;<4825088;>4864;;;;;<27318;>676192;;
;30201;;;;>2765805878;>2900022246;80;4;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2150388200;>2016166456;>296;3;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4916194078;<4916194078;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>14524416;>12419072;>2135744;;;>1507328;;>2685;<702891;;
;30201;;;;>2765806838;>2897888678;81;6;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>8192;>378;;;;;;;;;;;;;;
;30203;;;;>2150887288;>2016669704;>295;;;;;;;;;;;;>1004;;;;;>790;4;;;;;>285;;;>283;>9969664;>5535;>315392;>7639;;;;;;;;;>322;4;;;;
;30207;;;;<4916655502;<4916655502;68;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;<9420800;<4426;<299008;<7109;;;;;;;;;7;0;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>663552;<540672;<1152;;;;;<9489;<12668;;
;30201;;;;>2765768902;>2899987462;81;4;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;0;0;0;0;;;;;;;;;0;;;;;
;30203;;;;>2150886088;>2016668680;>295;5;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4916656142;<4916656142;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>9.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1732608;>5509120;>1575760;;;;;>8665;>717807;;
;30201;;;;>2765771014;>2898412838;81;4;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>232;;;;;;;;;;;;;;
;30203;;;;>2150885864;>2016668280;>295;5;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;<56;;;;;;;;;;;;;;
;30207;;;;<4916656878;<4916656878;68;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3276800;>7049216;>1573552;;;;;<8223;<718412;;
;30201;;;;>2765770502;>2898414534;81;5;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2150886552;>2016668968;>295;3;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4916657054;<4916657054;68;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4435968;>425984;>1897024;;;;;>14369;>11794;;
;30201;;;;>2766046918;>2898372150;81;4;;10;10;0;10;0;0;0;0;0;1007;0;0;0;0;>789;4;;;1;0;122;0;0;5;;;>299008;>7979;;;;;;;;;>253;2;;;;
;30203;;;;>2150628392;>2016406136;>295;5;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;;;<294912;<7674;;;;;;;;;0;0;;;;
;30207;;;;<4916676110;<4916676110;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;1;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1843200;<557056;>1545456;;;;;<7959;>707306;;
;30201;;;;>2766047846;>2898719974;81;5;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;0;;;;;
;30203;;;;>2150628968;>2016411384;>295;;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4916676814;<4916676814;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>60837888;>49643520;<77568174;;;>39477248;;>3519;<703106;;
;30201;;;;>2766049238;>2977834996;81;4;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>241;;;;;;;;;;;;;;
;30203;;;;>2066063714;>1931846098;>295;;;12;12;;12;;;;;;>1083;;3;;;>1180;22;22;;;;>285;;;>283;>86814720;>173422;>2666496;>14212;>118550528;>144812;;;;;;;>521;5;;;;
;30207;;;;<4826708904;<4826709224;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;0;;-1;-1;-1;-1;-1;-1;0;0;<2641920;<13382;0;0;;;;;;;14;0;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>319488;>1429504;<17800;;;;;<10533;<9560;;
;30201;;;;>2760645366;>2894881102;81;4;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2066063122;>1931845490;>295;6;;12;12;;12;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4826709640;<4826709592;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>200704;>8425472;>1920;;;;;>28213;>712039;;
;30201;;;;>2760647654;>2894863318;81;5;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>287;;;;;;;;;;;;;;
;30203;;;;>2066062722;>1931845138;>295;;;12;12;;12;;;;;;;;;;;;;;;;;>285;;;>283;;;;<91;;;;;;;;;;;;;;
;30207;;;;<4826710376;<4826710376;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>69509120;>70533120;>284624;;;;;>64974;<620958;;
;30201;;;;>2760922422;>2894865062;81;5;;10;10;0;10;0;0;0;0;0;29;0;0;0;0;25;;;;1;0;122;0;0;5;;;>8192;>463;;;;;;;;;8;;;;;
;30203;;;;>2065788130;>1931570546;>295;4;;12;12;;12;;;;;;0;;;;;0;;;;;;>285;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<4826710552;<4826710552;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1287221248;>1282244608;>1619945630;;;>5992448;;>3396526;>2181959;;
;30201;;;;>4376149252;>2890434470;81;4;;12;12;0;12;1;1;0;0;0;1742;0;0;0;0;>1619;20;9;;5;3;125;0;0;5;>10240000;>22505;>622592;>17445;>80359424;>35878;;;;-178078849;;-178078849;>418;11;;;;
;30203;;;;>450564164;>316323636;>295;6;;;;;;0;0;;;;3;;;;;0;0;0;;1;0;>282;;;>283;0;0;<618496;<17189;0;0;;;;0;;0;0;0;;;;
;30207;;;;<4826713448;<4826713960;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>309620736;>307470336;>43423088;;;;;<3483785;<1571288;;
;30201;;;;>4418170884;>4508816260;81;5;;12;12;0;12;1;1;0;0;0;0;0;0;0;0;;;;;5;3;125;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>408542740;>274474788;>295;6;;;;;;0;0;;;;;;;;;;;;;1;0;>282;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<4826714136;<4826714136;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1535115264;>1532854272;<1465266430;;;>512266240;;>3779;<700498;;
;30201;;;;>1569905940;>3169389954;81;5;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;1;1;;;1;0;122;0;0;5;>510746624;>215920;>8192;>542;>4096;>113;;;;;;;;;;;;
;30203;;;;>4672750466;>4502194902;>295;6;;;;;;1;1;;;;>1004;;;;;>1100;9;6;;6;3;>288;;;>283;<501710848;<198352;>319488;>8373;>581632;>907;;;;-168201327;;-168201327;>345;4;;;;
;30207;;;;<6242583830;<6206245690;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;0;;-1;-1;-1;-1;-1;-1;0;0;<307200;<8282;0;0;;;;-168201466;;-168201466;17;0;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>678883328;>678596608;>328958996;;;;;>203047;>187898;;
;30201;;;;>1569833492;>1375091920;81;5;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;0;;0;2;;;;;
;30203;;;;>4963813698;>4829596114;>295;7;;;;;;1;1;;;;>685;;;;;>487;9;;;5;3;>288;;;>283;;;>319488;>6691;;;;;;;;;>193;1;;;;
;30207;;;;<6533638798;<6533638798;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<307200;<6061;;;;;;;;;2;0;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>520622080;>528424960;<2900810798;;;>503894016;;<182729;>540766;;
;30201;;;;>1569826060;>4604854442;81;4;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;<8192;<422;;;;;;;;;0;;;;;
;30203;;;;>2062976388;>1928758804;>295;5;;;;;;;;;;;;;;;;1;1;;;;;>285;;;>283;>509861888;>221877;>4096;>252;>4096;>4566;;;;;;;3;;;;;
;30207;;;;<3632802448;<3632802448;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;0;0;0;0;;;;;;;0;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>446464;>765952;>1550496;;;;;<29283;<738174;;
;30201;;;;>1569826748;>1702493836;81;5;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2062975700;>1928758116;>295;;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3632801936;<3632801936;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>7282688;>7073792;>782112;;;>4096;;>28700;>23205;;
;30201;;;;>1570565804;>1704001276;81;4;;12;12;0;12;0;0;0;0;0;1007;0;0;0;0;>789;5;;;1;0;122;0;0;5;>4096;>338;>299008;>7912;;;;;;;;;>242;11;;;;
;30203;;;;>2062255684;>1928038100;>295;6;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;0;0;<294912;<7678;;;;;;;;;0;0;;;;
;30207;;;;<3632823600;<3632823088;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>434176;<2027520;<720;;;;;<23578;>702519;;
;30201;;;;>1570567532;>1704785324;81;4;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2062256244;>1928038660;>295;7;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3632823776;<3632823776;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>850038784;>841207808;>14415962;;;>84963328;;>12812;<705858;;
;30201;;;;>1582457950;>1702259572;82;7;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;>311;5;5;;1;0;122;0;0;5;>563290112;>185214;>28672;>1513;>26398720;>14669;;;;;;;96;;;;;
;30203;;;;>2051304986;>1917087306;>294;;;;;;;;;;;;>1004;;;;;>479;;0;;;;>285;;;>283;<561086464;<182627;>282624;>6842;0;0;;;;;;;>388;8;;;;
;30207;;;;<3633750504;<3633750248;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<290816;<7552;;;;;;;;;11;0;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2109440;>2457600;>1588688;;;;;<18316;<20058;;
;30201;;;;>1582445646;>1715074382;82;5;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2051304346;>1917086762;>294;7;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3633751144;<3633751144;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1165889536;>1166544896;>13602120;;;>83279872;;>12485;>727952;;
;30201;;;;>1582447758;>1703063222;82;6;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>210;;;;;;;;;;;;;;
;30203;;;;>2063330658;>1929113074;>295;7;;;;;;;;;;;;;;;;>305;1;1;;;;>285;;;>283;>562921472;>178164;>8192;>179;>17641472;>18877;;;;;;;95;;;;;
;30207;;;;<3645778416;<3645778416;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;0;;-1;-1;-1;-1;-1;-1;0;0;0;0;0;0;;;;;;;0;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>73728;>6942720;>6022400;;;;;<8785;<719756;;
;30201;;;;>1582447758;>1710642942;82;6;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2063330834;>1929113250;>295;7;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3645778592;<3645778592;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>10547200;>5509120;>3475152;;;;;>10041;>14742;;
;30201;;;;>1582816014;>1713558446;82;6;;12;12;0;12;0;0;0;0;0;1007;0;0;0;0;>789;5;;;1;0;122;0;0;5;>2822144;>1854;>299008;>8167;;;;;;;;;>205;6;;;;
;30203;;;;>2062964978;>1928747394;>295;7;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;0;0;<294912;<7857;;;;;;;;;0;0;;;;
;30207;;;;<3644231984;<3644256576;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>335872;<1945600;>24256;;;;;<8597;>691866;;
;30201;;;;>1581267006;>1715484926;82;5;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2062965154;>1928747570;>295;7;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3644232672;<3644232672;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>12181504;>5263360;>3641080;;;;;>4743;<703148;;
;30201;;;;>1581268542;>1711845046;82;7;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;122;0;0;5;;;>4096;>234;;;;;;;;;;;;;;
;30203;;;;>2063409354;>1929191610;>295;;;;;;;;;;;;>1082;;;;;>532;5;;;;;>285;;;>283;>155648;>907;>331776;>9108;;;;;;;;;>445;2;;;;
;30207;;;;<3644632120;<3644632312;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<315392;<8704;;;;;;;;;13;0;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1863680;>15876096;<48;;;;;>12967;>26651;;
;30201;;;;>1581223294;>1715441278;82;6;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2063408890;>1929191306;>295;7;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3644633336;<3644633336;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>323584;>4780032;>1551480;;;;;<16664;>696566;;
;30201;;;;>1581225582;>1713891686;82;6;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>269;;;;;;;;;;;;;;
;30203;;;;>2063408802;>1929191218;>295;7;;;;;;;;;;;;;;;;>303;;;;;;>285;;;>283;;;;<34;;;;;;;;;;;;;;
;30207;;;;<3644634384;<3644634384;68;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>626688;>8081408;<208;;;;;>2818;<723708;;
;30201;;;;>1581225198;>1715442990;82;5;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2063409362;>1929191778;>295;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3644634560;<3644634560;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>10072064;>7196672;>4985672;;;>303104;;>42729;>6745;;
;30201;;;;>1581487382;>1710719294;82;7;;12;12;0;12;0;0;0;0;0;1087;0;0;0;0;>834;4;;;1;0;122;0;0;5;>6279168;>5137;>339968;>8969;;;;;;;;;>249;2;;;;
;30203;;;;>2063149866;>1928932282;>295;6;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;0;0;<335872;<8741;;;;;;;;;0;0;;;;
;30207;;;;<3644637600;<3644638112;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>81920;<2551808;>208;;;;;<46603;>699214;;
;30201;;;;>1581487222;>1715705110;82;4;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2063151098;>1928933514;>295;7;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3644638832;<3644638832;68;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>15835136;>7274496;>2154552;;;>225280;;>4279;<707314;;
;30201;;;;>1581488694;>1713551726;82;6;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;122;0;0;5;;;>4096;>256;;;;;;;;;;;;;;
;30203;;;;>2063578306;>1929360626;>295;;;;;;;;;;;;>1006;;;;;>487;4;;;;;>285;;;>283;>12120064;>5439;>311296;>7968;;;;;;;;;>339;2;;;;
;30207;;;;<3645037928;<3645038184;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;<11571200;<4509;<286720;<7405;;;;;;;;;30;0;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>180224;>454656;<560;;;;;<10875;<7102;;
;30201;;;;>1581459750;>1715678246;82;3;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;0;0;0;0;;;;;;;;;0;;;;;
;30203;;;;>2063578194;>1929360610;>295;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3645039096;<3645039096;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>221184;>6078464;>3152;;;;;>14337;>714058;;
;30201;;;;>1581462934;>1715677366;82;6;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>252;;;;;;;;;;;;;;
;30203;;;;>2063577282;>1929359698;>295;;;;;;;;;;;;;;;;;>303;;;;;;>285;;;>283;;;;<9;;;;;;;;;;;;;;
;30207;;;;<3645040216;<3645040216;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>94208;>1880064;<144;;;;;<14267;<703008;;
;30201;;;;>1581462934;>1715680662;82;6;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2063577458;>1929359874;>295;7;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3645040712;<3645040712;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>6217728;>2695168;>312160;;;;;>15075;>4522;;
;30201;;;;>1581735974;>1715641398;82;4;;12;12;0;12;0;0;0;0;0;1007;0;0;0;0;>789;4;;;1;0;122;0;0;5;;;>299008;>8240;;;;;;;;;>208;3;;;;
;30203;;;;>2063308114;>1929090530;>295;6;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;;;<294912;<7942;;;;;;;;;0;0;;;;
;30207;;;;<3645007512;<3645008024;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>417792;<2117632;>128;;;;;<4957;>696674;;
;30201;;;;>1581699398;>1715917366;82;6;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2063308242;>1929090658;>295;;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3645008152;<3645008152;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>10244096;>8314880;>4736664;;;;;<2743;<697684;;
;30201;;;;>1581700998;>1711181742;82;6;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;122;0;0;5;;-1;>4096;>253;;;;;;-130153295;;-130153295;;;;;;
;30203;;;;>2063914666;>1929697258;>296;;;;;;;;;;;;>1004;;;;;>487;4;;;;;>285;;;>283;;0;>294912;>8322;;;;;;0;;0;>399;3;;;;
;30207;;;;<3643036368;<3643036720;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<278528;<7891;;;;;;;;;25;0;;;;
;;>9.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>339968;<1609728;<624;;;;;<6915;<17996;;
;30201;;;;>1579121702;>1713340262;82;6;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2063914154;>1929696570;>296;7;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;-124446226;;-124446226;;;;;;
;30207;;;;<3643037008;<3643036496;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;-123879818;;-123879818;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>122880;>8724480;>1680;;;;;>14405;>715351;;
;30201;;;;>1579124326;>1713339718;82;4;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>287;;;;;;0;;0;;;;;;
;30203;;;;>2063913402;>1929695818;>296;7;;;;;;;;;;;;;;;;>303;;;;;;>285;;;>283;;;;<4;;;;;;;;;;;;;;
;30207;;;;<3643037728;<3643037728;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>577536;>9981952;>688;;;;;<11623;<704536;;
;30201;;;;>1579124838;>1713341734;82;;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2063913066;>1929695482;>296;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3643037904;<3643037904;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>36290560;>33267712;>2381704;;;;;>252598;>220661;;
;30201;;;;>1579930846;>1711766726;82;6;;12;12;0;12;0;0;0;0;0;1663;0;0;0;0;>1251;13;;;1;0;122;0;0;5;;;>565248;>14923;>4096;>164;;;;;;;>306;8;;;;
;30203;;;;>2063109202;>1928891618;>296;7;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;;;<561152;<14642;0;0;;;;;;;0;0;;;;
;30207;;;;<3643040384;<3643040384;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>286720;<2580480;>304;;;;;<247150;>486848;;
;30201;;;;>1579931310;>1714148590;82;6;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2063109250;>1928891666;>296;;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3643040560;<3643040560;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>19259392;>11415552;<82136;;;;;>6257;<705354;;
;30201;;;;>1578577150;>1712852278;82;5;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;>309;4;4;;1;0;122;0;0;5;>921600;>5893;>20480;>875;;;;;;;;;9;;;;;
;30203;;;;>2064809002;>1930271602;>296;7;;;;;;;;;;;>1082;6;14;;;>526;;0;;;;>285;;;>283;0;0;>315392;>8954;;;;;;;;;>370;5;;;;
;30207;;;;<3642090880;<3641746312;69;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<315392;<9224;;;;;;;;;19;0;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>70041600;>72065024;>2827632;;;;;>147847;>126380;;
;30201;;;;>1577282054;>1708671846;82;6;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2065710394;>1931492282;>296;;;;;;;;;;;;>656;;;;;>462;9;;;;;>285;;;>283;;;>303104;>6002;;;;;;;;;>185;;;;;
;30207;;;;<3642984168;<3642983640;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<290816;<5377;;;;;;;;;1;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>495616;>5931008;>2648;;;;;<150502;>582054;;
;30201;;;;>1577274910;>1711489846;82;5;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;<8192;<386;;;;;;;;;0;;;;;
;30203;;;;>2065710242;>1931492658;>296;7;;;;;;;;;;;;;;;;>303;;;;;;>285;;;>283;;;;<43;;;;;;;;;;;;;;
;30207;;;;<3642985152;<3642985152;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>466944;>1138688;>352;;;;;<9540;<705060;;
;30201;;;;>1577275086;>1711492318;82;7;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2065710242;>1931492658;>296;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3642985328;<3642985328;69;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>15171584;>12234752;>9718720;;;;;>13055;<2326;;
;30201;;;;>1577525358;>1702024222;82;6;;12;12;0;12;0;0;0;0;0;1085;0;0;0;0;>834;4;;;1;0;122;0;0;5;;;>331776;>8762;;;;;;;;;>237;3;;;;
;30203;;;;>2065461746;>1931244162;>296;7;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;;;<327680;<8528;;;;;;;;;0;0;;;;
;30207;;;;<3642988352;<3642988352;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>479232;<1495040;>1573168;;;;;<1175;>708912;;
;30201;;;;>1577526270;>1710170686;82;5;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;>8192;>248;;;;;;;;;;;;;;;;
;30203;;;;>2065462210;>1931244626;>296;7;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;0;0;;;;;;;;;;;;;;;;
;30207;;;;<3642988992;<3642988992;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>11051008;>5115904;>1963904;;;;;>2189;<698190;;
;30201;;;;>1577527182;>1709780862;82;5;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;122;0;0;5;;;>4096;>207;;;;;;;;;3;;;;;
;30203;;;;>2065735258;>1931517674;>296;6;;;;;;;;;;;>1004;;;;;>487;4;;;;;>285;;;>283;>8192;>292;>299008;>8497;;;;;;;;;>354;3;;;;
;30207;;;;<3643249480;<3643249320;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<282624;<8036;;;;;;;;;15;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>602112;>3354624;<31096;;;;;<17129;<13532;;
;30201;;;;>1577514350;>1711762870;82;5;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2065734490;>1931516906;>296;7;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3643249992;<3643249992;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>430080;>5668864;>1824;;;;;>12547;>696434;;
;30201;;;;>1577516638;>1711732398;82;7;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>265;;;;;;;;;;;;;;
;30203;;;;>2065734042;>1931516458;>296;;;;;;;;;;;;;;;;;>303;;;;;;>285;;;>283;;;;>84;;;;;;;;;;;;;;
;30207;;;;<3643250680;<3643250680;69;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>262144;>2428928;>304;;;;;<10589;<704064;;
;30201;;;;>1577516814;>1711734094;82;6;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2065733994;>1931516410;>296;;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3643250808;<3643250808;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3244032;>565248;>293048;;;;;>13813;>23808;;
;30201;;;;>1577765414;>1711689950;82;5;;12;12;0;12;0;0;0;0;0;1007;0;0;0;0;>789;4;;;1;0;122;0;0;5;>2076672;>1547;>299008;>7693;;;;;;;;;>266;6;;;;
;30203;;;;>2065487122;>1931269538;>296;;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;0;0;<294912;<7420;;;;;;;;;0;0;;;;
;30207;;;;<3643215960;<3643215960;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2879488;>393216;>1549424;;;;;>69;>692784;;
;30201;;;;>1577729350;>1710397510;82;7;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2065486738;>1931269154;>296;;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3643216600;<3643216600;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>12656640;>7241728;>1920640;;;;;<3667;<714456;;
;30201;;;;>1577731430;>1710028374;82;5;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;122;0;0;5;;;>4096;>214;;;;;;;;;;;;;;
;30203;;;;>2065836162;>1931623378;>296;7;;;;;;;;;;;>1004;;;;;>487;4;;;;;>285;;;>283;>4096;>159;>299008;>8218;;;;;;;;;>408;5;;;;
;30207;;;;<3643553608;<3643558408;69;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<282624;<7834;;;;;;;;;9;0;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>462848;>2183168;>17792;;;;;<5439;>6576;;
;30201;;;;>1577717110;>1711916902;82;4;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2065835986;>1931618402;>296;7;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3643554248;<3643554248;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>315392;>8314880;>2288;;;;;>5951;>717196;;
;30201;;;;>1577719830;>1711935126;82;6;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>257;;;;;;;;;;;;;;
;30203;;;;>2065835138;>1931617554;>296;;;;;;;;;;;;;;;;;>303;;;;;;>285;;;>283;;;;>20;;;;;;;;;;;;;;
;30207;;;;<3643554968;<3643554968;69;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.012;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>36864;<2854912;>304;;;;;<10587;<725152;;
;30201;;;;>1577720006;>1711937286;82;3;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2065835090;>1931617506;>296;4;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3643555096;<3643555096;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>6627328;>8282112;>1773408;;;;;>29785;>15574;;
;30201;;;;>1577942158;>1710385550;82;6;;12;12;0;12;0;0;0;0;0;1007;0;0;0;0;>789;4;;;1;0;122;0;0;5;>5451776;>2799;>303104;>7762;;;;;;;;;>251;6;;;;
;30203;;;;>2065616482;>1931399682;>296;7;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;0;0;<299008;<7541;;;;;;;;;0;0;;;;
;30207;;;;<3643558928;<3643559440;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1654784;<475136;>1440;;;;;<23645;>707264;;
;30201;;;;>1577942446;>1712159102;82;6;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2065617138;>1931399554;>296;5;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3643560096;<3643560096;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>11223040;>7344128;>2001416;;;;;>3457;<717594;;
;30201;;;;>1577969566;>1710161142;82;4;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;122;0;0;5;;;>4096;>180;;;;;;;;;;;;;;
;30203;;;;>2066002170;>1931809114;>296;7;;;;;;;;;;;>1082;;;;;>532;4;;;;;>285;;;>283;>9310208;>3699;>335872;>9031;;;;;;;;;>400;5;;;;
;30207;;;;<3643957448;<3643957736;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;<8761344;<2721;<315392;<8281;;;;;;;;;14;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>73728;>6508544;>1658688;;;;;>32426;>5922;;
;30201;;;;>1577955406;>1710514654;82;6;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;0;0;0;0;;;;;;;;;0;;;;;
;30203;;;;>2066001402;>1931783818;>296;5;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3643957960;<3643957960;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>139264;>4689920;>1616;;;;;<22226;>726609;;
;30201;;;;>1577957518;>1712173486;82;5;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>241;;;;;;>88573470;;>88573470;;;;;;
;30203;;;;>2066001098;>1931783514;>296;6;;;;;;;;;;;;;;;;>303;;;;;;>285;;;>283;;;;<42;;;;;;0;;0;;;;;;
;30207;;;;<3643958616;<3643958616;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>761856;>1126400;>128;;;;;<18913;<742729;;
;30201;;;;>1577957518;>1712174974;82;5;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2066001226;>1931783642;>296;7;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;>105152143;;>105152143;;;;;;
;30207;;;;<3643958744;<3643958744;69;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;<566409;;<566409;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3620864;>1470464;>430176;;;;;>12281;>22040;;
;30201;;;;>1578386574;>1712173982;82;6;;12;12;0;12;0;0;0;0;0;1085;0;0;0;0;>834;4;;;1;0;122;0;0;5;;;>331776;>8807;;;;;;0;;0;>250;3;;;;
;30203;;;;>2065574250;>1931356666;>296;7;;;;;;;;;;;3;;;;;0;0;;;2;;>285;;;>283;;;<327680;<8610;;;;;;;;;0;0;;;;
;30207;;;;<3643961272;<3643961784;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1691648;<2064384;>832;;;;;<7065;>711050;;
;30201;;;;>1578387198;>1712604462;82;5;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2065574730;>1931357146;>296;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3643962440;<3643962440;69;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>10399744;>3493888;>3342392;;;;;>3113;<734124;;
;30201;;;;>1578388558;>1709263750;82;6;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;122;0;0;5;;;>4096;>255;;;;;;;;;;;;;;
;30203;;;;>2067328762;>1933111178;>296;;;;;;;;;;;;>1004;;;;;>487;4;;;;;>285;;;>283;;;>290816;>7393;;;;;;;;;>358;6;;;;
;30207;;;;<3645704032;<3645704544;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<274432;<6892;;;;;;;;;21;0;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>36864;>1282048;<1024;;;;;<10903;<716;;
;30201;;;;>1578375398;>1712594518;82;5;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2067328122;>1933110538;>296;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3645704672;<3645704672;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2052096;>7483392;>1920;;;;;>12407;>719304;;
;30201;;;;>1578377782;>1712593446;82;5;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>272;;;;;;;;;;;;;;
;30203;;;;>2067327578;>1933109994;>296;7;;;;;;;;;;;;;;;;>303;;;;;;>285;;;>283;;;;<73;;;;;;;;;;;;;;
;30207;;;;<3645705360;<3645705360;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4407296;>12787712;>6158872;;;;;>109292;<584035;;
;30201;;;;>1582984686;>1711043398;82;6;;12;12;0;12;0;0;0;0;0;567;0;0;0;0;>431;2;;;1;0;122;0;0;5;;;>172032;>5565;>57344;>1707;;;;;;;>149;3;;;;
;30203;;;;>2062722290;>1928504706;>296;;;;;;;;;;;;0;;;;;0;0;;;;;>285;;;>283;;;0;0;0;0;;;;;;;0;0;;;;
;30207;;;;<3645705920;<3645705920;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>9916416;>4108288;>5474168;;;;;>132698;>97475;;
;30201;;;;>1586840598;>1715584014;82;6;;12;12;0;12;0;0;0;0;0;1663;0;0;0;0;>1251;13;;;1;0;122;0;0;5;;;>569344;>15175;;;;;;;;;>349;6;;;;
;30203;;;;>2058884522;>1924666938;>296;8;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;;;<565248;<14917;;;;;;;;;0;0;;;;
;30207;;;;<3645725088;<3645725600;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>442368;<1867776;>1574016;;;;;<246071;>485902;;
;30201;;;;>1586840694;>1719484774;82;6;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2058884394;>1924666810;>296;7;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3645725600;<3645725600;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>13213696;>8089600;>1886520;;;;;>4597;<691840;;
;30201;;;;>1586841574;>1719172638;82;6;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;122;0;0;5;;;>4096;>289;;;;;;;;;1;;;;;
;30203;;;;>2059186018;>1924968434;>296;;;;;;;;;;;;>1004;;;;;>487;4;;;;;>285;;;>283;;;>303104;>7532;;;;;;;;;>377;2;;;;
;30207;;;;<3645992728;<3645992728;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<286720;<6941;;;;;;;;;20;0;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>134041600;>130695168;>16731072;;;;;>224251;>185424;;
;30201;;;;>1586806886;>1704293398;82;6;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;;;;25;;;;;
;30203;;;;>2074315530;>1940097946;>296;7;;;;;;;;;;;>1223;;;;;>893;10;;;;;>285;;;>283;>4096;>242;>491520;>12309;>57344;>1728;;;;;;;>362;;;;;
;30207;;;;<3661094584;<3661095096;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<454656;<10999;0;0;;;;;;;32;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1003520;>5046272;>328192;;;;;<223501;>499220;;
;30201;;;;>1586780542;>1720670446;82;6;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;<32768;<1020;;;;;;;;;0;;;;;
;30203;;;;>2073066858;>1938849274;>296;7;;;;;;;;;;;;;;;;>306;2;2;;;;>285;;;>283;>393216;>2672;>8192;>174;;;;;;;;;3;;;;;
;30207;;;;<3659847912;<3659847912;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;0;;-1;-1;-1;-1;-1;-1;0;0;0;0;;;;;;;;;0;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>409600;>13000704;>1952;;;;;>5977;<695620;;
;30201;;;;>1586781742;>1720998510;82;7;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2073066298;>1938847578;>296;;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3659848040;<3659848040;69;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4714496;>2691072;>1954128;;;;;>181;>4243;;
;30201;;;;>1587138958;>1719402414;82;6;;12;12;0;12;0;0;0;0;0;1007;0;0;0;0;>789;4;;;1;0;122;0;0;5;>16384;>282;>299008;>8160;;;;;;;;;>221;3;;;;
;30203;;;;>2072711850;>1938494266;>296;;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;0;0;<294912;<7812;;;;;;;;;0;0;;;;
;30207;;;;<3659854008;<3659854008;69;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>155648;<5013504;>352;;;;;<12267;>704927;;
;30201;;;;>1587142334;>1721359566;82;6;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2072711850;>1938494266;>296;7;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3659853672;<3659854184;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>9.031;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1396736;<933888;>2576;;;;;<2689;<715880;;
;30201;;;;>1587142830;>1721358350;82;4;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;122;0;0;5;;;>4096;>250;;;;;;;;;;;;;;
;30203;;;;>2088137802;>1938494314;>298;8;;;;;7;5;;;5;;>143;8;30;;;<181;;;;9;3;>292;;;>283;>12288;>344;>20480;>797;;;;;;;;;>171;;;;;
;30207;;;;<3675172872;<3659854728;71;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;0;0;0;0;;;;;;;;;0;;;;;
;;>11.001;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>6561792;>8888320;>1469264;;;;;>13163;>12107;;
;30201;;;;>1587035774;>1719891854;82;5;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2074131546;>1939913962;>296;6;;;;;;;;;;;>939;;;;;>713;4;;;;;>285;;;>283;;;>307200;>8291;;;;;;;;;>275;4;;;;
;30207;;;;<3661263224;<3661263736;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<286720;<7539;;;;;;;;;22;0;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>389120;>5292032;>2416;;;;;<9526;>711921;;
;30201;;;;>1587133630;>1721349310;82;6;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;<16384;<499;;;;;;;;;0;;;;;
;30203;;;;>2074130058;>1939912474;>296;7;;;;;;;;;;;;;;;;>303;;;;;;>285;;;>283;;;;>38;;;;;;;;;;;;;;
;30207;;;;<3661264200;<3661264200;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>561152;>4886528;>128;;;;;>19932;<701616;;
;30201;;;;>1587134142;>1721351598;82;6;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2074130186;>1939912602;>296;7;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3661264328;<3661264328;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>5705728;>159744;>275008;;;;;<11867;<11090;;
;30201;;;;>1587408238;>1721350814;82;5;;12;12;0;12;0;0;0;0;0;1085;0;0;0;0;>834;4;;;1;0;122;0;0;5;>3579904;>2396;>331776;>8607;;;;;;;;;>291;3;;;;
;30203;;;;>2073857962;>1939640378;>296;7;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;0;0;<327680;<8344;;;;;;;;;0;0;;;;
;30207;;;;<3661267160;<3661267160;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>208896;>1232896;>2064;;;;;>45;>704216;;
;30201;;;;>1587409710;>1721625230;82;5;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>2073859002;>1939641418;>296;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3661268200;<3661268712;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>13332480;>17412096;>706392;;;;;>22751;<667132;;
;30201;;;;>1587409662;>1720921878;82;4;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;122;0;0;5;;;>4096;>198;;;;;;;;;1;;;;;
;30203;;;;>2074525826;>1940307730;>296;6;;;;;;;;;;;>1004;;;;;>487;4;;;;;>285;;;>283;;;>290816;>7742;;;;;;;;;>403;8;;;;
;30207;;;;<3661922464;<3661922464;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<274432;<7262;;;;;;;;;20;0;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>155648;<217088;<1024;;;;;<38467;<37250;;
;30201;;;;>1587401438;>1721615374;83;;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;2;0;122;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>2074520514;>1940307602;>295;6;;;;;;;;;;;;;;;;;;;;1;;>285;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3661922080;<3661922080;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>188416;>2641920;>2608;;;;;>28523;>734783;;
;30201;;;;>1587397950;>1721612926;82;6;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>263;;;;;;;;;;;;;;
;30203;;;;>2074525682;>1940308098;>296;;;;;;;;;;;;;;;;;>303;;;;;;>285;;;>283;;;;>4;;;;;;;;;;;;;;
;30207;;;;<3661923632;<3661923632;69;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.012;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>299008;>2822144;<208;;;;;<19419;<741897;;
;30201;;;;>1587398126;>1721615918;82;5;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;>13603968;;>13603968;;;;;;
;30203;;;;>2074525634;>1940308050;>296;6;;;;;;;;;;;;;;;;;;;;;;>285;;;>283;;;;;;;;;;0;;0;;;;;;
;30207;;;;<3661924272;<3661924272;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>6242304;>18653184;>3390504;;;;;>63276;>76821;;
;30201;;;;>1587646374;>1718473454;82;6;;12;12;0;12;0;0;0;0;0;1009;0;0;0;0;>789;4;;;1;0;122;0;0;5;>4947968;>3031;>303104;>7842;;;;;;;;;>228;1;;;;
;30203;;;;>2074316730;>1940099146;>296;;;;;;;;;;;;3;;;;;0;0;;;;;>285;;;>283;0;0;<299008;<7527;;;;;;>1002993;;>1002993;0;0;;;;
;30207;;;;<3661963904;<3661963904;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;<260173;;<260173;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<3318882304;<2573353952;<1975885470;;;;;<25902;>707131;;
;30201;;;;>1587779206;>3697882260;80;6;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;>28672;>1046;>24576;>1066;;;;;;0;;0;;;;;;
;30203;;;;>2068785858;>1934625874;>283;7;;11;11;;11;;;;;;1;1;;;;;;;;2;1;>185;;;>196;0;0;<20480;<890;;;;;;;;;;;;;;
;;>10.012;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>413696;<778240;>595632;;;;;<32309;<789612;;
;30201;;;;<2068784786;<1935220434;80;3;;12;12;;12;;;;;;3;0;;;;>303;;;;1;0;<185;;;5;;;>8192;>401;;;;;;;;;;;;;;
;30203;;;;>2067771266;>1933620882;>277;6;;11;11;;11;;;;;;0;;;;;0;;;;2;1;<15;;;2;>11313152;>5373;<4096;<178;;;;;;;;;;;;;;
;;>10.046;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<19914285056;<13383558112;<5013832347;;;;;>40419;>231834;;
;30201;;;;<2067693578;>3080272769;75;;;12;12;;12;;;;;;;;;;;;;;;1;0;>15;;;5;<11296768;<4729;>8192;>371;;;;;;;;;;;;;;
;;>97.880;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;0;<14490932192;<3676961787;;;<65536;;0;0;;
;;>13.403;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>7227981824;>4588655584;>2213727119;;;;;>1244210;>2072610;;
;30201;;;-1;<842195048;>580958780;59;15;;5;5;;3;2;;;2;;>434;2;;;;>262;5;;;4;1;<5;;;;>81919;>2628;>1708031;>40394;>596021247;>275383;>1396735;>1055;;>7396524589507851;;>7396524589507851;>242;38;;;;
;30203;;;;<1554903454;<1734992998;38;9;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;-1;>7396524674274307;-1;>7396524674236415;<585248768;<259158;-1;>7396524674276524;;>84769728;;>84769728;0;0;;;;
;30207;;;;<205436538;<156859959;;13;;;;;;;;;;;;;;;;;;;;;;;;;;;<24806949;;<24806949;<10223616;<14732;;<24806949;;<24806949;;<24806949;1;;;;;
;;>10.040;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1;>5401358336;>5460665312;>4275500574;;;;;<850672;<1475267;;
;30201;;1;0;>2133363857;<1972075200;68;8;;9;9;0;9;0;0;0;0;0;1817;0;0;0;0;>1591;12;;;1;0;122;0;0;5;0;0;1875968;<7396524649453054;>4874241;>15917;0;0;;-22377168;;-22377168;>1651;18;;;;
;30203;;0;;>1560670881;>1427160697;>269;15;;1;1;;0;2;1;;1;;<1668;;;;;58;4;;;3;1;>270;;;>283;>24575;-7396524674277127;<294913;-7396524674240063;>569946112;>270212;>1396735;-7396524674276480;;-78597009;;-78597009;<905;>229;;;;
;30207;;;;<3108299746;<3110351802;44;11;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;-7396524649470103;<1560576;-7396524649469593;<508145664;<241696;>360448;-7396524649468417;;-93425798;;-93425798;1;0;;;;
;;>10.038;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2449457152;>2233787360;>1101130770;;;;;<105342;>460185;;
;30201;;;;>1560195513;>594565015;71;6;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;3;;;;1;0;122;0;0;5;>1;>7396524649471185;>4097;>7396524649471019;<66871296;<45053;0;0;;-3056204;;-3056204;0;;;;;
;30203;;1;;>1900705339;>1920020427;>281;9;;;;;4;5;;;5;;>427;;28;;;>490;4;;;8;3;>279;;;>283;0;0;>1441792;>7993;>9322496;>25563;;;;-45178664;;-45178664;>840;5;;;;
;30207;;0;;<3123176506;<3275139874;54;12;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<1359872;<6115;0;0;;;;>70153103;;>70153103;0;0;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;0;>399118336;>356958208;<32456704;;;;;<94041;<830269;;
;30201;;;;>1231941647;>1398656615;72;6;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;>4096;>142;<98304;<2909;;;;;;0;;0;;;;;;
;30203;;;;>1951947003;>1817730075;>283;;;;;;;;;;;;>1665;;;;;>1479;12;;;;;>282;;;>283;0;0;>643072;>15161;>5185536;>22504;;;;>1961904;;>1961904;>276;2;;;;
;30207;;;;<3170299866;<3170299866;58;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<618496;<14458;0;0;;;;-34384245;;-34384245;12;0;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>9031680;<4190208;>9583720;;;;;<171269;<152952;;
;30201;;;;>1218383327;>1343015639;72;5;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;0;;0;0;;;;;
;30203;;;;>1951940547;>1817724515;>283;;;;;;;;;;;;3;;;;;;;;;;;>282;;;>283;;;>4096;>233;;;;;;;;;;;;;;
;30207;;;;<3170282210;<3170282210;58;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>7491584;<3371008;>6306992;;;;;>3940;>703010;;
;30201;;;;>1219892783;>1347809167;72;5;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>205;;;;;;-18076490;;-18076490;;;;;;
;30203;;;;>1950394403;>1816171027;>283;2;;;;;;;;;;;0;;;;;;;;;;;>282;;;>283;;;0;0;;;;;;0;;0;;;;;;
;30207;;;;<3170281490;<3170281490;58;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.011;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>5844992;<5427200;>6388336;;;;;>5390;<680913;;
;30201;;;;>1219917551;>1347746143;72;4;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1950372803;>1816155875;>283;3;;;;;;;;;;;3;;;;;;;;;;;>282;;;>283;;;>4096;>337;;;;;;-11745785;;-11745785;;;;;;
;30207;;;;<3170286738;<3170286738;58;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;-1776555;;-1776555;;;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>97206272;>84627456;>22929016;;;;;<11515;<42753;;
;30201;;;;>1222311511;>1333599599;72;6;;9;9;0;9;0;0;0;0;0;1007;0;0;0;0;>839;4;;;1;0;122;0;0;5;;;>299008;>8831;;;;;;0;;0;>248;3;;;;
;30203;;;;>1947976763;>1813759659;>283;5;;;;;;;;;;;0;;;;;0;0;;;;;>282;;;>283;;;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3170279538;<3170279538;58;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>47554560;>41304064;>33378432;;;;;>13371;>722150;;
;30201;;;;>1225506311;>1326344807;75;5;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1949844123;>1815627195;>289;6;;;;;;;;;;;>1007;;;;;>790;4;;;;;>283;;;>283;;;>307200;>8518;;;;;;;;;>371;4;;;;
;30207;;;;<3173675954;<3173675954;61;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<286720;<7871;;;;;;;;;13;0;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>7159808;<3121152;>6331312;;;;;<16193;<716526;;
;30201;;;;>1223851207;>1351736823;74;5;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;<16384;<416;;;;;;;;;0;;;;;
;30203;;;;>1949831099;>1815614171;>290;3;;;;;;;;;;;0;;;;;;;;;;;>283;;;>283;;;0;0;;;;;;;;;;;;;;
;30207;;;;<3173677506;<3173677506;61;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4902912;<3788800;>3229464;;;;;>5228;<7590;;
;30201;;;;>1223851383;>1354838847;74;3;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1949832403;>1815615475;>290;;;;;;;;;;;;3;;;;;;;;;;;>283;;;>283;;;>4096;>259;;;;;;;;;;;;;;
;30207;;;;<3173678730;<3173678730;61;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.012;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3743744;<2101248;>4746304;;;;;<280;>704364;;
;30201;;;;>1225402935;>1354873559;74;5;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>231;;;;;;;;;;;;;;
;30203;;;;>1948283075;>1814066147;>290;2;;;;;;;;;;;0;;;;;;;;;;;>283;;;>283;;;0;0;;;;;;;;;;;;;;
;30207;;;;<3173642586;<3173642074;61;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4968448;<372736;>4782912;;;;;>7775;<694691;;
;30201;;;;>1225389975;>1354823479;74;3;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;-15598143;;-15598143;;;;;;
;30203;;;;>1948260227;>1814043299;>290;2;;;;;;;;;;;3;;;;;;;;;;;>283;;;>283;;;>4096;>338;;;;;;0;;0;;;;;;
;30207;;;;<3173645402;<3173645402;61;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>22634496;>35069952;>14726592;;;;;>1707;<3428;;
;30201;;;;>1230534871;>1350025207;79;5;;9;9;0;9;0;0;0;0;0;1007;0;0;0;0;>789;4;;;1;0;122;0;0;5;;;>299008;>7882;;;;;;;;;>275;6;;;;
;30203;;;;>1943146179;>1808929251;>286;;;;;;;;;;;;0;;;;;0;0;;;;;>283;;;>283;;;0;0;;;;;;-19094018;;-19094018;1;0;;;;
;30207;;;;<3173673082;<3173673082;61;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;-22804842;;-22804842;0;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>39874560;>26869760;>21128856;;;;;>24463;>732244;;
;30201;;;;>1233680375;>1346768623;79;6;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;0;;0;;;;;;
;30203;;;;>1942170379;>1807953275;>288;;;;;;;;;;;;>1007;;;;;>790;4;;;;;>283;;;>283;;;>299008;>8452;;;;;;;;;>464;8;;;;
;30207;;;;<3171089778;<3171114370;62;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<278528;<7710;;;;;;;;;15;0;;;;
;;>10.011;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1744896;>5738496;>1657512;;;;;>1047268;<661430;;
;30201;;;;>1228950847;>1361533959;79;2;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;<16384;<529;;;;;;;;;0;;;;;
;30203;;;;>1942144803;>1807928771;>288;7;;;;;;;;;;;0;;;;;;;;;;;>283;;;>283;;;0;0;;;;;;;;;;;;;;
;30207;;;;<3171089954;<3171089954;62;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>8228864;>299008;>4722640;;;;;<1067845;<66454;;
;30201;;;;>1228950639;>1358445407;79;;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1942161363;>1807943955;>288;6;;;;;;;;;;;3;;;;;;;;;;;>283;;;>283;;;>4096;>277;;;;;;;;;;;;;;
;30207;;;;<3169533058;<3169557650;62;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2818048;<2408448;>6417024;;;;;<13812;>694653;;
;30201;;;;>1227379007;>1355203503;79;2;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;>3563520;>1863;>4096;>251;;;;;;;;;;;;;;
;30203;;;;>1942161459;>1807944531;>288;6;;;;;;;;;;;0;;;;;;;;;;;>283;;;>283;0;0;0;0;;;;;;;;;;;;;;
;30207;;;;<3169498194;<3169498194;62;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.007;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4235264;>929792;>1641520;;;;;>1387;<701534;;
;30201;;;;>1228891519;>1361466927;79;2;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1940631043;>1806414115;>288;6;;;;;;;;;;;3;;;;;;;;;;;>283;;;>283;;;>4096;>231;;;;;;;;;;;;;;
;30207;;;;<3169517378;<3169517378;62;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.027;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>29638656;>24010752;>19174696;;;;;>707;>3832;;
;30201;;;;>1235437063;>1348903791;79;7;;9;9;0;9;0;0;0;0;0;1085;0;0;0;0;>834;4;;;1;0;122;0;0;5;;;>331776;>8921;;;;;;;;;>252;6;;;;
;30203;;;;>1934086075;>1801444651;>288;5;;;;;;;;;;;0;;;;;0;0;;;;;>283;;;>283;>3870720;>2224;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3169516754;<3169516754;62;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;0;0;;;;;;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>40972288;>36290560;>24028424;;;;;>14275;>710207;;
;30201;;;;>1235477543;>1345666047;79;5;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1934833139;>1800616211;>290;;;;;;;;;;;;>1085;;;;;>835;4;;;;;>283;;;>283;;;>331776;>8571;;;;;;;;;>370;5;;;;
;30207;;;;<3166095114;<3166095114;64;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<311296;<7898;;;;;;;;;19;0;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>929792;>132923392;>1631216;;;;;>2986735;<602356;;
;30201;;;;>1231267319;>1363853031;79;5;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;<16384;<440;;;;;;;;;0;;;;;
;30203;;;;>1934833299;>1800616371;>290;6;;;;;;;;;;;0;;;;;;;;;;;>283;;;>283;;;0;0;;;;;;;;;;;;;;
;30207;;;;<3166094922;<3166094922;64;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.010;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3522560;<5136384;>1583104;;;;;<3003657;<103898;;
;30201;;;;>1232816791;>1365452407;79;3;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1933283923;>1799065203;>290;5;;;;;;;;;;;3;;;;;;;;;;;>283;;;>283;;;>4096;>303;;;;;;;;;;;;;;
;30207;;;;<3166095658;<3166095658;64;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>5812224;<237568;>3197936;;;;;>5731;>701613;;
;30201;;;;>1232859927;>1363879575;79;4;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;>12288;>502;>4096;>287;;;;;;;;;;;;;;
;30203;;;;>1933242371;>1799024787;>290;3;;;;;;;;;;;0;;;;;;;;;;;>283;;;>283;0;0;0;0;;;;;;;;;;;;;;
;30207;;;;<3166097818;<3166098330;64;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.009;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>790528;>200704;>3246920;;;;;>1273;<707020;;
;30201;;;;>1232860903;>1363831599;79;3;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;-47468167;;-47468167;;;;;;
;30203;;;;>1933260491;>1799042907;>290;;;;;;;;;;;;3;;;;;;;;;;;>283;;;>283;;;>4096;>329;;;;;;0;;0;;;;;;
;30207;;;;<3166116210;<3166115730;64;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>11.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>20770816;>13496320;>11226888;;;;;<3751;>7580;;
;30201;;;;>1233341807;>1356332023;79;5;;9;9;0;9;0;0;0;0;0;1007;0;0;0;0;>789;4;;;1;0;122;0;0;5;;;>299008;>7681;;;;;;;;;>243;9;;;;
;30203;;;;>1932781971;>1798563859;>290;;;;;;;;;;;;0;;;;;0;0;;;;;>283;;;>283;>12288;>516;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3164542594;<3164542962;64;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;0;0;;;;;;;;-43624045;;-43624045;;;;;;
;;>9.008;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>34570240;>31969280;>17982880;;;;;>10301;>703354;;
;30201;;;;>1231765839;>1348000543;79;;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;0;;0;;;;;;
;30203;;;;>1934857379;>1800640691;>291;4;;;;;;;;;;;>1007;;;;;>790;4;;;;;>283;;;>283;;;>303104;>7687;;;;;;-41251495;;-41251495;>382;1;;;;
;30207;;;;<3163382642;<3163382642;65;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<282624;<6939;;;;;;0;;0;9;0;;;;
;;>10.011;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>6336512;>12009472;>664856;;;;;>73903;<635441;;
;30201;;;;>1229162775;>1362715983;79;2;;9;9;0;9;0;0;0;0;0;32;0;0;0;0;27;;;;1;0;122;0;0;5;;;<8192;<174;;;;;;;;;3;;;;;
;30203;;;;>1934224843;>1800006779;>291;3;;;;;;;;;;;0;;;;;0;;;;;;>283;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3163381922;<3163381922;65;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.012;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2383872;>3059712;>1607160;;;;;<77901;<70253;;
;30201;;;;>1229162951;>1361773375;79;4;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1934226019;>1800008435;>291;2;;;;;;;;;;;3;;;;;;;;;;;>283;;;>283;;;>4096;>296;;;;;;;;;;;;;;
;30207;;;;<3163384810;<3163384810;65;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3960832;<5083136;>68064;;;;;<4307;>717754;;
;30201;;;;>1229164087;>1363314087;79;3;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;>9453568;>4275;>8192;>378;;;;;;;;;;;;;;
;30203;;;;>1934226595;>1800007635;>291;5;;;;;;;;;;;0;;;;;;;;;;;>283;;;>283;0;0;0;0;;;;;;;;;;;;;;
;30207;;;;<3163385914;<3163385530;65;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.011;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2138112;<450560;>3146304;;;;;>9435;<710675;;
;30201;;;;>1230709847;>1361782119;79;3;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1932681827;>1798464243;>291;;;;;;;;;;;;3;;;;;;;;;;;>283;;;>283;;;>4096;>288;;;;;;;;;;;;;;
;30207;;;;<3163387450;<3163387450;65;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>348405760;>345010176;>22764888;;;;;>295308;>266856;;
;30201;;;;>1236801143;>1348254351;79;4;;9;9;0;9;0;0;0;0;0;1663;0;0;0;0;>1257;12;;;1;0;122;0;0;5;;;>561152;>15207;;;;;;;;;>293;4;;;;
;30203;;;;>1927444955;>1793226859;>291;5;;;;;;;;;;;29;;;;;27;0;;;;;>283;;;>283;>79888384;>51769;<548864;<14472;;;;;;;;;8;0;;;;
;30207;;;;<3164243122;<3164243122;65;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;<79273984;<50279;<8192;<253;;;;;;;;;0;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>190865408;>192536576;>30175680;;;;;<129294;>595422;;
;30201;;;;>1239952263;>1343994167;79;4;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;0;0;0;0;;;;;;;;;;;;;;
;30203;;;;>1927590315;>1793372731;>291;5;;;;;;;;;;;>1663;;;;;>1252;12;;;;;>283;;;>283;>4096;>165;>602112;>14279;;;;;;;;;>519;6;;;;
;30207;;;;<3161198354;<3161198354;65;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<569344;<12903;;;;;;;;;12;0;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1925120;<118902784;>912;;;;;<179179;<871893;;
;30201;;;;>1233609335;>1367826007;79;4;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;<28672;<1126;;;;;;;;;0;;;;;
;30203;;;;>1927589147;>1793371563;>291;6;;;;;;;;;;;0;;;;;;;;;;;>283;;;>283;;;0;0;;;;;;;;;;;;;;
;30207;;;;<3161198994;<3161198994;65;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1994752;<6139904;>3122944;;;;;>15921;>7512;;
;30201;;;;>1233610023;>1364704663;79;4;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1927589515;>1793371931;>291;6;;;;;;;;;;;3;;;;;;;;;;;>283;;;>283;;;>4096;>244;;;;;;;;;;;;;;
;30207;;;;<3161200498;<3161200498;65;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2396160;>113037312;>1610816;;;;;>74252;>775129;;
;30201;;;;>1235161895;>1367768663;79;4;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>183;;;;;;;;;;;;;;
;30203;;;;>1926038779;>1791821195;>291;5;;;;;;;;;;;0;;;;;;;;;;;>283;;;>283;;;0;0;;;;;;;;;;;;;;
;30207;;;;<3161166050;<3161165538;65;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>675840;>7135232;>26552;;;;;<55283;<755186;;
;30201;;;;>1235152039;>1369342559;79;;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1926016307;>1791798723;>291;4;;;;;;;;;;;3;;;;;;;;;;;>283;;;>283;;;>4096;>266;;;;;;;;;;;;;;
;30207;;;;<3161168346;<3161168346;65;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>32555008;<88039424;>10377688;;;;;<24134;<19815;;
;30201;;;;>1239201167;>1363041063;79;4;;9;9;0;9;0;0;0;0;0;1086;0;0;0;0;>834;4;;;1;0;122;0;0;5;;;>335872;>9372;;;;;;;;;>272;5;6;;;
;30203;;;;>1921968187;>1787750603;>291;;;;;;;;;;;;0;;;;;0;0;;;;;>283;;;>283;;;0;0;;;;;;;;;3;0;0;;;
;30207;;;;<3161168122;<3161168122;65;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;0;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>29466624;>26894336;>10584312;;;;;>12369;>726588;;
;30201;;;;>1239224527;>1362857799;79;4;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1922600403;>1788382819;>291;;;;;;;;;;;;>1085;;;;;>835;4;;;;;>283;;;>283;;;>335872;>8520;;;;;;;;;>417;9;;;;
;30207;;;;<3156670066;<3156670066;65;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<315392;<7782;;;;;;;;;6;0;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4063232;>2285568;>1575968;;;;;<15922;<735385;;
;30201;;;;>1234071615;>1366713231;79;4;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;<16384;<505;;;;;;;;;0;;;;;
;30203;;;;>1922598579;>1788380995;>291;3;;;;;;;;;;;0;;;;;;;;;;;>283;;;>283;;;0;0;;;;;;;;;;;;;;
;30207;;;;<3156670194;<3156670194;65;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>9.010;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1826816;>921600;>3155040;;;;;>28308;>3085;;
;30201;;;;>1234071615;>1365134159;79;;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1922600339;>1788382755;>291;2;;;;;;;;;;;3;;;;;;;;;;;>283;;;>283;;;>4096;>243;;;;;;;;;;;;;;
;30207;;;;<3156672594;<3156672594;65;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1925120;>1105920;<288;;;;;<25285;>719281;;
;30201;;;;>1234073391;>1368291263;79;5;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;>4096;>262;;;;;;;;;;;;;;
;30203;;;;>1922599379;>1788381795;>291;2;;;;;;;;;;;0;;;;;;;;;;;>283;;;>283;;;0;0;;;;;;;;;;;;;;
;30207;;;;<3156673858;<3156674370;65;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2375680;>23425024;>1593904;;;;;>16203;<698327;;
;30201;;;;>1234074655;>1366698847;79;3;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1922619043;>1788401459;>291;5;;;;;;;;;;;3;;;;;;;;;2;;>283;;;>283;;;>4096;>246;;;;;;;;;;;;;;
;30207;;;;<3156694210;<3156694210;65;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.011;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>19984384;>112128000;>11060000;;;;;>34727;>24642;;
;30201;;;;>1235996495;>1359154079;79;4;;9;9;0;9;0;0;0;0;0;1007;0;0;0;0;>789;4;;;1;0;122;0;0;5;;;>299008;>8189;;;;;;;;;>247;5;;;;
;30203;;;;>1920698531;>1786480947;>291;;;;;;;;;;;;0;;;;;0;0;;;;;>283;;;>283;;;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3153546610;<3153571202;65;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>26554368;>31924224;>13218112;;;;;<38835;>683041;;
;30201;;;;>1232848255;>1353872319;79;4;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1921241651;>1787024067;>291;5;;;;;;;;;;;>1007;;;;;>790;4;;;;;>283;;;>283;;;>303104;>7863;;;;;;;;;>387;4;;;;
;30207;;;;<3154039410;<3154038898;65;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<282624;<7127;;;;;;;;;13;0;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1843200;>6172672;>1599152;;;;;<11748;<719491;;
;30201;;;;>1232798815;>1365416735;79;5;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;<16384;<432;;;;;;;;;0;;;;;
;30203;;;;>1921240723;>1787023139;>291;;;;;;;;;;;;0;;;;;;;;;;;>283;;;>283;;;0;0;;;;;;;;;;;;;;
;30207;;;;<3154039538;<3154039538;65;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.012;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>921600;<3674112;>17800;;;;;>129288;>40937;;
;30201;;;;>1232799519;>1366999303;79;4;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1921257755;>1787040171;>291;;;;;;;;;;;;3;;;;;;;;;;;>283;;;>283;;;>4096;>262;;;;;;;;;;;;;;
;30207;;;;<3154057914;<3154057914;65;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.012;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2404352;<602112;>1550064;;;;;<133688;>661660;;
;30201;;;;>1232801679;>1365469199;79;3;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;>2375680;>1972;>4096;>209;;;;;;;;;;;;;;
;30203;;;;>1921256923;>1787039339;>291;5;;;;;;;;;;;0;;;;;;;;;;;>283;;;>283;0;0;0;0;;;;;;;;;;;;;;
;30207;;;;<3152486154;<3152510746;65;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.012;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>577536;>425984;>26976;;;;;>39082;<676049;;
;30201;;;;>1231229407;>1365444607;79;3;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1921258443;>1787040859;>291;4;;;;;;;;;;;3;;;;;;;;;;;>283;;;>283;;;>4096;>232;;;;;;;;;;;;;;
;30207;;;;<3152487850;<3152487338;65;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.012;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>7065600;>5492736;>3693432;;;;;<43737;<42076;;
;30201;;;;>1231712567;>1362236207;79;4;;9;9;0;9;0;0;0;0;0;1007;0;0;0;0;>789;4;;;1;0;122;0;0;5;;;>299008;>7911;;;;;;;;;>268;10;;;;
;30203;;;;>1920776099;>1786558515;>291;3;;;;;;;;;;;0;;;;;0;0;;;;;>283;;;>283;>2387968;>2187;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3152487978;<3152487978;65;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;0;0;;;;;;;;;;;;;;;;
;;>11.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>11558912;>12599296;>2029544;;;;;>12873;>735342;;
;30201;;;;>1231712183;>1363900223;79;3;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;-114294138;;-114294138;;;;;;
;30203;;;;>1922753483;>1788535899;>292;4;;;;;;;;;;;>1007;;;;;>790;4;;;;;>284;;;>283;;;>299008;>7658;;;;;;0;;0;>338;5;;;;
;30207;;;;<3154430514;<3154430514;66;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<278528;<6976;;;;;;;;;16;0;;;;
;;>10.011;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>319488;>3932160;>1760;;;;;<6155;<724498;;
;30201;;;;>1231678087;>1365893911;79;4;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;;;<16384;<422;;;;;;;;;0;;;;;
;30203;;;;>1922753131;>1788535547;>292;3;;;;;;;;;;;0;;;;;;;;;;;>284;;;>283;;;0;0;;;;;;-108035175;;-108035175;;;;;;
;30207;;;;<3154431218;<3154431218;66;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;-105271946;;-105271946;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>397312;>80642048;<416;;;;;>45883;>23050;;
;30201;;;;>1231678263;>1365896263;79;;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;;;;;;;;0;;0;;;;;;
;30203;;;;>1922753003;>1788535419;>292;5;;;;;;;;;;;3;;;;;;;;;;;>284;;;>283;;;>4096;>174;;;;;;;;;;;;;;
;30207;;;;<3154431906;<3154431906;66;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<3088166912;<2278441952;<1847028230;;;;;>27489;>784457;;
;30201;;;;>1232013831;>3213259645;77;5;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;>28672;>986;>28672;>1481;;;;;;;;;;;;;;
;30203;;;;>1919898515;>1785752931;>278;6;;;;;;;;;;;0;;;;;;;;;2;1;>193;;;>204;0;0;0;0;;;;;;;;;;;;;;
;;>10.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>188416;<500757472;<1045568;;;;;<70509;<813450;;
;30201;;;;<1919897811;<1784706659;77;4;;;;;;;;;;;;;;;;;;;;1;0;<193;;;5;;;;;;;;;;;;;;;;;;
;30203;;;;>705805360;>1347448771;67;15;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;>1642496;>3465;>131072;>3487;;;;;;;;;19;1;;;;
;;>14.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<8834682880;<6608297984;<4466017692;;;;;>56921;>279744;;
;30201;;;;<702871888;>3121545145;72;6;;9;9;0;9;0;0;0;0;0;1085;0;0;0;0;>884;4;;;1;0;122;0;0;5;<1626112;<2695;>212992;>7003;;;;;;;;;>222;7;;;;
;;>23.979;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;0;<4171994080;<1597524189;;;;;0;0;;
;;>13.435;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>7463747584;>4684166112;>2257491111;;;;;>1251169;>2076749;;
;30201;;;-1;<438724260;<1146818219;66;16;;4;4;;3;1;;;1;;<644;;;;;<580;5;;;3;2;<3;;;;>81919;>2123;>1388543;>34115;>596037631;>263075;>1396735;>1044;;>7396524403549510;;>7396524403549510;>5;26;;;;
;30203;;;;<1443145187;<1672610750;39;18;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;-1;>7396524466439412;-1;>7396524466397700;<585265152;<244266;-1;>7396524466441261;;>62892795;;>62892795;0;0;;;;
;30207;;;;<342710602;<243517151;;12;;;;;;;;;;;;;;;;;;;;;;;;;;;>112171713;;>112171713;<10223616;<17434;;>112171713;;>112171713;;>112171713;4;;;;;
;;>10.036;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1;>4833468416;>4965819360;>4155123141;;;;;<1076891;<1655729;;
;30201;;;0;>2080036424;<1896729728;70;5;;9;9;0;9;0;0;0;0;0;523;0;0;0;0;>439;2;;;1;0;122;0;0;5;0;0;1388544;<7396524578608034;>704513;>2354;0;0;;<7396524529692438;;<7396524529692438;>1450;9;;;;
;30203;;;;>1623025058;>1490516290;>268;15;;1;1;;0;2;1;;1;;<355;;;;;58;4;;;3;1;>270;;;>283;>24575;-7396524466441885;>192511;-7396524466403131;>574132224;>273540;>1396735;-7396524466441232;;<42052097;;<42052097;<704;>831;;;;
;30207;;;;<3084683498;<3087712346;45;9;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;-7396524578613522;<1560576;-7396524578613006;<508162048;<230008;>331776;-7396524578611826;;-178753836;;-178753836;0;0;;;;
;;>10.026;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3029090304;>2767676384;>1168083636;;;;;>377674;>183259;;
;30201;;;;>1581644974;>549098826;76;5;;9;9;0;9;0;0;0;0;0;1680;0;0;0;0;>1484;13;;;1;0;122;0;0;5;>1;>7396524578614549;>557057;>7396524578628383;<61792256;<31149;0;0;;-17397022;;-17397022;>309;11;;;;
;30203;;1;;>1897159858;>1768378138;>281;7;;;;;;;;;;;>204;;;;;>343;10;;;;;>283;;;>283;0;0;>1359872;>8540;>6602752;>10018;;;;-50346402;;-50346402;>640;4;;;;
;30207;;0;;<3137751966;<3146485030;62;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<1802240;<19830;0;0;;;;>85928774;;>85928774;25;0;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;0;>246378496;>226992128;>68940232;;;;;<323379;>359671;;
;30201;;;;>1245463796;>1314037708;77;5;;9;9;0;9;0;0;0;0;0;3;0;0;0;0;;;;;1;0;122;0;0;5;>4096;>213;<126976;<3607;;;;;;0;;0;0;;;;;
;30203;;;;>1931652162;>1797434754;>281;6;;;;;;;;;;;>663;;;;;>530;8;;;;;>283;;;>283;0;0;>299008;>7085;>3485696;>11676;;;;>12241559;;>12241559;>183;6;;;;
;30207;;;;<3177100246;<3177100246;62;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<294912;<6873;0;0;;;;-5791937;;-5791937;1;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>9089024;<4767744;>6352952;;;;;<201734;<899930;;
;30201;;;;>1248579060;>1376443372;77;6;;9;9;0;9;0;0;0;0;0;0;0;0;0;0;;;;;1;0;122;0;0;5;;;0;0;;;;;;0;;0;0;;;;;
;30203;;;;>1928545162;>1794327898;>281;3;;;;;;;;;;;3;;;;;;;;;;;>283;;;>283;;;>4096;>233;;;;;;;;;;;;;;
;30207;;;;<3177118526;<3177118526;62;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.023;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>132255744;>105353216;>43558456;;;;;>914108;>1050878;;
;30201;;;;>1266192732;>1356858132;87;7;;10;10;0;10;0;0;0;0;0;7;0;0;0;0;>919;4;6;;1;0;125;0;0;5;>806912;>5222;>77824;>3266;;;;;;-4265510;;-4265510;83;;;;;
;30203;;;;>1915021914;>1780798058;>273;6;;;;;;;;;;;4;;;;;>2;;7;;;;>280;;;>283;<77824;<722;<36864;<1717;;;;;;0;;0;37;;;;;
;30207;;;;<3178453662;<3178454430;65;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;0;;-1;-1;-1;-1;-1;-1;0;0;0;0;;;;;;;;;0;;;;;
;;>10.025;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>15777792;<6533120;>6899304;;;;;<862864;<272700;;
;30201;;;;>1265365612;>1392690516;92;7;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;126;0;0;5;>49152;>1743;>45056;>2036;;;;;;;;;;;;;;
;30203;;;;>1911777810;>1777542162;>273;6;;;;;;;;;;;3;;;;;;;;;;;>280;;;>283;0;0;<28672;<1411;;;;;;-13334183;;-13334183;3;;;;;
;30207;;;;<3175535838;<3175586782;69;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;<8192;<330;;;;;;-4033252;;-4033252;0;;;;;
;;>10.042;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>24584192;>19189760;>13470616;;;;;>6031607;>1621744;;
;30201;;;;>1272916396;>1385220564;99;7;;10;10;0;5;5;0;0;5;0;53;0;0;0;0;29;;;;7;0;129;0;0;5;>114688;>3782;>110592;>4083;;;;;;0;;0;53;2;;;;
;30203;;;;>1905814842;>1780100522;>278;9;;;;;10;0;;;0;;0;;;;;6;1;;;1;;>279;;;>283;0;0;>143360;>3220;;;;;;;;;7;0;;;;
;30207;;;;<3172308806;<3173912198;70;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<245760;<7153;;;;;;;;;0;;;;;
;;>9.999;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>246792192;>227856384;>122792875;;;;;>6447832;>5373774;;
;30201;;;;>1286956468;>1299990921;>56;6;;10;10;0;10;0;0;0;0;0;955;0;0;0;0;>1101;4;;;1;0;128;0;0;5;>36864;>1327;>315392;>9508;;;;;;;;;>295;5;;;;
;30203;;;;>1922128021;>1787906293;>304;7;;;;;;;;;;;>53;;;;;>45;6;;;;;>292;;;>283;0;0;>417792;>15595;;;;;;;;;>110;8;;;;
;30207;;;;<3190111289;<3190135817;80;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<729088;<24797;;;;;;;;;10;0;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>37986304;>34205696;>13543664;;;;;<11996853;<6578848;;
;30201;;;;>1267944236;>1388643148;>41;6;;10;10;0;10;0;0;0;0;0;5;0;0;0;0;>606;;;;1;0;128;0;0;5;>8192;>340;;>90;;;;;;;;;44;;;;;
;30203;;;;>1922000325;>1787782277;>295;7;;;;;;;;;;;2;;;;;;;;;;;>292;;;>283;0;0;<12288;<320;;;;;;;;;6;;;;;
;30207;;;;<3184018017;<3184042561;76;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;0;;;;;
;;>10.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>6967296;<194936832;>6304096;;;;;<281332;<963232;;
;30201;;;;>1263575460;>1391524276;>43;7;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;>8192;>304;>8192;>336;;;;;;;;;4;;;;;
;30203;;;;>1920446021;>1786217653;>297;;;;;;;;;;;;3;;;;;;;;;;;>292;;;>283;0;0;<4096;<161;;;;;;;;;0;;;;;
;30207;;;;<3184027641;<3184027641;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>6443008;<2215936;>4953072;;;;;<190483;<184482;;
;30201;;;;>1265019876;>1394438756;>30;7;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>212;;;;;;;;;4;;;;;
;30203;;;;>1918914965;>1784934869;>303;6;;;;;;;;;;;0;;;;;;;;;;;>292;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3184025097;<3184392777;67;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3899392;<843776;>1009152;;;;;<3685;>694442;;
;30201;;;;>1265122148;>1398306228;>38;6;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;-25196374;;-25196374;2;;;;;
;30203;;;;>1918910613;>1784693205;>303;;;;;;;;;;;;3;;;;;;;;;;;>292;;;>283;;;>4096;>184;;;;;;0;;0;0;;;;;
;30207;;;;<3184028025;<3184027961;67;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>22552576;>26537984;>6357696;;;;;>20150;<660830;;
;30201;;;;>1306019989;>1394557364;>43;10;;10;10;0;5;5;0;0;5;0;116;0;112;0;0;>117;;;;11;5;133;0;0;5;;;>12288;>456;;;;;;;;;>165;11;;;;
;30203;;;;>1878013012;>1784692245;>298;6;;;;;10;0;;;0;;0;;0;;;0;;;;1;0;>287;;;>283;;;0;0;;;;;;-18593210;;-18593210;0;0;;;;
;30207;;;;<3184039369;<3184039369;66;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;-23749506;;-23749506;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>117813248;>113446912;>56529037;;;;;>469174;>13355211;;
;30201;;;;>1277018780;>1353132783;>56;6;;10;10;0;10;0;0;0;0;0;972;0;0;0;0;>790;4;;;1;0;128;0;0;5;;;>327680;>9142;>36864;>1055;;;;0;;0;>152;3;;;;
;30203;;;;>1929466946;>1795249538;>302;;;;;;;;;;;;>35;;;;;>53;5;;;;;>305;;;>283;;;<8192;<335;0;0;;;;;;;>478;4;;;;
;30207;;;;<3204790494;<3204790494;68;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<299008;<7881;;;;;;;;;12;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>7270400;>11243520;>6328600;;;;;<481063;<12665268;;
;30201;;;;>1276903652;>1404792460;>54;6;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<747;;;;;;;;;2;;;;;
;30203;;;;>1927892682;>1793674378;>302;;;;;;;;;;;;0;;;;;;;;;;;>305;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3204791582;<3204790638;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2572288;>3768320;>94968;;;;;<7416;<735567;;
;30201;;;;>1276916404;>1411038796;>53;4;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;3;;;;;
;30203;;;;>1927880722;>1793663314;>303;6;;;;;;;;;;;3;;;;;;;;;;;>305;;;>283;;;>4096;>250;;;;;;;;;0;;;;;
;30207;;;;<3204791430;<3204791430;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1937408;<4759552;>3112600;;;;;<3146;<1961;;
;30201;;;;>1276869676;>1407974484;>49;6;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;>4538368;>3204;>4096;>208;;;;;;;;;;;;;;
;30203;;;;>1927932234;>1793714826;>307;;;;;;;;;;;;0;;;;;;;;;;;>305;;;>283;0;0;0;0;;;;;;;;;;;;;;
;30207;;;;<3204797750;<3204797238;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>5443584;>3375104;>4749224;;;;;>5649;>715333;;
;30201;;;;>1278420684;>1409472916;>49;6;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;2;;;;;
;30203;;;;>1926384258;>1792156658;>307;5;;;;;;;;;;;3;;;;;;;;;;;>305;;;>283;;;>4096;>216;;;;;;;;;0;;;;;
;30207;;;;<3204799246;<3204789054;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>36327424;>34549760;>19676640;;;;;>37670;<243180;;
;30201;;;;>1294901932;>1407834204;>53;6;;10;10;0;10;0;0;0;0;0;1007;0;0;0;0;>791;4;;;1;0;128;0;0;5;;;>303104;>8365;;;;;;;;;>237;5;;;;
;30203;;;;>1909903826;>1775709714;>303;;;;;;;;;;;;0;;;;;0;0;;;;;>305;;;>283;>3952640;>2966;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3204799422;<3204799422;68;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;0;0;;;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>55353344;>60321792;>40699304;;;;;>454101;>12610396;;
;30201;;;;>1294967052;>1388486452;>53;6;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1930282370;>1796064306;>312;;;;;;;;;;;;>1085;;;;;>838;4;;;;;>305;;;>283;;;>344064;>8358;;;;;;;;;>445;4;;;;
;30207;;;;<3215599462;<3215599462;71;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<323584;<7523;;;;;;;;;9;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>479232;>118906880;>1582880;;;;;<412926;<12311826;;
;30201;;;;>1285323332;>1417958516;>50;5;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<593;;;;;;;;;2;;;;;
;30203;;;;>1930281586;>1796063522;>312;6;;;;;;;;;;;0;;;;;;;;;;;>305;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3215600118;<3215600118;71;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>225280;<115818496;>38416;;;;;<61230;<760007;;
;30201;;;;>1285323508;>1419503156;>50;5;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;2;;;;;
;30203;;;;>1930283810;>1796065746;>312;6;;;;;;;;;;;3;;;;;;;;;;;>305;;;>283;;;>4096;>294;;;;;;;;;0;;;;;
;30207;;;;<3215601622;<3215601622;71;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>577536;<2109440;>35088;;;;;<6170;>54802;;
;30201;;;;>1285324132;>1419507108;>50;4;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;>45056;>616;>4096;>172;;;;;;;;;2;;;;;
;30203;;;;>1930286994;>1796068034;>312;6;;;;;;;;;;;0;;;;;;;;;;;>305;;;>283;0;0;0;0;;;;;;;;;0;;;;;
;30207;;;;<3215608566;<3215607158;71;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3526656;>2994176;>3206448;;;;;<1139;>657745;;
;30201;;;;>1285326548;>1416337652;>50;5;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;-34025532;;-34025532;;;;;;
;30203;;;;>1930288850;>1796070786;>312;6;;;;;;;;;;;3;;;;;;;;;;;>305;;;>283;;;>4096;>217;;;;;;0;;0;;;;;;
;30207;;;;<3215609702;<3215609702;71;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>16936960;>7516160;>8608728;;;;;>59170;>357632;;
;30201;;;;>1287564364;>1413149108;>53;6;;10;10;0;10;0;0;0;0;0;1007;0;0;0;0;>791;4;;;1;0;128;0;0;5;;;>303104;>8350;;;;;;;;;>270;8;;;;
;30203;;;;>1928051850;>1793857738;>309;7;;;;;;;;;;;0;;;;;0;0;;;;;>305;;;>283;>331776;>845;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3215608886;<3215609878;71;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;0;0;;;;;;;;;;;;;;;;
;;>9.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>24084480;>22327296;>6702056;;;;;>363522;>11287159;;
;30201;;;;>1287586844;>1415104484;>53;6;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;1;;;;;
;30203;;;;>1930103474;>1795885410;>310;;;;;;;;;;;;>1007;;;;;>793;4;;;;;>305;;;>283;;;>311296;>8527;;;;;;-36858410;;-36858410;>341;3;;;;
;30207;;;;<3216326718;<3216326718;72;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<290816;<7830;;;;;;-34892173;;-34892173;10;0;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>49172480;>63721472;>16611472;;;;;<325155;<11498759;;
;30201;;;;>1363490212;>1418866012;>52;6;;10;10;0;9;1;0;0;1;0;16;0;0;0;0;>310;;;;3;1;130;0;0;5;;;<12288;<155;;;;;;0;;0;8;1;;;;
;30203;;;;>1852842410;>1780855138;>310;;;;;;10;0;;;0;;0;;;;;<7;;;;1;0;>303;;;>283;;;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3216326926;<3216326926;72;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>434176;<2252800;<11096232;;;;;<80109;<807780;;
;30201;;;;>1288554132;>1433868428;>52;6;;10;10;0;10;0;0;0;0;0;16;0;0;0;0;20;;;;1;0;128;0;0;5;;;>4096;>333;;;;;;;;;3;1;;;;
;30203;;;;>1927780378;>1793562314;>310;7;;;;;;;;;;;3;;;;;0;;;;;;>305;;;>283;;;;<126;;;;;;;;;1;0;;;;
;30207;;;;<3216328814;<3216329710;72;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;0;;;;;
;;>11.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>5136384;<1810432;>3188688;;;;;<12839;<51433;;
;30201;;;;>1288554484;>1419584756;>52;5;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;>10633216;>4565;>8192;>343;;;;;;;;;4;;;;;
;30203;;;;>1927779914;>1793561850;>310;6;;;;;;;;;;;0;;;;;;;;;;;>305;;;>283;0;0;0;0;;;;;;;;;0;;;;;
;30207;;;;<3214751166;<3214750654;72;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2244608;<1142784;>1618544;;;;;<11005;>695774;;
;30201;;;;>1288569908;>1421168916;>52;6;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1926187802;>1791970218;>310;;;;;;;;;;;;3;;;;;;;;;;;>305;;;>283;;;>4096;>242;;;;;;;;;;;;;;
;30207;;;;<3214753454;<3214753454;72;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>75341824;>66146304;>37233312;;;;;>204291;>231221;;
;30201;;;;>1372478572;>1412681564;>55;8;;10;10;0;5;5;0;0;5;0;1456;72;214;0;0;>1169;9;;;9;3;131;0;0;5;>4096;>210;>442368;>12523;;;;;;;;;>369;9;;;;
;30203;;;;>1843098018;>1765476250;>307;7;;;;;10;2;;2;0;;29;0;0;;;27;0;;;1;0;>302;;;>283;>80568320;>61379;<430080;<11805;;;;;;;;;9;0;;;;
;30207;;;;<3215574238;<3215389622;72;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;<79958016;<60629;<8192;<582;;;;;;;;;0;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>135806976;>133607424;>9832176;;;;;>541420;>12914659;;
;30201;;;;>1304599156;>1428985412;>56;6;;10;10;0;10;0;0;0;0;0;285;0;0;0;0;>135;4;;;1;0;128;0;0;5;0;0;>167936;>4447;;;;;;;;;30;1;;;;
;30203;;;;>1911652530;>1777434946;>310;;;;;;;;;;;;>722;;;;;>658;;;;;;>308;;;>283;;;>147456;>4600;;;;;;;;;>423;4;;;;
;30207;;;;<3214917822;<3214917822;72;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<299008;<8497;;;;;;;;;14;0;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>138887168;>142983168;>6623920;;;;;>34169;<11039816;;
;30201;;;;>1303270724;>1430864388;>56;5;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<461;;;;;;;;;2;;;;;
;30203;;;;>1915073026;>1780855442;>310;6;;;;;;;;;;;>653;;;;;>471;11;2;;;;>308;;;>283;>421888;>2986;>446464;>7319;;;;;;;;;>248;3;;;;
;30207;;;;<3216761942;<3216761942;72;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;0;;-1;-1;-1;-1;-1;-1;0;0;<438272;<6929;;;;;;;;;2;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>770048;>1236992;>2824;;;;;<775416;<2805691;;
;30201;;;;>1301689092;>1435903852;>56;5;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;0;0;;;;;;;;;0;;;;;
;30203;;;;>1915074986;>1780857402;>310;6;;;;;;;;;;;3;;;;;;;;;;;>308;;;>283;;;>4096;>174;;;;;;;;;;;;;;
;30207;;;;<3216763054;<3216763566;72;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>471040;<3198976;<2464;;;;;>1783;>1584;;
;30201;;;;>1301689300;>1435909860;>56;6;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>229;;;;;;;;;;;;;;
;30203;;;;>1915072970;>1780855386;>310;;;;;;;;;;;;0;;;;;;;;;;;>308;;;>283;;;0;0;;;;;;;;;;;;;;
;30207;;;;<3216765694;<3216765694;72;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2265088;<1544192;>1578088;;;;;<733;>708628;;
;30201;;;;>1301693412;>1434332908;>56;4;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;2;;;;;
;30203;;;;>1915076594;>1780859010;>310;6;;;;;;;;;;;3;;;;;;;;;;;>308;;;>283;;;>4096;>186;;;;;;;;;0;;;;;
;30207;;;;<3216770806;<3216770806;72;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>13778944;>10838016;>3593888;;;;;>105692;>380331;;
;30201;;;;>1303701300;>1434324996;>59;5;;10;10;0;10;0;0;0;0;0;1007;0;0;0;0;>791;4;;;1;0;128;0;0;5;;;>307200;>8226;;;;;;;;;>242;3;;;;
;30203;;;;>1913070946;>1778852626;>307;6;;;;;;;;;;;0;;;;;0;0;;;;;>308;;;>283;;;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3216771558;<3216771510;72;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>25784320;>30633984;>11820576;;;;;>291299;>11368276;;
;30201;;;;>1303725380;>1426123076;>59;6;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;1;;;;;
;30203;;;;>1917750266;>1783532682;>316;;;;;;;;;;;;>1085;;;;;>838;4;;;;;>308;;;>283;;;>335872;>8251;;;;;;;;;>529;8;;;;
;30207;;;;<3216012470;<3216012470;72;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<315392;<7466;;;;;;;;;15;0;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>430080;>3108864;>864;;;;;<395366;<11759553;;
;30201;;;;>1298263260;>1432479980;>59;4;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<576;;;;;;;;;1;;;;;
;30203;;;;>1917749018;>1783531434;>316;6;;;;;;;;;;;0;;;;;;;;;;;>308;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3216012278;<3216012278;72;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>438272;>2809856;>1784;;;;;<10489;<710154;;
;30201;;;;>1298263436;>1432479236;>59;4;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1917750450;>1783532866;>316;6;;;;;;;;;;;3;;;;;;;;;;;>308;;;>283;;;>4096;>218;;;;;;;;;;;;;;
;30207;;;;<3216013374;<3216013886;72;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>737280;<5230592;>1120;;;;;>6851;>13202;;
;30201;;;;>1298264444;>1432481420;>59;4;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>217;;;;;;;;;3;;;;;
;30203;;;;>1917750770;>1783533186;>316;6;;;;;;;;;;;0;;;;;;;;;;;>308;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3216017966;<3216017966;72;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>45056;<1191936;>1792;;;;;<579;>693972;;
;30201;;;;>1298267372;>1432483164;>59;6;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;3;;;;;
;30203;;;;>1917752210;>1783534626;>316;;;;;;;;;;;;3;;;;;;;;;;;>308;;;>283;;;>4096;>291;;;;;;;;;0;;;;;
;30207;;;;<3216019582;<3216019582;72;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>14114816;>9846784;>500256;;;;;>95194;>377560;;
;30201;;;;>1298748716;>1432466044;>60;4;;10;10;0;10;0;0;0;0;0;1007;0;0;0;0;>791;4;;;1;0;128;0;0;5;;;>311296;>8484;;;;;;;;;>226;7;;;;
;30203;;;;>1917271170;>1783053458;>315;7;;;;;;;;;;;0;;;;;0;0;;;;;>308;;;>283;;;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3216007294;<3216007166;73;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>13312000;>20029440;>3952888;;;;;>300122;>11279548;;
;30201;;;;>1298736300;>1429000996;>59;5;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;1;1;;;;
;30203;;;;>1918044762;>1783827178;>315;7;;;;;;;;;;;>1007;;;;;>793;5;;;;;>308;;;>283;>4096;>308;>315392;>8222;;;;;;;;;>422;4;;;;
;30207;;;;<3216731574;<3216731574;73;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<294912;<7374;;;;;;;;;25;0;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1286144;<2502656;<1179512;;;;;<396632;<11636627;;
;30201;;;;>1298688284;>1434085380;>59;6;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<676;;;;;;;;;0;;;;;
;30203;;;;>1916862306;>1782644722;>315;;;;;;;;;;;;0;;;;;>3;2;2;;;;>308;;;>283;>385024;>2522;>4096;>236;;;;;;;;;4;;;;;
;30207;;;;<3215550590;<3215550590;73;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;0;;-1;-1;-1;-1;-1;-1;0;0;0;0;;;;;;;;;0;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1818624;>7192576;>1568848;;;;;>65669;<700416;;
;30201;;;;>1298688460;>1431337196;>59;4;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;2;;;;;
;30203;;;;>1916880994;>1782663410;>315;6;;;;;;;;;;;3;;;;;;;;;;;>308;;;>283;;;>4096;>165;;;;;;;;;0;;;;;
;30207;;;;<3215568942;<3215568942;73;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>409600;<4263936;>27408;;;;;<67924;<23062;;
;30201;;;;>1298689180;>1432879356;>59;4;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;>2686976;>2898;>4096;>229;;;;;;;;;1;;;;;
;30203;;;;>1916883938;>1782666354;>315;6;;;;;;;;;;;0;;;;;;;;;;;>308;;;>283;0;0;0;0;;;;;;;;;0;;;;;
;30207;;;;<3215575710;<3215575710;73;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>417792;<1597440;>3072;;;;;>20630;>719872;;
;30201;;;;>1298691948;>1432907452;>59;5;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;1;;;;;
;30203;;;;>1916885666;>1782668082;>315;6;;;;;;;;;;;3;;;;;;;;;;;>308;;;>283;;;>4096;>175;;;;;;;;;0;;;;;
;30207;;;;<3215577614;<3215577614;73;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>11755520;>7200768;>534424;;;;;>77865;>361966;;
;30201;;;;>1299165660;>1432847828;>59;6;;10;10;0;10;0;0;0;0;0;1085;0;0;0;0;>836;4;;;1;0;128;0;0;5;;;>344064;>9232;;;;;;;;;>258;5;;;;
;30203;;;;>1916412770;>1782195186;>315;;;;;;;;;;;;0;;;;;0;0;;;;;>308;;;>283;>2514944;>2536;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3215571406;<3215571406;73;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;0;0;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>18214912;>17014784;>9199280;;;;;>288745;>11273620;;
;30201;;;;>1299158812;>1424177116;>59;6;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;>31215254;;>31215254;;;;;;
;30203;;;;>1918056810;>1783839226;>315;;;;;;;;;;;;>1007;;;;;>793;4;;;;;>308;;;>283;;;>311296;>7912;>4096;>145;;;;0;;0;>364;2;;;;
;30207;;;;<3209606870;<3209606870;73;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<290816;<7158;0;0;;;;;;;27;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>126976;>8716288;>1840;;;;;<364228;<11628978;;
;30201;;;;>1291551980;>1425767724;>59;4;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<585;;;;;;;;;2;0;;;;
;30203;;;;>1918054810;>1783837226;>315;5;;;;;;;;;;;0;;;;;;;;;;;>308;;;>283;;;0;0;;;;;;>51693045;;>51693045;0;;;;;
;30207;;;;<3209606790;<3209606790;73;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;<115152;;<115152;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>450560;>1335296;>2248;;;;;<24388;<730847;;
;30201;;;;>1291552716;>1425768052;>59;4;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;0;;0;1;;;;;
;30203;;;;>1918055586;>1783838002;>315;6;;;;;;;;;;;3;;;;;;;;;;;>308;;;>283;;;>4096;>221;;;;;;;;;0;;;;;
;30207;;;;<3209607790;<3209608302;73;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1925120;>262144;>1548400;;;;;>11928;>25987;;
;30201;;;;>1293103148;>1425772844;>59;5;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;>4096;>286;>4096;>207;;;;;;;;;2;;;;;
;30203;;;;>1916504178;>1782286594;>315;7;;;;;;;;;;;0;;;;;;;;;;;>308;;;>283;0;0;0;0;;;;;;;;;0;;;;;
;30207;;;;<3209609918;<3209609918;73;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3346432;>430080;>3176632;;;;;<8507;>702106;;
;30201;;;;>1294679804;>1425720756;>59;7;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;3;;;;;
;30203;;;;>1914932410;>1780714826;>315;5;;;;;;;;;;;3;;;;;;;;;;;>308;;;>283;;;>4096;>180;;;;;;;;;0;;;;;
;30207;;;;<3209612214;<3209612214;73;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>10530816;>3006464;>3801608;;;;;>97228;>349628;;
;30201;;;;>1295190332;>1425606308;>60;6;;10;10;0;10;0;0;0;0;0;1007;0;0;0;0;>791;4;;;1;0;128;0;0;5;;;>311296;>8188;;;;;;;;;>255;5;;;;
;30203;;;;>1914422698;>1780205114;>314;7;;;;;;;;;;;0;;;;;0;0;;;;;>308;;;>283;;;0;0;;;;;;;;;1;0;;;;
;30207;;;;<3209573734;<3209573734;73;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;0;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>8339456;>10428416;>4095192;;;;;>303725;>11394099;;
;30201;;;;>1295159788;>1425273604;>60;6;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;4;;;;;
;30203;;;;>1915412594;>1781203586;>314;;;;;;;;;;;;>1085;;;;;>838;4;;;;;>311;;;>283;;;>352256;>9014;;;;;;;;;>503;2;;;;
;30207;;;;<3208983558;<3208983558;73;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<331776;<8172;;;;;;;;;20;0;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>155648;>3366912;>224;;;;;<394514;<11743452;;
;30201;;;;>1293562516;>1427779876;>60;4;;10;10;0;10;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<667;;;;;;;;;2;;;;;
;30203;;;;>1915421138;>1781203554;>314;6;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3208983654;<3208983654;73;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>9.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>819200;>8175616;>17904;;;;;<20967;<716614;;
;30201;;;;>1293562516;>1427762196;>60;5;;10;10;0;10;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;4;;;;;
;30203;;;;>1915439042;>1781221458;>314;6;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>340;;;;;;;;;0;;;;;
;30207;;;;<3209001558;<3209001558;73;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>6508544;>2146304;>3316368;;;;;>27804;>292997;;
;30201;;;;>1295280164;>1426181380;>60;5;;11;11;0;11;0;0;0;0;0;11;0;0;0;0;;;;;1;0;128;0;0;5;>5025792;>2977;>8192;>382;;;;;;;;;22;;;;;
;30203;;;;>1913723602;>1779506018;>314;6;;10;10;;10;;;;;;0;;;;;;;;;;;>311;;;>283;0;0;0;0;;;;;;;;;0;;;;;
;30207;;;;<3209005734;<3209005734;73;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4902912;>2170880;>123656;;;;;>80358;>3694271;;
;30201;;;;>1295282308;>1429376236;>60;6;;11;11;0;11;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1921386319;>1779626074;>314;;;;;;10;1;;;1;;9;;;;;;;;;2;;>311;;;>283;;;>4096;>225;;;;;;;;;64;;;;;
;30207;;;;<3215088963;<3209125198;73;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;6;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1474560;>2097152;>5843018;;;;;<27730;>897560;;
;30201;;;;>1293704164;>1423657626;>60;6;;11;11;0;11;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>221;;;;;;;;;2;;;;;
;30203;;;;>1918103556;>1783885972;>314;;;;;;;;;;;;2;;;;;;;;;;;>311;;;>283;>7868416;>3791;;<37;;;;;;;;;17;;;;;
;30207;;;;<3211806536;<3211806536;73;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;<7319552;<2836;;<31;;;;;;;;;4;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>235859968;>233656320;>32434672;;;;;>805086;>9794045;;
;30201;;;;>1304239772;>1406022684;>60;5;;11;11;0;11;0;0;0;0;0;1660;0;0;0;0;>1253;12;;;1;0;128;0;0;5;0;0;>569344;>14976;>4096;>168;;;;;;;>437;29;;;;
;30203;;;;>1913667860;>1779450276;>314;6;;;;;;;;;;;<653;;;;;<460;4;;;;;>311;;;>283;;;<253952;<6701;0;0;;;;;;;<12;6;;;;
;30207;;;;<3216312448;<3216312448;73;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<299008;<7582;;;;;;;;;11;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>67399680;>69705728;>3489840;;;;;<93097;<11887542;;
;30201;;;;>1304219388;>1434947132;>60;5;;11;11;0;11;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<678;;;;;;;;;2;;;;;
;30203;;;;>1910833556;>1776615972;>316;6;;;;;;;;;;;>653;;;;;>468;13;4;;;;>311;;;>283;>1003520;>9491;>462848;>7147;>143360;>4067;;;;;;;>313;7;;;;
;30207;;;;<3213452800;<3213452288;73;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;0;;-1;-1;-1;-1;-1;-1;0;0;<454656;<6642;0;0;;;;;;;3;0;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>819200;<1204224;>1591088;;;;;<766915;<2784867;;
;30201;;;;>1302644796;>1435270524;>60;5;;11;11;0;11;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;0;0;;;;;;;;;2;;;;;
;30203;;;;>1910826292;>1776608964;>316;7;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>159;;;;;;;;;0;;;;;
;30207;;;;<3213472368;<3213472368;73;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>323584;<598016;<848;;;;;<2704;<5555;;
;30201;;;;>1302647388;>1436865820;>60;5;;11;11;0;11;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>181;;;;;;;;;;;;;;
;30203;;;;>1910824964;>1776607380;>316;6;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;;;0;0;;;;;;;;;;;;;;
;30207;;;;<3213474752;<3213474752;73;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>540672;<241664;>2200;;;;;>8534;>729357;;
;30201;;;;>1302649788;>1436865172;>60;4;;11;11;0;11;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;4;;;;;
;30203;;;;>1910828028;>1776610444;>316;6;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>274;;;;;;;;;0;;;;;
;30207;;;;<3213478680;<3213478680;73;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4972544;>2592768;>2544;;;;;<16984;<723163;;
;30201;;;;>1314281916;>1436867548;>62;7;;11;11;0;6;5;0;0;5;0;89;0;4;0;0;56;;;;9;5;163;0;0;5;;;>16384;>473;;;;;;;;;83;5;;;;
;30203;;;;>1899196940;>1776608764;>314;6;;;;;11;0;;;0;;0;;0;;;0;;;;1;0;>276;;;>283;;;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3213478856;<3213478344;73;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>23040000;>21094400;>7286640;;;;;>485309;>13413581;;
;30201;;;;>1304509772;>1431440076;>60;5;;11;11;0;11;0;0;0;0;0;996;0;0;0;0;>780;4;;;1;0;128;0;0;5;;;>327680;>8528;;;;;;;;;>204;5;;;;
;30203;;;;>1909564636;>1775347180;>321;6;;;;;;;;;;;>11;;;;;>13;;;;;;>311;;;>283;;;<12288;<145;;;;;;;;;>240;3;;;;
;30207;;;;<3214010792;<3214010792;74;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<294912;<7593;;;;;;;;;15;0;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>421888;>2260992;>1456;;;;;<480794;<12712010;;
;30201;;;;>1304447388;>1438663516;>59;5;;11;11;0;11;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<547;;;;;;;;;4;;;;;
;30203;;;;>1909562988;>1775345404;>321;;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3214009864;<3214009864;74;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>77824;<2646016;>2376;;;;;<9815;<712595;;
;30201;;;;>1304447004;>1438662084;>59;3;;11;11;0;11;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1909565236;>1775347780;>321;6;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>290;;;;;;;;;;;;;;
;30207;;;;<3214012240;<3214012240;74;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>372736;>7229440;>128;;;;;>10983;>12176;;
;30201;;;;>1304448060;>1438665516;>59;7;;11;11;0;11;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>243;;;;;;;;;1;;;;;
;30203;;;;>1909565252;>1775347668;>321;6;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3214015440;<3214015440;74;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>282624;<3174400;>18680;;;;;<4835;>696639;;
;30201;;;;>1304450700;>1438649604;>59;5;;11;11;0;11;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;3;;;;;
;30203;;;;>1909583420;>1775365836;>321;7;;;;;;;;;;;3;;;;;;;;;2;;>311;;;>283;;;>4096;>262;;;;;;;;;0;;;;;
;30207;;;;<3214034632;<3214034632;74;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3121152;>720896;>3184;;;;;>27750;<354675;;
;30201;;;;>1313692364;>1438667084;>59;8;;11;11;0;6;5;0;0;5;0;471;0;15;0;0;>415;;;;8;1;129;0;0;5;;;>114688;>3024;;;;;;;;;>191;5;;;;
;30203;;;;>1900343788;>1775365564;>321;6;;;;;11;0;;;0;;0;;0;;;0;;;;1;0;>310;;;>283;;;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3212461432;<3214035320;74;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>22708224;>24866816;>5764136;;;;;>443909;>12844853;;
;30201;;;;>1303268940;>1433296468;>59;6;;11;11;0;11;0;0;0;0;0;536;0;0;0;0;>376;4;;;1;0;128;0;0;5;;;>196608;>5065;;;;;;;;;>128;;;;;
;30203;;;;>1909812692;>1775595236;>321;;;;;;;;;;;;>549;;;;;>462;;;;;;>311;;;>283;;;>139264;>3324;;;;;;;;;>327;2;;;;
;30207;;;;<3213067248;<3213067248;74;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<315392;<7525;;;;;;;;;16;0;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>356352;>3047424;>2896;;;;;<473924;<12489668;;
;30201;;;;>1303256844;>1437471404;>59;5;;11;11;0;11;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<595;;;;;;;;;0;;;;;
;30203;;;;>1909810500;>1775593044;>321;6;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;;;0;0;;;;;;;;;;;;;;
;30207;;;;<3213067344;<3213066832;74;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1945600;>200704;>54376;;;;;>51301;<699268;;
;30201;;;;>1303256844;>1437419540;>59;6;;11;11;0;11;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;>107727535;;>107727535;2;;;;;
;30203;;;;>1909828396;>1775610812;>321;;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>306;;;;;;0;;0;0;;;;;
;30207;;;;<3213085240;<3213085240;74;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>188416;<4464640;>1572144;;;;;<50807;>1335;;
;30201;;;;>1303257804;>1435903244;>59;6;;11;11;0;11;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;>2383872;>2190;>4096;>243;;;;;;;;;2;;;;;
;30203;;;;>1909826972;>1775609388;>321;;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;0;0;0;0;;;;;;>85810137;;>85810137;0;;;;;
;30207;;;;<3213087016;<3213087016;74;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;<589578;;<589578;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>188416;<1847296;>2416;;;;;>2075;>702380;;
;30201;;;;>1303260684;>1437475724;>59;5;;11;11;0;11;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;0;;0;4;;;;;
;30203;;;;>1909828236;>1775610780;>321;7;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>208;;;;;;;;;0;;;;;
;30207;;;;<3213088920;<3213088920;74;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4562944;>2617344;>3312;;;;;>32012;<250620;;
;30201;;;;>1303554876;>1437477452;>59;6;;11;11;0;11;0;0;0;0;0;1007;0;0;0;0;>791;4;;;1;0;128;0;0;5;>4096;>268;>311296;>8096;;;;;;;;;>278;8;;;;
;30203;;;;>1909534860;>1775608332;>321;7;;;;;;;;;;;0;;;;;0;0;;;;;>311;;;>283;>2285568;>1953;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3213089096;<3213088584;74;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;0;0;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>6680576;>13017088;>875720;;;;;>426654;>12512521;;
;30201;;;;>1303554236;>1436896228;>59;6;;11;11;0;11;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1910096884;>1775879300;>322;;;;;;;;;;;;>1007;;;;;>793;4;;;;;>311;;;>283;;;>315392;>8931;;;;;;;;;>443;3;;;;
;30207;;;;<3213629888;<3213629888;74;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<294912;<8123;;;;;;;;;20;0;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2297856;>3444736;>1576352;;;;;<456470;<12255657;;
;30201;;;;>1303534828;>1436176060;>59;4;;11;11;0;11;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<617;;;;;;;;;2;;;;;
;30203;;;;>1910095188;>1775877604;>322;6;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3213629504;<3213629504;74;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>405504;>19865600;>224;;;;;>22087;<693988;;
;30201;;;;>1303534316;>1437751676;>59;5;;11;11;0;11;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;2;;;;;
;30203;;;;>1910095924;>1775878340;>322;7;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>228;;;;;;;;;0;;;;;
;30207;;;;<3213630752;<3213630752;74;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>36864;>2359296;<1584;;;;;<8918;<6782;;
;30201;;;;>1303535788;>1437754956;>59;7;;11;11;0;11;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>252;;;;;;;;;3;;;;;
;30203;;;;>1910094500;>1775876916;>322;;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3213632368;<3213632368;74;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>36864;<5763072;>1136;;;;;<12375;>705091;;
;30201;;;;>1303537868;>1437754316;>59;6;;11;11;0;11;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;2;;;;;
;30203;;;;>1910095636;>1775878052;>322;7;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>290;;;;;;;;;0;;;;;
;30207;;;;<3213633504;<3213633504;74;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>5066752;<1089536;>1136;;;;;>31687;<259240;;
;30201;;;;>1303883100;>1437754764;>59;7;;11;11;0;11;0;0;0;0;0;1085;0;0;0;0;>836;4;;;1;0;128;0;0;5;;;>344064;>8425;>4096;>144;;;;;;;>319;5;;;;
;30203;;;;>1909751220;>1775877780;>322;;;;;;;;;;;;0;;;;;0;0;;;;;>311;;;>283;;;0;0;0;0;;;;;;;0;0;;;;
;30207;;;;<3213633168;<3213633168;74;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>5431296;>6656000;>2559128;;;;;>434545;>12520857;;
;30201;;;;>1303882492;>1435551268;>59;6;;11;11;0;11;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;1;;;;;
;30203;;;;>1910353628;>1776126364;>323;7;;;;;;;;;;;>1007;;;;;>793;4;;;;;>311;;;>283;;;>315392;>8326;;;;;;;;;>468;5;;;;
;30207;;;;<3214210120;<3214200440;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<294912;<7598;;;;;;;;;11;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>246054912;>227344384;>154609355;;;;;>723200;<11400628;;
;30201;;;;>1449066327;>1428664876;>58;6;;11;11;0;11;0;0;0;0;0;1365;0;0;0;0;>3697;14;;;1;0;128;0;0;5;>299008;>1157;>1740800;>14379;>8830976;>84914;;;;;;;>349;10;;;;
;30203;;;;>1765144113;>1630926529;>323;;;;;;;;;;;;0;;;;;<3394;0;;;;;>311;;;>283;0;0;0;0;0;0;;;;;;;0;0;;;;
;30207;;;;<3214209768;<3214210280;75;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>520192;>16318464;>92240;;;;;<1191855;<1585315;;
;30201;;;;>1449106823;>1583232679;>58;7;;11;11;0;11;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;1;;;;;
;30203;;;;>1765103681;>1630886097;>323;;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>235;;;;;;;;;0;;;;;
;30207;;;;<3214211016;<3214211016;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>5484544;>7045120;>1573616;;;;;>17603;>32276;;
;30201;;;;>1449109607;>1581753575;>57;6;;11;11;0;11;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;>12259328;>13664;>12288;>638;;;;;;;;;1;;;;;
;30203;;;;>1765100945;>1630883361;>324;7;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;0;0;0;0;;;;;;;;;0;;;;;
;30207;;;;<3214212632;<3214212632;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.023;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1916928;>23166976;>3493182;;;;;>23741;>751028;;
;30201;;;;>1449455949;>1580180351;>57;7;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;7;;;;1;0;128;0;0;5;;;;;>79351808;>27374;;;;;;;;;;;;
;30203;;;;>1764757827;>1630540243;>324;;;11;11;;11;;;;;;3;;;;;0;;;;;;>311;;;>283;;;>4096;>241;0;0;;;;;;;;;;;;
;30207;;;;<3214213776;<3214213776;75;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>118185984;>106930176;>123149010;;;;;>2177289;>10639420;;
;30201;;;;>1524964869;>1495132707;>59;9;;12;12;0;10;2;0;0;2;0;2099;101;461;0;0;>1579;14;;;6;3;131;0;0;5;;;>704512;>18071;;;;;;;;;>660;27;;;;
;30203;;;;>1819758386;>1681403509;>322;;;;;;12;1;;1;0;;<737;2;8;;;>1816;13;;;1;0;>308;;;>283;>7790592;>4962;>950272;<2708;>47501312;>94655;;;;;;;>119;6;;;;
;30207;;;;<3343226191;<3298220474;77;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;<7241728;<4015;<1597440;<12806;0;0;;;;;;;16;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>118132736;>93978624;>22464569;;;;;<1418485;>15384461;;
;30201;;;;>1452729797;>1564515124;>57;6;;12;12;0;12;0;0;0;0;0;34;0;0;0;0;40;;;;1;0;128;0;0;5;0;0;<49152;<2116;;;;;;;;;0;;;;;
;30203;;;;>1894471766;>1760254182;>322;7;;;;;;;;;;;>1521;;;;;>1164;6;;;;;>311;;;>283;>4096;>244;>487424;>13998;;;;;;;;;>687;1;;;;
;30207;;;;<3347117803;<3347117803;77;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<454656;<12911;;;;;;;;;44;0;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>143073280;>137838592;<12148962;;;;;<25888;<24003226;;
;30201;;;;>1445355380;>1591721926;>57;6;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;>348;30;30;;1;0;128;0;0;5;>3489792;>24873;>86016;>2374;>4493312;>6351;;;;;;;46;1;;;;
;30203;;;;>1895322886;>1761105302;>322;7;;;;;;;;;;;>653;;;;;>444;27;18;;;;>311;;;>283;<24576;<4545;>397312;>4880;<2859008;<3776;;;;;;;>274;4;;;;
;30207;;;;<3340670922;<3340670922;77;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;0;;-1;-1;-1;-1;-1;-1;0;0;<512000;<8214;0;0;;;;;;;3;0;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>532480;<5586944;>24496;;;;;<780737;<2802036;;
;30201;;;;>1445372804;>1579565892;>57;6;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;0;0;;;;;;;;;;;;;;
;30203;;;;>1895298294;>1761080710;>322;;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>190;;;;;;;;;0;;;;;
;30207;;;;<3340672058;<3340671546;77;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>106496;>2027520;<7424;;;;;>10720;<5106;;
;30201;;;;>1445375956;>1579600452;>57;7;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>205;;;;;;;;;;;;;;
;30203;;;;>1895295318;>1761077734;>322;;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;;;0;0;;;;;;;;;;;;;;
;30207;;;;<3340679594;<3340679594;77;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1724416;<1777664;>1232;;;;;<2932;>709014;;
;30201;;;;>1445384276;>1579600628;>57;5;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;1;;;;;
;30203;;;;>1895297350;>1761079766;>322;7;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>312;;;;;;;;;0;;;;;
;30207;;;;<3340682426;<3340682426;77;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>49528832;>42270720;>20396856;;;;;>147725;>490272;;
;30201;;;;>1446466596;>1560287324;>57;7;;12;12;0;12;0;0;0;0;0;1007;0;0;0;0;>791;4;;;1;0;128;0;0;5;;;>311296;>7696;;;;;;;;;>293;3;4;;;
;30203;;;;>1898665182;>1777708798;>324;8;;14;;2;14;;;;;;35;;;;;0;0;;;;;>311;;;>283;;;<294912;<6764;;;;;;;;;7;0;74;;;
;30207;;;;<3345130978;<3358392818;77;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;0;;0;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>38400000;>39690240;<643208;;;;;>402724;>11618061;;
;30201;;;;>1446489076;>1581350508;>57;6;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;1;1;2;;;
;30203;;;;>1904952662;>1770735078;>325;7;;15;;3;15;;;;;;>1053;;;;;>823;4;;;;;>311;;;>283;>4096;>196;>323584;>8544;>4096;>104;;;;;;;>504;3;77;;;
;30207;;;;<3351454026;<3351454026;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<303104;<7725;0;0;;;;;;;14;0;0;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4722688;>10788864;>413216;;;;;<491584;<12008610;;
;30201;;;;>1446497956;>1580302324;>59;6;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<640;;;;;;;;;1;;1;;;
;30203;;;;>1905372694;>1771155110;>325;7;;15;;3;15;;;;;;16;;;;;;;;;;;>311;;;>283;;;;>59;;;;;;;;;0;;30;;;
;30207;;;;<3351870650;<3351870650;75;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;0;;;
;;>9.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1642496;<1249280;>18128;;;;;<75095;<816587;;
;30201;;;;>1446497956;>1580697412;>59;4;;12;12;0;12;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1905390982;>1771173398;>325;7;;15;;3;15;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>278;;;;;;;;;;;;;;
;30207;;;;<3351888586;<3351889098;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4194304;>11517952;>5971712;;;;;>18945;>14904;;
;30201;;;;>1446498564;>1574744948;>59;7;;12;12;0;12;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>242;;;;;;-140272122;;-140272122;2;1;;;;
;30203;;;;>1905389558;>1771171974;>325;;;15;;3;15;;;;;;0;;;;;;;;;;;>311;;;>283;;;0;0;;;;;;0;;0;0;0;;;;
;30207;;;;<3351890714;<3351890714;75;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>162365440;>157827072;>11723600;;;;;>282691;>1354030;;
;30201;;;;>1454990900;>1579143716;>62;6;;15;12;3;15;0;0;0;0;0;81;0;0;0;0;30;;;;1;0;128;0;0;5;;;>24576;>1219;;;;;;;;;5;;>177;;;
;30203;;;;>1895004470;>1761024534;>322;7;;;;;;;;;;;3;;;;;0;;;;;;>311;;;>283;;;<20480;<984;;;;;;-139413856;;-139413856;0;;20;;;
;30207;;;;<3349995370;<3351891850;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;-139477503;;-139477503;;;0;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4145152;>6995968;<3196272;;;;;<257039;<1270378;;
;30201;;;;>1455312900;>1592726756;>62;5;;15;12;3;15;0;0;0;0;0;19;0;0;0;0;;;;;1;0;128;0;0;5;;;>8192;>433;;;;;;0;;0;4;;31;;;
;30203;;;;>1894682646;>1760465062;>322;7;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;;;0;0;;;;;;;;;0;;0;;;
;30207;;;;<3349995546;<3349995546;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>10952704;>9863168;>2629152;;;;;>463114;>13344477;;
;30201;;;;>1455878700;>1587467644;>62;6;;15;12;3;15;0;0;0;0;0;1093;0;0;0;0;>836;4;;;1;0;128;0;0;5;;;>339968;>8594;;;;;;;;;>322;5;21;;;
;30203;;;;>1894561910;>1760343814;>322;7;;;;;;;;;;;<86;;;;;<43;;;;2;;>311;;;>283;;;<20480;<248;;;;;;;;;>95;4;0;;;
;30207;;;;<3350421314;<3350421314;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<299008;<7524;;;;;;;;;7;0;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>270336;>5009408;>176;;;;;<491762;<12714604;;
;30201;;;;>1455859916;>1590077324;>62;6;;15;12;3;15;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<637;;;;;;;;;0;;;;;
;30203;;;;>1894561574;>1760343990;>322;7;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;;;0;0;;;;;;;;;;;;;;
;30207;;;;<3350421490;<3350421490;75;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>344064;<1736704;>2400;;;;;>22498;<687120;;
;30201;;;;>1455859916;>1590075100;>62;6;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;2;;;;;
;30203;;;;>1894563974;>1760346390;>322;;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>179;;;;;;;;;0;;;;;
;30207;;;;<3350423890;<3350423890;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>327680;>5869568;<1584;;;;;>20653;>11330;;
;30201;;;;>1455860876;>1590079532;>62;6;;15;12;3;15;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;>3362816;>2616;>4096;>219;;;;;;;;;4;;;;;
;30203;;;;>1894562550;>1760345478;>322;7;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;0;0;0;0;;;;;;;;;0;;;;;
;30207;;;;<3350425506;<3350425506;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>40960;>1413120;>18288;;;;;<22703;>684365;;
;30201;;;;>1455862956;>1590062252;>62;6;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;4;;;;;
;30203;;;;>1894580838;>1760363254;>322;7;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>294;;;;;;;;;0;;;;;
;30207;;;;<3350443794;<3350443794;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>811008;>2379776;>17872;;;;;<11831;<708859;;
;30201;;;;>1455880300;>1590080012;>62;6;;15;12;3;15;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>267;;;;;;;;;1;;;;;
;30203;;;;>1894564022;>1760346438;>322;7;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;>8372224;>5592;0;0;;;;;;;;;0;;;;;
;30207;;;;<3350444322;<3350444322;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;0;0;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>12025856;>5869568;>2795816;;;;;>485468;>13519026;;
;30201;;;;>1456153068;>1587574836;>62;5;;15;12;3;15;0;0;0;0;0;1004;0;0;0;0;>791;4;;;1;0;128;0;0;5;;;>307200;>8414;;;;;;;;;>280;6;;;;
;30203;;;;>1895184430;>1760966846;>323;6;;;;;;;;;;;>81;;;;;>47;;;;;;>311;;;>283;;;>36864;>684;;;;;;;;;>168;4;;;;
;30207;;;;<3351324522;<3351324522;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<323584;<8386;;;;;;;;;23;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>929792;>2191360;>1040;;;;;<479893;<12815732;;
;30201;;;;>1456140972;>1590357516;>62;6;;15;12;3;15;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<476;;;;;;;;;2;1;;;;
;30203;;;;>1895183710;>1760966126;>323;7;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;;;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3351324682;<3351324682;75;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>311296;<4468736;>1608;;;;;<21968;<718192;;
;30201;;;;>1456141484;>1590357460;>62;6;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;4;;;;;
;30203;;;;>1895184294;>1760966710;>323;;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>233;;;;;;;;;0;;;;;
;30207;;;;<3351325778;<3351325778;75;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>184320;>3166208;<1568;;;;;>22772;>28243;;
;30201;;;;>1456142620;>1590361772;>62;7;;15;12;3;15;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;>8192;>468;>4096;>231;;;;;;;;;1;;;;;
;30203;;;;>1895182694;>1760965110;>323;;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;0;0;0;0;;;;;;;;;0;;;;;
;30207;;;;<3351327554;<3351327554;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>327680;<2555904;>17784;;;;;<18555;>669098;;
;30201;;;;>1456144348;>1590344148;>62;3;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;2;;;;;
;30203;;;;>1895201502;>1760983918;>323;6;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>250;;;;;;;;;0;;;;;
;30207;;;;<3351345850;<3351345850;75;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>11.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4943872;>4423680;>359592;;;;;>121656;>400512;;
;30201;;;;>1456501972;>1590356444;>62;5;;15;12;3;15;0;0;0;0;0;1007;0;0;0;0;>791;4;;;1;0;128;0;0;5;;;>307200;>7848;;;;;;;;;>267;6;;;;
;30203;;;;>1894845206;>1760631142;>324;7;;;;;;;;;;;0;;;;;0;0;;;2;;>311;;;>283;>24576;>619;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3351346538;<3351350058;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;0;0;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>15081472;>13099008;>710168;;;;;>422790;>12781002;;
;30201;;;;>1456731844;>1590242780;>62;6;;15;12;3;15;0;0;0;0;0;16;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>172;;;;;;;;;;;37;;;
;30203;;;;>1895082318;>1760864734;>323;7;;;;;;;;;;;>991;;;;;>793;4;;;;;>311;;;>283;;;>303104;>7261;;;;;;;;;>457;10;0;;;
;30207;;;;<3351802130;<3351802130;75;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<286720;<6633;;;;;;;;;14;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1314816;>3756032;<1860144;;;;;<536773;<13173395;;
;30201;;;;>1456704420;>1592782148;>62;6;;15;12;3;15;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<643;;;;;;;;;4;1;;;;
;30203;;;;>1893252958;>1759035374;>323;7;;;;;;;;;;;0;;;;;>3;2;2;;;;>311;;;>283;>692224;>3069;>4096;>252;>81920;>1352;;;;;;;;0;;;;
;30207;;;;<3349957378;<3349957378;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;0;;-1;-1;-1;-1;-1;-1;0;0;0;0;0;0;;;;;;;0;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>20480;<864256;>3048;;;;;<14577;<708248;;
;30201;;;;>1456704948;>1590919484;>62;6;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;2;;;;;
;30203;;;;>1893254438;>1759036854;>323;7;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>188;;;;;;;;;0;;;;;
;30207;;;;<3349958874;<3349958874;75;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>147456;>2617344;<768;;;;;>11357;<286;;
;30201;;;;>1456706772;>1590925124;>62;7;;15;12;3;15;0;0;0;0;0;5;0;0;0;0;;;;;1;0;128;0;0;5;>5246976;>3027;>12288;>476;;;;;;;;;1;;;;;
;30203;;;;>1893251590;>1759034006;>323;;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;0;0;0;0;;;;;;;;;0;;;;;
;30207;;;;<3349960954;<3349960954;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>495616;<2224128;>3176;;;;;>14212;>1306565;;
;30201;;;;>1456709492;>1590923900;>62;3;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;2;;;;;
;30203;;;;>1893254190;>1759036606;>323;7;;;;;;;;;;;5;;;;;;;;;;;>311;;;>283;;;>4096;>230;;;;;;;;;29;;;;;
;30207;;;;<3349963362;<3349963362;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;1;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>115175424;>108789760;>59394984;;;;;>451115;>1011077;;
;30201;;;;>1460190564;>1584676228;>62;6;;15;12;3;15;0;0;0;0;0;1741;0;0;0;0;>1298;13;;;1;0;128;0;0;5;>4096;>208;>610304;>16259;;;;;;;;;>420;20;;;;
;30203;;;;>1889774750;>1705894102;>323;7;;;;;;;;;;;0;;;;;0;0;;;;;>311;;;>283;>9990144;>3970;<602112;<15958;;;;;;;;;0;0;;;;
;30207;;;;<3349963106;<3349963106;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;<9445376;<3297;;<36;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>6823936;>10813440;<44585952;;;;;<62594;>10056128;;
;30201;;;;>1460188868;>1638992404;>62;7;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;0;0;0;0;;;;;;;;;2;;;;;
;30203;;;;>1891606742;>1757389158;>323;;;;;;;;;;;;>1007;;;;;>793;4;;;;;>311;;;>283;;;>315392;>8248;;;;;;;;;>405;5;;;;
;30207;;;;<3351748474;<3351748474;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<294912;<7493;;;;;;;;;23;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>17174528;>18747392;>1286400;;;;;>371062;<9563843;;
;30201;;;;>1460986828;>1593918012;>62;5;;15;12;3;15;0;0;0;0;0;3;0;0;0;0;>306;2;2;;1;0;128;0;0;5;>335872;>1738;<8192;<184;;;;;;;;;8;;;;;
;30203;;;;>1891195094;>1756977510;>323;6;;;;;;;;;;;>653;;;;;>462;11;;;;;>311;;;>283;;<297;>450560;>6677;;;;;;;;;>249;3;;;;
;30207;;;;<3352174066;<3352174066;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;0;;-1;-1;-1;-1;-1;-1;0;0;<450560;<6697;;;;;;;;;0;0;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>98304;<1859584;>40824;;;;;<776615;<2805011;;
;30201;;;;>1461003052;>1595179812;>62;6;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;0;0;;;;;;;;;2;;;;;
;30203;;;;>1891188590;>1756971006;>323;;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>274;;;;;;;;;0;;;;;
;30207;;;;<3352192474;<3352192474;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>118784;>442368;<2048;;;;;>5876;>9099;;
;30201;;;;>1461005020;>1595224652;>62;6;;15;12;3;15;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>207;;;;;;;;;2;;;;;
;30203;;;;>1891186670;>1756969086;>323;;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3352194090;<3352194090;75;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>94208;>10575872;>864;;;;;>40028;>696367;;
;30201;;;;>1461007420;>1595224140;>62;6;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1891188334;>1756970750;>323;;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>293;;;;;;;;;;;;;;
;30207;;;;<3352196554;<3352196554;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4648960;<6979584;>144736;;;;;>57288;>361448;;
;30201;;;;>1461144844;>1595217692;>62;5;;15;12;3;15;0;0;0;0;0;1007;0;0;0;0;>791;4;;;1;0;128;0;0;5;;;>311296;>8116;;;;;;-102188931;;-102188931;>278;3;;;;
;30203;;;;>1891052526;>1756834942;>323;6;;;;;;;;;;;0;;;;;0;0;;;;;>311;;;>283;;;0;0;;;;;;0;;0;0;0;;;;
;30207;;;;<3352196218;<3352196218;75;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>7884800;>8712192;>626736;;;;;>356301;>11890828;;
;30201;;;;>1461143692;>1594734540;>62;6;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;4;;;;;
;30203;;;;>1891652206;>1757434622;>323;7;;;;;;;;;;;>1085;;;;;>838;4;;;;;>311;;;>283;;;>344064;>8675;;;;;;-101288932;;-101288932;>494;5;;;;
;30207;;;;<3352768842;<3352768842;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<323584;<7842;;;;;;-101375750;;-101375750;13;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>372736;>4059136;>1984;;;;;<462843;<12701258;;
;30201;;;;>1461117788;>1595333388;>62;6;;15;12;3;15;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<572;;;;;;0;;0;2;;;;;
;30203;;;;>1891651374;>1757433790;>323;;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3352768650;<3352768650;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>36864;<2859008;>1520;;;;;>225;<271669;;
;30201;;;;>1461118236;>1595333340;>62;6;;15;12;3;15;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>235;;;;;;;;;3;;;;;
;30203;;;;>1891652446;>1757435822;>323;;;;;;;;;;;;;;;;;;;;;;;>311;;;>283;;;;>13;;;;;;;;;0;;;;;
;30207;;;;<3352771194;<3352771194;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>327680;>1757184;<1088;;;;;>1081;>11256;;
;30201;;;;>1461119404;>1595338076;>62;6;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1891651326;>1757433742;>323;;;;;;;;;;;;;;;;;;;;;;;>311;;;>283;;;;;;;;;;;;;;;;;;
;30207;;;;<3352772970;<3352772970;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>9.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>434176;<2199552;>2176;;;;;<9553;>705698;;
;30201;;;;>1461121772;>1595337052;>62;6;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;2;;;;;
;30203;;;;>1891653374;>1757435918;>323;;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>199;;;;;;;;;0;;;;;
;30207;;;;<3352775146;<3352775146;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2924544;>1961984;>1550560;;;;;>36781;<162358;;
;30201;;;;>1469883252;>1593789756;>62;6;;15;12;3;10;5;0;0;4;0;687;0;14;0;0;>597;;;;6;2;128;0;0;5;;;>151552;>4382;;;;;;;;;>219;6;;;;
;30203;;;;>1882892390;>1757435006;>323;7;;;;;15;0;;;0;;0;;0;;;0;;;;1;0;>311;;;>283;;;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3351226026;<3351226026;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>8347648;>97198080;>2823416;;;;;>586766;>17248310;;
;30201;;;;>1459994140;>1591389012;>62;7;;15;12;3;15;0;0;0;0;0;320;0;0;0;0;>194;4;;;1;0;128;0;0;5;;;>155648;>4010;;;;;;;;;68;2;;;;
;30203;;;;>1892005830;>1757787862;>323;;;;;;;;;;;;>687;;;;;>599;;;;;;>311;;;>283;;;>155648;>3910;;;;;;;;;>382;5;;;;
;30207;;;;<3351971026;<3351971026;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<290816;<7082;;;;;;;;;19;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>589824;<18575360;>672;;;;;<585856;<17695230;;
;30201;;;;>1459966204;>1594182988;>62;6;;15;12;3;15;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<557;;;;;;;;;3;;;;;
;30203;;;;>1892004998;>1757787542;>323;;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3351971202;<3351971202;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>98304;<1802240;>1456;;;;;<19559;<73396;;
;30201;;;;>1459966204;>1594182332;>62;6;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;3;;;;;
;30203;;;;>1892005814;>1757788230;>323;7;;;;;;;;;;;3;;;;;;;;;2;;>311;1;;>283;;;>4096;>276;;;;;;;;;0;;;;;
;30207;;;;<3351972018;<3351971506;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>94208;<3678208;<1040;;;;;>77461;>6741200;;
;30201;;;;>1459967820;>1594185804;>62;7;;15;12;3;15;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;>2449408;>2434;>4096;>253;;;;;;;;;;;;;;
;30203;;;;>1892004262;>1757786806;>323;6;;;;;;;;;;;0;;;;;;;;;;;>311;;;>283;0;0;0;0;;;;;;;;;;;;;;
;30207;;;;<3351974162;<3351974162;75;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>598016;<7049216;>2032;;;;;<83838;<5980918;;
;30201;;;;>1459970076;>1594185452;>62;;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;3;;;;;
;30203;;;;>1892005990;>1757788582;>323;6;;;;;;;;;;;3;;;;;;;;;;;>311;;;>283;;;>4096;>240;;;;;;;;;0;;;;;
;30207;;;;<3351976066;<3351976066;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2383872;<14053376;>1840;;;;;>21667;<419563;;
;30201;;;;>1460273020;>1594186780;>62;7;;15;12;3;15;0;0;0;0;0;1085;0;0;0;0;>836;4;;;1;0;128;0;0;5;;;>344064;>9194;;;;;;;;;>251;3;;;;
;30203;;;;>1891704390;>1757788150;>323;;;;;;;;;;;;0;;;;;0;0;;;;;>311;;;>283;>2461696;>2818;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3351970114;<3351976770;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;0;0;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3231744;<2957312;>2519168;;;;;>434079;>12705336;;
;30201;;;;>1460265724;>1591971436;>62;6;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;4;1;;;;
;30203;;;;>1892246470;>1758026326;>323;7;;;;;;;;;;;>1007;;;;;>793;4;;;;;>315;;;>283;;;>315392;>8104;;;;;;;;;>440;11;;;;
;30207;;;;<3352440946;<3352438386;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<294912;<7387;;;;;;;;;11;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>69632;>8990720;>1632;;;;;<457025;<12355009;;
;30201;;;;>1460195900;>1594411852;>62;5;;15;12;3;15;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<484;;;;;;;;;2;;;;;
;30203;;;;>1892245254;>1758025110;>323;6;;;;;;;;;;;0;;;;;;;;;;;>315;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3352441154;<3352438594;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>16384;<7606272;>1328;;;;;<3656;<716779;;
;30201;;;;>1460195900;>1594412156;>62;3;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;;;;;;
;30203;;;;>1892246070;>1758025926;>323;6;;;;;;;;;;;3;;;;;;;;;;;>315;;;>283;;;>4096;>244;;;;;;;;;;;;;;
;30207;;;;<3352441970;<3352438898;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>49152;>4091904;<352;;;;;>4563;>11530;;
;30201;;;;>1460196476;>1594413772;>62;6;;15;12;3;15;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;>12288;>448;>4096;>177;;;;;;;;;4;;;;;
;30203;;;;>1892247286;>1758027270;>323;7;;;;;;;;;;;0;;;;;;;;;;;>315;;;>283;0;0;0;0;;;;;;;;;0;;;;;
;30207;;;;<3352445842;<3352443282;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>16384;<4718592;>2400;;;;;>2359;>707817;;
;30201;;;;>1460199196;>1594414252;>62;3;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;3;1;;;;
;30203;;;;>1892248406;>1758028390;>323;8;;;;;;;;;;;3;;;;;;;;;;;>315;;;>283;;;>4096;>261;;;;;;;;;0;0;;;;
;30207;;;;<3352447602;<3352445042;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>9322496;>4337664;>1550512;;;;;>88434;>363969;;
;30201;;;;>1461981500;>1594416524;>62;6;;15;12;3;15;0;0;0;0;0;1007;0;0;0;0;>791;4;;;1;0;128;0;0;5;>4096;>186;>307200;>8258;;;;;;;;;>282;6;;;;
;30203;;;;>1890466870;>1756478134;>323;8;;;;;;;;;;;0;;;;;0;0;;;;;>315;;;>283;0;0;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3352447730;<3352445170;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>13312000;>12918784;>6039632;;;;;>327459;>11394225;;
;30201;;;;>1461980860;>1590159452;>62;5;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;4;;;;;
;30203;;;;>1894940718;>1760720574;>328;6;;;;;;;;;;;>1085;;;;;>838;4;;;;;>315;;;>283;;;>344064;>8925;;;;;;;;;>525;6;;;;
;30207;;;;<3355630114;<3355627554;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<323584;<8102;;;;;;;;;11;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>68440064;>65916928;>3004688;;;;;<316644;<11594266;;
;30201;;;;>1460893444;>1592106212;>62;7;;15;12;3;15;0;0;0;0;0;32;0;0;0;0;>328;;;;1;0;128;0;0;5;;;<8192;<84;;;;;;;;;8;;;;;
;30203;;;;>1894736766;>1760516750;>328;6;;;;;;;;;;;0;;;;;<25;;;;;;>315;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3355630210;<3355627650;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>262144;<1351680;>26528;;;;;<86620;<869947;;
;30201;;;;>1460894148;>1595085028;>62;5;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;2;;;;;
;30203;;;;>1894736830;>1760516862;>328;6;;;;;;;;;;;3;;;;;;;;;;;>315;;;>283;;;>4096;>180;;;;;;;;;0;;;;;
;30207;;;;<3355630978;<3355627906;75;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>61440;>2482176;>784;;;;;<15785;>7826;;
;30201;;;;>1460896020;>1595112180;>62;6;;15;12;3;15;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;>4734976;>2644;>8192;>346;;;;;;;;;1;;;;;
;30203;;;;>1894736574;>1760516558;>328;;;;;;;;;;;;0;;;;;;;;;;;>315;;;>283;0;0;0;0;;;;;;;;;0;;;;;
;30207;;;;<3355634834;<3355632274;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>32768;<4304896;>1984;;;;;>5314;>685430;;
;30201;;;;>1460898388;>1595113860;>62;6;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;2;;;;;
;30203;;;;>1894738302;>1760518286;>328;7;;;;;;;;;;;3;;;;;;;;;;;>315;;;>283;;;>4096;>264;;;;;;;;;0;;;;;
;30207;;;;<3355636690;<3355634130;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>21430272;>43094016;>120461696;;;;;>408303;>1396813;;
;30201;;;;>1564791756;>1588802244;>63;8;;15;12;3;13;2;0;0;2;0;1629;101;416;0;0;>1215;13;;;5;3;131;0;0;5;;;>569344;>14925;;;;;;;;;>400;21;;;;
;30203;;;;>1790881286;>1646403646;>327;7;;;;;15;1;;1;0;;29;0;0;;;25;0;;;1;0;>312;;;>283;>7528448;>4115;<557056;<14335;;;;;;;;;5;1;;;;
;30207;;;;<3355670834;<3355666338;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;<6979584;<3147;<8192;<447;;;;;;;;;0;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>139567104;>112730112;<105124368;;;;;>120856;>10586991;;
;30201;;;;>1464472308;>1703815220;>62;6;;15;12;3;15;0;0;0;0;0;34;0;0;0;0;40;;;;1;0;128;0;0;5;0;0;>4096;>466;;;;;;-84761627;;-84761627;;;;;;
;30203;;;;>1891882222;>1757662078;>328;7;;;;;;;;;;;>973;;;;;>753;4;;;;;>315;;;>283;;;>307200;>7282;>4096;>185;;;;0;;0;>430;4;;;;
;30207;;;;<3356340866;<3356338306;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<294912;<7076;0;0;;;;;;;24;0;;;;
;;>9.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>43077632;>47292416;>3249728;;;;;>244332;<9889521;;
;30201;;;;>1464459524;>1595427380;>62;5;;15;12;3;15;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<613;;;;;;;;;3;;;;;
;30203;;;;>1893549054;>1759328910;>328;6;;;;;;;;;;;>653;;;;;>464;9;;;;;>315;;;>283;;;>442368;>6089;;;;;;;;;>223;2;;;;
;30207;;;;<3358001330;<3357998770;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<434176;<5569;;;;;;;;;3;0;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>73728;<4689920;>4304;;;;;<781596;<2803491;;
;30201;;;;>1464454884;>1598668164;>62;3;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;0;0;;;;;;;;;4;;;;;
;30203;;;;>1893548142;>1759327998;>328;8;;;;;;;;;;;3;;;;;;;;;;;>315;;;>283;;;>4096;>184;;;;;;-82970700;;-82970700;0;;;;;
;30207;;;;<3358003026;<3358000466;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;-82612403;;-82612403;;;;;;
;;>11.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>155648;>7860224;<720;;;;;>15210;>15223;;
;30201;;;;>1464455972;>1598674276;>62;4;;15;12;3;15;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>211;;;;;;0;;0;2;;;;;
;30203;;;;>1893547646;>1759327502;>328;8;;;;;;;;;;;0;;;;;;;;;;;>315;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3358006018;<3358003458;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>118784;<1990656;>1568;;;;;>6699;>723283;;
;30201;;;;>1464458884;>1598674900;>62;6;;15;12;3;15;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;2;1;;;;
;30203;;;;>1893548990;>1759328846;>328;7;;;;;;;;;;;3;;;;;;;;;;;>315;;;>283;;;>4096;>185;;;;;;;;;1;0;;;;
;30207;;;;<3358008674;<3358006114;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;0;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1736704;<1486848;>247936;;;;;>76839;>335816;;
;30201;;;;>1464707492;>1598677140;>62;5;;15;12;3;15;0;0;0;0;0;1085;0;0;0;0;>836;4;;;1;0;128;0;0;5;;;>344064;>9026;;;;;;;;;>240;4;;;;
;30203;;;;>1893301950;>1759081166;>328;6;;;;;;;;;;;0;;;;;0;0;;;;;>315;;;>283;;;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3358008290;<3358006242;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3837952;>151552;>474032;;;;;>302416;>11283598;;
;30201;;;;>1464764476;>1598509180;>63;6;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>217;;;;;;;;;;;9;;;
;30203;;;;>1893585278;>1759365134;>329;;;15;;3;15;;;;;;>1004;;;;;>793;4;;;;;>315;;;>283;;;>299008;>7612;;;;;;;;;>423;3;0;;;
;30207;;;;<3358301706;<3358299146;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<282624;<7036;;;;;;;;;14;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>286720;>3612672;>9504;;;;;<396290;<11639066;;
;30201;;;;>1464717596;>1598925676;>63;5;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<617;;;;;;;;;1;;;;;
;30203;;;;>1893584862;>1759364718;>329;6;;15;;3;15;;;;;;0;;;;;;;;;;;>315;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3358294362;<3358292314;75;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>229376;<2285568;>1720;;;;;<2631;<717469;;
;30201;;;;>1464710524;>1598926900;>63;;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;4;1;;;;
;30203;;;;>1893584534;>1759364390;>329;6;;15;;3;15;;;;;;3;;;;;;;;;;;>315;;;>283;;;>4096;>302;;;;;;;;;0;0;;;;
;30207;;;;<3358295570;<3358293010;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>86016;<4272128;<1504;;;;;>3259;>5203;;
;30201;;;;>1464712124;>1598931212;>63;5;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>283;;;;;;;;;2;1;;;;
;30203;;;;>1893582934;>1759362790;>329;7;;15;;3;15;;;;;;0;;;;;;;;;;;>315;;;>283;;;0;0;;;;;;;;;0;0;;;;
;30207;;;;<3358297138;<3358294578;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>544768;>311296;>1272;;;;;>6386;>723296;;
;30201;;;;>1464714380;>1598930692;>63;7;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;2;;;;;
;30203;;;;>1893583854;>1759363710;>329;;;15;;3;15;;;;;;3;;;;;;;;;;;>315;;;>283;;;>4096;>241;;;;;;;;;0;;;;;
;30207;;;;<3358298234;<3358295674;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3801088;<1941504;>374736;;;;;>84231;>349765;;
;30201;;;;>1465072588;>1598915436;>63;6;;16;12;4;16;0;0;0;0;0;1007;0;0;0;0;>791;4;;;1;0;128;0;0;5;;;>311296;>8008;>4096;>164;;;;;;;>276;5;;;;
;30203;;;;>1893226414;>1759005630;>329;7;;15;;3;15;;;;;;0;;;;;0;0;;;;;>315;;;>283;;;0;0;0;0;;;;;;;0;0;;;;
;30207;;;;<3358297850;<3358295802;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>12587008;>13840384;>511776;;;;;>307093;>11384143;;
;30201;;;;>1465071948;>1598778908;>63;5;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;;;;;;;;;4;;;;;
;30203;;;;>1893699582;>1759479438;>329;7;;15;;3;15;;;;;;>1085;;;;;>838;4;;;;;>315;;;>283;;;>348160;>9472;;;;;;;;;>449;2;;;;
;30207;;;;<3358760330;<3358757770;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<327680;<8782;;;;;;;;;10;0;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>176128;>2129920;>1632;;;;;<399308;<11748341;;
;30201;;;;>1465061260;>1599277724;>63;4;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;<16384;<460;;;;;;;;;4;;;;;
;30203;;;;>1893699166;>1759478510;>329;7;;15;;3;15;;;;;;0;;;;;;;;;;;>315;;;>283;;;0;0;;;;;;;;;0;;;;;
;30207;;;;<3358760426;<3358757354;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<2411192320;<1914835936;<1386309736;;;;;>192733;<473944;;
;30201;;;;>1465404268;>2985930324;>64;5;;16;12;4;15;1;0;0;1;0;0;0;0;0;0;;;;;2;1;129;1;1;6;>32768;>1538;>32768;>1444;;;;;;;;;7;2;2;;;
;30203;;;;>1889873694;>1755719262;>283;7;;14;11;3;14;0;;;0;;1;1;;;;;;;;;;>145;0;0;>141;0;0;<28672;<1263;;;;;;;;;0;0;0;;;
;;>10.023;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<3629056;<438526944;<925354339;;;;;<236966;<263784;;
;30201;;;;<1889884550;<830355419;<285;6;;16;12;4;15;1;;;1;;3;0;;;;;;;;;;<145;1;1;6;>2703360;>2936;>8192;>354;;;;;;;;;2;;;;;
;30203;;;;>524826947;>393088731;<14;13;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;>3653632;>9739;>389120;>9065;;;;;;;;;24;4;;;;
;;>10.008;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<7797420032;<6671847424;<3791926847;;;<6503079936;;>193930;>960948;;
;30201;;;;<524265627;>3399379108;>5;6;>4096;16;12;4;15;1;0;0;1;0;1;3;0;0;0;;;;;2;0;128;1;0;5;<6311936;<11106;<360448;<7900;;;;;;;;;0;0;2;;;
;;>10.009;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>28065792;>6639616;>18627088;;;;;<134985;<809916;;
;30201;;;;<584848;;;;0;;;;;;;;;;>1006;78;>250;;;>841;4;;;;;>1;;;6;<40960;<1350;>270336;>7272;;;;;;;;;>199;5;0;;;
;;>10.006;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>12288;<19238912;<19276336;;;;;<68007;<150925;;
;30201;;;;<64400;;<6;4;;;;;;;;;;;0;;;;;0;0;;;;;;;;;0;0;0;0;;;;;;;;;2;0;;;;
;;>10.005;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<12189696;>2192;;;;;<187;>718894;;
;30201;;;;>2192;;<1;3;;;;;;;;;;;3;79;;;;>303;;;;;;;;;;;;>4096;>183;;;;;;;;;3;;;;;
;;>10.006;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>425984;<14778368;<93296;;;;;>6705;<707925;;
;30201;;;;<94016;;<1;;>4096;;;;16;;;;;;1;0;0;;;0;;;;1;;<1;0;;5;;;;>15;;;;;;;;;;;1;;;
;;>9.008;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>69632;<15888384;>560;;;;;<4487;<23800;;
;30201;;;;>560;;;6;0;;;;;;;;;;3;;;;;;;;;;;;;;;;;;<55;;;;;;;;;0;;0;;;
;;>10.010;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1622016;<4755456;>64560;;;;;<9832;>699363;;
;30201;;;;>64560;;;;;;;;;;;;;;0;;;;;;;;;;;;;;;>4096;>250;;>146;;;;;;;;;3;;;;;
;;>10.007;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>110592;<9003008;>1466608;;;;;<13416;<704694;;
;30201;;;;<58560;<1525168;<5;4;;;;;;;;;;;3;;;;;;;;;;;;;;;0;0;;<86;;;;;;;;;1;;;;;
;;>10.008;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2813952;<14479360;>282032;;;;;>79206;>95137;;
;30201;;;;>232640;<49392;;5;;;;;;;;;;;>1079;;;;;>836;4;;;;;;;;;;;>339968;>8548;;;;;;;;;>199;4;;;;
;;>10.008;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>16384;<5783552;>1088;;;;;<70474;>614335;;
;30201;;;;>1088;;;;;;;;;;;;;;3;;;;;<533;0;;;;;;;;;;;<339968;<8488;;;;;;;;;2;0;;;;
;;>10.008;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>16384;<7151616;>4848;;;;;<2133;<710806;;
;30201;;;;>176;;;;;;;;;;;;;;0;;;;;0;;;;;;;;;;;;0;0;;;;;;-70023852;;-70023852;0;;;;;
;;>10.008;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>577536;<2015232;<2160;;;;;>2047;>13266;;
;30201;;;;>2512;;;;;;;;;;;;;;5;;;;;;;;;;;;;;;>5492736;>2898;>8192;>371;;;;;;0;;0;2;;;;;
;;>10.009;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>18112512;>10059776;>59560;;;;;>4710;>704965;;
;30201;;;;>59048;;;;;;;;;;;;;;0;;;;;7;;;;;;;;;;<5488640;<2730;<4096;<213;>79233024;>41220;;;;;;;0;;;;;
;;>10.008;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>14848000;>4890624;>1123576;;;;;>88673;<565052;;
;30201;;;;<424424;<1549296;;6;;;;;15;;;;;;>473;37;98;;;>359;2;;;2;;>1;1;;6;>4096;>134;>151552;>4501;0;0;;;;;;;91;;4;;;
;;>10.009;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>7942144;>23023616;>6603400;;;;;>614317;>965148;;
;30201;;;;>1857816;<4745584;;5;>8192;;;;;;;;;;>1187;>128;>574;;;>894;12;;;;1;;;1;;;<17;>438272;>10723;>4096;>152;;;;;;;>167;15;0;;;
;;>10.043;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3107663872;>2463039488;>2210623121;;;>2216562688;;<385696;<81993;;
;30201;;;;<4672712;<2215295833;>4;7;0;;;;;;;;;;3;>9;;;;<948;6;6;;;;;;;;>1392640;>11252;<544768;<13236;>126976;>2578;;;;;;;19;0;;;;
;30240;;;-1;<853967835;<986961483;41;15;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;0;;-1;-1;-1;-1;-1;-1;>66265087;>175494;>2152431615;>2089337;-1;>7396524147803757;-1;>7396524147806487;;>7396524147806487;;>7396524147806487;20;;;;;
;;>11.007;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>94892032;>60563456;>43032464;;;;;<305360;<1030877;;
;30201;;;0;>881992555;>971953739;>79;6;;16;12;4;15;1;0;0;1;0;0;174;672;0;0;;;;;2;1;129;1;1;6;0;0;0;0;0;0;0;0;;0;;0;3;;;;;
;30240;;;;<864236387;<999978459;41;9;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;>5148672;>4130;-1;-77185603;-1;-77185603;;-77185603;;-77185603;0;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>789491712;>977277920;>612942069;;;>127590400;;<8127;>11218;;
;30201;;;;>864245395;>387045398;>79;6;;16;12;4;15;1;0;0;1;0;3;175;672;0;0;;;;;2;1;129;1;1;6;;;<5144576;<3890;0;0;0;0;;0;;0;;;;;;
;30240;;;;>66033762;<158422886;43;16;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;4;5;;;-1;-1;-1;-1;-1;-1;>133873664;>199908;>13623296;>115796;>8191;-7396524070620565;-1;;;;;;>436;1;;;;
;;>10.026;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>365715456;>300244992;>125113732;;;>80576512;;>28297;>747702;;
;30201;;;;<66025026;>33317890;>77;6;;16;12;4;15;1;0;0;1;0;0;175;672;0;0;0;0;;;2;1;129;1;1;6;0;0;0;0;0;0;0;;;;;;3;;;;;
;30240;;;;>135879607;<29242914;43;17;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;85;54;3;;-1;-1;-1;-1;-1;-1;>82255872;>130496;>10928128;>138508;;;-1;>35649372;;>35649372;;>35649372;>278;43;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>138231808;>130920448;>105223661;;;;;>45741;<660290;;
;30201;;;;<135490191;<54219891;>77;7;;16;12;4;15;1;0;0;1;0;1007;250;922;0;0;>756;4;0;;2;1;129;1;1;6;0;0;<10620928;<130284;>4096;>224;0;0;;0;;0;<89;8;;;;
;30240;;;;>190225050;>30885147;44;5;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;>3260416;>73466;0;0;-1;;;;;;0;0;;;;
;;>10.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>70131712;>73388032;>98284502;;;;;<76605;<93514;;
;30201;;;;<190217034;<150533073;>76;;;16;12;4;15;1;0;0;1;0;0;250;922;0;0;;;;;2;1;129;1;1;6;;;0;0;;;0;;;;;;1;1;;;;
;30240;;;;>308146161;>171896497;44;14;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;>7262208;>76519;;;-1;;;;;;0;0;;;;
;;>10.012;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>71651328;>72241152;>45158378;;;;;>8624;>688099;;
;30201;;;;<309752017;<218648667;>75;5;;16;12;4;15;1;0;0;1;0;3;252;922;0;0;>306;2;2;;2;1;129;1;1;6;>421888;>2553;<7249920;<75962;;;0;;;;;;1;;;;;
;30240;;;;>367669446;>220242459;44;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;0;;-1;-1;-1;-1;-1;-1;0;0;>1232896;>25922;;;-1;-16867182;;-16867182;;-16867182;0;;;;;
;;>10.010;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>60502016;>56102912;>50150562;;;;;<8593;<186722;;
;30201;;;;<367685174;<270421709;>73;5;;16;12;4;15;1;0;0;1;0;0;252;922;0;0;;;;;2;1;129;1;1;6;;;0;0;;;0;0;;0;;0;1;;;;;
;30240;;;;>423670140;>270450397;44;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;>671744;>17202;;;-1;;;;;;0;;;;;
;;>9.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>52707328;>53252096;>46483986;;;;;<13823;<516708;;
;30201;;;;<423662092;<316925439;>73;6;;16;12;4;15;1;0;0;1;0;3;253;922;0;0;;;;;2;1;129;1;1;6;;;<667648;<16938;;;0;;;;;;2;1;;;;
;30240;;;;>464175238;>316916495;44;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;>598016;>15481;;;-1;;;;;;0;0;;;;
;;>10.027;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>593289216;>559575040;>520434152;;;>4096;;>287030;>1075097;;
;30201;;;;<464284214;<837455895;>77;6;;16;12;4;16;0;0;0;0;0;1;0;0;0;0;;;;;1;0;128;0;0;5;>8192;>394;<589824;<15164;;;0;;;;;;25;1;;;;
;30240;;;;>1037118999;>835913703;>235;18;;4;4;0;3;1;;;1;;>4131;;14;;;>116;2;;;3;2;>267;;;>283;;>22;>4296704;>62566;>16384;>371;-1;;;;;;10;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>115638272;>111452160;>113926456;;;;;<92085;<255992;;
;30201;;;;<1021818095;<949838975;<234;7;;16;12;4;11;5;;;5;;85;;4;;;49;0;;;9;4;<261;;;5;0;0;<4292608;<62681;0;0;0;;;;;;80;7;;;;
;30240;;;;>1072804887;>949837599;>234;8;;4;4;0;3;1;;;1;;>1265;;2;;;0;2;;;4;2;>262;;;>283;;;>6635520;>98150;;;-1;;;;;;50;1;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>47165440;>38793216;>86671608;;;;;<110643;<715861;;
;30201;;;;<1086661895;<1035069439;<235;6;;16;12;4;16;0;;;0;;<350;;0;;;>831;4;;;1;0;<268;;;5;;;<6324224;<89284;;;0;;;;;;>105;2;;;;
;30240;;;;>1174243351;>1033598935;>235;8;;4;4;0;3;1;;;1;;>288;;72;;;0;0;;;4;2;>268;;;>283;;;>6901760;>95192;;;-1;;;;;;0;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>105037824;>101527552;>89206672;;;;;<68238;>631517;;
;30201;;;;<1175617975;<1124180231;<235;6;;16;12;4;16;0;;;0;;3;;0;;;>306;2;2;;1;0;<268;;;5;>417792;>2891;<7217152;<104065;;;0;;;;;;3;;;;;
;30240;;;;>1271610071;>1125554727;>235;8;;4;4;0;3;1;;;1;;>1068;;2;;;40;49;5;;4;2;>268;;;>283;0;0;>6168576;>87621;;;-1;-8142713;;-8142713;;-8142713;27;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>109424640;>100749312;>80319344;;;;;>55603;>427843;;
;30201;;;;<1271608839;<1205872839;<235;6;;16;12;4;16;0;;;0;;0;;0;;;0;0;0;;1;0;<268;;;5;;;0;0;;;0;0;;0;;0;3;1;;;;
;30240;;;;>1340868695;>1205871607;>235;8;;4;4;0;3;1;;;1;;>1030;;28;;;1;;;;4;2;>268;;;>283;;;>6291456;>90986;;;-1;;;;;;0;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>43692032;>45133824;>92235040;;;;;<60791;<1152982;;
;30201;;;;<1340867639;<1298105591;<235;7;;16;12;4;16;0;;;0;;3;;0;;;0;;;;1;0;<268;;;5;>2166784;>2011;<6287360;<90750;;;0;;;;;;1;1;;;;
;30240;;;;>1434036359;>1298104535;>235;8;;4;4;0;3;1;;;1;;>965;;;;;;;;;4;2;>268;;;>283;0;0;>5820416;>80340;;;-1;;;;;;0;0;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>237350912;>228372480;>169030120;;;;;>995;>707074;;
;30201;;;;<1434036359;<1467134655;<235;5;;16;12;4;16;0;;;0;;0;;;;;;;;;1;0;<268;;;5;;;0;0;;;0;;;;;;2;1;;;;
;30240;;;;>1610343007;>1467134655;>235;9;;4;4;0;3;1;;;;;>2505;;;;;;;;;5;2;>268;;;>283;>262144;>542;>13950976;>158248;;;-1;;;;;;;0;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>686346240;>679395328;>415301568;;;;;>52837;>425167;;
;30201;;;;<1603082487;<1882470223;<238;8;;16;12;4;11;5;;;5;;<1834;2;17;;;>592;;;;13;5;<262;;;5;0;0;<13787136;<153750;;;0;;;;;;>185;7;;;;
;30240;;;;>2180522988;>1882485215;>226;7;;11;11;0;6;6;;;6;;<88;4;4;;;6;;;;7;0;>266;;;>283;;;>4050944;>36516;;;-1;;;;;;>267;1;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1;>2210717696;>2187313152;>1046690538;;;>106496;;>555714;<200867;;
;30201;;;;<2184928276;<2926286697;<224;6;;16;12;4;16;0;;;0;;<247;0;0;;;>194;4;;;1;;<272;;;5;;;<4067328;<37160;;;0;;;;;;41;0;;;;
;30240;;1;;>3041869881;>2907653145;>258;8;;13;13;0;13;2;;;2;;>10469;;;;;>12865;63;;;2;;>272;;;>283;>192512;>821;>3280896;>67764;>12288;>503;-1;;;;;;>1518;32;;;;
;;>11.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;0;>507944960;>486150144;>251971494;;;>2019328;;<611404;<233688;;
;30201;;0;;<3041869321;<3159623903;<258;6;;16;12;4;16;0;;;0;;3;;;;;<12762;0;;;1;;<272;;;5;0;0;<3424256;<71438;0;0;0;;;;;;1;0;;;;
;30240;;;;>3266975002;>3159598575;>258;11;;13;13;0;13;2;;;2;;>16706;;;;;>3191;>26198;;;2;;>272;;;>283;>2519040;>10740;>106278912;>68680;>53248;>1104;-1;;;;;;98;;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2072371200;>2070835200;>998252;;;>4952064;;>353;<716374;;
;30201;;;;<3266972762;<3160596827;<258;6;;16;12;4;16;0;;;0;;3;;;;;0;0;;;1;;<272;;;5;0;0;<106278912;<68688;0;0;0;;;;;;2;;;;;
;30240;;;;>3451963911;>3160596827;>258;9;;14;14;0;13;2;;;2;;>563;;;;;>2933;>47010;;;2;;>272;;;>283;>6463488;>13935;>717172736;>450361;>249856;>1765;-1;;;;;;96;;;;;
;;>10.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1093705728;>1099669504;>1048985636;;;>10436608;;>410169;>1670448;;
;30201;;;;<3451963687;<4209579999;<258;7;;16;12;4;16;0;;;0;;0;;;;;0;0;;;1;;<272;;;5;<6430720;<13517;0;0;0;0;0;;;;;;51;1;;;;
;30240;;;;>4328559981;>4190728431;>284;11;;14;14;0;13;2;;;2;;>719;;;;;>820;>450;;;2;;>272;;;>283;>10424320;>14536;>699920384;>442748;;;-1;;;;;;>6979;0;;;;
;;>10.027;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>73027584;>58716160;>95243584;;;>45056;;<338155;<915664;;
;30201;;;;<4328558845;<4285971839;<284;7;;16;12;4;16;0;;;0;;3;;;;;0;0;;;1;;<272;;;5;0;0;<699916288;<442515;;;0;;;-61627528;;-61627528;43;1;;;;
;30240;;;;>4420985311;>4271207887;>294;18;;14;14;0;13;2;;;2;;>4277;;>9530;;;>1623;>1813;1;;2;;>272;;;>283;>65536;>2779;>23388160;>79787;;;-1;;;0;;0;>82;0;;;;
;;>9.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>91942912;>74219520;>39583885;;;>4096;;>6532;<585087;;
;30201;;;;<4420417071;<4310741740;<293;7;;16;12;4;16;0;;;0;;<3276;;0;;;<832;4;0;;1;;<272;;;5;0;0;<23089152;<71939;;;0;;;;;;>129;5;;;;
;30240;;;;>4429044332;>4301469020;>298;9;;14;14;0;13;2;;;2;;>2101;;>340;;;>1124;>526;;;2;;>272;;;>283;>4096;>331;>4620288;>61561;;;-1;;;;;;>183;9;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>26095616;>24313856;<9599680;;;;;<7589;<98532;;
;30201;;;;<4429044204;<4291350172;<298;6;;16;12;4;16;0;;;0;;0;;0;;;0;0;;;1;;<272;;;5;0;0;0;0;;;0;;;;;;10;0;;;;
;30240;;;;>4428764772;>4290834140;>300;5;;14;14;0;13;2;;;2;;>840;;>1312;;;>1103;70;;;2;;>272;;;>283;;;>1650688;>42927;;;-1;;;;;;30;;;;;
;;>10.024;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;9;>9155256320;>9314570240;>4116689262;;;>1310720;;>295558625;>409515029;;
;30201;;;;<4428252004;<8407035274;<300;7;;16;12;4;16;0;;;0;;32;;0;;;<772;2;2;;1;;<272;;;5;>385024;>2305;<1630208;<41649;;;0;;;;;;26;;;;;
;30240;;2;;>5960260779;>5805097053;>1403;12;;10;10;0;10;1;;;1;;7;2;;;;>59633;>2178;0;;3;1;>332;;;>283;>925696;>685;>32739328;>240313;;;-1;;;;;;>55757;>12669;;;;
;;>10.024;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1;>2809683968;>2825555968;<49592879;;;>262144;;<229093488;<401200537;;
;30201;;0;;<5960260779;<5755479406;<1403;6;;16;12;4;16;0;;;0;;0;0;;;;0;0;;;1;0;<332;;;5;0;0;0;0;;;0;;;;;;11;0;;;;
;30240;;;;>6935514213;>6753545428;>1403;10;;10;10;0;10;1;;;1;;;;;;;>115;2;;;3;1;>278;;;>283;>262144;>839;>175378432;>58924;;;-1;-23243673;;-23243673;;-23243673;>134;15;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2492383232;>2491928576;>936782183;;;>1074008064;;<28836458;>1157256;;
;30201;;;;<6933938453;<7688751979;<1403;7;;16;12;4;16;0;;;0;;3;;;;;0;0;;;1;0;<278;;;5;>5107712;>2201;<175366144;<58435;;;0;0;;0;;0;30;0;;;;
;30240;;;;>7294108568;>7159890632;>1403;11;;9;9;0;9;;;;;;;;;;;>341;22;;;;;>274;;;>283;<5107712;<2338;>1378017280;>1129792;;;-1;;;;;;>370;24;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;0;>60936192;>62193664;<1390785384;;;>450560;;<37151644;<8278881;;
;30201;;;;<7294108392;<5769105120;<1403;7;;16;12;4;16;;;;;;0;;;;;0;0;;;;;<274;;;5;0;0;0;0;;;0;;;;;;10;0;;;;
;30240;;;;>7173090362;>7038872474;>1403;10;;9;9;0;9;;;;;;;;;;;>130;4;;;;;>272;;;>283;>450560;>2611;>6520832;>4543;;;-1;;;;;;>132;48;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>22429696;>13586432;<360894981;;;;;>5535123;<959745;;
;30201;;;;<7140301330;<6677964149;<1402;7;;16;12;4;11;5;;;5;;>1378;64;>190;;;>1006;3;;;10;4;<266;;;5;0;0;<6144000;>6044;;;0;;;;;;>118;10;;;;
;30240;;;;>6774864165;>6673420589;>1405;10;;9;9;0;9;1;;1;0;;<371;0;0;;;<347;5;;;1;0;>265;;;>283;;;>5738496;<35;;;-1;;;;;;>68;8;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>67977216;>69402624;>5886232;;;;;<5702658;>323283;;
;30201;;;;<6801670573;<6673338021;<1405;7;;16;12;4;16;0;;0;;;<644;;;;;<621;10;;;;;<271;;;5;;;<5877760;<4765;;;0;;;;;;59;1;;;;
;30240;;;;>6801677613;>6667460205;>1405;10;;9;9;0;9;;;;;;0;;;;;0;0;;;;;>271;;;>283;;;0;0;;;-1;;;;;;0;0;;;;
;;>10.023;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2699264;>6746112;>3092992;;;;;<382287;>80952;;
;30201;;;;<6801676461;<6670551389;<1405;6;;16;12;4;16;;;;;;3;;;;;>303;;;;;;<271;;;5;;;>4096;>248;;;0;;;;;;1;1;;;;
;30240;;;;>6801643981;>6667426397;>1405;10;;9;9;0;9;;;;;;;;;;;0;;;;;;>271;;;>283;;;;>3;;;-1;;;;;;0;0;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<10293248;<7733248;<1795920;;;;;>13294;<673262;;
;30201;;;;<6801643981;<6665630477;<1405;6;;16;12;4;16;;;;;;0;;;;;;;;;;;<271;;;5;;;0;0;;;0;;;;;;4;;;;;
;30240;;;;>6798297629;>6664080045;>1160;9;;9;9;0;9;;;;;;;;;;;;;;;;;>271;;;>283;;;;;;;-1;;;;;;0;;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<288399360;<202551296;<12133016;;;;;>1877;<9634;;
;30201;;;;<6798296669;<6651946069;<1160;6;;16;12;4;16;;;;;;3;;;;;;;;;;;<271;;;5;;;>4096;>251;;;0;;;;;;2;;;;;
;30240;;;;>6790304757;>6656121013;>1159;10;;9;9;0;9;;;;;;;;;;;;;;;;;>271;;;>283;;;;<6;;;-1;;;;;;4;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<259776512;<274149376;<23440888;;;>2198007808;;>49252;>748796;;
;30201;;;;<6790304757;<6632680125;<1159;6;;16;12;4;16;;;;;;0;;;;;;;;;;;<271;;;5;;;0;0;;;0;;;;;;2;;;;;
;30240;;;;>6773016381;>6638832637;>309;8;;9;9;0;9;;;;;;2;;;;;1;;;;;;>271;;;>283;>2199494656;>6781493;>16384;>648;;;-1;;;;;;17;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<14254080;<32735232;>827568;;;;;>41891;<581529;;
;30201;;;;<6772523701;<6639659245;<309;6;;16;12;4;16;;;;;;>1005;;;;;>790;4;;;;;<271;;;5;0;0;>294912;>7259;;;0;;;;;;>203;3;;;;
;30240;;;;>6773147845;>6639692061;>280;7;;9;9;0;9;;;;;;>78;;;;;>43;5;;;;;>271;;;>283;;;>28672;>875;;;-1;;;;;;>68;4;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<659456;<27877376;<287160;;;;;<109980;<185681;;
;30201;;;;<6773147669;<6638913181;<280;6;;16;12;4;16;;;;;;0;;;;;0;0;;;;;<271;;;5;;;0;0;;;0;;;;;;4;0;;;;
;30240;;;;>6773113957;>6638930389;>280;8;;9;9;0;9;;;;;;;;;;;;;;;;;>271;;;>283;;;;;;;-1;;;;;;0;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>28672;<8044544;<31936;;;;;>3197;>714514;;
;30201;;;;<6773113109;<6638897429;<280;4;;16;12;4;16;;;;;;3;;;;;>303;;;;;;<271;;;5;;;>4096;>262;;;0;;;;;;1;;;;;
;30240;;;;>6773113989;>6638896405;>280;7;;9;9;0;9;;;;;;;;;;;0;;;;;;>271;;;>283;;;;<65;;;-1;;;;;;0;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>53248;<13979648;;;;;;<1731;<707474;;
;30201;;;;<6773113989;<6638896405;<280;6;;16;12;4;16;;;;;;0;;;;;;;;;;;<271;;;5;;;0;0;;;0;;;;;;4;;;;;
;30240;;;;>6773113989;>6638896405;>280;7;;9;9;0;9;;;;;;;;;;;;;;;;;>271;;;>283;;;;;;;-1;;;;;;0;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>20480;<7102464;>2704;;;;;>413;<8578;;
;30201;;;;<6773113029;<6638898149;<280;5;;16;12;4;16;;;;;;3;;;;;;;;;;;<271;;;5;;;>4096;>274;;;0;;;;;;;;;;;
;30240;;;;>6773114773;>6638897189;>280;7;;9;9;0;9;;;;;;;;;;;;;;;;;>271;;;>283;;;;<20;;;-1;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1626112;<7413760;>9296;;;;;>5925;>698034;;
;30201;;;;<6773114773;<6638897189;<280;6;;16;12;4;16;;;;;;0;;;;;;;;;;;<271;;;5;;;0;0;;;0;;;;;;3;;;;;
;30240;;;;>6773114773;>6638897189;>280;7;;9;9;0;9;;;;;;;;;;;;;;;;;>271;;;>283;;;;;;;-1;;;;;;0;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>6799360;<4419584;>4027616;;;;;>102410;<510899;;
;30201;;;;<6772870909;<6642690237;<279;5;;16;12;4;16;;;;;;>1007;;;;;>791;4;;;;;<271;;;5;;;>315392;>7935;;;0;;;;;;>222;9;;;;
;30240;;;;>6773505957;>6639274005;>281;7;;9;9;0;9;;;;;;;;;;;<2;;;;;;>271;;;>283;;;<12288;>171;;;-1;;;;;;>92;1;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>32768;<3563520;>34928;;;;;<110273;<182987;;
;30201;;;;<6773505445;<6639308421;<281;5;;16;12;4;16;;;;;;0;;;;;0;0;;;;;<271;;;5;;;0;0;;;0;;;;;;4;0;;;;
;30240;;;;>6773500901;>6639283317;>280;7;;9;9;0;9;;;;;;;;;;;;;;;;;>271;;;>283;;;;;;;-1;;;;;;0;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>204800;<2600960;>1760;;;;;>2546;>689334;;
;30201;;;;<6773500021;<6639284197;<280;5;;16;12;4;16;;;;;;3;;;;;>303;;;;;;<271;;;5;;;>4096;>201;;;0;;;;;;4;;;;;
;30240;;;;>6773500901;>6639283317;>280;7;;9;9;0;9;;;;;;;;;;;0;;;;;;>271;;;>283;;;;>5;;;-1;;;;;;0;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>512000;>1409024;>992;;;;;>65453;<683007;;
;30201;;;;<6773500901;<6639283317;<280;6;;16;12;4;16;;;;;;0;;;;;;;;;;;<271;;;5;;;0;0;;;0;;;;;;;;;;;
;30240;;;;>6773500901;>6639283317;>280;7;;9;9;0;9;;;;;;;;;;;;;;;;;>271;;;>283;;;;;;;-1;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>225280;<528384;<224;;;;;<64727;<2023;;
;30201;;;;<6773500453;<6639283637;<280;;;16;12;4;16;;;;;;3;;;;;;;;;;;<271;;;5;>2781184;>2301;>4096;>145;;;0;;;;;;4;1;;;;
;30240;;;;>6773500773;>6639283189;>280;8;;9;9;0;9;;;;;;;;;;;;;;;;;>271;;;>283;0;0;;>114;;;-1;;;;;;0;0;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1716224;<3268608;>176;;;;;>19511;>704687;;
;30201;;;;<6773500597;<6639283189;<280;4;;16;12;4;16;;;;;;0;;;;;;;;;;;<271;;;5;;;0;0;;;0;;;;;;4;;;;;
;30240;;;;>6773500597;>6639283013;>280;8;;9;9;0;9;;;;;;;;;;;;;;;;;>271;;;>283;;;;;;;-1;;;;;;0;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>122408960;>112492544;>3623528;;;;;>284313;<218781;;
;30201;;;;<6773094717;<6642500661;<280;5;;16;12;4;16;;;;;;>1085;;;;;>836;4;;;;;<271;;;5;;;>344064;>8394;;;0;;;-52922876;;-52922876;>288;6;;;;
;30240;;;;>6774738477;>6640520893;>280;7;;9;9;0;9;;;;;;>578;;;;;>421;12;;;;;>271;;;>283;;;>237568;>6754;;;-1;;;0;;0;>115;7;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>286720;<5455872;>256;;;;;<307817;<496752;;
;30201;;;;<6774738349;<6640521021;<280;6;;16;12;4;16;;;;;;0;;;;;0;0;;;;;<271;;;5;;;0;0;;;0;;;;;;4;1;;;;
;30240;;;;>6774738477;>6640520893;>280;7;;9;9;0;9;;;;;;;;;;;;;;;;;>271;;;>283;;;;;;;-1;;;;;;0;0;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>36864;<479232;>1792;;;;;>10779;>722809;;
;30201;;;;<6774737565;<6640521773;<280;6;;16;12;4;16;;;;;;3;;;;;>303;;;;;;<271;;;5;;;>4096;>161;;;0;;;;;;;;;;;
;30240;;;;>6774738445;>6640520861;>280;7;;9;9;0;9;;;;;;;;;;;0;;;;;;>271;;;>283;;;;>21;;;-1;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>102400;<4632576;>1024;;;;;<9253;<732417;;
;30201;;;;<6774737421;<6640520861;<280;4;;16;12;4;16;;;;;;0;;;;;;;;;;;<271;;;5;;;0;0;;;0;;;;;;3;;;;;
;30240;;;;>6774737421;>6640519837;>280;7;;9;9;0;9;;;;;;;;;;;;;;;;;>271;;;>283;;;;;;;-1;;;;;;0;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>118784;>1605632;>1280;;;;;>4265;>14314;;
;30201;;;;<6774736461;<6640520157;<280;;;16;12;4;16;;;;;;3;;;;;;;;;;;<271;;;5;;;>4096;>218;;;0;;;;;;4;;;;;
;30240;;;;>6774736781;>6640519197;>280;;;9;9;0;9;;;;;;;;;;;;;;;;;>271;;;>283;;;;<54;;;-1;;;;;;0;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>188416;<36864;;;;;;>20384;>738753;;
;30201;;;;<6774736781;<6640519197;<280;4;;16;12;4;16;;;;;;0;;;;;;;;;;;<271;;;5;;;0;0;;;0;;;;;;2;;;;;
;30240;;;;>6774736781;>6640519197;>280;7;;9;9;0;9;;;;;;;;;;;;;;;;;>271;;;>283;>303104;>919;;;;;-1;-63841373;;-63841373;;-63841373;0;;;;;
;;>9.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4624384;<3170304;>698240;;;;;>750;<663077;;
;30201;;;;<6774736845;<6641212829;<280;5;;16;12;4;16;;;;;;3;;;;;;;;;;;<271;;;5;0;0;>4096;>178;;;0;0;;0;;0;;;;;;
;30240;;;;>6775430477;>6641208221;>281;6;;9;9;0;9;;;;;;>1082;;;;;>834;4;;;;;>271;;;>283;;;>335872;>9251;;;-1;;;;;;>232;5;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1675264;<6275072;>1812424;;;;;>53397;>12123;;
;30201;;;;<6775188421;<6642783261;<281;;;16;12;4;16;;;;;;<81;;;;;<43;;;;;;<271;;;5;;;<40960;<1807;;;0;;;;;;>7;9;;;;
;30240;;;;>6775189573;>6640971989;>281;7;;9;9;0;9;;;;;;0;;;;;0;0;;;;;>271;;;>283;;;0;0;;;-1;;;;;;1;0;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<12288;>1728;;;;;<76147;>629067;;
;30201;;;;<6775188725;<6640972869;<281;5;;16;12;4;16;;;;;;3;;;;;>303;;;;;;<271;;;5;;;>4096;>243;;;0;;;;;;2;;;;;
;30240;;;;>6775189605;>6640972021;>281;7;;9;9;0;9;;;;;;;;;;;0;;;;;;>271;;;>283;;;;<42;;;-1;;;;;;0;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>102400;<3194880;<336;;;;;<989;<723402;;
;30201;;;;<6775189429;<6640971509;<281;5;;16;12;4;16;;;;;;0;;;;;;;;;;;<271;;;5;;;0;0;;;0;;;;;;2;;;;;
;30240;;;;>6775188917;>6640971333;>281;6;;9;9;0;9;;;;;;;;;;;;;;;;;>271;;;>283;;;;;;;-1;;;;;;0;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>405504;>7573504;>2432;;;;;>7873;>17383;;
;30201;;;;<6775186917;<6640971765;<281;7;;16;12;4;16;;;;;;5;;;;;;;;;;;<271;;;5;>4751360;>2680;>8192;>400;;;0;;;;;;4;;;;;
;30240;;;;>6775187349;>6640969765;>281;;;9;9;0;9;;;;;;3;;;;;;;;;;;>271;;;>283;0;0;<4096;<66;;;-1;;;;;;0;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>8192;>45056;>528;;;;;>12627;>719447;;
;30201;;;;<6775187349;<6640970293;<281;5;;16;12;4;16;;;;;;0;;;;;;;;;;;<271;;;5;;;0;0;;;0;;;;;;;;;;;
;30240;;;;>6775187877;>6640970293;>281;7;;9;9;0;9;;;;;;;;;;;;;;;;;>271;;;>283;>4096;>366;;;;;-1;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2703360;<3534848;>718208;;;;;>4814;<659386;;
;30201;;;;<6775186917;<6641687541;<281;6;;16;12;4;16;;;;;;3;;;;;;;;;;;<271;;;5;0;0;>4096;>268;;;0;;;;;;4;;;;;
;30240;;;;>6775904165;>6641686581;>281;;;9;9;0;9;;;;;;>1004;;;;;>789;4;;;;;>271;;;>283;;;>303104;>8327;;;-1;;;;;;>262;4;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>84520960;>78585856;>2578216;;;;;>437640;>743567;;
;30201;;;;<6773326909;<6641687541;<281;;;16;12;4;16;;;;;;>653;;;;;>464;12;;;;;<271;;;5;;;>266240;>6858;;;0;;;;;;>88;16;;;;
;30240;;;;>6773327869;>6639110285;>281;7;;9;9;0;9;;;;;;0;;;;;0;0;;;;;>271;;;>283;;;0;0;;;-1;;;;;;0;0;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2314240;>864256;>1330000;;;;;<462291;<100053;;
;30201;;;;<6773326813;<6640439229;<281;5;;16;12;4;16;;;;;;3;;;;;>303;;;;;;<271;;;5;;;>4096;>203;;;0;;;;;;4;;;;;
;30240;;;;>6774655757;>6640438173;>281;7;;10;10;0;10;;;;;;11;;;;;0;;;;;;>271;;;>283;;;;>8;;;-1;;;;;;0;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>106496;<3158016;>656;;;;;<2151;<719822;;
;30201;;;;<6774655629;<6640438701;<281;5;;16;12;4;16;;;;;;0;;;;;;;;;;;<271;;;5;;;0;0;;;0;;;;;;4;;;;;
;30240;;;;>6774656157;>6640438573;>281;6;;10;10;0;10;;;;;;;;;;;;;;;;;>271;;;>283;;;;;;;-1;;;;;;0;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>270336;>6008832;>1864;;;;;>6579;>8847;;
;30201;;;;<6774655197;<6640439477;<281;5;;16;12;4;16;;;;;;3;;;;;;;;;2;;<271;;;5;;;>4096;>202;;;0;;;;;;4;;;;;
;30240;;;;>6774656101;>6640438517;>281;7;;10;10;0;10;;;;;;;;;;;;;;;1;;>271;;;>283;;;;<11;;;-1;;;;;;0;;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>323584;<10641408;>10032;;;>4276224;;<1286;>714081;;
;30201;;;;<6774656101;<6640448549;<281;5;;16;12;4;16;;;;;;0;;;;;;;;;;;<271;;;5;;;0;0;;;0;;;;;;;;;;;
;30240;;;;>6774666133;>6640448549;>281;7;;10;10;0;10;;;;;;2;;;;;1;;;;;;>271;;;>283;>8175616;>5156;>8192;>439;;;-1;;;;;;;;;;;
;;>10.010;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4558848;<3686400;>558992;;;;;>21307;<630986;;
;30201;;;;<6774665173;<6641006581;<281;5;;16;12;4;16;;;;;;3;;;;;0;;;;;;<271;;;5;0;0;<4096;<193;;;0;;;;;;4;;;;;
;30240;;;;>6775223205;>6641005621;>281;6;;10;10;0;10;;;;;;>1004;;;;;>789;4;;;;;>271;;;>283;;;>299008;>7613;;;-1;;;;;;>318;1;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>413696;<6807552;>204568;;;;;>50439;<3165;;
;30201;;;;<6775019373;<6641006357;<281;;;16;12;4;16;;;;;;>75;;;;;>47;;;;;;<271;;;5;;;>36864;>881;;;0;;;;;;<100;3;;;;
;30240;;;;>6775020109;>6640802525;>281;7;;10;10;0;10;;;;;;0;;;;;0;0;;;2;;>271;;;>283;;;0;0;;;-1;;;;;;0;0;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>188416;>917504;>3536;;;;;<75134;>614577;;
;30201;;;;<6775018077;<6640804029;<281;;;16;12;4;16;;;;;;3;;;;;>303;;;;1;;<271;;;5;;;>4096;>192;;;0;;;;;;1;;;;;
;30240;;;;>6775019581;>6640801997;>281;6;;10;10;0;10;;;;;;;;;;;0;;;;;;>271;;;>283;;;;>34;;;-1;;;;;;0;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>204800;<2568192;;;;;;>761;<696767;;
;30201;;;;<6775019581;<6640801997;<281;;;16;12;4;16;;;;;;0;;;;;;;;;;;<271;;;5;;;0;0;;;0;;;;;;4;;;;;
;30240;;;;>6775019581;>6640801997;>281;7;;10;10;0;10;;;;;;;;;;;;;;;;;>271;;;>283;;;;;;;-1;;;;;;0;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2576384;>688128;>1262080;;;;;>12808;>44346;;
;30201;;;;<6775017421;<6642061917;<281;;;16;12;4;16;;;;;;3;;;;;;;;;;;<271;;;5;;;>4096;>281;;;0;;;;;;;;2;;;
;30240;;;;>6776277341;>6642059757;>282;;;11;10;1;11;;;;;;14;;;;;;;;;;;>271;;;>283;;;>8192;>362;;;-1;;;;;;;;19;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4096;>1323008;>16;;;;;<5198;>654075;;
;30201;;;;<6776277325;<6642059757;<282;3;;16;12;4;16;;;;;;0;;;;;;;;;;;<271;;;5;;;0;0;;;0;;;;;;4;;0;;;
;30240;;;;>6776277325;>6642059741;>282;7;;11;10;1;11;;;;;;;;;;;;;;;;;>271;;;>283;;;;;;;-1;;;;;;0;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>6660096;>3633152;>463232;;;;;>16315;<619300;;
;30201;;;;<6767327757;<6642521805;<282;6;;16;12;4;;5;;;5;;>148;4;28;;;92;;;;10;5;<265;;;5;;;>32768;>1076;;;0;;;;;;100;2;;;;
;30240;;;;>6767790493;>6642520637;>282;7;;11;10;1;;1;;1;0;;>937;0;0;;;>742;4;;;1;0;>265;;;>283;;;>307200;>8094;;;-1;;;;;;>148;4;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>520192;>5332992;>300080;;;;;>53747;>24621;;
;30201;;;;<6776438941;<6642520765;<282;5;;16;12;4;16;0;;0;;;<226;;;;;<135;;;;;;<271;;;5;;;<61440;<2341;;;0;;;;;;<107;0;;;;
;30240;;;;>6776438397;>6642220813;>282;7;;11;10;1;11;;;;;;0;;;;;0;0;;;;;>271;;;>283;;;0;0;;;-1;;;;;;0;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>69632;<126976;>1232;;;;;<76641;>604713;;
;30201;;;;<6776438573;<6642222221;<282;5;;16;12;4;16;;;;;;3;;;;;>303;;;;;;<271;;;5;;;>4096;>184;;;0;;;-46563557;;-46563557;3;;;;;
;30240;;;;>6776439981;>6642222397;>282;7;;11;10;1;11;;;;;;;;;;;0;;;;;;>271;;;>283;;;;>59;;;-1;;;0;;0;0;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>16384;>634880;;;;;;>22871;<705132;;
;30201;;;;<6776439981;<6642222397;<282;;;16;12;4;16;;;;;;0;;;;;;;;;;;<271;;;5;;;0;0;;;0;;;;;;1;;;;;
;30240;;;;>6776439981;>6642222397;>282;;;11;10;1;11;;;;;;;;;;;;;;;;;>271;;;>283;;;;;;;-1;;;;;;0;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>90112;<4644864;>1840;;;;;<26118;<1707;;
;30201;;;;<6776438461;<6642222717;<282;;;16;12;4;16;;;;;;3;;;;;;;;;;;<271;;;5;>2367488;>2015;>4096;>175;;;0;;;;;;2;;;;;
;30240;;;;>6776438781;>6642221197;>282;6;;11;10;1;11;;;;;;;;;;;;;;;;;>271;;;>283;0;0;;>100;;;-1;;;;;;0;;;;;
;;>10.012;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>290816;>3391488;>128;;;;;>10234;>710527;;
;30201;;;;<6776438653;<6642221197;<282;3;;16;12;4;16;;;;;;0;;;;;;;;;;;<271;;;5;;;0;0;;;0;;;;;;2;;;;;
;30240;;;;>6776438653;>6642221069;>282;7;;11;10;1;11;;;;;;;;;;;;;;;;;>271;;;>283;;;;;;;-1;;;;;;0;;;;;
;;>10.031;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>197713920;>191385600;>3307336;;;;;>308781;<121293;;
;30201;;;;<6769454325;<6645527445;<282;8;;16;12;4;;5;;;5;;>766;;5;;;>674;;;;8;3;<269;;;5;;;>192512;>5108;;;0;;;;;;>192;6;1;;;
;30240;;;;>6771187133;>6643952597;>284;7;;11;10;1;;0;;;0;;>936;;0;;;>617;12;;;1;0;>269;;;>283;;;>393216;>11927;;;-1;-45148928;;-45148928;;-45148928;>189;4;16;;;
;;>11.002;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>81920;>4472832;>286896;;;;;<255082;<545280;;
;30201;;;;<6777899765;<6643969637;<284;5;;16;12;4;16;;;;;;<1458;;;;;<1174;4;;;2;;<271;;;5;;;<466944;<14214;;;0;0;;0;;0;27;0;0;;;
;30240;;;;>6777900085;>6643683381;>284;7;;11;10;1;11;;;;;;0;;;;;0;0;;;1;;>271;;;>283;;;0;0;;;-1;;;;;;0;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>20480;>1765376;>1616;;;;;<61322;>656373;;
;30201;;;;<6777899909;<6643683941;<284;;;16;12;4;16;;;;;;;;;;;>303;;;;;;<271;;;5;;;;;;;0;;;;;;;;;;;
;30240;;;;>6777900469;>6643682885;>284;6;;11;10;1;11;;;;;;3;;;;;0;;;;;;>271;;;>283;;;>4096;>196;;;-1;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2428928;<3043328;>1383928;;;;;>9618;<656913;;
;30201;;;;<6777899509;<6645066813;<284;;;16;12;4;16;;;;;;;;;;;;;;;;;<271;;;5;;;;<4;;;0;;;;;;4;;1;;;
;30240;;;;>6779283437;>6645066813;>284;7;;11;10;1;11;;;;;;12;;;;;39;;;;;;>271;;;>283;;;;>87;;;-1;;;;;;0;;18;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>348160;>10616832;>2904;;;;;<15672;<45431;;
;30201;;;;<6779282349;<6645067669;<284;6;;16;12;4;16;;;;;;0;;;;;0;;;;;;<271;;;5;>4096;>216;0;0;;;0;;;;;;1;;0;;;
;30240;;;;>6779283205;>6645065621;>284;7;;11;10;1;11;;;;;;3;;;;;;;;;;;>271;;;>283;0;0;>4096;>298;;;-1;;;;;;0;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>307200;<10706944;<17416;;;;;>11431;>700618;;
;30201;;;;<6779299661;<6645065621;<284;;;16;12;4;16;;;;;;;;;;;;;;;;;<271;;;5;;;;<93;;;0;;;;;;4;;1;;;
;30240;;;;>6779299661;>6645083037;>284;;;11;10;1;11;;;;;;0;;;;;;;;;;;>271;;;>283;>4096;>250;0;0;;;-1;;;;;;0;;0;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3903488;>2011136;>2108008;;;;;>104273;<512752;;
;30201;;;;<6779069229;<6646959653;<284;;;16;12;4;16;;;;;;>1082;;;;;>836;4;;;;;<271;;;5;0;0;>344064;>8402;;;0;;;;;;>200;11;;;;
;30240;;;;>6779371957;>6645154373;>284;6;;11;10;1;11;;;;;;<75;;;;;<47;;;;;;>271;;;>283;;;<40960;<468;;;-1;;;;;;>114;3;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2232320;<884736;>227920;;;;;>123;<77846;;
;30201;;;;<6779240621;<6645252221;<280;;>4096;16;12;4;15;1;;;1;;3;6;;;;0;0;;;2;1;<270;1;1;6;>20480;>717;<278528;<7002;;;0;;;;;;0;0;3;;;
;30240;;;;>6779289397;>6645073077;>283;7;0;11;10;1;11;0;;;0;;0;0;;;;;;;;1;0;>271;0;0;>282;0;0;<20480;<784;;;-1;;;;;;;;0;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<43102208;<41779200;<602439384;;;;;>6055859;>3094878;;
;30201;;;;<6779327885;<6042671701;<282;6;>4096;16;12;4;15;1;;;1;;94;15;22;;;>362;;;;2;1;<271;1;1;6;>32768;>966;>61440;>2316;;;0;;;;;;57;3;2;;;
;30240;;;;>6176915405;>6042697501;>292;7;0;11;10;1;11;;;1;0;;3;0;0;;;6;1;;;1;0;>274;0;0;>282;0;0;>184320;>5413;;;-1;;;;;;12;0;0;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1404928;<2621440;>1707240;;;;;<68362;<870781;;
;30201;;;;<6176845141;<6044335469;<291;6;>4096;16;12;4;15;;;0;1;;4;6;;;;0;0;;;2;1;<274;1;1;6;>28672;>1126;<212992;<6484;;;0;;;;;;4;;2;;;
;30240;;;;>6178469797;>6044253989;>301;7;0;11;10;1;11;0;;;0;;0;0;;;;6;1;;;1;0;>277;0;0;>282;0;0;>192512;>5722;;;-1;;;;;;6;;0;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1851392;>1372160;>1518144;;;;;<117029;<32748;;
;30201;;;;<6178583925;<6045905605;<301;6;;16;12;4;16;;;;;;1;;;;;0;0;;;;;<278;;;5;>5283840;>3058;<212992;<6524;;;0;;;;;;;;1;;;
;30240;;;;>6180138533;>6046039077;>308;7;;11;10;1;11;;;;;;13;;;;;6;1;;;;;>280;;;>283;0;0;>217088;>6633;;;-1;;;;;;9;;16;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>8192;>6639616;<71904;;;;;<5887365;<1485879;;
;30201;;;;<6180131061;<6045939541;<308;6;;16;12;4;16;;;;;;3;;;;;7;0;;;;;<280;;;5;;;<221184;<6709;>79233024;>37234;0;;;;;;1;;0;;;
;30240;;;;>6180128533;>6045911909;>308;8;;11;10;1;11;;;;;;0;;;;;0;;;;;;>280;;;>283;>8192;>223;0;0;0;0;-1;;;;;;0;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>138690560;>130863104;>37415684;;;;;>1399843;>13815562;;
;30201;;;;<6178141541;<6073901053;<298;7;;16;12;4;16;;;;;;>2130;;;;;>1681;14;;;;;<280;;;5;0;0;>716800;>19488;;;0;;;;;;>463;20;;;;
;30240;;;;>6204532205;>6062876033;>307;;;11;10;1;11;;;;;;<1045;;;;;<784;4;;;;;>301;;;>283;>4096;>272;<372736;<9303;;;-1;;;;;;<94;2;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>217088;>1540096;<7441612;;;;;<1435146;<14602202;;
;30201;;;;<6204531229;<6062872833;<307;6;;16;12;4;16;;;;;;3;;;;;0;0;;;;;<301;;;5;0;0;<339968;<10029;;;0;;;;;;2;0;;;;
;30240;;;;>6204528029;>6070311245;>307;7;;11;10;1;11;;;;;;0;;;;;;;;;;;>301;;;>283;;;0;0;;;-1;;;;;;0;;;;;
;;>10.011;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4755456;>5369856;<8902065;;;;;>104;>714888;;
;30201;;;;<6213432590;<6070312941;<307;6;;16;12;4;16;;;;;;;;;;;>306;2;2;;;;<301;;;5;>729088;>8672;>8192;>290;>323584;>8236;0;;;;;;2;;;;;
;30240;;;;>6213434286;>6079216702;>307;7;;11;10;1;11;;;;;;3;;;;;0;0;0;;;;>301;;;>283;0;0;<4096;>34;0;0;-1;;;;;;0;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>65536;<2514944;>1555376;;;;;>1829;<710192;;
;30201;;;;<6213445774;<6080772462;<308;4;;16;12;4;16;;;;;;;;;;;;;;;;;<301;;;5;;;;<119;;;0;;;;;;2;;;;;
;30240;;;;>6213452238;>6079223550;>308;6;;11;10;1;11;;;;;;0;;;;;;;;;;;>301;;;>283;;;0;0;;;-1;;;;;;0;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1433600;<266240;<58336;;;;;>103710;>131504;;
;30201;;;;<6213520286;<6079187358;<309;5;>4096;16;12;4;15;1;;;1;;;1;;;;;;;;2;1;<296;;;5;>4096;>234;>4096;>243;;;0;;;;;;5;;5;;;
;30240;;;;>6213520286;>6079245694;>309;6;0;11;10;1;11;0;;;0;;3;0;;;;;;;;1;0;>296;;;>283;0;0;;<48;;;-1;;;;;;0;;0;;;
;;>9.051;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2025771008;>1648636896;>1317417050;;;>89427968;;>570930;>1331914;;
;30201;;;;<6213426534;<7396623840;<308;7;>4096;16;12;4;15;1;;;1;;1;1;;;;;;;;2;1;<300;1;1;6;>32768;>1135;>28672;>1158;;;0;;;;;;4;;2;;;
;30240;;;;>6214199894;>6079980150;>313;8;0;11;10;1;11;0;;;0;;2;0;;;;10;1;;;1;0;>301;0;0;>282;>10313728;>4399;>98304;>2619;;;-1;;;;;;17;;0;;;
;30243;;;-1;<7950369183;<7950406463;52;11;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;>58572799;>167317;>19521535;>50982;-1;>7396523888633264;;>7396523888633264;;>7396523888633264;;>7396523888633264;27;;;;;
;;>9.999;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>125116416;>89239552;>69905677;;;;;>2005230;>20099750;;
;30201;;;0;>1783385347;>1828680948;>91;8;>4096;16;12;4;14;3;0;0;2;0;992;74;245;0;0;>817;4;;;4;2;130;1;1;6;<68886527;<171600;<19316735;<45140;0;0;0;0;;0;;0;>279;6;2;;;
;30240;;;;>6187770849;>6072605939;>332;7;0;11;10;1;11;0;;;0;;>15;0;0;;;>33;5;;;1;0;>317;0;0;>282;0;0;>118784;>2234;>4096;>121;-1;;;;;;>117;5;0;;;
;30243;;;;<7950207588;<7951807188;62;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<425984;<11160;-1;>51969842;;>51969963;;>51969963;;>51969963;3;0;;;;
;;>10.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>14016512;>12554240;>8327610;;;;;<546452;<20095224;;
;30201;;;;>1743948747;>1871446017;>83;6;>4096;16;12;4;15;1;0;0;1;0;17;5;0;0;0;18;;;;2;1;129;1;1;6;>49152;>1659;>28672;>1302;0;0;0;0;;0;;0;5;;2;;;
;30240;;;;>6206389545;>6072137849;>338;8;0;11;10;1;11;0;;;0;;0;0;;;;6;1;;;1;0;>320;0;0;>282;0;0;>118784;>2679;;;-1;;;;;;1;;0;;;
;30243;;;;<7944242068;<7944266676;66;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<159744;<4368;-1;;;;;;;;0;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<2064556032;<1555059680;<1311266466;;;<147456;;<7832;>868539;;
;30201;;;;>1737947219;>3183485333;>76;6;;16;12;4;15;1;0;0;1;0;4;17;0;0;0;>303;;;;2;1;129;1;1;6;>81920;>2837;>69632;>3308;0;;0;;;;;;11;;2;;;
;30240;;;;>6198483977;>6064348537;>312;8;;11;10;1;11;0;;;0;;0;0;;;;6;1;;;;;>166;0;0;>152;0;0;>20480;<720;;;-1;;;;;;1;;0;;;
;;>10.029;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<2494464;<450601952;<1624280856;;;>1826816;;<2160860;<2350108;;
;30201;;;;<6198429161;<4440014497;<317;;;16;12;4;15;1;;;1;;;23;;;;0;0;;;;;<166;1;1;6;>24576;>951;<81920;<2094;;;0;;;-40874072;;-40874072;;;;;;
;30240;;;;>2846096866;>4002704129;;17;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;>3444736;>25164;>335872;>7553;;;-1;;;0;;0;19;4;;;;
;;>10.008;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<16763985920;<15578009600;<7390291974;;;;;>680754;>802427;;
;30201;;;;<2846111970;>3387576085;<5;7;>8192;16;12;4;15;1;0;0;1;0;3;28;0;0;0;;;;;1;0;129;0;0;6;<3452928;<25517;<339968;<7480;;;0;;;;;;4;0;;;;
;;>10.037;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>6720749568;>5870351328;>4665819363;;;;;<66290;>593081;;
;30201;;;;>191760;<4665629827;>7;6;0;;;;;;;;;;0;44;;;;;;;;2;1;;1;1;;>57344;>1314;>45056;>1325;;;;;;;;;3;1;;;;
;30240;;;-1;>715112166;>479897926;79;13;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;38;3;;;-1;-1;-1;-1;-1;-1;<49153;<1388;>589823;>17638;>622010367;>889160;>1396735;>1718;;>7396523912698771;;>7396523912698771;>624;>252;;;;
;30243;;;;<2683394595;<2583706163;74;;;;;;;;;;;;;;;;;0;0;;;;;;;;;;<20;<634880;<18955;<554237952;<835990;;<63;;<32221339;;<32221339;<212;0;;;;
;;>10.045;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1;>2164342784;>2214646752;>1809881968;;;;;>23935899;>10579472;;
;30201;;;0;>1969334222;>294296925;>73;8;>4096;16;12;4;15;1;0;0;1;0;1085;144;268;0;0;>887;4;;;2;1;129;1;1;6;>49153;>2184;>393217;>11102;<67768319;<53018;0;0;;0;;0;<48;10;;;;
;30240;;;;>2314660248;>2155429164;>244;17;0;9;9;0;4;6;1;;5;;<582;>310;>5123;;;63;7;;;8;;>282;0;0;>282;0;0;>2740224;>44346;>267038720;>802167;;;;>2367238;;>2367238;>230;1;;;;
;30243;;;;<3977834172;<3953740303;78;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<3072000;<54048;0;0;;;;>42844908;;>42844908;0;0;;;;
;;>10.051;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3243290624;>2750071776;>1936759451;;;>87171072;;<23411428;>24495563;;
;30201;;;;>1663890076;<137052767;>75;5;;16;12;4;16;0;0;0;0;0;1;0;0;0;0;;;;;1;0;128;0;0;5;>28672;>762;<53248;<1305;;;;;;0;;0;33;1;;;;
;30240;;1;;>2906278498;>2763671349;>303;7;;9;9;0;9;2;1;1;;;>993;>545;>5654;;;>993;6;;;5;3;>334;;;>283;0;0;>421888;>11937;>3264512;>12038;;;;;;;>1094;5;;;;
;30243;;0;;<4544228486;<4535838281;84;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<421888;<11915;0;0;;;;;;;9;0;;;;
;30246;;;-1;<51729346;<51729858;72;10;;;;;;;;;;;;;;;;;;;;;;;;;;>68919295;>167417;>19623935;>52330;-1;>7396523885667507;-1;>7396523885667507;;>7396523885667507;;>7396523885667507;32;;;;;
;;>10.004;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;0;>100253696;>11382784;>55830725;;;;;<1008983;<35633512;;
;30201;;;0;>1717681158;>1796067889;>81;6;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;0;0;<19648511;<53327;0;0;0;0;;0;;0;3;;;;;
;30240;;;;>2877382554;>2743165098;>303;;;9;9;0;9;;;;;;;;;;;<41;1;;;;;>333;;;>283;;;>40960;>1307;>3256320;>9451;;;;>2389575;;>2389575;20;;;;;
;30243;;;;<4543323806;<4543323806;84;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;0;0;0;0;;;;-1573325;;-1573325;0;;;;;
;30246;;;;<34603058;<34627650;76;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;>24576;>837;-1;>26790063;-1;>26790063;;>28363388;;>28363388;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>634880;<19234816;>30928;;;;;<26018;<775379;;
;30201;;;;>1700545862;>1834755558;>77;;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;0;0;0;0;0;0;;0;;0;3;;;;;
;30240;;;;>2877375818;>2743159786;>303;6;;9;9;0;9;;;;;;;;;;;;;;;;;>333;;;>283;;;;;;;;;;;;;0;;;;;
;30243;;;;<4543312926;<4543312926;84;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;<34603058;<34603058;76;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>4304896;<13647872;>1584392;;;;;>7882;>26520;;
;30201;;;;>1700541254;>1833174318;>77;6;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;>3104768;>2336;>4096;>257;0;;0;;;;;;;;;;;
;30240;;;;>2877390450;>2743172994;>303;4;;9;9;0;9;;;;;;;;;;;;;;;;;>333;;;>283;0;0;;<73;;;;;;;;;;;;;;
;30243;;;;<4543323622;<4543323622;84;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;<33022354;<33046946;76;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;>5775184;-1;>5775184;;>5775184;;>5775184;;;;;;
;;>10.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1794048;<1757184;>1663840;;;;;>8755;>673688;;
;30201;;;;>1698955654;>1831544054;>77;6;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;0;0;0;;0;;0;3;;;;;
;30240;;;;>2877389442;>2743161794;>303;7;;9;9;0;9;;;;;;;;;;;;;;;2;;>333;;;>283;;;;;;;;;;-8523202;;-8523202;0;;;;;
;30243;;;;<4543311670;<4543300966;84;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;-18028473;;-18028473;;;;;;
;30246;;;;<32988578;<32989602;76;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;0;;0;;;;;;
;;>10.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>367009792;>347664384;>141799431;;;;;>2682660;>92360299;;
;30201;;;;>1699176167;>1691584640;>78;7;;16;12;4;16;0;0;0;0;0;1007;0;0;0;0;>835;4;;;1;0;128;0;0;5;;;>303104;>8772;0;;0;;;;;;>372;5;;;;
;30240;;;;>2968994727;>2834776983;>315;6;;9;9;0;9;;;;;;>1221;;;;;>995;14;;;;;>339;;;>283;>8192;>397;>843776;>14254;>3510272;>16745;;;;;;;>1050;9;;;;
;30243;;;;<4632545420;<4632545580;78;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<1101824;<21082;0;0;;;;;;;34;0;;;;
;30246;;;;<2753074;<2777666;83;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<51;-1;;-1;;;;;;58;;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3706880;<5468160;>3158576;;;;;<2694899;<93068949;;
;30201;;;;>1666304407;>1797388327;>71;5;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;0;0;0;;0;;;;;;4;;;;;
;30240;;;;>2968998407;>2834780823;>315;;;9;9;0;9;;;;;;;;;;;;;;;;;>339;;;>283;;;;;;;;;;;;;0;;;;;
;30243;;;;<4632544172;<4632544172;78;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>424798;>400206;83;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;-13794231;-1;-13794231;;-13794231;;-13794231;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1187840;<6094848;<120912;;;;;>6708;>729186;;
;30201;;;;>1663049623;>1797412711;>65;4;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;>4096;>256;0;0;0;0;;0;;0;3;1;;;;
;30240;;;;>2969075127;>2834857543;>321;5;;9;9;0;9;;;;;;;;;;;0;;;;;;>339;;;>283;;;;<27;;;;;;;;;0;0;;;;
;30243;;;;<4632550332;<4632550332;77;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>346830;>346830;76;4;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>618496;<1269760;>32768;;;;;<6921;<727893;;
;30201;;;;>1663128887;>1797313703;>72;;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;;;;;;;;;
;30240;;;;>2969091223;>2834873639;>321;3;;9;9;0;9;;;;;;;;;;;;;;;;;>339;;;>283;;;;;;;;;;;;;;;;;;
;30243;;;;<4632561468;<4632561468;77;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>346862;>346862;76;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>561152;<6848512;>27424;;;;;<4140;>13879;;
;30201;;;;>1663124471;>1797314631;>72;6;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>200;0;;0;;;;;;2;;;;;
;30240;;;;>2969111959;>2834894375;>321;4;;9;9;0;9;;;;;;;;;;;;;;;;;>339;;;>283;;;;>7;;;;;;;;;0;;;;;
;30243;;;;<4632580700;<4632580700;77;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>350862;>350862;76;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>192512;<4993024;>14432;;;;;>14548;>710112;;
;30201;;;;>1663117495;>1797320647;>72;3;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;;;;2;;;;;
;30240;;;;>2969116663;>2834899079;>321;2;;9;9;0;9;;;;;;;;;;;;;;;;;>339;;;>283;;;;;;;;;;-4555832;;-4555832;0;;;;;
;30243;;;;<4632579324;<4632579324;77;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;-2128569;;-2128569;;;;;;
;30246;;;;>349966;>349966;76;1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;0;;0;;;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>57880576;>50470912;>17144664;;;;;>833811;>40696054;;
;30201;;;;>1663361151;>1780434071;>74;6;;16;12;4;16;0;0;0;0;0;1007;0;0;0;0;>791;4;;;1;0;128;0;0;5;;;>307200;>7984;0;;0;;;;;;>384;6;;;;
;30240;;;;>2973729959;>2839509815;>337;;;9;9;0;9;;;;;;;;;;;>8;;;;;;>352;;;>283;;;>12288;>761;;;;;;;;;>394;4;;;;
;30243;;;;<4634807796;<4634805236;78;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<299008;<8056;;;;;;;;;7;0;;;;
;30246;;;;>7059142;>7034550;81;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<21;-1;;-1;;;;;;17;;;;;
;;>10.018;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3596288;<6832128;>3130208;;;;;<852383;<41418845;;
;30201;;;;>1654023367;>1785130663;>70;7;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;0;0;0;;0;;;;;;3;;;;;
;30240;;;;>2973731495;>2839516023;>336;3;;9;9;0;9;;;;;;;;;;;;;;;;;>352;;;>283;;;;;;;;;;;;;0;;;;;
;30243;;;;<4634844772;<4634842212;75;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>10244678;>10220086;78;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;-2161229;-1;-2161229;;-2161229;;-2161229;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>364544;<2920448;>59568;;;;;>5173;>699759;;
;30201;;;;>1650865799;>1785048407;>72;6;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;>4096;>237;0;0;0;0;;0;;0;;;;;;
;30240;;;;>2973756903;>2839536759;>337;3;;9;9;0;9;;;;;;;;;;;0;;;;;;>352;;;>283;;;;>9;;;;;;;;;;;;;;
;30243;;;;<4634861684;<4634859124;75;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>10243782;>10243782;78;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3526656;<6803456;>42512;;;;;<6739;<694453;;
;30201;;;;>1650861639;>1785036711;>72;6;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;;;;3;1;;;;
;30240;;;;>2973783751;>2839563607;>337;5;;9;9;0;9;;;;;;;;;;;;;;;;;>352;;;>283;;;;;;;;;;;;;0;0;;;;
;30243;;;;<4634882836;<4634880276;75;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>10244982;>10245494;78;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>344064;<2482176;>30568;;;;;>1435;>6271;;
;30201;;;;>1650856055;>1785042559;>72;6;;16;12;4;16;0;0;0;0;0;5;0;0;0;0;;;;;1;0;128;0;0;5;>6213632;>2966;>12288;>454;0;;0;;;;;;4;;;;;
;30240;;;;>2973803695;>2839583551;>337;5;;9;9;0;9;;;;;;3;;;;;;;;;;;>352;;;>283;0;0;<8192;<270;;;;;;;;;0;;;;;
;30243;;;;<4634901116;<4634898556;75;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>10244982;>10244982;78;4;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1830912;>2301952;>1564656;;;;;>10743;>707228;;
;30201;;;;>1650852567;>1783505495;>72;6;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;;;;1;;;;;
;30240;;;;>2973808303;>2839588159;>337;5;;9;9;0;9;;;;;;;;;;;;;;;;;>352;;;>283;>1507328;>2119;;;;;;;;;;;0;;;;;
;30243;;;;<4634900156;<4634897596;75;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;0;0;;;;;;;;;;;;;;;;
;30246;;;;>11817974;>11793382;78;4;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>141877248;>136675328;>51306624;;;;;>1247047;>42643430;;
;30201;;;;>1652131351;>1748945135;>72;7;;16;12;4;16;0;0;0;0;0;1741;0;0;0;0;>1304;13;;;1;0;128;0;0;5;>4096;>263;>606208;>16008;0;;0;;;;;;>446;23;;;;
;30240;;;;>2992428119;>2844330255;>355;6;;9;9;0;9;;;;;;<734;;;;;<505;4;;;;;>352;;;>283;0;0;<299008;<7370;>4096;>139;;;;;;;>306;10;;;;
;30243;;;;<4652234932;<4652233204;76;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<286720;<7952;0;0;;;;;;;17;0;;;;
;30246;;;;>13429750;>13429750;78;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<28;-1;;-1;;;;;;10;;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2523136;<1683456;<12287368;;;;;<1229747;<43309550;;
;30201;;;;>1646377063;>1792882335;>72;5;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;0;0;0;;0;;;;;;0;;;;;
;30240;;;;>2992433575;>2858213431;>355;6;;9;9;0;9;;;;;;;;;;;;;;;;;>352;;;>283;;;;;;;;;;;;;;;;;;
;30243;;;;<4652234692;<4652232132;76;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>15028230;>15003638;78;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>9490432;>8056832;>3079208;;;;;<1188;>754040;;
;30201;;;;>1644773895;>1775936863;>72;6;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;>4096;>216;0;;0;;;;;;2;;2;;;
;30240;;;;>2993926863;>2859706239;>356;5;;10;9;1;10;;;;;;14;;;;;0;;;;;;>352;;;>283;;;>8192;>538;;;;;;;;;0;;19;;;
;30243;;;;<4653723292;<4653720252;76;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;0;;;
;30246;;;;>15027334;>15027334;78;4;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.017;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>487424;<4902912;>27424;;;;;<24414;<814198;;
;30201;;;;>1644769095;>1778959255;>72;3;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;;;;2;1;;;;
;30240;;;;>2993942543;>2859721023;>356;5;;10;9;1;10;;;;;;;;;;;;;;;;;>352;;;>283;;;;;;;;;;;;;0;0;;;;
;30243;;;;<4653733692;<4653729724;76;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>15029350;>15029350;78;4;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.014;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1675264;<1298432;>1587240;;;;;>12533;>23872;;
;30201;;;;>1644763495;>1777393807;>72;3;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>239;0;;0;;;;;;3;;;;;
;30240;;;;>2993946039;>2859725415;>356;;;10;9;1;10;;;;;;;;;;;;;;;;;>352;;;>283;;;;>24;;;;;;;;;0;;;;;
;30243;;;;<4653735588;<4653733028;76;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>16603238;>16603238;78;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.013;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1142784;<2797568;>16192;;;>32768;;>197;>710479;;
;30201;;;;>1643186311;>1777388183;>72;;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;-35276848;;-35276848;3;1;;;;
;30240;;;;>2993951735;>2859731111;>356;;;10;9;1;10;;;;;;;;;;;;;;;;;>352;;;>283;>3047424;>2111;;;;;;;;0;;0;0;0;;;;
;30243;;;;<4653735588;<4653733028;76;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;0;0;;;;;;;;;;;;;;;;
;30246;;;;>16602342;>16602342;78;4;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>46768128;>37253120;>8310120;;;;;>849647;>41023702;;
;30201;;;;>1643349735;>1769257679;>72;7;;16;12;4;16;0;0;0;0;0;1007;0;0;0;0;>791;4;;;1;0;128;0;0;5;;;>311296;>8065;0;;0;;;;;;>292;7;;;;
;30240;;;;>2997097119;>2862876495;>358;6;;10;9;1;10;;;;;;>78;;;;;>53;;;;;;>352;;;>283;;;>24576;>936;;;;;;-13226846;;-13226846;>396;6;;;;
;30243;;;;<4655431084;<4655453116;76;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<315392;<8306;;;;;;-13006871;;-13006871;13;0;;;;
;30246;;;;>16628710;>16653302;79;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>61;-1;;-1;;;0;;0;21;;;;;
;;>10.015;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>270336;<4096000;>41040;;;;;<858177;<41747747;;
;30201;;;;>1641705383;>1775882407;>71;;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;0;0;0;;0;;;;;;2;;;;;
;30240;;;;>2997102815;>2862882191;>358;;;10;9;1;10;;;;;;;;;;;;;;;;;>352;;;>283;;;;;;;;;;;;;0;;;;;
;30243;;;;<4655431212;<4655428652;76;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>16627334;>16627814;79;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>282624;>1437696;>16976;;;;;<3493;>723323;;
;30201;;;;>1641702151;>1775902759;>71;5;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;>4096;>200;0;;0;;;;;;2;;;;;
;30240;;;;>2997108079;>2862887455;>358;;;10;9;1;10;;;;;;;;;;;0;;;;;;>352;;;>283;;;;>6;;;;;;;;;0;;;;;
;30243;;;;<4655432764;<4655430204;76;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>16627750;>16627750;79;4;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;-8255910;-1;-8255910;;-8255910;;-8255910;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>692224;<3743744;>20160;;;;;>22087;<719814;;
;30201;;;;>1641697111;>1775895015;>71;6;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;0;0;0;;0;;0;2;;;;;
;30240;;;;>2997115775;>2862895151;>358;;;10;9;1;10;;;;;;;;;;;;;;;;;>352;;;>283;;;;;;;;;;;;;0;;;;;
;30243;;;;<4655435100;<4655432028;76;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>16628662;>16627766;79;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3854336;>163840;>3136976;;;;;<26511;<9473;;
;30201;;;;>1641691751;>1772773223;>71;5;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>156;0;;0;;;;;;2;;;;;
;30240;;;;>2997121183;>2862900559;>358;6;;10;9;1;10;;;;;;;;;;;;;;;;;>352;;;>283;;;;>28;;;;;;;;;;;;;;
;30243;;;;<4655437980;<4655435420;76;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;0;;;;;
;30246;;;;>19775542;>19750950;79;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>38051840;>42115072;>1675280;;;>51806208;;>18107;>722315;;
;30201;;;;>1638541255;>1771108631;>71;7;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;;;;;;;;;
;30240;;;;>2997215311;>2862993791;>358;5;;10;9;1;10;;;;;;;;;;;;;;;;;>352;;;>283;>79446016;>138747;>4096;>134;;;;;;;;;;;;;;
;30243;;;;<4653955756;<4653976412;76;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;<78831616;<137686;;>25;;;;;;;;;;;;;;
;30246;;;;>18204406;>18228518;79;2;;;;;;;;;;;;;;;;;;;;;;;;;;0;0;0;0;-1;;-1;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>35708928;>33947648;>7381552;;;;;>831553;>40689411;;
;30201;;;;>1638753095;>1765589607;>71;5;;16;12;4;16;0;0;0;0;0;1007;0;0;0;0;>791;4;;;1;0;128;0;0;5;;;>311296;>7835;0;;0;;;;;;>426;4;;;;
;30240;;;;>2998031343;>2863811199;>364;;;10;9;1;10;;;;;;;;;;;>8;5;;;;;>353;;;>283;;;>8192;>1063;;;;;;;;;>225;;;;;
;30243;;;;<4654939548;<4654936988;76;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<299008;<8173;;;;;;;;;13;0;;;;
;30246;;;;>21063478;>21038406;80;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>47;-1;;-1;;;;;;11;;;;;
;;>9.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3837952;>9744384;>3128720;;;>262144;;<856629;<41411496;;
;30201;;;;>1635844727;>1766958663;>70;6;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;0;0;0;;0;;;;;;4;1;;;;
;30240;;;;>2998031343;>2863811199;>364;;;10;9;1;10;;;;;;;;;;;;;;;;;>353;;;>283;;;;;;;;;;;;;0;0;;;;
;30243;;;;<4653390252;<4653387692;76;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>21093126;>21068534;80;;;;;;;;;;;;;;;;;;;;;;;;;;;>614400;>1174;>4096;>153;-1;;-1;;;;;;;;;;;
;;>10.016;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1921024;<4767744;>1626240;;;;;>16705;>702035;;
;30201;;;;>1634266759;>1766892423;>70;4;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;0;0;;>44;0;;0;;;;;;4;;;;;
;30240;;;;>2998031023;>2863801151;>364;;;10;9;1;10;;;;;;;;;;;0;;;;;;>353;;;>283;;;;>57;;;;;;;;;0;;;;;
;30243;;;;<4653390908;<4653388348;76;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>22683414;>22683414;80;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2109440;>8343552;>1576688;;;;;>16605;<695167;;
;30201;;;;>1632676599;>1765317367;>70;6;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;;;;2;;;;;
;30240;;;;>2998031663;>2863811647;>364;;;10;9;1;10;;;;;;;;;;;;;;;;;>353;;;>283;;;;;;;;;;;;;0;;;;;
;30243;;;;<4653390396;<4653389116;76;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>24292374;>24269062;80;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;;>10.054;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1637158912;>1268941792;>858568348;;;>87126016;;>662560;>731611;;
;30201;;;;>1631002455;>906710075;>74;5;>4096;16;12;4;15;1;0;0;1;0;3;5;0;0;0;;;;;2;1;129;1;1;6;>2699264;>3199;>24576;>1014;0;;0;;;;;;6;1;7;;;
;30240;;;;>2998179199;>2863931991;>363;6;0;10;9;1;10;0;;;0;;;0;;;;;;;;1;0;>353;0;0;>282;0;0;>102400;>2551;;;;;;;;;13;0;0;;;
;30243;;;;<4653446732;<4653450900;78;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;<118784;<3295;;;;;;;;;0;;;;;
;30246;;;;>24295958;>24295958;82;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>12;-1;;-1;;;;;;;;;;;
;30249;;;-1;<515113504;<530078972;59;13;;;;;;;;;;;;;;;;;;;;;;;;;;>68919295;>127297;>19611647;>51887;;>7396523938591072;;>7396523938591072;;>7396523938591072;;>7396523938591072;17;;;;;
;;>10.010;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>243499008;>182349824;>168624181;;;;;<614635;>100351;;
;30201;;;0;>2174029207;>2154588078;>97;6;;16;12;4;16;0;0;0;0;0;1;0;0;0;0;;;;;1;0;128;0;0;5;<68911103;<127008;<19607551;<51672;0;0;0;0;;0;;0;3;;1;;;
;30240;;;;>2970524119;>2836303975;>363;;;10;9;1;10;;;;;;10;;;;;6;1;;;;;>354;;;>283;0;0;>49152;>1479;;;;;;;;;25;1;16;;;
;30243;;;;<4653735780;<4653733220;78;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;0;0;0;;;
;30246;;;;>25894438;>25894438;82;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<392646695;<392671287;62;8;;;;;;;;;;;;;;;;;;;;;;;;;;;;>57344;>1801;;-30559802;;-30559802;;-30559802;;-30559802;;;;;;
;;>10.027;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>374153216;>368775168;>92315140;;;;;>2018847;>52179567;;
;30201;;;;>2066029486;>2091892858;>94;9;;16;12;4;11;5;0;0;5;0;740;0;26;0;0;>696;;;;8;2;130;0;0;5;;;>126976;>3216;0;0;0;0;;0;;0;>300;5;;;;
;30240;;;;>2969310075;>2889232347;>372;7;;10;9;1;10;0;;;0;;>952;;0;;;>645;12;;;1;0;>360;;;>283;>16384;>438;>839680;>11823;>4096;>141;;;;;;;>747;6;;;;
;30243;;;;<4665911592;<4703987784;83;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<991232;<15317;0;0;;;;;;;24;0;;;;
;30246;;;;>27717566;>24816654;86;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>67;-1;;-1;;;;;;19;;;;;
;30249;;;;<363656615;<360780919;69;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<112;;>5902477;;>5902477;;>5902477;;>5902477;6;;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>7278592;>1191936;<30332538;;;;;<2000014;<51577678;;
;30201;;;;>2016635212;>2181210422;>87;7;;16;12;4;16;0;0;0;0;0;345;0;0;0;0;>190;4;;;1;0;128;0;0;5;;;>122880;>3212;0;0;0;0;;0;;0;>110;;;;;
;30240;;;;>2985215765;>2850995749;>372;4;;10;9;1;10;;;;;;0;;;;;0;0;;;;;>362;;;>283;;;0;0;;;;;;;;;0;;;;;
;30243;;;;<4664362328;<4664384360;83;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>27744734;>27768558;86;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<363648231;<363672055;69;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-17456203;;-17456203;;-17456203;;-17456203;;;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2359296;>3964928;>1633936;;;;;<76213;<689848;;
;30201;;;;>2015051964;>2147660076;>87;6;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;>4096;>181;0;0;0;0;;0;;0;4;;;;;
;30240;;;;>2985232397;>2851012381;>372;3;;10;9;1;10;;;;;;;;;;;0;;;;;;>362;;;>283;;;;>84;;;;;;;;;0;;;;;
;30243;;;;<4664380864;<4664378304;83;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>27744734;>27744734;86;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<362060095;<362084687;69;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>897024;<3686400;>32752;;;;;>1135;<736391;;
;30201;;;;>2013463956;>2147674244;>87;5;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;;;;2;;;;;
;30240;;;;>2985234573;>2851011261;>372;3;;10;9;1;10;;;;;;;;;;;;;;;;;>362;;;>283;;;;;;;;;;;;;4;;;;;
;30243;;;;<4664383200;<4664377344;83;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;0;;;;;
;30246;;;;>27744606;>27744606;86;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<362052703;<362053695;69;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1003520;<1548288;>6800;;;;;>79;<14505;;
;30201;;;;>2013457860;>2147668468;>87;7;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;>4096;>264;>4096;>182;0;;0;;;;;;;;;;;
;30240;;;;>2985233853;>2851013885;>372;4;;10;9;1;10;;;;;;;;;;;;;;;;;>362;;;>283;0;0;;>138;;;;;;;;;;;;;;
;30243;;;;<4664385744;<4664383184;83;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>27744782;>27744782;86;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<362042687;<362042687;69;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>14311225;;>14311225;;>14311225;;>14311225;;;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2457600;>5931008;>1625328;;;;;>27179;>726634;;
;30201;;;;>2013449924;>2146042052;>87;4;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;0;0;0;;0;;0;2;;;;;
;30240;;;;>2985266005;>2851045989;>372;3;;10;9;1;10;;;;;;;;;;;;;;;;;>362;;;>283;;;;;;;;;;;;;3;;;;;
;30243;;;;<4664418024;<4664415464;83;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;0;;;;;
;30246;;;;>29318670;>29318670;86;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<363561399;<363561399;69;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.023;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>65949696;>62636032;>22249584;;;;;>828758;>47732062;;
;30201;;;;>2014869124;>2125327516;>88;6;;16;12;4;16;0;0;0;0;0;1007;0;0;0;0;>791;4;;;1;0;128;0;0;5;>4096;>234;>303104;>7932;0;;0;;;;;;>370;7;;;;
;30240;;;;>2984715141;>2852003965;>379;;;10;9;1;10;;;;;;>78;;;;;>54;;;;;;>366;;;>283;;>20;>49152;>1107;;;;;;;;;>405;4;;;;
;30243;;;;<4659857032;<4659878424;84;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<331776;<8369;;;;;;;;;8;0;;;;
;30246;;;;>25175790;>25200382;86;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>67;-1;;-1;;;;;;28;;;;;
;30249;;;;<348753623;<351916631;75;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>24;;;;;;;;;18;;;;;
;;>10.026;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>741376;<1118208;>4709704;;;;;<868558;<48455875;;
;30201;;;;>1998719724;>2131390612;>82;6;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;0;0;0;;0;;;;;;4;1;;;;
;30240;;;;>2984715141;>2850494997;>379;;;10;9;1;10;;;;;;;;;;;;;;;;;>366;;;>283;;;;;;;;;;;;;0;0;;;;
;30243;;;;<4659856888;<4659854328;84;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>25176414;>25176414;86;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<348743447;<348743447;75;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2658304;>4083712;>64096;;;;;>114207;>889295;;
;30201;;;;>1998741356;>2132894716;>82;7;;16;12;4;16;0;0;0;0;0;32;0;0;0;0;>328;;;;1;0;128;0;0;5;;;>12288;>803;0;;0;;;;;;7;;;;;
;30240;;;;>2984701069;>2850481053;>379;4;;10;9;1;10;;;;;;3;;;;;0;;;;;;>366;;;>283;;;<8192;<500;;;;;;;;;0;;;;;
;30243;;;;<4659875392;<4659872832;84;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>25176414;>25176414;86;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<348730303;<348730303;75;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2428928;>397312;>3115104;;;;;<107973;<876252;;
;30201;;;;>1998728340;>2129830692;>82;5;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;;;;;;;;;
;30240;;;;>2984706317;>2850486301;>379;;;10;9;1;10;;;;;;;;;;;;;;;;;>366;;;>283;;;;;;;;;;;;;;;;;;
;30243;;;;<4659878880;<4659876320;84;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>25174878;>25174878;86;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<347147999;<347172591;75;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>884736;<1032192;>26208;;;;;>3671;>11484;;
;30201;;;;>1997148324;>2131364292;>82;6;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;>4816896;>2903;>8192;>342;0;;0;;;;;;1;;;;;
;30240;;;;>2984705149;>2850485005;>379;5;;10;9;1;10;;;;;;;;;;;;;;;;;>366;;;>283;0;0;<4096;<91;;;;;;;;;0;;;;;
;30243;;;;<4659882944;<4659880384;84;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>25174878;>25174878;86;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<347142847;<347142847;75;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.025;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3239936;>7610368;>1555896;;;;;>269;>705989;;
;30201;;;;>1997145892;>2129807452;>82;7;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;;;;4;1;;;;
;30240;;;;>2984705021;>2850485005;>379;5;;10;9;1;10;;;;;;;;;;;;;;;;;>366;;;>283;>614400;>1209;;;;;;;;;;;0;0;;;;
;30243;;;;<4658309056;<4658331088;84;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;0;0;;;;;;;;;;;;;;;;
;30246;;;;>23600990;>23625582;86;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<347136247;<347136247;75;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-4915943;;-4915943;;-4915943;;-4915943;;;;;;
;;>10.025;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>67579904;>60063744;>28410424;;;;;>1017948;>47657868;;
;30201;;;;>2078302500;>2104521300;>83;7;;16;12;4;14;2;0;0;2;0;1630;77;340;0;0;>1220;12;;;4;2;131;0;0;5;>4096;>170;>569344;>14919;0;0;0;0;;0;;0;>480;22;;;;
;30240;;;;>2910866541;>2857808645;>384;5;;10;9;1;10;1;;1;0;;<623;0;0;;;<420;4;;;1;0;>363;;;>283;0;0;<253952;<6398;;;;;;;;;>288;2;;;;
;30243;;;;<4662727464;<4662749816;86;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<294912;<7875;;;;;;;;;15;0;;;;
;30246;;;;>23632454;>23657206;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>108;-1;;-1;;;;;;20;;;;;
;30249;;;;<336381383;<341103847;78;4;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<21;;;;;;;;;16;;;;;
;;>10.024;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>48447488;>46280704;>6987376;;;;;<791261;<46669348;;
;30201;;;;>1985703892;>2116082836;>79;7;;16;12;4;16;0;0;0;0;0;33;0;0;0;0;39;;;;1;0;128;0;0;5;;;<12288;<359;0;;0;;;>9806331;;>9806331;0;;;;;
;30240;;;;>2989772117;>2855551973;>385;6;;10;9;1;10;;;;;;0;;;;;0;;;;;;>366;;;>283;;;0;0;;;;;;0;;0;;;;;;
;30243;;;;<4662738936;<4662736376;85;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>23644310;>23644310;86;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<334811863;<334836455;77;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3436544;>4726784;>2884488;;;;;<238280;<1006216;;
;30201;;;;>1984136116;>2115493804;>80;5;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;>4096;>199;0;;0;;;;;;;;;;;
;30240;;;;>2989772517;>2855552373;>385;4;;10;9;1;10;;;;;;;;;;;0;;;;;;>366;;;>283;;;;>52;;;;;;>21274499;;>21274499;;;;;;
;30243;;;;<4662741080;<4662738520;85;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;>572690;;>572690;;;;;;
;30246;;;;>23644310;>23644310;86;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;0;;0;;;;;;
;30249;;;;<334805199;<334805711;77;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3969024;>217088;>3165008;;;;;>11387;<696464;;
;30201;;;;>1984129452;>2115182540;>80;4;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;;;;1;;;;;
;30240;;;;>2989776357;>2855556213;>385;5;;10;9;1;10;;;;;;;;;;;;;;;;;>366;;;>283;;;;;;;;;;;;;0;;;;;
;30243;;;;<4662738008;<4662735448;85;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>26785174;>26760582;86;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<337947007;<337922415;77;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>5312512;>2707456;>4727264;;;;;<12295;<10784;;
;30201;;;;>1984124572;>2113614764;>80;6;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>174;0;;0;;;;;;4;;;;;
;30240;;;;>2989775269;>2855555253;>385;5;;10;9;1;10;;;;;;;;;;;;;;;;;>366;;;>283;;;;>93;;;;;;;;;0;;;;;
;30243;;;;<4662740408;<4662737848;85;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>26785174;>26785174;86;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;>16627246;-1;>16627246;;>16627246;;>16627246;;;;;;
;30249;;;;<333213503;<333238095;77;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;0;;0;;0;;0;;;;;;
;;>10.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2838528;>6369280;>1581272;;;;;>12463;>704890;;
;30201;;;;>1979393468;>2112054372;>80;7;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;;;;2;1;;;;
;30240;;;;>2989775925;>2855555781;>385;4;;10;9;1;10;;;;;;;;;;;;;;;;;>366;;;>283;>2441216;>2590;;;;;;;;;;;3;0;;;;
;30243;;;;<4661167176;<4661189208;85;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;0;0;;;;;;;;;;;0;;;;;
;30246;;;;>25211286;>25235878;86;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<333206903;<333206903;77;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.024;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>50253824;>49463296;>13623280;;;;;>830179;>47378682;;
;30201;;;;>1979536132;>2099982132;>81;8;;16;12;4;16;0;0;0;0;0;1085;0;0;0;0;>836;4;;;1;0;128;0;0;5;;;>335872;>8315;4096;>128;0;;;;;;>347;9;;;;
;30240;;;;>2991616973;>2857545133;>384;6;;10;9;1;10;;;;;;<78;;;;;<36;;;;;;>366;;;>283;;;<16384;>252;0;0;;;;;;;>500;3;;;;
;30243;;;;<4661829064;<4661826504;86;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<299008;<7703;;;;;;;;;28;0;;;;
;30246;;;;>25503830;>25503830;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<134;-1;;-1;;;;;;17;;;;;
;30249;;;;<324620071;<326194439;77;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>140;;;;;;;;;1;;;;;
;;>10.023;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>532480;<2166784;>1711840;;;;;<839771;<48081015;;
;30201;;;;>1969323788;>2103403772;>80;7;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;0;0;0;;0;;;;;;0;;;;;
;30240;;;;>2991621517;>2857401501;>385;5;;10;9;1;10;;;;;;;;;;;;;;;;;>366;;;>283;;;;;;;;;;;;;;;;;;
;30243;;;;<4661829064;<4661826504;86;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>25503830;>25503830;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<324626231;<324626231;76;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>9.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1581056;>6471680;>1583184;;;;;<12393;>685209;;
;30201;;;;>1969331884;>2101966284;>81;6;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;>4096;>254;0;;0;;;;;;4;;;;;
;30240;;;;>2991621141;>2857400997;>385;5;;10;9;1;10;;;;;;;;;;;0;;;;;;>366;;;>283;;;;<17;;;;;;;;;0;;;;;
;30243;;;;<4661830624;<4661828064;86;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>25503830;>25503830;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<323046159;<323046671;76;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.026;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>708608;<1441792;>7840;;;;;>7220;<704142;;
;30201;;;;>1967751940;>2101962196;>81;5;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;;;;1;;;;;
;30240;;;;>2991623157;>2857403013;>385;6;;10;9;1;10;;;;;;;;;;;;;;;;;>366;;;>283;;;;;;;;;;;;;0;;;;;
;30243;;;;<4661832000;<4661829440;86;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>25503062;>25503062;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<323041103;<323041871;76;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>802816;<1847296;>31768;;;;;>9062;>16572;;
;30201;;;;>1967747972;>2101946540;>81;6;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>241;0;;0;;;;;;4;;;;;
;30240;;;;>2991640541;>2857420397;>385;;;10;9;1;10;;;;;;;;;;;;;;;;;>366;;;>283;;;;<51;;;;;;;;;0;;;;;
;30243;;;;<4661852040;<4661849992;86;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>25503062;>25503062;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<323035919;<323047391;76;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.024;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>22376448;>25382912;>12322705;;;>262144;;>379320;>30207143;;
;30201;;;;>1967744484;>2089639363;>81;6;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;;;;3;1;;;;
;30240;;;;>2999211142;>2864990998;>386;;;11;10;1;11;;;;;;8;;;;;;;;;;;>366;;;>283;>7663616;>4068;>4096;>166;;;;;;;;;>173;2;;;;
;30243;;;;<4669409793;<4669407233;86;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;<7114752;<2793;;>47;;;;;;;;;17;0;;;;
;30246;;;;>28654998;>28630406;;;;;;;;;;;;;;;;;;;;;;;;;;;;0;0;0;0;-1;;-1;;;;;;11;;;;;
;30249;;;;<324591319;<324566727;76;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.023;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>28930048;>27607040;>4266888;;;;;>368033;>15804597;;
;30201;;;;>1966136060;>2096086756;>81;6;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;;;>4096;>263;0;;0;;;;;;1;;;;;
;30240;;;;>2999996358;>2865776214;>387;5;;11;10;1;11;;;;;;>1082;;;;;>845;4;;;;;>366;;;>283;>4096;>118;>339968;>9241;>4096;>182;;;;;;;>759;1;;;;
;30243;;;;<4670182385;<4670179665;86;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<323584;<8743;0;0;;;;;;;9;0;;;;
;30246;;;;>31834886;>31834886;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<111;-1;;-1;;;;;;15;;;;;
;30249;;;;<327681959;<327537807;79;4;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>146;;-5110654;;-5110654;;-5110654;;-5110654;;;;;;
;;>10.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>9060352;>5980160;>3366872;;;;;<627398;<43571687;;
;30201;;;;>1966409132;>2097115532;>84;6;;16;12;4;16;0;0;0;0;0;1004;0;0;0;0;>791;4;;;1;0;128;0;0;5;;;>286720;>7115;4096;>5110763;0;0;;0;;0;>339;2;;;;
;30240;;;;>2999621478;>2865401334;>381;5;;11;10;1;11;;;;;;0;;;;;0;0;;;;;>366;;;>283;;;0;0;0;0;;;;;;;2;0;;;;
;30243;;;;<4670182401;<4670179841;86;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;1;;;;;
;30246;;;;>31836902;>31836902;;;;;;;;;;;;;;;;;;;;;;;;;;;;>548864;>1109;>4096;>155;-1;;-1;;;;;;0;;;;;
;30249;;;;<322981703;<324555079;79;;;;;;;;;;;;;;;;;;;;;;;;;;;0;0;0;0;;;;;;;;;;;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>872448;>3280896;>1582496;;;;;<117747;<1727742;;
;30201;;;;>1961707324;>2095920460;>84;6;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;>4096;>189;0;;0;;;;;;4;;;;;
;30240;;;;>2999621310;>2865396494;>381;4;;11;10;1;11;;;;;;;;;;;0;;;;;;>366;;;>283;;;;>6;;;;;;;;;0;;;;;
;30243;;;;<4670185113;<4670182553;86;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>31836902;>31836902;;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<322976447;<322976447;79;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>385024;<2281472;>1216;;;;;<10748;<708670;;
;30201;;;;>1961703860;>2095920228;>84;4;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;;;;2;;;;;
;30240;;;;>2999620798;>2865400654;>381;;;11;10;1;11;;;;;;;;;;;;;;;;;>366;;;>283;;;;;;;;;;;;;0;;;;;
;30243;;;;<4670184761;<4670182713;86;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>31836902;>31836902;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<322971103;<322970591;79;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.021;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>3960832;>3780608;>53856;;;>262144;;>8183;>5673;;
;30201;;;;>1961699252;>2095862980;>84;6;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;>2371584;>2313;>4096;>178;0;;0;;;;;;2;;;;;
;30240;;;;>2999637278;>2865417134;>381;3;;11;10;1;11;;;;;;;;;;;;;;;;;>366;;;>283;0;0;;<16;;;;;;;;;0;;;;;
;30243;;;;<4670204921;<4670202361;86;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>31873766;>31873766;;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<321427615;<323002879;79;;;;;;;;;;;;;;;;;;;;;;;;;;;>262144;>1551;;;;;;;;;;;;;;;;
;;>10.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1892352;>8830976;>3319600;;;;;>496;>704853;;
;30201;;;;>1960121620;>2092600532;>84;6;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;0;0;;;0;;0;;;;;;2;;;;;
;30240;;;;>2999679718;>2865453910;>381;5;;11;10;1;11;;;;;;;;;;;;;;;;;>366;;;>283;;;;;;;;;;;;;4;;;;;
;30243;;;;<4670247489;<4670244929;86;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;0;;;;;
;30246;;;;>31873766;>31873766;;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<321366983;<321366983;79;3;;;;;;;;;;;;;;;;;;;;;;;;;;>417792;>1761;>4096;>169;;;;;;;;;;;;;;
;;>10.051;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>102584320;>83107840;>5127096;;;;;>1989331;>51189739;;
;30201;;;;>1960061948;>2089152436;>84;5;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;0;0;;>23;0;;0;;;;;;;;;;;
;30240;;;;>3001781982;>2867561838;>383;6;;11;10;1;11;;;;;;>1660;;;;;>1262;12;;;;;>366;;;>283;>20480;>503;>995328;>14683;>12288;>388;;;;;;;>1158;5;;;;
;30243;;;;<4672287417;<4672284697;86;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;0;0;<966656;<13530;0;0;;;;;;;25;0;;;;
;30246;;;;>31847206;>31847206;;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<98;-1;;-1;;;;;;13;;;;;
;30249;;;;<317188991;<318475655;79;4;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>146;;;;;;;;;18;;;;;
;;>9.995;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>5173248;>11460608;>1516248;;;;;<1875317;<49463524;;
;30201;;;;>1956074116;>2090061956;>84;6;;16;12;4;16;0;0;0;0;0;1004;0;0;0;0;>791;4;;;1;0;128;0;0;5;;;>266240;>6650;0;;0;;;;;;>390;7;;;;
;30240;;;;>3001555726;>2867335582;>383;4;;11;10;1;11;;;;;;0;;;;;0;0;;;;;>366;;;>283;;;0;0;;;;;;;;;0;0;;;;
;30243;;;;<4672286857;<4672284297;86;2;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>31846694;>31846694;;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<314065855;<317189039;79;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1105920;>5210112;>3142328;;;;;<105053;<1712212;;
;30201;;;;>1952951268;>2087149708;>84;4;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;>303;;;;1;0;128;0;0;5;;;>4096;>238;0;;0;;;;;;4;1;;;;
;30240;;;;>3001572462;>2867352318;>383;;;11;10;1;11;;;;;;;;;;;0;;;;;;>366;;;>283;;;;>2;;;;;;;;;0;0;;;;
;30243;;;;<4672304569;<4672302009;86;1;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>31846694;>31846694;;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<314064887;<314065399;79;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.020;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>155648;>630784;>384;;;;;>1274;<730663;;
;30201;;;;>1952950428;>2087168140;>84;5;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;;;;3;1;;;;
;30240;;;;>3001572334;>2867352190;>383;3;;11;10;1;11;;;;;;;;;;;;;;;;;>366;;;>283;;;;;;;;;;;;;0;0;;;;
;30243;;;;<4672305369;<4672302297;86;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>31847526;>31847526;;1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<314065431;<314065943;79;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.019;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1855488;>5222400;>10952;;;;;>30861;>1720;;
;30201;;;;>1952952796;>2087159428;>84;4;;16;12;4;16;0;0;0;0;0;3;0;0;0;0;;;;;1;0;128;0;0;5;>8192;>204;>4096;>224;0;;0;;;;;;4;1;;;;
;30240;;;;>3001587958;>2867367814;>383;3;;11;10;1;11;;;;;;;;;;;;;;;;;>366;;;>283;0;0;;<74;;;;;;;;;0;0;;;;
;30243;;;;<4672324929;<4672322369;86;;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;0;0;;;;;;;;;;;;;;
;30246;;;;>31847206;>31847206;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<312492023;<314065911;79;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.022;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>1966080;>4272128;>3099240;;;;;<38250;>716403;;
;30201;;;;>1951381916;>2084074148;>84;4;;16;12;4;16;0;0;0;0;0;0;0;0;0;0;;;;;1;0;128;0;0;5;;;;;0;;0;;;;;;;;;;;
;30240;;;;>3001587958;>2867367814;>383;5;;11;10;1;11;;;;;;;;;;;;;;;;;>366;;;>283;;;;;;;;;;;;;5;;;;;
;30243;;;;<4670775761;<4670797793;86;4;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;0;;;;;
;30246;;;;>30297398;>30321990;;3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<312490607;<312490607;79;2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;>10.026;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>37888000;>34480128;>14206056;;;;;>724563;>44942395;;
;30201;;;;>1960948092;>2071394700;>84;8;;16;12;4;12;5;0;0;5;0;388;0;12;0;0;>337;;;;8;1;130;0;0;5;;;>77824;>2457;0;;0;;;;;;>237;6;;;;
;30240;;;;>2994075246;>2869419702;>385;6;;11;10;1;11;0;;;0;;>619;;0;;;>463;4;;;1;0;>366;;;>283;;;>225280;>5170;>4096;>191;;;;;;;>432;;;;;
;30243;;;;<4668084897;<4668081665;86;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;0;0;;;-1;-1;-1;-1;-1;-1;;;<282624;<6932;0;0;;;;;;;18;0;;;;
;30246;;;;>28422822;>28422310;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<25;-1;;-1;;;;;;15;;;;;
;30249;;;;<310827495;<310851927;79;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;<39;;;;;;;;;23;;;;;
;;>10.024;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;>2686976;>4227072;>1812816;;;;;<610523;<43211183;;
;30201;;;;>1947085612;>2079514972;>84;7;;16;12;4;16;0;0;0;0;0;697;0;0;0;0;>499;4;;;1;0;128;0;0;5;;;>237568;>5854;0;;0;;;;;;>160;6;;;;
;30240;;;;>3003405542;>2869185398;>385;6;;11;10;1;11;;;;;;0;;;;;0;0;;;;;>368;;;>283;;;0;0;;;;;;;;;0;0;;;;
;30243;;;;<4666512273;<4666534305;86;3;;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;-1;;;;;-1;-1;-1;-1;-1;-1;;;;;;;;;;;;;;;;;;
;30246;;;;>26848982;>26873574;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1;;-1;;;;;;;;;;;
;30249;;;;<310827543;<310827543;79;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;`;
    const mdcFileBlob = [new Blob([mdcFileContent], { type: 'text/plain' })];
    return new File(mdcFileBlob, 'mdcNameServerHistory.trc', {type: 'text/plain', lastModified: Number(new Date())});
  }
  static getOffset(timezone): number {
    const utcOffset = moment.tz(timezone).utcOffset();
    const currentOffset = moment.tz(getDefaultTimezone()).utcOffset();
    return (utcOffset - currentOffset) / 60;
  }
  static checkMdcTime(firstLineTimes, lastLineTimes, servicePort, result, firstLineExpect, lastLineExpect) {
    firstLineTimes[servicePort] = Math.round(result.time[servicePort][0]);
    lastLineTimes[servicePort] = Math.round(result.time[servicePort][result.time[servicePort].length - 1]);
    expect(firstLineTimes[servicePort]).toBe(firstLineExpect);
    expect(lastLineTimes[servicePort]).toBe(lastLineExpect);
  }
  static checkNonMdcTimeZone(service, startTime, endTime, servicePort, timezone, maxRow, firstLineTime, lastLineTime, done) {
    service.getChartContentFromFile(FSSpecHelper.getNonMdcFile(), startTime, endTime, servicePort, timezone, maxRow, null)
      .then(result => {
        const offset = FSSpecHelper.getOffset(timezone);
        FSSpecHelper._checkTimeZone(result, servicePort, firstLineTime, lastLineTime, offset);
        done();
      });
  }
  static checkMdcTimezone(service, startTime, endTime, port, timezone, maxRow, firstLineTime, lastLineTime, done) {
    service.getChartContentFromFile(FSSpecHelper.getMdcFile(), startTime, endTime, port, timezone, maxRow, null)
      .then(result => {
        const offset = FSSpecHelper.getOffset(timezone);
        let serverPort = '30201';
        FSSpecHelper._checkTimeZone(result, serverPort, firstLineTime[serverPort], lastLineTime[serverPort], offset);
        serverPort = '30203';
        FSSpecHelper._checkTimeZone(result, serverPort, firstLineTime[serverPort], lastLineTime[serverPort], offset);
        serverPort = '30207';
        FSSpecHelper._checkTimeZone(result, serverPort, firstLineTime[serverPort], lastLineTime[serverPort], offset);
        serverPort = '30240';
        FSSpecHelper._checkTimeZone(result, serverPort, firstLineTime[serverPort], lastLineTime[serverPort], offset);
        serverPort = '30243';
        FSSpecHelper._checkTimeZone(result, serverPort, firstLineTime[serverPort], lastLineTime[serverPort], offset);
        serverPort = '30246';
        FSSpecHelper._checkTimeZone(result, serverPort, firstLineTime[serverPort], lastLineTime[serverPort], offset);
        serverPort = '30249';
        FSSpecHelper._checkTimeZone(result, serverPort, firstLineTime[serverPort], lastLineTime[serverPort], offset);
        done();
      });
  }
  static checkMdcData(result, servicePort, expectedResult) {
    // indexserverMemUsed
    let dataLineFirst = result.data[servicePort][2][0];
    let dataLineLast = result.data[servicePort][2][result.data[servicePort][2].length - 1];

    expect({x: Math.round(dataLineFirst.x), y: Math.round(dataLineFirst.y)}).toEqual(expectedResult.indexserverMemUsed.firstLine);
    expect({x: Math.round(dataLineLast.x), y: Math.round(dataLineLast.y)}).toEqual(expectedResult.indexserverMemUsed.lastLine);

    // searchCount
    dataLineFirst = result.data[servicePort][21][0];
    dataLineLast = result.data[servicePort][21][result.data[servicePort][21].length - 1];

    expect({x: Math.round(dataLineFirst.x), y: Math.round(dataLineFirst.y)}).toEqual(expectedResult.searchCount.firstLine);
    expect({x: Math.round(dataLineLast.x), y: Math.round(dataLineLast.y)}).toEqual(expectedResult.searchCount.lastLine);

    // networkOut
    dataLineFirst = result.data[servicePort][58][0];
    dataLineLast = result.data[servicePort][58][result.data[servicePort][58].length - 1];

    expect({x: Math.round(dataLineFirst.x), y: Math.round(dataLineFirst.y)}).toEqual(expectedResult.networkOut.firstLine);
    expect({x: Math.round(dataLineLast.x), y: Math.round(dataLineLast.y)}).toEqual(expectedResult.networkOut.lastLine);
  }
}
