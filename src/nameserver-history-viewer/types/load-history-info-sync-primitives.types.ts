import { LoadHistoryInfoItem } from './load-history-info-item.types';

export interface LoadHistoryInfoSyncPrimitives {
  mutexCollisionCount: LoadHistoryInfoItem;
  readWriteLockCollisionCount: LoadHistoryInfoItem;
}
