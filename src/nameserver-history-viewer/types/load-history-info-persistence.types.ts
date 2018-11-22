import { LoadHistoryInfoItem } from './load-history-info-item.types';

export interface LoadHistoryInfoPersistence {
  dataWriteSize: LoadHistoryInfoItem;
  dataWriteTime: LoadHistoryInfoItem;
  logWriteSize: LoadHistoryInfoItem;
  logWriteTime: LoadHistoryInfoItem;
  dataReadSize: LoadHistoryInfoItem;
  dataReadTime: LoadHistoryInfoItem;
  logReadSize: LoadHistoryInfoItem;
  logReadTime: LoadHistoryInfoItem;
}
