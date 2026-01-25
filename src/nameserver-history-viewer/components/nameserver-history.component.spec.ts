import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NameServerHistoryComponent } from './nameserver-history.component';
import { FSSpecHelper } from '../services/file.service.spec';
import { ChartService, FileService, UIService } from '../services';
import { Alert } from '../types';
import * as utils from '../utils';
import * as fileUtil from '../utils/file-util';

describe('NameServerHistoryComponent', () => {
  let component: NameServerHistoryComponent;
  let event;
  let mdcFile;
  let spyNameServerHistoryComponent;

  beforeEach(() => {
    mdcFile = FSSpecHelper.getMdcFile();
    event = {};
    event['target'] = {};
    TestBed.configureTestingModule({providers: [NameServerHistoryComponent, FileService, ChartService, UIService]});
    component = TestBed.inject(NameServerHistoryComponent);

    spyNameServerHistoryComponent = jasmine.createSpyObj(
      'NameServerHistoryComponent', ['_buildChartFromDataFile', '_readPortsFromFile', '_initChartEnv', '_buildChart']);

    // set spy on _readPortsFromFile
    spyNameServerHistoryComponent['_readPortsFromFile'].and.returnValue(Promise.resolve(''));
    // set spy on _initChartEnv
    spyNameServerHistoryComponent['_initChartEnv'].and.returnValue(Promise.resolve(''));
    // set spy on _buildChartFromDataFile
    spyNameServerHistoryComponent['_buildChartFromDataFile'].and.returnValue(Promise.resolve(''));
    // spyNameServerHistoryComponent['_buildChart'].and.returnValue(Promise.resolve(''));


    // set spy on getFileFromDrop (file-util.ts)
    // jasmine.createSpy('getFileFromDrop').and.resolveTo(mdcFile);
    // spyOn(fileUtil, 'getFileFromDrop').and.returnValue(Promise.resolve(mdcFile));
    // jasmine.createSpy('getFileFromDrop', fileUtil.getFileFromDrop).and.returnValue(Promise.resolve(mdcFile));

    // set spy on getTimeRangeString (file-util.ts)
    jasmine.createSpy('getTimeRangeString').and.returnValue('2000-01-01 ~ 2000-01-02');
    // spyOn(utils, 'getTimeRangeString').and.returnValue('2000-01-01 ~ 2000-01-02');
    // set spy on isEmptyData (ui-util.ts)
    jasmine.createSpy('isEmptyData').and.returnValue(false);
    // spyUtil = spyOn(utils, 'isEmptyData').and.returnValue(false);

    // set spy on resetChart (chartService)
    spyOn(ChartService.prototype, 'resetChart').and.returnValue(Promise.resolve(''));
    // set spy on destroyChart(chartService)
    spyOn(ChartService.prototype, 'destroyChart').and.returnValue(Promise.resolve(''));
    // // set spy on convertUnitAndGenerateControlData(uiService)
    // spyOn(UIService.prototype, 'convertUnitAndGenerateControlData').and.returnValue(Promise.resolve(''));
    // // set spy on getHeader(uiService)
    // spyOn(UIService.prototype, 'getHeader').and.returnValue([{headerKey: 'key1', headerText: 'test1'}]);
    // spyOn(UIService.prototype, 'getYScale').and.returnValue('');

  });
  it('#01 fileSelected: should skip the same file', async () => {
    const file = FSSpecHelper.getMdcFile();
    event['target'].files = [file];
    component.file = file;
    await component.fileSelected(event);
    expect(component.abbreviatedFileName).toEqual('or Drop File Here');
    expect(component.enableShowChartButton).toBeFalsy();
  });
  it('#02 fileSelected: should not skip if the selected file is a different one', async () => {
    event['target'].files = [FSSpecHelper.getMdcFile()];
    component.file = FSSpecHelper.getNonMdcFile();
    await component.fileSelected(event);
    expect(component.abbreviatedFileName).toEqual(utils.getAbbreviatedFileName('mdcNameServerHistory.trc'));
    expect(component.enableShowChartButton).toBeTruthy();
  });
  it('#03 fileDropped: should skip the same file', fakeAsync(() => {
    component.abbreviatedFileName = 'or Drop File Here';
    component.file = mdcFile;
    component.fileDropped({file: mdcFile});
    tick();
    expect(component.abbreviatedFileName).toEqual('or Drop File Here');
    expect(component.enableShowChartButton).toBeFalsy();
  }));
  it('#04 fileDropped: should not skip if the selected file is a different one', fakeAsync(async() => {
    component.file = FSSpecHelper.getNonMdcFile();
    component.fileDropped({file: FSSpecHelper.getMdcFile()});
    tick();
    expect(component.abbreviatedFileName).toEqual(utils.getAbbreviatedFileName('mdcNameServerHistory.trc'));
    expect(component.enableShowChartButton).toBe(true);
  }));
  it('#05 loadPorts: should disable showChartButton and enable progress bar', () => {
    component.file = FSSpecHelper.getMdcFile();
    component.loadPorts();
    expect(component.showReadFileProgress).toBe(true);
    expect(component.enableShowChartButton).toBe(false);
  });
  it(`#06 _initPortSelector: should: 1. set the progress to 0; 2. enable showChartButton; 3. disable progress bar when (1) loading ports or (2) the file does not contain the selected Port`, (done: DoneFn) => {
    component['_initPortSelector'](['30001', '30015']).then(() => {
      expect(component.readProgress).toBe(0);
      expect(component.showReadFileProgress).toBe(false);
      expect(component.enableShowChartButton).toBe(true);
      done();
    });
  });
  it('#07 resetChart: should disable resetChartButton', () => {
    component.resetChart();
    expect(component.enableResetChartButton).toBe(false);
  });
  it('#08 showChart: should disable resetChartButton and showChartButton', () => {
    component.showChart();
    expect(component.enableResetChartButton).toBe(false);
    expect(component.enableShowChartButton).toBe(false);
  });
  it('#09 showChart: should display error message if start time > end time', fakeAsync(() => {
    component.dateTimeRange = [new Date(1323232323200), new Date(1223232320000)];
    component.showChart();
    tick();
    expect(component.alertMessage).toEqual('Time range is not correct.');
    expect(component.alertType).toEqual(Alert.error);
  }));
  it('#10 showChart: should enable readFileProgress if file is selected', fakeAsync(() => {
    component.file = mdcFile;
    component.showChart();
    tick();
    expect(component.showReadFileProgress).toBeTruthy();
  }));
  it('#11 _initChartEnv: should hide chartArea', (done: DoneFn) => {
    component.file = mdcFile;
    component['_initChartEnv']().then(() => {
      expect(component.showChartFlag).toBe(false);
      done();
    });
  });
  it('#12 _initChartEnv: should clear all other objects when not switching port', (done: DoneFn) => {
    component.file = mdcFile;
    component.time = {'30001': [1, 2, 3]};
    component.data = {'30001': [[{x: 1, y: 2}]]};
    component.header = [{key: 'test', text: 'test'}];
    component.host = 'TEST';
    component.tableSource = ['TEST'];
    component['_initChartEnv']().then(() => {
      expect(component.time).toEqual({});
      expect(component.data).toEqual({});
      expect(component.header).toEqual([]);
      expect(component.host).toEqual('nameserver history file');
      expect(component.tableSource).toEqual(undefined);
      done();
    });
  });
  it('#13 _initChartEnv: should not clear other objects when doing switch port', (done: DoneFn) => {
    component.file = mdcFile;
    component.time = {'30001': [1, 2, 3]};
    component.data = {'30001': [[{x: 1, y: 2}]]};
    component.header = [{key: 'test', text: 'test'}];
    component.host = 'TEST';
    component.tableSource = ['TEST'];
    component['_initChartEnv'](true).then(() => {
      expect(component.time).toEqual({'30001': [1, 2, 3]});
      expect(component.data).toEqual({'30001': [[{x: 1, y: 2}]]});
      expect(component.header).toEqual([{key: 'test', text: 'test'}]);
      expect(component.host).toEqual('TEST');
      expect(component.tableSource).toEqual( ['TEST']);
      done();
    });
  });
  it('#14 switchPortForChart: should show warning message if data does not exist', () => {
    component.time = {'30001': [1111, 2222], '30003': [1111, 2222]};
    component.file = mdcFile;
    const port = '30007';
    component.switchPortForChart(port);
    expect(component.alertMessage).toEqual(`Data of port:${port} is not loaded, please load the data first by clicking the "Show" button.`);
    expect(component.alertType).toEqual(Alert.info);
  });
  it('#15 switchPortForChart: should disable the showChart button and the resetChart button', () => {
    component.time = {'30001': [1111, 2222], '30003': [1111, 2222]};
    component.file = mdcFile;
    component.switchPortForChart('30001');
    expect(component.enableShowChartButton).toBe(false);
    expect(component.enableResetChartButton).toBe(false);
  });

  // it('#_buildChartFromDataFile: should show Maximum number of lines reached if result gets aborted', fakeAsync(() => {
  //   // set spy on getChartContentFromFile(fileService)
  //   spyOn(FileService.prototype, 'getChartContentFromFile').and.returnValue(Promise.resolve({time: {'30001': [21000000000, 21000000000]},
  //     data: {'30001': [21000000000, 21000000000]}, header: ['1', '2'], aborted: true}));
  //   component['_buildChartFromDataFile'](null, null, null, null);
  //   tick(15000);
  //   expect(component.alertMessage).toEqual('Maximum number of lines reached. Processed time range is: 2000-01-01 ~ 2000-01-02.');
  //   expect(component.alertType).toEqual(Alert.warning);
  // }));

  // it('#showChart: should catch and display error message (and hide the readFileProgress) if error occurs', fakeAsync(() => {
  //   // spyNameServerHistoryComponent['_buildChartFromDataFile'].and.returnValue(Promise.reject('In testing: error occurs!'));
  //   spyNameServerHistoryComponent['_initChartEnv'].and.callFake(() => Promise.reject('In testing: error occurs!'));
  //   component.file = mdcFile;
  //   component.showChart();
  //   tick();
  //   expect(component.alertMessage).toEqual('In testing: error occurs!');
  //   expect(component.alertType).toEqual(Alert.error);
  //   expect(component.showReadFileProgress).toBe(false);
  // }));
});
