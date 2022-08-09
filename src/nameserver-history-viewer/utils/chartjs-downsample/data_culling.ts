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
import { ChartPoint } from 'chart.js';
import { Scale } from './chartjs_ext';
import moment from 'moment';
import * as utils from './utils';

export type XValue = number | string | Date | moment.Moment;
export type Range = [XValue, XValue];

function getCompareValue(value: XValue): number {
    if (typeof value === 'number') {
        return value;
    } else if (typeof value === 'string') {
        return (new Date(value)).getTime();
    } else if (value instanceof Date) {
        return value.getTime();
    } else {
        return moment(value).toDate().getTime();
    }
}

export function rangeIsEqual(previousValue: Range, currentValue: Range): boolean {
    if (utils.isNil(previousValue) ||
        utils.isNil(currentValue) ||
        utils.isNil(previousValue[0]) ||
        utils.isNil(previousValue[1]) ||
        utils.isNil(currentValue[0]) ||
        utils.isNil(currentValue[1])
    ) {
        return false;
    }

    previousValue = [getCompareValue(previousValue[0]), getCompareValue(previousValue[1])];
    currentValue = [getCompareValue(currentValue[0]), getCompareValue(currentValue[1])];

    return previousValue[0] === currentValue[0] && previousValue[1] === currentValue[1];
}

export function getScaleRange(scale: Scale): Range {
    if (utils.isNil(scale)) {
      return [null, null];
    }

    const start = scale.getValueForPixel(scale.left);
    const end = scale.getValueForPixel(scale.right);

    return [start, end];
}

export function cullData(data: ChartPoint[], range: Range): ChartPoint[] {
    const startValue = getCompareValue(range[0]);
    const endValue = getCompareValue(range[1]);
    let startIndex = 0;
    let endIndex = data.length;

    for (let i = 1; i < data.length; ++i) {
        const point = data[i];
        const compareValue = getCompareValue(point.x || point.t);

        if (compareValue <= startValue) {
            startIndex = i;
        }

        if (compareValue >= endValue) {
            endIndex = i + 1;
            break;
        }
    }

    return data.slice(startIndex, endIndex);
}
