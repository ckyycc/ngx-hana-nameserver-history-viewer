import { LoadHistoryInfoItem } from './load-history-info-item.types';

export interface LoadHistoryInfoColumnStore {
  searchCount: LoadHistoryInfoItem;
  indexingCount: LoadHistoryInfoItem;
  mergeCount: LoadHistoryInfoItem;
  unloadCount: LoadHistoryInfoItem;
}

