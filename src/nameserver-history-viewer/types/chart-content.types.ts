import {Abort} from './abort.types';
import {ChartContentTime} from './chart-content-time.types';
import {ChartContentData} from './chart-content-data.types';
export interface ChartContent {
  header: string[];
  host: string;
  time: ChartContentTime;
  data: ChartContentData;
  aborted: Abort;
}
