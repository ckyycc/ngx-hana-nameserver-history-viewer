import {
  calculateValue,
  getAbbreviatedFileName,
  isSamePort,
  getDefaultPort,
  isSameFile,
  isValidPort,
  validateData,
  getRealPorts,
  calculateValue4Time
} from './file-util';
import {getTimeFromTimeZone} from './time-util';


describe('FileUtil', () => {
  it('#01 calculateValue: ">" should act as "+"', () => {
    expect(calculateValue(123, '>12')).toEqual(135);
  });
  it('#02 calculateValue: "<" should act as "-"', () => {
    expect(calculateValue(123, '<12')).toEqual(111);
  });
  it('#03 calculateValue: "NOT > and NOT <" should act as "replace"', () => {
    expect(calculateValue(123, '12')).toEqual(12);
  });
  it('#04 getAbbreviatedFileName: should display the first 11 chars and last 11 chars of the name', () => {
    expect(getAbbreviatedFileName('hostname_nameserver_history - 1.trc')).toEqual('hostname_na...ory - 1.trc');
    expect(getAbbreviatedFileName('nameserver_history1.trc')).toEqual('nameserver_...istory1.trc');
  });
  it('#05 getAbbreviatedFileName: should display the full name if the length <= 22', () => {
    expect(getAbbreviatedFileName('nameserver_history.trc')).toEqual('nameserver_history.trc');
    expect(getAbbreviatedFileName('server_history.trc')).toEqual('server_history.trc');
  });
  it('#06 getRealPorts: should return [] when the giving port is null', () => {
    expect(getRealPorts(null)).toEqual([]);
  });
  it('#07 getRealPorts: should return the giving port directly when the giving "ports" is not null and includeDefault is true', () => {
    expect(getRealPorts(['30001', '30002', 'DEFAULT'], true)).toEqual(['30001', '30002', 'DEFAULT']);
    expect(getRealPorts(['30001', '30002'], true)).toEqual(['30001', '30002']);
  });
  it('#08 getRealPorts: should exclude the "default" port from the giving "ports" when the giving "ports" is not null and includeDefault is false', () => {
    expect(getRealPorts(['30001', '30002', 'DEFAULT'], false)).toEqual(['30001', '30002']);
    expect(getRealPorts(['30001', '30002'], false)).toEqual(['30001', '30002']);
  });
  it('#09 isSamePort: should return false when it is mdc and default port', () => {
    expect(isSamePort(getDefaultPort(), getDefaultPort(), true)).toBe(false);
  });
  it('#10 isSamePort: should return true when it is not (mdc + default port) and the selection is empty)', () => {
    expect(isSamePort(getDefaultPort(), null, false)).toBe(true);
    expect(isSamePort('30003', null, true)).toBe(true);
    expect(isSamePort('30003', null, false)).toBe(true);
  });
  it('#11 isSamePort: should return true when ports or the last two numbers of ports from file and selection are the same', () => {
    expect(isSamePort('30003', '30003', false)).toBe(true);
    expect(isSamePort('30003', '30003', true)).toBe(true);
    expect(isSamePort('35503', '30003', false)).toBe(true);
    expect(isSamePort('35503', '30003', true)).toBe(true);
  });
  it('#12 isSameFile: should return true when files(size, last modify date and name) are the same', () => {
    const nonMdcFileBlob = [new Blob(['1'], { type: 'text/plain' })];
    const lastModifiedDate = Number(new Date());
    const file1 =  new File(nonMdcFileBlob, 'test.trc', {type: 'text/plain', lastModified: lastModifiedDate});
    const file2 =  new File(nonMdcFileBlob, 'test.trc', {type: 'text/plain', lastModified: lastModifiedDate});
    expect(isSameFile(file1, file2)).toBe(true);
  });
  it('#13 isSameFile: should return false when files(size, last modify date and name) are not the same', () => {
    const nonMdcFileBlob1 = [new Blob(['1'], { type: 'text/plain' })];
    const nonMdcFileBlob2 = [new Blob(['12345'], { type: 'text/plain' })];

    const lastModifiedDate = Number(new Date());
    const file1 =  new File(nonMdcFileBlob1, 'test.trc', {type: 'text/plain', lastModified: lastModifiedDate});
    const file2 =  new File(nonMdcFileBlob1, 'test.trc', {type: 'text/plain', lastModified: lastModifiedDate + 1});
    const file3 =  new File(nonMdcFileBlob1, 'test1.trc', {type: 'text/plain', lastModified: lastModifiedDate});
    const file4 =  new File(nonMdcFileBlob2, 'test.trc', {type: 'text/plain', lastModified: lastModifiedDate});

    expect(isSameFile(file1, file2)).toBe(false);
    expect(isSameFile(file1, file3)).toBe(false);
    expect(isSameFile(file1, file4)).toBe(false);

  });
  it('#14 isValidPort: should return true when length of port is 5 and first character is 3', () => {
    expect(isValidPort('39995')).toBe(true);
  });
  it('#15 isValidPort: should return false when length of port is not 5 or first character is not 3', () => {
    expect(isValidPort('40005')).toBe(false);
    expect(isValidPort('3005')).toBe(false);
  });
  it('#16 validateData: should return true when length of data >=4 and header includes "time" and "host"', () => {
    expect(validateData([['host', 'time', 'test1'], ['1'], ['2'], ['3']])).toBe(true);
    expect(validateData([['host', 'time', 'test1'], ['1'], ['2'], ['3'], ['4']])).toBe(true);

  });
  it('#17 validateData: should return false when data is empty or length of data <=4 or header does not include "time" and "host"', () => {
    expect(validateData(null)).toBe(false);
    expect(validateData([])).toBe(false);
    expect(validateData([['host', 'time', 'test1'], ['1'], ['2']])).toBe(false);
    expect(validateData([['time', 'test1'], ['1'], ['2'], ['3']])).toBe(false);
    expect(validateData([['host', 'test1'], ['1'], ['2'], ['3']])).toBe(false);
  });
  it('#18 calculateValue4Time: ">" should act as "+"', () => {
    expect(calculateValue4Time(1536101895.920, '>12', 'Asia/Shanghai')).toEqual(1536101907.920);
  });
  it('#19 calculateValue4Time: "<" should act as "-"', () => {
    expect(calculateValue4Time(1536101895.920, '<12', 'Asia/Shanghai')).toEqual(1536101883.920);
  });
  it('#20 calculateValue4Time: "NOT > and NOT <" should act as "replace with selected timezone"', () => {
    expect(calculateValue4Time(1536101895.920, '1536101898.920', 'Asia/Shanghai')).toEqual(getTimeFromTimeZone(1536101898.920, 'Asia/Shanghai'));
  });
});
