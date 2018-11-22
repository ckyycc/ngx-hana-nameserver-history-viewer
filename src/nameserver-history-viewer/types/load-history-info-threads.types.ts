import { LoadHistoryInfoItem } from './load-history-info-item.types';

export interface LoadHistoryInfoThreads {
  indexserverThreads: LoadHistoryInfoItem;
  waitingThreads: LoadHistoryInfoItem;
  totalThreads: LoadHistoryInfoItem;
  activeSqlExecutors: LoadHistoryInfoItem;
  waitingSqlExecutors: LoadHistoryInfoItem;
  totalSqlExecutors: LoadHistoryInfoItem;
}
