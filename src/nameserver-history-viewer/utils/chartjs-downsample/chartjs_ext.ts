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
import { Chart } from 'chart.js';

/**
 * A chart scale
 */
export interface Scale {
    left: number;
    right: number;
    top: number;
    bottom: number;

    /**
     * Returns the location of the given data point. Value can either be an index or a numerical value
     * The coordinate (0, 0) is at the upper-left corner of the canvas
     * @param value
     * @param index
     * @param datasetIndex
     */
    getPixelForValue(value: any, index?: number, datasetIndex?: number): number;

    /**
     * Used to get the data value from a given pixel. This is the inverse of getPixelForValue
     * The coordinate (0, 0) is at the upper-left corner of the canvas
     * @param pixel
     */
    getValueForPixel(pixel: number): any;
}

/**
 * A time-based chart scale
 */
export interface TimeScale extends Scale {
    /**
     * Returns the location of the given data point. Value can either be an index or a numerical value
     * The coordinate (0, 0) is at the upper-left corner of the canvas
     * @param value
     * @param index
     * @param datasetIndex
     */
    getPixelForValue(value: Date, index?: number, datasetIndex?: number): number;

    /**
     * Used to get the data value from a given pixel. This is the inverse of getPixelForValue
     * The coordinate (0, 0) is at the upper-left corner of the canvas
     * @param pixel
     */
    getValueForPixel(pixel: number): Date;
}

/**
 * Interface for a chart.js plugin
 */
export interface IChartPlugin {
    beforeInit?: (chartInstance: Chart) => void;
    afterInit?: (chartInstance: Chart) => void;

    resize?: (chartInstance: Chart, newChartSize: [number, number]) => void;

    beforeUpdate?: (chartInstance: Chart) => void | boolean;
    afterScaleUpdate?: (charInstance: Chart) => void;
    afterLayout?: (charInstance: Chart) => void;
    beforeDatasetsUpdate?: (charInstance: Chart) => void | boolean;
    afterDatasetsUpdate?: (charInstance: Chart) => void;
    afterUpdate?: (charInstance: Chart) => void;

    beforeRender?: (charInstance: Chart) => void | boolean;

    beforeDraw?: (charInstance: Chart, easing: string) => void | boolean;
    afterDraw?: (charInstance: Chart, easing: string) => void;

    // Before the datasets are drawn but after scales are drawn
    beforeDatasetsDraw?: (charInstance: Chart, easing: string) => void | boolean;
    afterDatasetsDraw?: (charInstance: Chart, easing: string) => void;

    destroy?: (charInstance: Chart) => void;

    // Called when an event occurs on the chart
    beforeEvent?: (charInstance: Chart, event: any) => void | boolean;
    afterEvent?: (charInstance: Chart, event: any) => void;
}
