import {ChartContentDataItem} from './chart-content-data-item.types';

// export interface ChartContentDataItems extends Array<Array<ChartContentDataItem>> {}
export interface ChartContentData {
  [index: string]: ChartContentDataItem[][];
}
