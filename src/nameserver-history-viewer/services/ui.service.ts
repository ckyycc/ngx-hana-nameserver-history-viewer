import { Injectable } from '@angular/core';
import { getIgnoredLineNumFromTail, isUnitTimeRelated, getValueByUnit, getRoundedValue, calculateYScale } from '../utils';
import {
  ColorRgba,
  LoadHistoryInfo,
  LoadHistoryInfoBackup,
  LoadHistoryInfoColumnStore,
  LoadHistoryInfoHost,
  LoadHistoryInfoIndexServer,
  LoadHistoryInfoItem,
  LoadHistoryInfoPersistence,
  LoadHistoryInfoRowStore,
  LoadHistoryInfoSessionAdmissionControl,
  LoadHistoryInfoSQL,
  LoadHistoryInfoSyncPrimitives,
  LoadHistoryInfoThreads,
  ChartContentDataItem,
  ChartContentHeader,
  ScaleGroup,
  Unit,
  UnitType,
  Item
} from '../types';

// Using dynamic flag to fix the issue of ng-packagr #696: Lambda not supported
// @dynamic
@Injectable()
export class UIService {
  private readonly _DEFAULT_DISPLAY_ITEMS: string[] = ['cpuUsed', 'indexserverMemUsed', 'mvccNum'];
  private readonly _HIDED_COLUMNS: string[] = [Item.yScaleGroup, Item.description];
  private readonly _MEASURE_COLUMNS: string[] = [Item.max, Item.average, Item.sum, Item.last];
  private _loadHistoryInfos = {};

  /**
   * get the 65 generated colors
   */
  public static getColors(alpha: number = null): ColorRgba[] {
    if (alpha == null) {
      alpha = 0.5;
    }
    return [
      // this._getRgbColor(157, 134, 216, alpha),
      // this._getRgbColor(90, 178, 45, alpha),
      // this._getRgbColor(155, 58, 181, alpha),
      // this._getRgbColor(72, 200, 91, alpha),
      // this._getRgbColor(209, 108, 231, alpha),
      // this._getRgbColor(152, 190, 48, alpha),
      // this._getRgbColor(151, 102, 225, alpha),
      // this._getRgbColor(131, 205, 97, alpha),
      // this._getRgbColor(196, 49, 159, alpha),
      // this._getRgbColor(58, 195, 125, alpha),
      // this._getRgbColor(234, 99, 199, alpha),
      // this._getRgbColor(49, 140, 46, alpha),
      // this._getRgbColor(97, 93, 205, alpha),
      // this._getRgbColor(187, 187, 52, alpha),
      // this._getRgbColor(72, 117, 215, alpha),
      // this._getRgbColor(223, 169, 57, alpha),
      // this._getRgbColor(145, 72, 160, alpha),
      // this._getRgbColor(98, 151, 50, alpha),
      // this._getRgbColor(235, 72, 148, alpha),
      // this._getRgbColor(93, 204, 173, alpha),
      // this._getRgbColor(216, 48, 82, alpha),
      // this._getRgbColor(70, 202, 210, alpha),
      // this._getRgbColor(221, 79, 37, alpha),
      // this._getRgbColor(95, 199, 242, alpha),
      // this._getRgbColor(227, 125, 43, alpha),
      // this._getRgbColor(106, 151, 222, alpha),
      // this._getRgbColor(145, 140, 34, alpha),
      // this._getRgbColor(204, 125, 217, alpha),
      // this._getRgbColor(155, 184, 89, alpha),
      // this._getRgbColor(189, 42, 115, alpha),
      // this._getRgbColor(121, 191, 128, alpha),
      // this._getRgbColor(186, 72, 147, alpha),
      // this._getRgbColor(69, 140, 80, alpha),
      // this._getRgbColor(229, 92, 132, alpha),
      // this._getRgbColor(60, 158, 129, alpha),
      // this._getRgbColor(232, 88, 75, alpha),
      // this._getRgbColor(40, 163, 169, alpha),
      // this._getRgbColor(169, 49, 32, alpha),
      // this._getRgbColor(65, 159, 208, alpha),
      // this._getRgbColor(182, 87, 35, alpha),
      // this._getRgbColor(72, 106, 164, alpha),
      // this._getRgbColor(177, 120, 33, alpha),
      // this._getRgbColor(112, 89, 160, alpha),
      // this._getRgbColor(197, 180, 98, alpha),
      // this._getRgbColor(157, 64, 115, alpha),
      // this._getRgbColor(83, 107, 40, alpha),
      // this._getRgbColor(230, 133, 192, alpha),
      // this._getRgbColor(43, 111, 77, alpha),
      // this._getRgbColor(173, 50, 86, alpha),
      // this._getRgbColor(146, 156, 90, alpha),
      // this._getRgbColor(189, 167, 233, alpha),
      // this._getRgbColor(115, 103, 28, alpha),
      // this._getRgbColor(195, 128, 176, alpha),
      // this._getRgbColor(233, 153, 92, alpha),
      // this._getRgbColor(145, 83, 131, alpha),
      // this._getRgbColor(221, 171, 122, alpha),
      // this._getRgbColor(148, 69, 90, alpha),
      // this._getRgbColor(163, 128, 72, alpha),
      // this._getRgbColor(227, 136, 155, alpha),
      // this._getRgbColor(141, 84, 41, alpha),
      // this._getRgbColor(228, 128, 123, alpha),
      // this._getRgbColor(194, 120, 80, alpha),
      // this._getRgbColor(196, 78, 75, alpha),
      // this._getRgbColor(237, 134, 104, alpha),
      // this._getRgbColor(174, 89, 90, alpha),

      // this._getRgbColor(55, 173, 125, alpha),
      // this._getRgbColor(208, 50, 163, alpha),
      // this._getRgbColor(76, 201, 86, alpha),
      // this._getRgbColor(138, 60, 186, alpha),
      // this._getRgbColor(124, 194, 63, alpha),
      // this._getRgbColor(180, 101, 229, alpha),
      // this._getRgbColor(79, 157, 36, alpha),
      // this._getRgbColor(152, 114, 231, alpha),
      // this._getRgbColor(165, 186, 46, alpha),
      // this._getRgbColor(88, 80, 188, alpha),
      // this._getRgbColor(225, 179, 56, alpha),
      // this._getRgbColor(83, 121, 236, alpha),
      // this._getRgbColor(184, 166, 42, alpha),
      // this._getRgbColor(156, 56, 156, alpha),
      // this._getRgbColor(57, 209, 143, alpha),
      // this._getRgbColor(237, 108, 211, alpha),
      // this._getRgbColor(57, 146, 60, alpha),
      // this._getRgbColor(191, 89, 192, alpha),
      // this._getRgbColor(103, 193, 106, alpha),
      // this._getRgbColor(188, 46, 129, alpha),
      // this._getRgbColor(68, 209, 187, alpha),
      // this._getRgbColor(226, 60, 86, alpha),
      // this._getRgbColor(88, 210, 204, alpha),
      // this._getRgbColor(220, 78, 46, alpha),
      // this._getRgbColor(84, 185, 229, alpha),
      // this._getRgbColor(216, 144, 33, alpha),
      // this._getRgbColor(74, 97, 176, alpha),
      // this._getRgbColor(225, 123, 49, alpha),
      // this._getRgbColor(127, 151, 228, alpha),
      // this._getRgbColor(104, 127, 33, alpha),
      // this._getRgbColor(159, 122, 214, alpha),
      // this._getRgbColor(148, 177, 82, alpha),
      // this._getRgbColor(240, 83, 148, alpha),
      // this._getRgbColor(59, 129, 68, alpha),
      // this._getRgbColor(207, 48, 106, alpha),
      // this._getRgbColor(117, 198, 153, alpha),
      // this._getRgbColor(179, 46, 52, alpha),
      // this._getRgbColor(60, 185, 197, alpha),
      // this._getRgbColor(178, 95, 37, alpha),
      // this._getRgbColor(71, 139, 196, alpha),
      // this._getRgbColor(191, 172, 85, alpha),
      // this._getRgbColor(126, 77, 153, alpha),
      // this._getRgbColor(133, 185, 115, alpha),
      // this._getRgbColor(219, 134, 217, alpha),
      // this._getRgbColor(42, 106, 69, alpha),
      // this._getRgbColor(198, 90, 158, alpha),
      // this._getRgbColor(84, 154, 115, alpha),
      // this._getRgbColor(153, 62, 118, alpha),
      // this._getRgbColor(31, 147, 131, alpha),
      // this._getRgbColor(221, 104, 98, alpha),
      // this._getRgbColor(99, 104, 162, alpha),
      // this._getRgbColor(218, 159, 90, alpha),
      // this._getRgbColor(197, 155, 216, alpha),
      // this._getRgbColor(100, 109, 45, alpha),
      // this._getRgbColor(236, 134, 172, alpha),
      // this._getRgbColor(166, 172, 108, alpha),
      // this._getRgbColor(173, 106, 153, alpha),
      // this._getRgbColor(134, 102, 30, alpha),
      // this._getRgbColor(192, 84, 111, alpha),
      // this._getRgbColor(166, 129, 78, alpha),
      // this._getRgbColor(147, 61, 89, alpha),
      // this._getRgbColor(229, 142, 104, alpha),
      // this._getRgbColor(165, 85, 84, alpha),
      // this._getRgbColor(227, 138, 138, alpha),
      // this._getRgbColor(154, 76, 43, alpha),

      this._getRgbColor(101, 123, 236, alpha),
      this._getRgbColor(133, 92, 31, alpha),
      this._getRgbColor(166, 188, 58, alpha),
      this._getRgbColor(85, 82, 185, alpha),
      this._getRgbColor(151, 216, 100, alpha),
      this._getRgbColor(74, 41, 132, alpha),
      this._getRgbColor(76, 220, 139, alpha),
      this._getRgbColor(164, 61, 157, alpha),
      this._getRgbColor(106, 194, 98, alpha),
      this._getRgbColor(230, 124, 220, alpha),
      this._getRgbColor(52, 132, 42, alpha),
      this._getRgbColor(151, 120, 226, alpha),
      this._getRgbColor(141, 188, 77, alpha),
      this._getRgbColor(172, 104, 202, alpha),
      this._getRgbColor(100, 139, 30, alpha),
      this._getRgbColor(59, 120, 214, alpha),
      this._getRgbColor(208, 182, 60, alpha),
      this._getRgbColor(60, 64, 138, alpha),
      this._getRgbColor(229, 167, 63, alpha),
      this._getRgbColor(108, 137, 229, alpha),
      this._getRgbColor(171, 142, 24, alpha),
      this._getRgbColor(55, 158, 231, alpha),
      this._getRgbColor(212, 129, 34, alpha),
      this._getRgbColor(72, 98, 169, alpha),
      this._getRgbColor(164, 179, 76, alpha),
      this._getRgbColor(106, 45, 113, alpha),
      this._getRgbColor(109, 198, 122, alpha),
      this._getRgbColor(204, 60, 126, alpha),
      this._getRgbColor(75, 183, 126, alpha),
      this._getRgbColor(190, 79, 156, alpha),
      this._getRgbColor(50, 143, 75, alpha),
      this._getRgbColor(208, 54, 66, alpha),
      this._getRgbColor(54, 222, 230, alpha),
      this._getRgbColor(174, 48, 31, alpha),
      this._getRgbColor(67, 194, 158, alpha),
      this._getRgbColor(208, 65, 86, alpha),
      this._getRgbColor(133, 185, 115, alpha),
      this._getRgbColor(134, 40, 97, alpha),
      this._getRgbColor(159, 192, 105, alpha),
      this._getRgbColor(156, 114, 193, alpha),
      this._getRgbColor(194, 177, 82, alpha),
      this._getRgbColor(124, 147, 220, alpha),
      this._getRgbColor(197, 97, 37, alpha),
      this._getRgbColor(217, 146, 217, alpha),
      this._getRgbColor(53, 106, 42, alpha),
      this._getRgbColor(174, 42, 81, alpha),
      this._getRgbColor(93, 115, 35, alpha),
      this._getRgbColor(214, 116, 167, alpha),
      this._getRgbColor(170, 161, 86, alpha),
      this._getRgbColor(142, 44, 83, alpha),
      this._getRgbColor(224, 156, 78, alpha),
      this._getRgbColor(225, 113, 151, alpha),
      this._getRgbColor(153, 116, 29, alpha),
      this._getRgbColor(226, 106, 129, alpha),
      this._getRgbColor(212, 170, 103, alpha),
      this._getRgbColor(143, 41, 49, alpha),
      this._getRgbColor(218, 139, 87, alpha),
      this._getRgbColor(149, 57, 74, alpha),
      this._getRgbColor(233, 113, 80, alpha),
      this._getRgbColor(124, 40, 22, alpha),
      this._getRgbColor(237, 100, 95, alpha),
      this._getRgbColor(160, 70, 29, alpha),
      this._getRgbColor(223, 111, 112, alpha),
      this._getRgbColor(178, 65, 56, alpha),
      this._getRgbColor(215, 122, 96, alpha),
    ];
  }

  private static get _unitType(): any {
    const unitType = {};
    unitType[Unit.PCT] = UnitType.TypeEA;
    unitType[Unit.MS] = UnitType.TypeEA;
    unitType[Unit.Empty] = UnitType.TypeEA;
    unitType[Unit.GB] = UnitType.TypeGB;
    unitType[Unit.MB] = UnitType.TypeMB;
    unitType[Unit.MBPerSec] = UnitType.TypeMBSec;
    unitType[Unit.SecPerSec] = UnitType.TypeSecSec;
    unitType[Unit.StmtPerSec] = UnitType.TypeSec;
    unitType[Unit.ReqPerSec] = UnitType.TypeSec;
    unitType[Unit.ColPerSec] = UnitType.TypeSec;
    return unitType;
  }

  /**
   * get yScale group list from the enum ScaleGroup
   */
  private static get _YScaleGroupList(): any[] {
    return Object.keys(ScaleGroup).filter(key => !isNaN(Number(ScaleGroup[key]))).map(key => ScaleGroup[key]);
  }

  /**
   * Generate one item by the provided attributes and values
   * @param args the dynamic parameter of [attribute, value]
   */
  private static _generateLoadHistoryInfoItem(...args): LoadHistoryInfoItem {
    const obj = {};
    if (!args || args.length <= 0) {
      return obj;
    }

    args.forEach(item => {
      if (item && item.length >= 2) {
        obj[item[0]] = item[1];
      }
    });
    return obj;
  }

  /**
   * generate the loadHistoryInfo object with default values.
   */
  private static _generateLoadHistoryInfo(): LoadHistoryInfo {
    // minimum value for YScale of swapIn, swapOut, indexserverSwapIn is 100 (according to hana studio)
    const infoItem = UIService._generateLoadHistoryInfoItem; // just for making the name shorter...
    const cpuUsed                         = infoItem([Item.kpi, 'CPU'                        ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.CPU    ], [Item.unit, Unit.PCT        ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'CPU Used by all processes']);
    const memoryResident                  = infoItem([Item.kpi, 'Database Resident Memory'   ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Memory ], [Item.unit, Unit.MB         ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Physical memory used for all HANA processes']);
    const memoryTotalResident             = infoItem([Item.kpi, 'Total Resident Memory'      ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Memory ], [Item.unit, Unit.MB         ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Physical memory used for all processes']);
    const memoryUsed                      = infoItem([Item.kpi, 'Database Used Memory'       ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Memory ], [Item.unit, Unit.MB         ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Memory used for all HANA processes']);
    const memoryLimit                     = infoItem([Item.kpi, 'Database Allocation Limit'  ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Memory ], [Item.unit, Unit.MB         ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Memory allocation limit for all processes of HANA instance']);
    const memorySize                      = infoItem([Item.kpi, 'Physical Memory Size'       ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Memory ], [Item.unit, Unit.MB         ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Physical memory size']);
    const diskUsed                        = infoItem([Item.kpi, 'Disk Used'                  ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Disk   ], [Item.unit, Unit.GB         ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Disk used']);
    const diskSize                        = infoItem([Item.kpi, 'Disk Size'                  ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Disk   ], [Item.unit, Unit.GB         ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Disk size']);
    const networkIn                       = infoItem([Item.kpi, 'Network In'                 ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Network], [Item.unit, Unit.MBPerSec   ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Bytes read from network by all processes']);
    const networkOut                      = infoItem([Item.kpi, 'Network Out'                ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Network], [Item.unit, Unit.MBPerSec   ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Bytes written to network by all processes']);
    const swapIn                          = infoItem([Item.kpi, 'Swap In'                    ], [Item.yScale, 100], [Item.yScaleGroup, ScaleGroup.Swap   ], [Item.unit, Unit.MBPerSec   ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Bytes read from swap by all processes (pswpin line in /proc/vmstat * sysconf(_SC_PAGESIZE))']);
    const swapOut                         = infoItem([Item.kpi, 'Swap Out'                   ], [Item.yScale, 100], [Item.yScaleGroup, ScaleGroup.Swap   ], [Item.unit, Unit.MBPerSec   ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Bytes written To swap by all processes (pswpout line in /proc/vmstat * sysconf(_SC_PAGESIZE))']);
    const indexserverCpu                  = infoItem([Item.kpi, 'Index Server CPU'           ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.CPU    ], [Item.unit, Unit.PCT        ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'CPU used by Service']);
    const indexserverCpuSys               = infoItem([Item.kpi, 'System CPU'                 ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.CPU    ], [Item.unit, Unit.PCT        ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'OS Kernel/System CPU used by Service']);
    const indexserverMemUsed              = infoItem([Item.kpi, 'Memory Used'                ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Memory ], [Item.unit, Unit.MB         ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Memory used by Service']);
    const indexserverMemLimit             = infoItem([Item.kpi, 'Memory Allocation Limit'    ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Memory ], [Item.unit, Unit.MB         ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Memory allocation limit for Service']);
    const indexserverHandles              = infoItem([Item.kpi, 'Handles'                    ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of open handles']);
    const indexserverPingtime             = infoItem([Item.kpi, 'Ping Time'                  ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.MS         ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Duration of Service ping request (THREAD_METHOD=\'__nsWatchdog\'). This request includes the collection of service specific KPI\'s']);
    const indexserverSwapIn               = infoItem([Item.kpi, 'Index Server Swap In'       ], [Item.yScale, 100], [Item.yScaleGroup, ScaleGroup.Swap   ], [Item.unit, Unit.MBPerSec   ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Bytes read from swap by Service (column 12(majflt) in /proc/<pid>/stat * sysconf(_SC_PAGESIZE))']);
    const sqlConnections                  = infoItem([Item.kpi, 'Open Connections'           ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Conn   ], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of open SQL connections']);
    const internalConnections             = infoItem([Item.kpi, 'Internal Connections'       ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Conn   ], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of open SQL internal connections']);
    const externalConnections             = infoItem([Item.kpi, 'External Connections'       ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Conn   ], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of open SQL external connections']);
    const idleConnections                 = infoItem([Item.kpi, 'Idle Connections'           ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Conn   ], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of open SQL idle connections']);
    const sqlTransactions                 = infoItem([Item.kpi, 'Open Transactions'          ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Trans  ], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of open SQL transactions']);
    const internalTransactions            = infoItem([Item.kpi, 'Internal Transactions'      ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Trans  ], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of internal transactions']);
    const externalTransactions            = infoItem([Item.kpi, 'External Transactions'      ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Trans  ], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of external transactions']);
    const userTransactions                = infoItem([Item.kpi, 'User Transactions'          ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Trans  ], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of user transactions']);
    const sqlBlockedTrans                 = infoItem([Item.kpi, 'Blocked Transactions'       ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of blocked SQL transactions']);
    const sqlStatements                   = infoItem([Item.kpi, 'Statements'                 ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Stmt   ], [Item.unit, Unit.StmtPerSec ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of finished SQL statements']);
    const cidRange                        = infoItem([Item.kpi, 'Active Commit ID Range'     ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Range between newest and oldest active commit ID']);
    const tidRange                        = infoItem([Item.kpi, 'Active Transaction ID Range'], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Range between newest and oldest active transaction ID']);
    const pendingRequestCount             = infoItem([Item.kpi, 'Pending Request Count'      ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of pending session requests']);
    const mvccNum                         = infoItem([Item.kpi, 'Active Versions'            ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of active MVCC versions']);
    const acquiredRecordLocks             = infoItem([Item.kpi, 'Acquired Record Locks'      ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of acquired record locks']);
    const searchCount                     = infoItem([Item.kpi, 'Read Requests'              ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Req    ], [Item.unit, Unit.ReqPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of read requests (select)']);
    const indexingCount                   = infoItem([Item.kpi, 'Write Requests'             ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Req    ], [Item.unit, Unit.ReqPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of write requests (insert,update,delete)']);
    const mergeCount                      = infoItem([Item.kpi, 'Merge Requests'             ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Req    ], [Item.unit, Unit.ReqPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of merge requests']);
    const unloadCount                     = infoItem([Item.kpi, 'Column Unloads'             ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Req    ], [Item.unit, Unit.ReqPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of column unloads']);
    const indexserverThreads              = infoItem([Item.kpi, 'Active Threads'             ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of active threads']);
    const waitingThreads                  = infoItem([Item.kpi, 'Waiting Threads'            ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of waiting threads']);
    const totalThreads                    = infoItem([Item.kpi, 'Total Threads'              ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Total number of threads']);
    const activeSqlExecutors              = infoItem([Item.kpi, 'Active SqlExecutors'        ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of active SqlExecutors']);
    const waitingSqlExecutors             = infoItem([Item.kpi, 'Waiting SqlExecutors'       ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of waiting SqlExecutors']);
    const totalSqlExecutors               = infoItem([Item.kpi, 'Total SqlExecutors'         ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.Empty      ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Total number of SqlExecutors']);
    const dataWriteSize                   = infoItem([Item.kpi, 'Data Write Size'            ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.WRSize ], [Item.unit, Unit.MBPerSec   ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Bytes written to data area']);
    const dataWriteTime                   = infoItem([Item.kpi, 'Data Write Time'            ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.WRTime ], [Item.unit, Unit.SecPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Time used for writing to data area']);
    const logWriteSize                    = infoItem([Item.kpi, 'Log Write Size'             ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.WRSize ], [Item.unit, Unit.MBPerSec   ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Bytes written to log area']);
    const logWriteTime                    = infoItem([Item.kpi, 'Log Write Time'             ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.WRTime ], [Item.unit, Unit.SecPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Time used for writing to log area']);
    const dataReadSize                    = infoItem([Item.kpi, 'Data Read Size'             ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.WRSize ], [Item.unit, Unit.MBPerSec   ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Bytes read from data area']);
    const dataReadTime                    = infoItem([Item.kpi, 'Data Read Time'             ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.WRTime ], [Item.unit, Unit.SecPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Time used for reading from data area']);
    const logReadSize                     = infoItem([Item.kpi, 'Log Read Size'              ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.WRSize ], [Item.unit, Unit.MBPerSec   ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Bytes read from log area']);
    const logReadTime                     = infoItem([Item.kpi, 'Log Read Time'              ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.WRTime ], [Item.unit, Unit.SecPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Time used for reading from log area']);
    const dataBackupWriteSize             = infoItem([Item.kpi, 'Data Backup Write Size'     ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.WRSize ], [Item.unit, Unit.MBPerSec   ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Bytes written to data backup']);
    const dataBackupWriteTime             = infoItem([Item.kpi, 'Data Backup Write Time'     ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.WRTime ], [Item.unit, Unit.SecPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Time used for writing to data backup']);
    const logBackupWriteSize              = infoItem([Item.kpi, 'Log Backup Write Size'      ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.WRSize ], [Item.unit, Unit.MBPerSec   ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Bytes written to log backup']);
    const logBackupWriteTime              = infoItem([Item.kpi, 'Log Backup Write Time'      ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.WRTime ], [Item.unit, Unit.SecPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Time used for writing to log backup']);
    const mutexCollisionCount             = infoItem([Item.kpi, 'Mutex Collisions'           ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.ColPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of collisions on mutexes']);
    const readWriteLockCollisionCount     = infoItem([Item.kpi, 'Read/Write Lock Collisions' ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.ColPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of collisions on read/write locks']);
    const admissinControlAdmitCount       = infoItem([Item.kpi, 'Admitted Requests'          ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.ReqPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of session requests admitted by admission control']);
    const admissionControlRejectCount     = infoItem([Item.kpi, 'Rejected Requests'          ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.ReqPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of session requests rejected by admission control']);
    const admissionControlWaitingRequests = infoItem([Item.kpi, 'Waiting Requests'           ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.ReqPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of session requests waiting in admission control queue']);
    const admissionControlWaitTime        = infoItem([Item.kpi, 'Wait Time'                  ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.SecPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Total wait time of session requests queued in admission control queue']);
    // generate Host
    const loadHistoryInfoHost: LoadHistoryInfoHost = {
      cpuUsed                         : cpuUsed            ,
      memoryResident                  : memoryResident     ,
      memoryTotalResident             : memoryTotalResident,
      memoryUsed                      : memoryUsed         ,
      memoryLimit                     : memoryLimit        ,
      memorySize                      : memorySize         ,
      diskUsed                        : diskUsed           ,
      diskSize                        : diskSize           ,
      networkIn                       : networkIn          ,
      networkOut                      : networkOut         ,
      swapIn                          : swapIn             ,
      swapOut                         : swapOut            ,
    };
    // generate Index Server
    const loadHistoryInfoIndexServer: LoadHistoryInfoIndexServer = {
      indexserverCpu                  : indexserverCpu      ,
      indexserverCpuSys               : indexserverCpuSys   ,
      indexserverMemUsed              : indexserverMemUsed  ,
      indexserverMemLimit             : indexserverMemLimit ,
      indexserverHandles              : indexserverHandles  ,
      indexserverPingtime             : indexserverPingtime ,
      indexserverSwapIn               : indexserverSwapIn   ,
    };
    // generate SQL
    const loadHistoryInfoSQL: LoadHistoryInfoSQL = {
      sqlConnections                  : sqlConnections      ,
      internalConnections             : internalConnections ,
      externalConnections             : externalConnections ,
      idleConnections                 : idleConnections     ,
      sqlTransactions                 : sqlTransactions     ,
      internalTransactions            : internalTransactions,
      externalTransactions            : externalTransactions,
      userTransactions                : userTransactions    ,
      sqlBlockedTrans                 : sqlBlockedTrans     ,
      sqlStatements                   : sqlStatements       ,
      cidRange                        : cidRange            ,
      tidRange                        : tidRange            ,
      pendingRequestCount             : pendingRequestCount ,
    };
    // generate Row Store
    const loadHistoryInfoRowStore: LoadHistoryInfoRowStore = {
      mvccNum                         : mvccNum            ,
      acquiredRecordLocks             : acquiredRecordLocks,
    };
    // generate Column Store
    const loadHistoryInfoColumnStore: LoadHistoryInfoColumnStore = {
      searchCount                     : searchCount  ,
      indexingCount                   : indexingCount,
      mergeCount                      : mergeCount   ,
      unloadCount                     : unloadCount  ,
    };
    // generate Threads
    const loadHistoryInfoThreads: LoadHistoryInfoThreads = {
      indexserverThreads              : indexserverThreads ,
      waitingThreads                  : waitingThreads     ,
      totalThreads                    : totalThreads       ,
      activeSqlExecutors              : activeSqlExecutors ,
      waitingSqlExecutors             : waitingSqlExecutors,
      totalSqlExecutors               : totalSqlExecutors  ,
    };
    // generate Persistence
    const loadHistoryInfoPersistence: LoadHistoryInfoPersistence = {
      dataWriteSize                   : dataWriteSize,
      dataWriteTime                   : dataWriteTime,
      logWriteSize                    : logWriteSize ,
      logWriteTime                    : logWriteTime ,

      dataReadSize                    : dataReadSize ,
      dataReadTime                    : dataReadTime ,
      logReadSize                     : logReadSize  ,
      logReadTime                     : logReadTime  ,
    };
    // generate Backup
    const loadHistoryInfoBackup: LoadHistoryInfoBackup = {
      dataBackupWriteSize             : dataBackupWriteSize,
      dataBackupWriteTime             : dataBackupWriteTime,
      logBackupWriteSize              : logBackupWriteSize ,
      logBackupWriteTime              : logBackupWriteTime ,
    };
    // generate Synchronization Primitives
    const loadHistoryInfoSynchronizationPrimitives: LoadHistoryInfoSyncPrimitives = {
      mutexCollisionCount             : mutexCollisionCount        ,
      readWriteLockCollisionCount     : readWriteLockCollisionCount,
    };
    // Session Admission Control
    const loadHistoryInfoSessionAdmissionControl: LoadHistoryInfoSessionAdmissionControl = {
      admissinControlAdmitCount       : admissinControlAdmitCount      ,
      admissionControlRejectCount     : admissionControlRejectCount    ,
      admissionControlWaitingRequests : admissionControlWaitingRequests,
      admissionControlWaitTime        : admissionControlWaitTime       ,
    };

    return {
      'Host': loadHistoryInfoHost,
      'Index Server': loadHistoryInfoIndexServer,
      'SQL': loadHistoryInfoSQL,
      'Row Store': loadHistoryInfoRowStore,
      'Column Store': loadHistoryInfoColumnStore,
      'Threads': loadHistoryInfoThreads,
      'Persistence': loadHistoryInfoPersistence,
      'Backup': loadHistoryInfoBackup,
      'Synchronization Primitives': loadHistoryInfoSynchronizationPrimitives,
      'Session Admission Control': loadHistoryInfoSessionAdmissionControl
    };
  }

  /**
   * get rgbcolor object via red, green, blue and alpha.
   */
  private static _getRgbColor(red: number, green: number, blue: number, alpha: number): ColorRgba {
    return {red: red, green: green, blue: blue, alpha: alpha};
  }

  private static _getYScaleForItem(item: any, yScale: number): number {
    return yScale > item[Item.yScale] ? (item[Item.unit] === Unit.PCT ? 100 : yScale) : item[Item.yScale];
  }

  private static _getMaxValueOfGroup(groupItems: any): number {
    let max = 0;
    if (groupItems) {
      max = groupItems.reduce((maxValue, current) => {
        return current.Max > maxValue ? current.Max : maxValue;
      }, 0);
    }
    return max;
  }

  private _getLoadHistoryInfo(port: string): LoadHistoryInfo {
    if (!this._loadHistoryInfos[port]) {
      this._loadHistoryInfos[port] = UIService._generateLoadHistoryInfo();
    }
    return this._loadHistoryInfos[port];
  }

  private _getProcessingUnit(itemKey: string, port: string): UnitType {
    const historyDetailItem: LoadHistoryInfoItem = this._getItemByKey(itemKey, port);
    if (historyDetailItem) {
      let unit = historyDetailItem.Unit;
      if (!unit) {
        unit = '';
      }
      return UIService._unitType[unit];
    }
  }

  private _setOverview (key: string, overview: LoadHistoryInfoItem, unit: UnitType, port: string) {
    const historyDetailItem = this._getItemByKey(key, port);
    if (historyDetailItem) {
      historyDetailItem.Max = overview.Max >= 0 ? overview.Max : 0;
      historyDetailItem.Average = overview.Average >= 0 ? overview.Average : 0;
      // only TYPE_CONVERSION_MBSEC and TYPE_CONVERTION_SEC (eg: MB/s, req/s stmt/s...) need sum
      historyDetailItem.Sum = isUnitTimeRelated(unit) ? (overview.Sum >= 0 ? overview.Sum : 0) : '-';
      historyDetailItem.Last = overview.Last >= 0 ? overview.Last : 0;
    }
  }

  /**
   * convert unit values (eg: byte to MB or GB) and generate the control data (sum, max, avg) for one row
   */
  private _convertUnitAndGenerateRowControlData(row: ChartContentDataItem[], key: string, unit: UnitType, port: string): Promise<any> {
    return new Promise(resolve => {
      if (row) {
        const overview: LoadHistoryInfoItem = {Sum: 0, Max: 0, Average: 0, Last: 0};
        const ignoredTailLineNum = getIgnoredLineNumFromTail();
        let invalidCount = 0;
        // convert unit and calculate the overview data, skip the first, and last three rows.
        row.forEach((item, index, arrayData) => {
          // skip ignored line(s) from tail
          if (index <= row.length - ignoredTailLineNum - 1) {
            if (arrayData[index].y >= 0) {
              arrayData[index].y = getValueByUnit(item.y, unit);
              overview.Sum += arrayData[index].y;
              if (isUnitTimeRelated(unit)) {
                if (index === 0) {
                  // according to hana studio, for those time related column, the first value is set to 0
                  arrayData[index].y = 0;
                } else {
                  // get value for unit like: MB/s  (value / seconds)
                  const timeDiff = arrayData[index].x - arrayData[index - 1].x;
                  arrayData[index].y = timeDiff !== 0 ? arrayData[index].y * 1000 / timeDiff : 0;
                }
              }
              arrayData[index].y = getRoundedValue(arrayData[index].y);

              if (arrayData[index].y > overview.Max) {
                overview.Max = arrayData[index].y;
              }
            } else {
              // set value to 0, for those points with value -1 or < 0
              arrayData[index].y = 0;
              // invalid count + 1, for calculating the average (not time relative)
              invalidCount++;
            }
          }
        });

        if (row.length > (ignoredTailLineNum + invalidCount)) {
          if (isUnitTimeRelated(unit)) {
            const timePeriod = row[row.length - ignoredTailLineNum - 1].x - row[0].x;
            overview.Average = timePeriod !== 0 ? getRoundedValue(overview.Sum * 1000 / timePeriod) : 0;
          } else {
            overview.Average = getRoundedValue(overview.Sum / (row.length - ignoredTailLineNum - invalidCount));
          }
          overview.Last = row[row.length - ignoredTailLineNum - 1].y;
          overview.Sum = getRoundedValue(overview.Sum);
          overview.Max = getRoundedValue(overview.Max);

          // remove those ignored lines
          row.length = row.length - ignoredTailLineNum;
          // for (let i = 0; i < IGNORE_RECORD_NUM_HEAD; i++) {
          //   row.shift();
          // }
        }
        this._setOverview(key, overview, unit, port);
      }
      resolve();
    });
  }

  /**
   * Loop from all history items, put those history items which
   * have the same yScaleGroup together, using yScaleGroup as key.
   * eg: {__SCALE_GROUP_CPU:[item1, item2...], __SCALE_GROUP_UNKNOWN:[item3, item4...]}
   */
  private _getYScaleGroupWithHistoryItems(port: string): {} {
    const yScaleGroup = {};
    const loadHistoryInfo = this._getLoadHistoryInfo(port);

    Object.keys(loadHistoryInfo).forEach(parentKey => {
      Object.keys(loadHistoryInfo[parentKey]).forEach(childKey => {
        const detailItem = loadHistoryInfo[parentKey][childKey];
        const yScaleGroupKey = detailItem._YScaleGroup;
        if (!yScaleGroup[yScaleGroupKey]) {
          yScaleGroup[yScaleGroupKey] = [];
        }
        yScaleGroup[yScaleGroupKey].push(detailItem);
      });
    });
    return yScaleGroup;
  }

  private _setYScaleOfGroup(groupItems: any, group: ScaleGroup) {
    if (groupItems) {
      if (group === ScaleGroup.Unknown) {
        groupItems.forEach(item => item[Item.yScale] = UIService._getYScaleForItem(item, calculateYScale(item.Max)));
      } else {
        const yScale = calculateYScale(UIService._getMaxValueOfGroup(groupItems));
        groupItems.forEach(item =>  item[Item.yScale] = UIService._getYScaleForItem(item, yScale));
      }
    }
  }

  private _getItemByKey(key: string, port: string): any {
    const loadHistoryInfo = this._getLoadHistoryInfo(port);
    for ( const itemKey of Object.keys(loadHistoryInfo)) {
      if (key in loadHistoryInfo[itemKey]) {
        return loadHistoryInfo[itemKey][key];
      }
    }
  }

  /**
   * reset the load history info object, to prevent memory leak
   */
  public clearLoadHistoryInfos() {
    this._loadHistoryInfos = {};
  }

  /**
   * get all the data for the selection table
   */
  public getSelectionTableRows(headerKeys: string[], port: string, defaultDisplayItems: string[]): any[] {
    const rows: any[] = [];
    const loadHistoryInfo = this._getLoadHistoryInfo(port);

    const defaultItems = defaultDisplayItems && defaultDisplayItems.length > 0 ? defaultDisplayItems : this._DEFAULT_DISPLAY_ITEMS;

    Object.keys(loadHistoryInfo).forEach(keyParent => {
      rows.push({KPI: keyParent, header: true});
      const len = rows.length;
      rows.push(...Object.keys(loadHistoryInfo[keyParent])
        .filter(keyChild => headerKeys.includes(keyChild))
        .map(keyChild => {
          loadHistoryInfo[keyParent][keyChild].header = false;
          loadHistoryInfo[keyParent][keyChild].checked = defaultItems.includes(keyChild);
          return loadHistoryInfo[keyParent][keyChild];
      }));
      if (len === rows.length) {
        // no sub items, remove the header
        rows.pop();
      }
    });

    return rows;
  }

  /**
   * get all hidden columns. Those hidden columns = input hidden columns + default hidden columns
   * @param hideMeasureColumns the array contains the columns list that need to be hidden.
   */
  public getHiddenColumns(hideMeasureColumns: string[]): string[] {
    // only measure columns can be hidden
    const hideColumns = hideMeasureColumns ? hideMeasureColumns.filter(column => this._MEASURE_COLUMNS.includes(column)) : [];
    return hideColumns ? this._HIDED_COLUMNS.concat(hideColumns) : this._HIDED_COLUMNS;
  }

  /**
   * get header information and format it to {headKey: key, headText: text}
   */
  public getHeader(keys: string[], port: string): ChartContentHeader[] {
    return keys.map(key => ({key: key, text: this._getItemByKey(key, port).KPI}));
  }

  /**
   * Get the selected items, which need to be displayed on the chart.
   * @param headerKeys array that contains the keys of header
   * @param port the relative port
   * @param defaultDisplayItems the items list that will be displayed by default.
   */
  public getDisplayItems(headerKeys: string[], port: string, defaultDisplayItems: string[]): string[] {
    const selectionTable = this.getSelectionTableRows(headerKeys, port, defaultDisplayItems);
    return selectionTable.filter(row => row.checked).map(row => row.KPI);
  }

  /**
   * Get the Y Scale by the keys and port
   */
  public getYScale(keys: string[], port: string): number[] {
    const yScales = [];
    if (keys) {
      keys.forEach(key => {
        yScales.push(this._getItemByKey(key, port)[Item.yScale]);
      });
    }
    return yScales;
  }

  /**
   * Generate Y Scale for the port
   */
  public generateYScale(port: string): void {
    const yScaleGroup = this._getYScaleGroupWithHistoryItems(port);
    UIService._YScaleGroupList.forEach(group => {
      const historyItems = yScaleGroup[group];
      if (historyItems) {
        this._setYScaleOfGroup(historyItems, group);
      }
    });
  }

  /**
   * convert unit values (eg: byte to MB or GB) and generate the control data (sum, max, avg)
   * @param data the nameserver history data
   * @param header header list
   * @param port selected port
   */
  public convertUnitAndGenerateControlData(data: ChartContentDataItem[][], header: string[], port: string): Promise<any> {
    const promises = [];
    if (data && header) {
      data.forEach((row, index) => {
        if (row) {
          // get detail history item key, like indexserverCpu
          const itemKey = header[index];
          const unit = this._getProcessingUnit(itemKey, port);
          promises.push(this._convertUnitAndGenerateRowControlData(row, itemKey, unit, port));
        }
      });
    }
    return Promise.all(promises);
  }
}

