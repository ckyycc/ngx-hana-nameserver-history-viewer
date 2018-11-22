import { LoadHistoryInfoItem } from './load-history-info-item.types';

export interface LoadHistoryInfoSessionAdmissionControl {
  admissinControlAdmitCount: LoadHistoryInfoItem;
  admissionControlRejectCount: LoadHistoryInfoItem;
  admissionControlWaitingRequests: LoadHistoryInfoItem;
  admissionControlWaitTime: LoadHistoryInfoItem;
}
