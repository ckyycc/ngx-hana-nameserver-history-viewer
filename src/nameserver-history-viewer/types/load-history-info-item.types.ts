import {ScaleGroup} from './scale-group.types';

export interface LoadHistoryInfoItem {
  KPI?: string;
  'Y-Scale'?: number;
  _YScaleGroup?: ScaleGroup;
  Unit?: string;
  Max?: number;
  Average?: number;
  Sum?: number;
  Last?: number;
  Description?: string;
  header?: boolean;
}
