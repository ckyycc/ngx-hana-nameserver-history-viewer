import { Injectable } from '@angular/core';
import { parse } from 'papaparse';
import { Chart } from 'chart.js';
import { getColorString, randomColor } from '../utils';
import { UIService } from './ui.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ChartContentDataItem, LegendColor } from '../types';

// Using dynamic flag to fix the issue of ng-packagr #696: Lambda not supported
// @dynamic
@Injectable()
export class ChartService {
  private _chart: Chart;

  /**
   * toggle the dataset status of the chart, synchronously
   */
  private static _toggleDataSet(dataSetIndex: number, chart: Chart, hidden: boolean): void {
    // meta.hidden = false and dataset.hidden = false --> show
    // meta.hidden = false and dataset.hidden = true --> show
    // meta.hidden = null and dataset.hidden = false -> show
    // meta.hidden = null and dataset.hidden = true -> hide
    // in the first case (false, false), needs to click legend twice to
    // hide the dataset, because the first click only set meta.hidden = null)
    if (dataSetIndex != null && chart != null) {
      const meta = chart.getDatasetMeta(dataSetIndex);
      if (meta) {
        if (!hidden) {
          // display the item, if dataset hidden is false, set hidden of meta to null,
          meta.hidden = !chart.data.datasets[dataSetIndex].hidden ? null : hidden;
        } else {
          meta.hidden = hidden;
        }
      }
    }
  }
  private static _restoreDataSetStatus(chart: Chart, datasetIndex: number, status: {metaStatus: boolean, datasetStatus: boolean}): void {
    if (chart && chart.data && chart.data.datasets && chart.getDatasetMeta(datasetIndex) && status) {
      chart.data.datasets[datasetIndex].hidden = status.datasetStatus;
      chart.getDatasetMeta(datasetIndex).hidden = status.metaStatus;
    }
  }

  /**
   * initialize/clear the configuration for the chart
   */
  private static _initConfig(chart: any): void {
    // init data sets
    if (chart.data && chart.data.datasets) {
      chart.data.datasets.length = 0;
      chart.data.datasets = void 0;
      chart.data = void 0;
    }
    // init options
    if (chart.options && chart.options.scales && (chart.options.scales.xAxes || chart.options.scales.yAxis)) {
      if (chart.options.scales.xAxes) {
        chart.options.scales.xAxes.length = 0;
        chart.options.scales.xAxes = void 0;
      }
      if (chart.options.scales.yAxes) {
        chart.options.scales.yAxes.length = 0;
        chart.options.scales.yAxes = void 0;
      }
      chart.options.scales = void 0;
      chart.options = void 0;
    }
  }

  /**
   * Generate DataSets by the data and header information
   */
  private static _generateDataSets(data: ChartContentDataItem[][], header: string[], headerKey: string[], defaultItems: string[]): any {
    const alpha = 0.5;
    const colors: LegendColor = UIService.getColors(alpha);
    return data.map((item, i) => {
      const color = colors[headerKey[i]] ? getColorString(colors[headerKey[i]]) : randomColor(alpha);
      return {
        borderColor: color,
        backgroundColor: color,
        borderWidth: 1.25,
        spanGaps: false,
        label: header[i],
        data: data[i],
        fill: false,
        yAxisID: `y-axis-${i}`,
        hidden: !defaultItems.includes(header[i])
      };
    });
  }
  private static _generateXAxes(time: number[]): any {
    const format = 'MMMDD HH:mm:ss';
    return [
      {
        type: 'time',
        time: {
          // unit: 'second',
          // stepSize: 1,
          displayFormats: {
            'millisecond': format,
            'second': format,
            'minute': format,
            'hour': 'MMMDD HH',
            'day': 'MMMDD YYYY',
            'week': format,
            'month': format,
            'quarter': format,
            'year': format,
          },
          tooltipFormat: 'll HH:mm:ss',
          min: time[0],
          max: time[time.length - 1]
        },
        // scaleLabel: {
        //   display: false,
        //   labelString: 'Date'
        // },
        ticks: {
          maxRotation: 0,
          reverse: true
        }
      }
    ];
  }
  private static _generateYAxes(data: ChartContentDataItem[][], yScale: number[]): any {
    return data.map((item, i) => ({
      type: 'linear',
      display: false,
      position: 'left',
      id: `y-axis-${i}`,
      gridLines: {
      },
      ticks: {
        min: 0,
        max: yScale[i]
      }
    }));
  }

  /**
   * generate configuration for chart
   */
  private static _generateChartConfig(time: number[],
                                      data: ChartContentDataItem[][],
                                      yScale: number[],
                                      header: string[],
                                      headerKey: string[],
                                      selection: SelectionModel<any>,
                                      tableSource: any,
                                      title: string,
                                      defaultItems: string[],
                                      zoomCallback: any): any {

    return {
      type: 'line',
      data: {
        datasets: ChartService._generateDataSets(data, header, headerKey, defaultItems)
      },
      options: {
        elements: {point: {radius: 0, hitRadius: 5, hoverRadius: 5}}, // set radius to 0 not to display point
        responsive: true,
        animation: {
          duration: 0, // general animation time
        },
        hover: {
          animationDuration: 0, // duration of animations when hovering an item
          onHover: function (e) {
            const point = this.getElementAtEvent(e);
            if (point.length) {
              e.target.style.cursor = 'pointer';
            } else {
              e.target.style.cursor = 'default';
            }
          }
        },
        responsiveAnimationDuration: 0, // animation duration after a resize
        legend: {
          position: 'bottom',
          onHover: (e) => {
            e.target.style.cursor = 'pointer';
          },
          labels: {
            filter: (legendItem) => selection.isSelected(tableSource.find(row => legendItem.text === row.KPI))
          }
        },
        title: {
          display: true,
          text: title
        },
        responsiveDownsample: {
          enabled: true,
          desiredDataPointDistance: 2,
          minNumPoints: 200,
          maxNumPointsToDraw: 100
        },
        scales: {
          xAxes: ChartService._generateXAxes(time),
          yAxes: ChartService._generateYAxes(data, yScale)
        },
        zoom: {
          enabled: true,
          drag: true,
          mode: 'x',
          onZoom: zoomCallback
        }
      }
    };
  }

  private _getDataSetIndexByLabel(label: string, chart: Chart): number {
    if (chart.data && chart.data.datasets) {
      return chart.data.datasets.findIndex(dataset => dataset.label === label);
    }
    return -1;
  }

  /**
   * destroy the chart, release the resource of the chart
   */
  private _destroyChart(chart: Chart): Promise<any> {
    return new Promise((resolve) => {
      if (chart) {
        chart.destroy();
      }
      resolve();
    });
  }
  /**
   * update/refresh the chart
   */
  private _updateChart(chart: Chart): Promise<any> {
    return new Promise((resolve, reject) => {
      if (chart) {
        chart.update();
        resolve();
      } else {
        reject('Updating chart failed, error: the chart object is empty.');
      }
    });
  }

  /**
   * reset zoom of the chart
   */
  private _resetZoom(chart: any): Promise<{metaStatus: boolean, datasetStatus: boolean}[]> {
    return new Promise((resolve, reject) => {
      if (chart) {
        const datasetStatusBeforeReset = [];
        if (chart.data && chart.data.datasets) {
          chart.data.datasets.forEach((dataset, index) => {
            const meta = chart.getDatasetMeta(index);
            if (meta) {
              datasetStatusBeforeReset[index] = {metaStatus: meta.hidden, datasetStatus: dataset.hidden};
            } else {
              reject(`Internal error, can not find the meta ${index}.`);
            }
          });
        }
        chart.resetZoom();
        resolve(datasetStatusBeforeReset);
      } else {
        reject('Resetting chart failed, error: the chart object is empty.');
      }
    });
  }
  /**
   * Reset Chart to initial status
   * If legend is already selected/unselected from the list, it wouldn't be restored.
   * @param dataSourceData the data sets of the chart
   * @param selection selection status list
   */
  public resetChart(dataSourceData: any, selection: SelectionModel<any>): Promise <any> {
    return this._resetZoom(this._chart).then((datasetStatusBeforeZoom) => {
      // reset the data set by the selection status
      dataSourceData.filter(row => !row.header).forEach(row => {
        const index = this._getDataSetIndexByLabel(row.KPI, this._chart);
        if (!selection.isSelected(row)) {
          ChartService._toggleDataSet(index, this._chart, true);
        } else {
          ChartService._restoreDataSetStatus(this._chart, index, datasetStatusBeforeZoom[index]);
        }
      });
      return this._updateChart(this._chart);
    });
  }

  /**
   * destroy the chart and reinitialize the configuration of the chart
   */
  public destroyChart(): Promise<any> {
    return this._destroyChart(this._chart).then(() => {
      if (this._chart) {
        ChartService._initConfig(this._chart);
        this._chart = void 0;
      }
    });
  }

  /**
   * generate configuration for chart and create the chart object.
   */
  public buildChart(time: number[],
                    data: ChartContentDataItem[][],
                    yScale: number[],
                    header: string[],
                    headerKey: string[],
                    selection: SelectionModel<any>,
                    tableSource: any,
                    title: string,
                    defaultItems: string[],
                    zoomCB): Promise<any> {
    return new Promise((resolve) => {
      const ctx = (<HTMLCanvasElement> document.getElementById('chartNameServerHistory')).getContext('2d');
      const cfg: any = ChartService._generateChartConfig(time, data, yScale, header, headerKey, selection, tableSource, title, defaultItems, zoomCB);
      this._chart = new Chart(ctx, cfg);
      resolve();
    });
  }

  /**
   * show/hide the relative data set
   */
  public toggleDataInChart(label: string, hide: boolean): Promise<any> {
    return new Promise((resolve) => {
      ChartService._toggleDataSet(this._getDataSetIndexByLabel(label, this._chart), this._chart, hide);
      resolve(this._updateChart(this._chart));
    });
  }
}
