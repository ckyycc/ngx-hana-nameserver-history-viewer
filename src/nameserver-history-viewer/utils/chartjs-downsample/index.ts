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
import * as chartjs from 'chart.js';
const Chart = window && (window as any).Chart ? (window as any).Chart : chartjs.Chart;

import { ResponsiveDownsamplePlugin, ResponsiveDownsamplePluginOptions } from './responsive_downsample_plugin';
export { ResponsiveDownsamplePlugin, ResponsiveDownsamplePluginOptions } from './responsive_downsample_plugin';


// comment this because this plugin is only used internally, merge ChartOptions interface is unnecessary
// and causes build error: "error TS2665: Invalid module name in augmentation.".
// // Extend chart.js options interface
// declare module 'chart.js' {
//     interface ChartOptions {
//         /**
//          * Options for responsive downsample plugin
//          */
//         responsiveDownsample?: ResponsiveDownsamplePluginOptions;
//     }
// }

Chart.pluginService.register(new ResponsiveDownsamplePlugin());
