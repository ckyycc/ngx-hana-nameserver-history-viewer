import { LoadHistoryInfoItem } from './load-history-info-item.types';

export interface LoadHistoryInfoBackup {
  dataBackupWriteSize: LoadHistoryInfoItem;
  dataBackupWriteTime: LoadHistoryInfoItem;
  logBackupWriteSize: LoadHistoryInfoItem;
  logBackupWriteTime: LoadHistoryInfoItem;
}
