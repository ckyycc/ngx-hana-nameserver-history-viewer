import { LoadHistoryInfoItem } from './load-history-info-item.types';

export interface LoadHistoryInfoRowStore {
  mvccNum: LoadHistoryInfoItem;
  acquiredRecordLocks: LoadHistoryInfoItem;
}

