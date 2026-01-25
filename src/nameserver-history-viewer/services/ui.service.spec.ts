import { FSSpecHelper } from './file.service.spec';
import { TestBed } from '@angular/core/testing';
import { UIService } from './ui.service';
import { Item } from '../types';
import {FileService} from './file.service';

describe('UIService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UIService]
    });
  });

  it('#01 getHiddenColumns: predefined hidden columns + new hidden columns', () => {
    const service = TestBed.inject(UIService);
    let hiddenColumns = service.getHiddenColumns([Item.max, Item.average]);
    expect(hiddenColumns).toEqual([Item.yScaleGroup, Item.description, Item.max, Item.average]);

    hiddenColumns = service.getHiddenColumns(null);
    expect(hiddenColumns).toEqual([Item.yScaleGroup, Item.description]);
  });
  it('#02 getSelectionTableRows, convertUnitAndGenerateControlData and generateYScale', (done: DoneFn) => {
    const service = TestBed.inject(UIService);
    const fsService =  new FileService();

    fsService.getChartContentFromFile(FSSpecHelper.getNonMdcFile(), 0, 4102358400000, undefined, 'America/Los_Angeles', undefined, null)
      .then(result => {
        const port = 'DEFAULT';
        const defaultDisplayItems = ['memoryTotalResident', 'indexserverCpu', 'indexserverMemUsed', 'mvccNum'];
        service.convertUnitAndGenerateControlData(result.data[port], result.header, port).then(() => {
          service.generateYScale(port);
          const selectionTable = service.getSelectionTableRows(result.header, port, defaultDisplayItems);
          expect(selectionTable[0]).toEqual({ KPI: 'Host', header: true });
          expect(selectionTable[16]).toEqual({KPI: 'Memory Used', 'Y-Scale': 2000000, _YScaleGroup: 1, Unit: 'MB', Max: 26601, Average: 26526, Sum: '-', Last: 26524, Description: 'Memory used by Service', header: false, checked: true});
          expect(selectionTable[18]).toEqual({Average: 282, Description: 'Number of open handles', KPI: 'Handles', Last: 282, Max: 283, Sum: '-', Unit: '', 'Y-Scale': 500, checked: false, header: false, _YScaleGroup: 12});
          expect(selectionTable[32]).toEqual({KPI: 'Active Commit ID Range', 'Y-Scale': 5, _YScaleGroup: 12, Unit: '', Max: 4, Average: 0.15, Sum: '-', Last: 0, Description: 'Range between newest and oldest active commit ID', header: false, checked: false});
          expect(selectionTable[63]).toEqual({Average: 0, Description: 'Time used for writing to log backup', KPI: 'Log Backup Write Time',  Last: 0, Max: 0, Sum: 0, Unit: 'Sec/s', 'Y-Scale': 0.05, checked: false, header: false, _YScaleGroup: 8});
          done();
        });
      });
  });

});
