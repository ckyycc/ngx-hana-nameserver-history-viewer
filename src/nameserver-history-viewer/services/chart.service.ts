import { Injectable } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import {
  Chart,
  ChartConfiguration,
  ChartDataset,
  registerables,
  TimeScale,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  Decimation
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';
import { getColorString, getNumberWithCommas, randomColor } from '../utils';
import { UIService } from './ui.service';
import { ChartContentDataItem, LegendColor, Item, Unit } from '../types';

// Register Chart.js components and plugins
Chart.register(
  ...registerables,
  TimeScale,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  Decimation,
  zoomPlugin
);

const MAX_POINTS_TO_RENDER = 100;

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
    if (chart.data?.datasets) {
      chart.data.datasets.length = 0;
      chart.data.datasets = void 0;
      chart.data = void 0;
    }
    // init options
    if (chart.options?.scales) {
      chart.options.scales = void 0;
      chart.options = void 0;
    }
  }

  /**
   * Generate DataSets by the data and header information
   */
  private static _generateDataSets(data: ChartContentDataItem[][], header: string[], headerKey: string[], defaultItems: string[], yScale: number[]): ChartDataset<'line'>[] {
    const alpha = 0.5;
    const colors: LegendColor = UIService.getColors(alpha);
    return data.map((item, i) => {
      const color = colors[headerKey[i]] ? getColorString(colors[headerKey[i]]) : randomColor(alpha);
      // only cap 100 which is percentage
      if (yScale[i] === 100) {
        // to save some memory, change the value directly
        //   cappedData = item.map(dp =>
        //     dp.y > 100 ? { ...dp, y: 100, originalY: dp.y } : dp
        //   );
        // }
        for(let j = 0, len = item.length; j < len; j++) {
          const dp: any = item[j];
          if (dp.y > 100) {
            dp.originalY = dp.y;
            dp.y = 100;
          }
        }
      }

      return {
        borderColor: color,
        backgroundColor: color,
        borderWidth: 1,
        spanGaps: false,
        label: header[i],
        data: item,
        fill: false,
        yAxisID: `y-axis-${i}`,
        hidden: !defaultItems.includes(header[i]),
        pointRadius: 0,
        pointHitRadius: 5,
        pointHoverRadius: 5,
        // Enable smooth curves for more natural line appearance
        tension: 0.2,
        // Enable decimation for each dataset
        parsing: false,
        normalized: true
      };
    });
  }

  private static _generateScales(timeArray: number[], data: ChartContentDataItem[][], yScaleArray: number[]): any {
    const scales: any = {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            'millisecond': 'MMMdd HH:mm:ss',
            'second': 'MMMdd HH:mm:ss',
            'minute': 'MMMdd HH:mm',
            'hour': 'MMMdd HH',
            'day': 'MMMdd',
            'week': 'MMMdd',
            'month': 'MMM yyyy',
            'quarter': 'MMM yyyy',
            'year': 'MMM yyyy',
          },
          tooltipFormat: 'MMM dd, yyyy HH:mm:ss'
        },
        min: timeArray[0],
        max: timeArray[timeArray.length - 1],
        ticks: {
          source: 'auto',
          maxRotation: 0,
          autoSkip: true,
          autoSkipPadding: 40, // label space
        },
        reverse: false
      }
    };

    // Add Y axes
    data.forEach((item, i) => {
      scales[`y-axis-${i}`] = {
        type: 'linear',
        display: false,
        position: 'left',
        grid: {
          drawOnChartArea: i === 0, // only show grid for first axis
        },
        min: 0,
        max: yScaleArray[i]
      };
    });

    return scales;
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
                                      zoomCallback: any): ChartConfiguration<'line'> {
    return {
      type: 'line',
      data: {
        datasets: ChartService._generateDataSets(data, header, headerKey, defaultItems, yScale)
      },
      options: {
        layout: {
          padding: {
            right: 25 // Add padding to the right side of the chart
          }
        },
        interaction: {
          intersect: true, // true means must actually hover over a point
          axis: 'xy',      // check both x and y axis for intersection
          mode: 'index'    // when intersecting, show all datasets at the same index/x position
        },
        responsive: true,
        animation: false, // must disable it otherwise zoomin will hang
        onHover: (event: any, elements: any) => {
          const target = event.native?.target || event.target;
          if (target) {
            (target as HTMLElement).style.cursor = elements?.length > 0 ? 'pointer' : 'default';
          }
        },
        elements: {point: { radius: 0, hitRadius: 5, hoverRadius: 5 }}, // set radius to 0 not to display point
        parsing: false,
        normalized: true,
        datasets: {line: { pointRadius: 0, pointHitRadius: 5, pointHoverRadius: 5}},
        plugins: {
          legend: {
            position: 'bottom',
            onHover: (event: any, legendItem: any) => {
              const target = event.native?.target || event.target;
              if (target) {
                (target as HTMLElement).style.cursor = 'pointer';
              }
            },
            labels: {
              filter: (legendItem) => selection.isSelected(tableSource.find(row => legendItem.text === row.KPI))
            }
          },
          title: {
            display: true,
            text: title
          },
          tooltip: {
            mode: 'nearest',
            intersect: true, // true means only show tooltip for the closest point
            callbacks: {
              label: function(context) {
                // format numbers with commas and add unit information
                const label = context.dataset.label || '';
                if (label) {
                  // get unit (eg: MB, GB, MB/s, % and so on)
                  const rowItem = tableSource.find(controlTableRow => label === controlTableRow.KPI) || '';
                  const unit = rowItem[Item.unit] && rowItem[Item.unit] !== Unit.PCT ? ` ${rowItem[Item.unit]}` : rowItem[Item.unit] || '';
                  // Use original value if available, otherwise use displayed value
                  const valueToShow = (context.raw as any)?.originalY ?? context.parsed.y;
                  return `${label}: ${getNumberWithCommas(valueToShow)}${unit}`;
                } else {
                  // Use original value if available, otherwise use displayed value
                  const valueToShow = (context.raw as any)?.originalY ?? context.parsed.y;
                  return getNumberWithCommas(valueToShow);
                }
              }
            }
          },
          // downsampling
          decimation: {
            enabled: true,
            algorithm: 'lttb', // Largest-Triangle-Three-Buckets algorithm
            samples: 600, // Increased samples for better quality
            threshold: 1 // increase it may hang the ui due to swith of using/not using downsampling, disable it (set it to 0), will slowdown average zoom in.
          },
          zoom: {
            limits: {
              x: {
                min: 'original',
                max: 'original',
                //minRange: 180000  // 3 min the min range that can be zoomed
              }
            },
            pan: {
              enabled: true,
              mode: 'x',
              modifierKey: 'ctrl'
            },
            zoom: {
              // wheel: {
              //   enabled: true,
              //   speed: 0.02 
              // },
              // pinch: {
              //   enabled: true
              // },
              drag: {
                enabled: true,
                threshold: 10,
                drawTime: 'beforeDraw'
              },
              mode: 'x',
              onZoom: zoomCallback,
              onZoomComplete: (context => {
                const chart = context?.chart;
                if (!chart?.data?.datasets) {
                  return;
                }
                // make point visible when current points are less than MAX_POINTS_TO_RENDER
                const pointRadiusChangeFlag = chart.data.datasets.some(dataset => dataset.data.length <= MAX_POINTS_TO_RENDER);
                const pointRadius = pointRadiusChangeFlag ? 2 : 0;
                chart.data.datasets.forEach((dataset: any) => {
                  dataset.pointRadius = pointRadius;
                });

                if (chart.options?.elements?.point) {
                  chart.options.elements.point.radius = pointRadius;
                }
                chart.update();
              })
            }
          }
        },
        scales: ChartService._generateScales(time, data, yScale)
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
   * WORKAROUND: Setup mousemove event listener to fix Chart.js tooltip issue
   * Issue: https://github.com/chartjs/Chart.js/issues/11972
   * TODO: Remove this entire method when the Chart.js bug is fixed
   */
  private _setupTooltipWorkaround(chart: Chart): void {
    const canvas = chart.canvas;
    const mouseMoveHandler = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Check if mouse is within chart area
      const chartArea = chart.chartArea;
      if (chartArea) {
        const isInChartArea = x >= chartArea.left && x <= chartArea.right && 
                             y <= chartArea.bottom && y >= chartArea.top;
        
        // Get legend area (legend is positioned at bottom)
        const legendArea = chart.legend;
        let isInLegendArea = false;
        if (legendArea && (legendArea as any).legendHitBoxes) {
          isInLegendArea = (legendArea as any).legendHitBoxes.some((hitBox: any) => 
            x >= hitBox.left && x <= hitBox.left + hitBox.width &&
            y >= hitBox.top && y <= hitBox.top + hitBox.height
          );
        }
        
        if (!isInChartArea && !isInLegendArea) {
          // Mouse is in axis area (but not legend), force hide tooltip and active points
          if (chart.tooltip) {
            chart.tooltip.setActiveElements([], {x: 0, y: 0});
          }
          // Clear active elements to hide hover points
          chart.setActiveElements([]);
          chart.update('none');
          canvas.style.cursor = 'default';
        }
      }
    };
    
    canvas.addEventListener('mousemove', mouseMoveHandler);
    
    // Store the handler for cleanup
    (chart as any)._mouseMoveHandler = mouseMoveHandler;
  }

  /**
   * WORKAROUND: Clean up mousemove event listener for Chart.js tooltip issue
   * Issue: https://github.com/chartjs/Chart.js/issues/11972
   * TODO: Remove this entire method when the Chart.js bug is fixed
   */
  private _cleanupTooltipWorkaround(chart: Chart): void {
    const canvas = chart.canvas;
    const mouseMoveHandler = (chart as any)._mouseMoveHandler;
    if (canvas && mouseMoveHandler) {
      canvas.removeEventListener('mousemove', mouseMoveHandler);
    }
  }

  /**
   * destroy the chart, release the resource of the chart
   */
  private _destroyChart(chart: Chart): Promise<void> {
    return new Promise((resolve) => {
      if (chart) {
        // WORKAROUND: Clean up tooltip workaround - TODO: Remove when Chart.js bug is fixed
        this._cleanupTooltipWorkaround(chart);
        chart.destroy();
      }
      resolve();
    });
  }
  
  /**
   * update/refresh the chart
   */
  private _updateChart(chart: Chart): Promise<void> {
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
        // Use the zoom plugin's resetZoom method
        if (chart.resetZoom) {
          chart.resetZoom();
        }
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
                    zoomCB): Promise<void> {
    return new Promise((resolve, reject) => {
      const ctx = (<HTMLCanvasElement> document.getElementById('chartNameServerHistory'))?.getContext('2d');
      if (ctx) {
        this._chart = new Chart(ctx, ChartService._generateChartConfig(time, data, yScale, header, headerKey, selection, tableSource, title, defaultItems, zoomCB));
        // WORKAROUND: Setup tooltip workaround - TODO: Remove when Chart.js bug is fixed
        this._setupTooltipWorkaround(this._chart);
        resolve();
      } else {
        reject('Can not find the canvas.');
      }
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
