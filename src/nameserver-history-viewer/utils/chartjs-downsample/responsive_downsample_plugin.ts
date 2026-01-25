/**
 * This plugin is adapted from: https://github.com/3dcl/chartjs-plugin-responsive-downsample
 * for controlling the radius of point.
 *
 * MIT License
 * Copyright (c) 2018 3D Content Logistics
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import moment from 'moment';
import { Chart, ChartDataSets, ChartPoint } from 'chart.js';
import { IChartPlugin, TimeScale } from './chartjs_ext';
import * as utils from './utils';

import { DataMipmap } from './data_mipmap';
import { LTTBDataMipmap } from './lttb_data_mipmap';
import * as data_culling from './data_culling';

interface MipMapDataSets extends ChartDataSets {
  originalData?: ChartPoint[];
  currentMipMapLevel?: number;
  mipMap?: DataMipmap;
}

export interface ResponsiveDownsamplePluginOptions {
  /**
   * Enable/disable plugin
   */
  enabled?: boolean;
  /**
   * The aggregation algorithm to thin out data. Default: LTTB
   */
  aggregationAlgorithm?: 'AVG' | 'LTTB';
  /**
   * Desired minimal distance between data points in pixels. Default: 1 pixel
   */
  desiredDataPointDistance?: number;
  /**
   * Minimal number of data points. Limits
   */
  minNumPoints?: number;
  /**
   * Cull data to displayed range of x scale
   */
  cullData?: boolean;
  /**
   * Flag is set by plugin to trigger reload of data
   */
  needsUpdate?: boolean;
  /**
   * Current target resolution(Set by plugin)
   */
  targetResolution?: number;
  /**
   * Scale range of x axis
   */
  scaleRange?: data_culling.Range;
  /**
   * Draw points only if the points number less than the limitation
   */
  maxNumPointsToDraw?: number;
}

// Using dynamic flag to fix the issue of ng-packagr #696: Lambda not supported
// @dynamic
/**
 * Chart js Plugin for downsampling data
 */
export class ResponsiveDownsamplePlugin implements IChartPlugin {
  static getPluginOptions(chart: any): ResponsiveDownsamplePluginOptions {
    const options: ResponsiveDownsamplePluginOptions = chart.options.responsiveDownsample || {};
    utils.defaultsDeep(options, {
      enabled: false,
      aggregationAlgorithm: 'LTTB',
      desiredDataPointDistance: 1,
      minNumPoints: 100,
      maxNumPointsToDraw: 100,
      cullData: true
    });

    if (options.enabled) {
      chart.options.responsiveDownsample = options;
    }

    return options;
  }

  static hasDataChanged(chart: Chart): boolean {
    return !utils.isNil(
      utils.findInArray(
        chart.data.datasets as MipMapDataSets[],
        (dataset) => {
          return utils.isNil(dataset.mipMap);
        }
      )
    );
  }

  static createDataMipMap(chart: Chart, options: ResponsiveDownsamplePluginOptions): void {
    chart.data.datasets.forEach((dataset: MipMapDataSets) => {
      // @ts-ignore
      const data = !utils.isNil(dataset.originalData) ? dataset.originalData : dataset.data as ChartPoint[];

      const mipMap = (options.aggregationAlgorithm === 'LTTB')
        ? new LTTBDataMipmap(data, options.minNumPoints)
        : new DataMipmap(data, options.minNumPoints);

      dataset.originalData = data;
      dataset.mipMap = mipMap;
      // @ts-ignore
      dataset.data = mipMap.getMipMapLevel(mipMap.getNumLevel() - 1); // set last level for first render pass
    });
  }

  static restoreOriginalData(chart: Chart): boolean {
    let updated = false;

    chart.data.datasets.forEach((dataset: MipMapDataSets) => {
      // @ts-ignore
      if (!utils.isNil(dataset.originalData) && dataset.data !== dataset.originalData) {
        // @ts-ignore
        dataset.data = dataset.originalData;
        updated = true;
      }
    });

    return updated;
  }

  static getTargetResolution(chart: Chart, options: ResponsiveDownsamplePluginOptions): number {
    const xScale: TimeScale = (chart as any).scales['x-axis-0'];

    if (utils.isNil(xScale)) {
      return null;
    }

    const start = moment(xScale.getValueForPixel(xScale.left) as any);
    const end = moment(xScale.getValueForPixel(xScale.left + 1) as any);
    const targetResolution = end.diff(start);

    return targetResolution * options.desiredDataPointDistance;
  }

  static updateMipMap(chart: Chart, options: ResponsiveDownsamplePluginOptions, rangeChanged: boolean): boolean {
    let updated = false;

    chart.data.datasets.forEach((dataset: MipMapDataSets) => {
      const mipMap = dataset.mipMap;
      if (utils.isNil(mipMap)) {
        return;
      }

      const mipMalLevel = mipMap.getMipMapIndexForResolution(options.targetResolution);
      if (mipMalLevel === dataset.currentMipMapLevel && !rangeChanged) {
        // skip update if mip map level and data range did not change
        return;
      }
      updated = true;
      dataset.currentMipMapLevel = mipMalLevel;

      let newData = mipMap.getMipMapLevel(mipMalLevel);
      if (options.cullData) {
        newData = data_culling.cullData(newData, options.scaleRange);
      }

      // @ts-ignore
      dataset.data = newData;
    });

    return updated;
  }

  beforeInit(chart: Chart): void {
    const options = ResponsiveDownsamplePlugin.getPluginOptions(chart);
    if (!options.enabled) { return; }

    ResponsiveDownsamplePlugin.createDataMipMap(chart, options);
    options.needsUpdate = true;
  }

  beforeDatasetsUpdate(chart: Chart): void {
    const options = ResponsiveDownsamplePlugin.getPluginOptions(chart);
    if (!options.enabled) {
      // restore original data and remove state from options
      options.needsUpdate = ResponsiveDownsamplePlugin.restoreOriginalData(chart);
      delete options.targetResolution;
      delete options.scaleRange;
      return;
    }

    // only update mip map if data set was reloaded externally
    if (ResponsiveDownsamplePlugin.hasDataChanged(chart)) {
      ResponsiveDownsamplePlugin.createDataMipMap(chart, options);
      options.needsUpdate = true;
    }
  }

  beforeRender(chart: Chart): boolean {
    const options = ResponsiveDownsamplePlugin.getPluginOptions(chart);
    if (!options.enabled) {
      // update chart if data was restored from original data
      if (options.needsUpdate) {
        options.needsUpdate = false;
        chart.update(0);

        return false;
      }
      return true;
    }

    const targetResolution = ResponsiveDownsamplePlugin.getTargetResolution(chart, options);
    const xScale: TimeScale = (chart as any).scales['x-axis-0'];
    const scaleRange = data_culling.getScaleRange(xScale);
    const rangeChanged = !data_culling.rangeIsEqual(options.scaleRange, scaleRange);

    if (options.needsUpdate ||
      options.targetResolution !== targetResolution ||
      rangeChanged
    ) {
      options.targetResolution = targetResolution;
      options.scaleRange = scaleRange;
      options.needsUpdate = false;

      if (ResponsiveDownsamplePlugin.updateMipMap(chart, options, rangeChanged)) {
        utils.changePointRadius(chart, options);
        // update chart and cancel current render
        chart.update(0);

        return false;
      }
    }
    return true;
  }
}
