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
import * as utils from './utils';
import { DataMipmap } from './data_mipmap';

/**
 * A mipmap data structure that uses Largest-Triangle-Three-Buckets algorithm to downsample data
 */
export class LTTBDataMipmap extends DataMipmap {
    protected resolutions: number[];

    override getMipMapIndexForResolution(resolution: number): number {
        if (utils.isNil(resolution)) { return 0; }

        let index = utils.findIndexInArray(this.resolutions, (levelResolution) => levelResolution >= resolution);
        if (index === -1) {
            // use smallest mipmap as fallback
            index = this.resolutions.length - 1;
        }

        return index;
    }

    protected override createMipMap(): void {
        super.createMipMap();
        this.resolutions = this.mipMaps.map((level) => this.computeAverageResolution(level));
    }

    /**
     * This method is adapted from: https://github.com/sveinn-steinarsson/flot-downsample
     *
     * The MIT License
     * Copyright (c) 2013 by Sveinn Steinarsson
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    protected override downsampleToResolution(
        data: ChartPoint[],
        targetResolution: number,
        targetLength: number
    ) {
        const dataLength = data.length;
        if (targetLength >= dataLength || targetLength === 0) {
            return data; // data has target size
        }

        const output: ChartPoint[] = [];

        // bucket size, leave room for start and end data points
        const bucksetSize = (dataLength - 2) / (targetLength - 2);

        let a = 0;  // initially a is the first point in the triangle
        let maxAreaPoint: ChartPoint;
        let maxArea: number;
        let area: number;
        let nextA: number;

        // always add the first point
        output.push(data[a]);

        for (let i = 0; i < targetLength - 2; ++i) {
            // Calculate point average for next bucket (containing c)
            let avgX = 0;
            let avgY = 0;
            let avgRangeStart = Math.floor((i + 1) * bucksetSize) + 1;
            let avgRangeEnd = Math.floor((i + 2) * bucksetSize) + 1;
            avgRangeEnd = avgRangeEnd < dataLength ? avgRangeEnd : dataLength;

            const avgRangeLength = avgRangeEnd - avgRangeStart;

            for (; avgRangeStart < avgRangeEnd; avgRangeStart++) {
                avgX += this.getTime(data[avgRangeStart]);
                avgY += data[avgRangeStart].y as number * 1;
            }
            avgX /= avgRangeLength;
            avgY /= avgRangeLength;

            // Get the range for this bucket
            let rangeOffs = Math.floor((i + 0) * bucksetSize) + 1;
            const rangeTo = Math.floor((i + 1) * bucksetSize) + 1;

            // Point a
            const pointA = data[a];
            const pointAX = this.getTime(pointA);
            const pointAY = pointA.y as number * 1;

            maxArea = area = -1;

            for (; rangeOffs < rangeTo; rangeOffs++) {
                // Calculate triangle area over three buckets
                area = Math.abs((pointAX - avgX) * (data[rangeOffs].y as number - pointAY) -
                    (pointAX - this.getTime(data[rangeOffs])) * (avgY - pointAY)
                ) * 0.5;

                if (area > maxArea) {
                    maxArea = area;
                    maxAreaPoint = data[rangeOffs];
                    nextA = rangeOffs; // Next a is this b
                }
            }

            output.push(maxAreaPoint); // Pick this point from the bucket
            a = nextA; // This a is the next a (chosen b)
        }

        output.push(data[dataLength - 1]); // Always add last

        return output;
    }

    protected computeAverageResolution(data: ChartPoint[]): number {
        let timeDistances = 0;

        for (let i = 0, end = this.originalData.length - 1; i < end; ++i) {
            const current = this.originalData[i];
            const next = this.originalData[i + 1];

            timeDistances += Math.abs(this.getTime(current) - this.getTime(next));
        }
        return timeDistances / (data.length - 1);
    }
}
