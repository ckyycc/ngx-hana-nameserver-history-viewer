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
  LegendColor,
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
   * get the colors for legends
   */
  public static getColors(alpha: number = null): LegendColor {
    if (alpha == null) {
      alpha = 0.8;
    }
    return {
      cpuUsed                        : this._getRgbColor(199, 21, 133, alpha), // mediumvioletred
      memoryResident                 : this._getRgbColor(238, 130, 238, alpha), // violet
      memoryTotalResident            : this._getRgbColor(72, 61, 139, alpha), // darkslateblue
      memoryUsed                     : this._getRgbColor(0, 0, 205, alpha), // mediumblue
      memoryLimit                    : this._getRgbColor(255, 105, 180, alpha), // hotpink
      memorySize                     : this._getRgbColor(70, 130, 180, alpha), // steelblue
      diskUsed                       : this._getRgbColor(25, 25, 112, alpha), // midnightblue
      diskSize                       : this._getRgbColor(0, 255, 255, alpha), // aqua
      networkIn                      : this._getRgbColor(102, 51, 153, alpha), // rebeccapurple
      networkOut                     : this._getRgbColor(245, 222, 179, alpha), // wheat
      swapIn                         : this._getRgbColor(47, 79, 79, alpha), // darkslategray
      swapOut                        : this._getRgbColor(205, 92, 92, alpha), // indianred
      indexserverCpu                 : this._getRgbColor(255, 99, 71, alpha), // tomato
      indexserverCpuSys              : this._getRgbColor(255, 20, 147, alpha), // deeppink
      indexserverMemUsed             : this._getRgbColor(0, 255, 0, alpha), // lime
      indexserverMemLimit            : this._getRgbColor(139, 0, 0, alpha), // darkred
      indexserverHandles             : this._getRgbColor(139, 0, 139, alpha), // darkmagenta
      indexserverPingtime            : this._getRgbColor(189, 183, 107, alpha), // darkkhaki
      indexserverSwapIn              : this._getRgbColor(112, 128, 144, alpha), // slategray
      sqlConnections                 : this._getRgbColor(85, 107, 47, alpha), // darkolivegreen
      internalConnections            : this._getRgbColor(46, 139, 87, alpha), // seagreen
      externalConnections            : this._getRgbColor(147, 112, 219, alpha), // mediumpurple
      idleConnections                : this._getRgbColor(216, 191, 216, alpha), // thistle
      sqlTransactions                : this._getRgbColor(220, 20, 60, alpha), // crimson
      internalTransactions           : this._getRgbColor(186, 85, 211, alpha), // mediumorchid
      externalTransactions           : this._getRgbColor(221, 160, 221, alpha), // plum
      userTransactions               : this._getRgbColor(210, 105, 30, alpha), // chocolate
      sqlBlockedTrans                : this._getRgbColor(0, 0, 255, alpha), // blue
      sqlStatements                  : this._getRgbColor(188, 143, 143, alpha), // rosybrown
      cidRange                       : this._getRgbColor(32, 178, 170, alpha), // lightseagreen
      tidRange                       : this._getRgbColor(124, 252, 0, alpha), // lawngreen
      pendingRequestCount            : this._getRgbColor(160, 32, 240, alpha), // purple3
      mvccNum                        : this._getRgbColor(65, 105, 225, alpha), // royalblue
      acquiredRecordLocks            : this._getRgbColor(0, 250, 154, alpha), // mediumspringgreen
      searchCount                    : this._getRgbColor(127, 255, 212, alpha), // aquamarine
      indexingCount                  : this._getRgbColor(0, 191, 255, alpha), // deepskyblue
      mergeCount                     : this._getRgbColor(135, 206, 235, alpha), // skyblue
      unloadCount                    : this._getRgbColor(255, 165, 0, alpha), // orange
      indexserverThreads             : this._getRgbColor(0, 100, 0, alpha), // darkgreen
      waitingThreads                 : this._getRgbColor(176, 48, 96, alpha), // maroon3
      totalThreads                   : this._getRgbColor(100, 149, 237, alpha), // cornflower
      activeSqlExecutors             : this._getRgbColor(175, 238, 238, alpha), // paleturquoise
      waitingSqlExecutors            : this._getRgbColor(50, 205, 50, alpha), // limegreen
      totalSqlExecutors              : this._getRgbColor(240, 230, 140, alpha), // khaki
      dataWriteSize                  : this._getRgbColor(102, 205, 170, alpha), // mediumaquamarine
      dataWriteTime                  : this._getRgbColor(169, 169, 169, alpha), // darkgray
      logWriteSize                   : this._getRgbColor(160, 82, 45, alpha), // sienna
      logWriteTime                   : this._getRgbColor(128, 128, 0, alpha), // olive
      dataReadSize                   : this._getRgbColor(255, 215, 0, alpha), // gold
      dataReadTime                   : this._getRgbColor(95, 158, 160, alpha), // cadetblue
      logReadSize                    : this._getRgbColor(255, 0, 0, alpha), // red
      logReadTime                    : this._getRgbColor(184, 134, 11, alpha), // darkgoldenrod
      dataBackupWriteSize            : this._getRgbColor(255, 255, 0, alpha), // yellow
      dataBackupWriteTime            : this._getRgbColor(154, 205, 50, alpha), // yellowgreen
      logBackupWriteSize             : this._getRgbColor(0, 0, 139, alpha), // darkblue
      logBackupWriteTime             : this._getRgbColor(219, 112, 147, alpha), // palevioletred
      mutexCollisionCount            : this._getRgbColor(244, 164, 96, alpha), // sandybrown
      readWriteLockCollisionCount    : this._getRgbColor(233, 150, 122, alpha), // darksalmon
      admissinControlAdmitCount      : this._getRgbColor(143, 188, 143, alpha), // darkseagreen
      admissionControlRejectCount    : this._getRgbColor(255, 0, 255, alpha), // fuchsia
      admissionControlWaitingRequests: this._getRgbColor(153, 50, 204, alpha), // darkorchid
      admissionControlWaitTime       : this._getRgbColor(144, 238, 144, alpha), // lightgreen
    };
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
    const admissionControlEnqueueCount    = infoItem([Item.kpi, 'Enqueued Requests'          ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.ReqPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of session requests enqueued by admission control']);
    const admissionControlDequeueCount    = infoItem([Item.kpi, 'Dequeued Requests'          ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.ReqPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of session requests dequeued by admission control']);
    const admissionControlTimeoutCount    = infoItem([Item.kpi, 'Timed out Requests'          ], [Item.yScale, 0, ], [Item.yScaleGroup, ScaleGroup.Unknown], [Item.unit, Unit.ReqPerSec  ], [Item.max, -1], [Item.average, -1], [Item.sum, -1], [Item.last, -1], [Item.description, 'Number of timed out session requests in admission control queue']);

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
      admissionControlEnqueueCount    : admissionControlEnqueueCount   ,
      admissionControlDequeueCount    : admissionControlDequeueCount   ,
      admissionControlTimeoutCount    : admissionControlTimeoutCount   ,
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
    return UnitType.TypeEA; // default return value
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
  private _convertUnitAndGenerateRowControlData(row: ChartContentDataItem[], key: string, unit: UnitType, port: string): Promise<void> {
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

        if (row.length >= (ignoredTailLineNum + invalidCount)) {
          if (isUnitTimeRelated(unit)) {
            const timePeriod = row[row.length - ignoredTailLineNum - 1].x - row[0].x;
            overview.Average = timePeriod !== 0 ? getRoundedValue(overview.Sum * 1000 / timePeriod) : 0;
          } else {
            const validItemCount = row.length - ignoredTailLineNum - invalidCount;
            overview.Average = validItemCount > 0 ? getRoundedValue(overview.Sum / validItemCount) : 0;
          }
          overview.Last = row[row.length - ignoredTailLineNum - 1].y;
          overview.Sum = getRoundedValue(overview.Sum);
          overview.Max = getRoundedValue(overview.Max);

          // remove those ignored lines
          row.length = row.length - ignoredTailLineNum;
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
    return keys.map(key => {
      const item = this._getItemByKey(key, port);
      if (item != null && 'KPI' in item) {
        return ({key: key, text: item.KPI});
      } else {
        console.warn(`${key} is not configured.`);
        return null;
      }
    }).filter(key => key != null );
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
