import {LoadHistoryInfoHost} from './load-history-info-host.types';
import {LoadHistoryInfoIndexServer} from './load-history-info-server.types';
import {LoadHistoryInfoColumnStore} from './load-history-info-columnstore.types';
import {LoadHistoryInfoThreads} from './load-history-info-threads.types';
import {LoadHistoryInfoSessionAdmissionControl} from './load-history-info-session-admission-control.types';
import {LoadHistoryInfoBackup} from './load-history-info-backup.types';
import {LoadHistoryInfoSQL} from './load-history-info-sql.types';
import {LoadHistoryInfoRowStore} from './load-history-info-rowstore.types';
import {LoadHistoryInfoPersistence} from './load-history-info-persistence.types';
import {LoadHistoryInfoSyncPrimitives} from './load-history-info-sync-primitives.types';


export interface LoadHistoryInfo {
  'Host': LoadHistoryInfoHost;
  'Index Server': LoadHistoryInfoIndexServer;
  'SQL': LoadHistoryInfoSQL;
  'Row Store': LoadHistoryInfoRowStore;
  'Column Store': LoadHistoryInfoColumnStore;
  'Threads': LoadHistoryInfoThreads;
  'Persistence': LoadHistoryInfoPersistence;
  'Backup': LoadHistoryInfoBackup;
  'Synchronization Primitives': LoadHistoryInfoSyncPrimitives;
  'Session Admission Control': LoadHistoryInfoSessionAdmissionControl;
}
