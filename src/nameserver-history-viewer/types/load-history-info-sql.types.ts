import { LoadHistoryInfoItem } from './load-history-info-item.types';

export interface LoadHistoryInfoSQL {
  sqlConnections: LoadHistoryInfoItem;
  internalConnections: LoadHistoryInfoItem;
  externalConnections: LoadHistoryInfoItem;
  idleConnections: LoadHistoryInfoItem;
  sqlTransactions: LoadHistoryInfoItem;
  internalTransactions: LoadHistoryInfoItem;
  externalTransactions: LoadHistoryInfoItem;
  userTransactions: LoadHistoryInfoItem;
  sqlBlockedTrans: LoadHistoryInfoItem;
  sqlStatements: LoadHistoryInfoItem;
  cidRange: LoadHistoryInfoItem;
  tidRange: LoadHistoryInfoItem;
  pendingRequestCount: LoadHistoryInfoItem;
}
