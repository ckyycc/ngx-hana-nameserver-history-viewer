import { LoadHistoryInfoItem } from './load-history-info-item.types';

export interface LoadHistoryInfoIndexServer {
  indexserverCpu: LoadHistoryInfoItem;
  indexserverCpuSys: LoadHistoryInfoItem;
  indexserverMemUsed: LoadHistoryInfoItem;
  indexserverMemLimit: LoadHistoryInfoItem;
  indexserverHandles: LoadHistoryInfoItem;
  indexserverPingtime: LoadHistoryInfoItem;
  indexserverSwapIn: LoadHistoryInfoItem;
}
