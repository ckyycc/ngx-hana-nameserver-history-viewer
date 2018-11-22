import { LoadHistoryInfoItem } from './load-history-info-item.types';

export interface LoadHistoryInfoHost {
  cpuUsed: LoadHistoryInfoItem;
  memoryResident: LoadHistoryInfoItem;
  memoryTotalResident: LoadHistoryInfoItem;
  memoryUsed: LoadHistoryInfoItem;
  memoryLimit: LoadHistoryInfoItem;
  memorySize: LoadHistoryInfoItem;
  diskUsed: LoadHistoryInfoItem;
  diskSize: LoadHistoryInfoItem;
  networkIn: LoadHistoryInfoItem;
  networkOut: LoadHistoryInfoItem;
  swapIn: LoadHistoryInfoItem;
  swapOut: LoadHistoryInfoItem;
}

