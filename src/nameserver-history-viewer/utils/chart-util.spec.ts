import { getColorString, getNumberWithCommas } from './chart-util';

describe('Chart Util', () => {
  it('#01 getColorString: should return the string format of ColorRgba color', () => {
    expect(getColorString({red: 122, green: 133, blue: 101, alpha: 0.3})).toEqual('rgba(122, 133, 101, 0.3)');
  });
  it('#02 getNumberWithCommas: should format number with comma(s) if number >= 1000', () => {
    expect(getNumberWithCommas(1234567890.128423)).toEqual('1,234,567,890.128423');
    expect(getNumberWithCommas(1234567890.00000)).toEqual('1,234,567,890');
    expect(getNumberWithCommas(10000)).toEqual('10,000');
    expect(getNumberWithCommas(1000)).toEqual('1,000');
  });

  it('#03 getNumberWithCommas: should not format number with comma if number < 1000', () => {
    expect(getNumberWithCommas(999.999999)).toEqual('999.999999');
    expect(getNumberWithCommas(12)).toEqual('12');
    expect(getNumberWithCommas(12.3456)).toEqual('12.3456');
    expect(getNumberWithCommas(0.12345)).toEqual('0.12345');
    expect(getNumberWithCommas(0.1)).toEqual('0.1');
    expect(getNumberWithCommas(0)).toEqual('0');
  });
});
