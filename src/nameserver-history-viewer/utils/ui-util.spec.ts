import { calculateYScale, generatePorts, getDisplayPort, getRoundedValue, isEmptyData, isUnitTimeRelated } from './ui-util';
import { UnitType } from '../types';


describe('UI Util', () => {
  it('#01 calculateValue: "value <= 0" should return 100', () => {
    expect(calculateYScale(-1)).toEqual(100);
    expect(calculateYScale(0)).toEqual(100);
  });
  it('#02 calculateValue: "value > 0 and Math.pow( 10, Math.floor(Math.log10(value))) >= value, should return Math.pow( 10, Math.floor(Math.log10(value)))', () => {
    expect(calculateYScale(100)).toEqual(100);
  });
  it('#03 calculateValue: "value > 0 and 2* Math.pow( 10, Math.floor(Math.log10(value))) >= value, should return 2 * Math.pow( 10, Math.floor(Math.log10(value)))', () => {
    expect(calculateYScale(190)).toEqual(200);
  });
  it('#04 calculateValue: "value > 0 and 5* Math.pow( 10, Math.floor(Math.log10(value))) >= value, should return 5 * Math.pow( 10, Math.floor(Math.log10(value)))', () => {
    expect(calculateYScale(45)).toEqual(50);
  });
  it('#05 calculateValue: "value > 0 and 5* Math.pow( 10, Math.floor(Math.log10(value))) < value, should return 10 * Math.pow( 10, Math.floor(Math.log10(value)))', () => {
    expect(calculateYScale(55)).toEqual(100);
  });
  it('#06 isEmptyData: should return false if any column is not empty', () => {
    expect(isEmptyData({'30003': [[{x: 1, y: 1}]]})).toBe(false);
    expect(isEmptyData({'30003': [[{x: 1, y: 1}], [{x: 2, y: 2}]]})).toBe(false);
    expect(isEmptyData({'30003': [[{x: 1, y: 1}], null, undefined]})).toBe(false);
  });
  it('#07 isEmptyData: should return true if all columns are empty', () => {
    expect(isEmptyData({'30003': [[], null, undefined]})).toBe(true);
    expect(isEmptyData({'30003': [[], [], []]})).toBe(true);
    expect(isEmptyData({'30003': [[]]})).toBe(true);
    expect(isEmptyData({'30003': [undefined]})).toBe(true);
  });
  it('#08 getDisplayPort: should return undefined if the "ports" is empty', () => {
    expect(getDisplayPort(null, '30003')).toBe(undefined);
    expect(getDisplayPort([], '30003')).toBe(undefined);
  });
  it('#09 getDisplayPort: should return ports[0] if length of "ports" is 1 and the selected port is null or empty', () => {
    expect(getDisplayPort(['30003'], '')).toBe('30003');
    expect(getDisplayPort(['30003'], null)).toBe('30003');
  });
  it('#10 getDisplayPort: should return the first non-xsengine non-nameserver port from "ports" if length of "ports" > 1 and "ports" contains port for xsengine or nameserver and the selected port is null or empty', () => {
    expect(getDisplayPort(['30001', '30003', '30007', '30040'], '')).toBe('30003');
    expect(getDisplayPort(['30001', '30003', '300043', '30040'], null)).toBe('30003');
    expect(getDisplayPort(['30001', '30007', '30003', '30040'], null)).toBe('30003');
    expect(getDisplayPort(['30007', '30003', '30040'], null)).toBe('30003');
    expect(getDisplayPort(['30040', '30001', '30043'], null)).toBe('30040');
  });
  it('#11 getDisplayPort: should return the first port from "ports" if length of "ports" > 1 and "ports" does not contain port for xsengine or nameserver and the selected port is null or empty', () => {
    expect(getDisplayPort(['30017', '30003', '30004', '30040'], '')).toBe('30017');
  });
  it('#12 generatePorts: should return null if the provided ports is null', () => {
    expect(generatePorts(null, '')).toBe(null);
  });
  it('#13 generatePorts: should return the ports with the first non-xsengine, non-nameserver, non-scriptserver...port being selected if the selected port is null or empty', () => {
    expect(generatePorts(['30001', '30007', '30003'], null)).toEqual([{id: '30001', text: '30001'}, {id: '30007', text: '30007'}, {id: '30003', text: '30003', selected: true}]);
    expect(generatePorts(['30001', '30007', '30003'], '')).toEqual([{id: '30001', text: '30001'}, {id: '30007', text: '30007'}, {id: '30003', text: '30003', selected: true}]);
    expect(generatePorts(['30002', '30004', '30003'], '')).toEqual([{id: '30002', text: '30002'}, {id: '30004', text: '30004'}, {id: '30003', text: '30003' , selected: true}]);
    expect(generatePorts(['30017', '30004', '30003'], '')).toEqual([{id: '30017', text: '30017', selected: true}, {id: '30004', text: '30004'}, {id: '30003', text: '30003'}]);
  });
  it('#14 generatePorts: should return the ports with the provided "port" being selected if the selected port is not empty and the provided "port" exists in the "ports"', () => {
    expect(generatePorts(['30001', '30007', '30003'], '30007')).toEqual([{id: '30001', text: '30001'}, {id: '30007', text: '30007', selected: true}, {id: '30003', text: '30003'}]);
  });
  it('#15 generatePorts: should return the ports with the first item of "ports" being selected if the selected port is not empty and the provided "port" does not exist in the "ports"', () => {
    expect(generatePorts(['30001', '30007', '30003'], '30009')).toEqual([{id: '30001', text: '30001', selected: true}, {id: '30007', text: '30007'}, {id: '30003', text: '30003'}]);
  });
  it('#16 getRoundedValue: should round the value to integer if value >= 10', () => {
  // get rounded value: if value >= 10, round to integer; if value < 10, round to at most 2 decimal places
    expect(getRoundedValue(10.01)).toBe(10);
    expect(getRoundedValue(1999.99999)).toBe(2000);
  });
  it('#17 getRoundedValue: should round the value to at most 2 decimal if value < 10', () => {
    expect(getRoundedValue(9.01)).toBe(9.01);
    expect(getRoundedValue(9.1557)).toBe(9.16);
    expect(getRoundedValue(9.154)).toBe(9.15);

  });
  it('#18 isUnitTimeRelated: should return true if the unit is in (UnitType.TypeMBSec, UnitType.TypeSec, UnitType.TypeSecSec)', () => {
    expect(isUnitTimeRelated(UnitType.TypeMBSec)).toBe(true);
    expect(isUnitTimeRelated(UnitType.TypeSec)).toBe(true);
    expect(isUnitTimeRelated(UnitType.TypeSecSec)).toBe(true);
  });
  it('#19 isUnitTimeRelated: should return false if the unit is not in (UnitType.TypeMBSec, UnitType.TypeSec, UnitType.TypeSecSec)', () => {
    expect(isUnitTimeRelated(UnitType.TypeMB)).toBe(false);
    expect(isUnitTimeRelated(UnitType.TypeGB)).toBe(false);
    expect(isUnitTimeRelated(UnitType.TypeEA)).toBe(false);
  });
});
