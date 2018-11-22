import { getColorString } from './chart-util';

describe('Chart Util', () => {
  it('#01 getColorString: should return the string format of ColorRgba color', () => {
    expect(getColorString({red: 122, green: 133, blue: 101, alpha: 0.3})).toEqual('rgba(122, 133, 101, 0.3)');
  });
});
