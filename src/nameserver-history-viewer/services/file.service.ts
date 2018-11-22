import {Injectable} from '@angular/core';
import {
  calculateValue,
  getDefaultPort,
  getPort,
  getTimeFromTimeZone,
  isSamePort,
  isValidPort,
  printProcessedTime,
  validateData
} from '../utils';
import {parse} from 'papaparse';
import {Abort, ChartContent, ChartContentData, ChartContentTime} from '../types';

/**
 * prevent browser from crashing, set the max rows limitation.
 * This could be overwritten by the input:maxRowsLimitation of the component.
 */
const _DEFAULT_MAX_ROWS_IN_MEMORY = 100000;

@Injectable()
export class FileService {
  /**
   * prevent browser from crashing, set the max rows limitation.
   * @param limitation if this parameter is not null, the default value will be overwritten by this one.
   */
  private static _getMaxRowsLimitation(limitation: any = null) {
    if (limitation == null || isNaN(limitation) || limitation.length === 0) {
      return _DEFAULT_MAX_ROWS_IN_MEMORY;
    }
    return Number(limitation);
  }

  /**
   * get all available ports from data
   */
  private static _getPorts(data: string[][], firstChunk: boolean, ports: string[]) {
    let line = 0;
    if (firstChunk) {
      // start from line 3
      line = 2;
    }

    for (; line < data.length; line++) {
      const dataItem = data[line][1];
      if (dataItem != null && dataItem.length > 0) {
        if (isValidPort(dataItem) && ports.indexOf(dataItem) === -1) {
          ports.push(dataItem);
        }
      }
    }
  }

  /**
   * get the time column from the analyzed data
   * @param data the analyzed data
   * @param firstChunk whether it's first chunk or not
   * @param timezone selected timezone
   * @param startTime selected starting time. It's millisecond, need to be converted second.
   * @param endTime selected ending time. It's millisecond, need to be converted second.
   * @param lastProcessedTime last processed time form last chunk
   * @param time time object which contains the time data for all ports
   * @param selectedPort if the selected port is empty (did not select any port), all ports info are needed
   * @param isMDC flag for MDC system
   * @param maxRowsLimitation prevent browser from crashing, set the max rows limitation.
   * This comes from the input: maxRowsLimitation of the component.
   */
  private static _getTimeColumn(data: string[][],
                                firstChunk: boolean,
                                timezone: string,
                                startTime: number,
                                endTime: number,
                                lastProcessedTime: number,
                                time: ChartContentTime,
                                selectedPort: string,
                                isMDC: boolean,
                                maxRowsLimitation: any) {
    // convert millisecond to second for startTime and endTime.
    startTime = startTime / 1000;
    endTime = endTime / 1000;
    const timeColumn = 2;
    let startLine = 0;
    let iStart = -1;
    let iEnd = -1;

    let curTime = lastProcessedTime;
    let lastProcessedTimeReturn;
    let totalNum = 0;
    let mdcFlag = isMDC;
    const defaultPort = getDefaultPort();
    const maxRowNum = this._getMaxRowsLimitation(maxRowsLimitation);

    if (firstChunk) {
      if (curTime >= startTime && curTime <= endTime) {
        iStart = 1; // start from first line

        /** Modified at 2018/10/10,
         * in some case, eg: the nameserver history trace gets modified by Kook, Jin Young's python script,
         * the port show in the first line as well, and does not like the non-mdc system, this kind of file has
         * one port in it. The history for non-mdc system doesn't have port info in the port column.*/

          // get port for the line 1.
        const firstLinePort = getPort(data[1][1]);
        // init time array for the first line.
        if (!selectedPort || selectedPort.length === 0 || isSamePort(firstLinePort, selectedPort, mdcFlag)) {
          // does not select any port or
          // it's non-mdc (mdcFlag is false at the beginning) system and the selected port is the first line port
          time[firstLinePort] = [];
          time[firstLinePort][0] = curTime * 1000;
        }
      }
      lastProcessedTimeReturn = curTime;
      startLine = 2;
    }

    // get current total number
    Object.keys(time).forEach(key => {
      if (time[key]) {
        totalNum += time[key].length;
      }
    });

    if (curTime == null) {
      console.error('getTimeColumn', 'Can not get the time from the file, internal error!');
      return {indexStart: null, indexEnd: null, lastProcessedTime: null, isMDC: null};
    }

    for (let i = startLine; i < data.length; i++) {
      // sometime the last line is empty, need to be skipped.
      if (data[i] == null || data[i].length === 0 || (data[i].length === 1 && data[i][0].length === 0)) {
        continue;
      }

      // get port number and initialize the relative port array in time
      const port = getPort(data[i][1]); // data[i][1] == null || data[i][1].length == 0 ? __DEFAULT_PORT : data[i][1];
      if (!(port in time)) {
        // add undefined port to time, then we can find all ports in time
        time[port] = void 0;
      }
      if (time[port] == null && isSamePort(port, selectedPort, mdcFlag)) {
        time[port] = [];
        // if other ports exists in this file, default port will be set to undefined.
        if (!mdcFlag && port !== defaultPort && time[defaultPort]) {
          // update the total num;
          totalNum -= time[defaultPort].length;
          time[defaultPort].length = 0;
          time[defaultPort] = void 0;
          mdcFlag = true;
        }
      }
      curTime = calculateValue(curTime, data[i][timeColumn]);
      if (curTime > endTime) {
        if (iEnd < 0) {
          iEnd = i - 1;
        }
        break;
      }
      if (iStart >= 0) {
        if (time[port]) {
          // not null means it's the selected port
          time[port][time[port].length] = curTime * 1000;
          totalNum ++;
        }
      } else {
        if (curTime >= startTime && curTime <= endTime) {
          if (time[port]) {
            // only selected port counted in
            if (iStart < 0) {
              iStart = i;
            }
            time[port][time[port].length] = curTime * 1000;
            totalNum ++;
          }
        }
      }
      // last processed time need to be recorded anyway
      lastProcessedTimeReturn = curTime;

      if (totalNum >= maxRowNum) {
        iEnd = i;
        break;
      }
    }
    return {indexStart: iStart, indexEnd: iEnd, lastProcessedTime: lastProcessedTimeReturn, isMDC: mdcFlag};
  }

  /**
   * Get data for all columns
   * @param columnNum the total number of columns. For mdc system,
   *                  the length of each row is different. Host relative data does not exist in tenant line.
   *                  Needs to use column number from the first line.
   * @param data      data parsed by papa
   * @param firstChunk the flag which identifies whether it's the first chunk or not.
   * @param time
   * @param indexStart
   * @param indexEnd
   * @param lastProcessedLine
   * @param resultData   the result data after analyzed
   * @param selectedPort
   * @param isMDC
   */
  private static _getDataColumns(columnNum: number,
                                 data: string[][],
                                 firstChunk: boolean,
                                 time: ChartContentTime,
                                 indexStart: number,
                                 indexEnd: number,
                                 lastProcessedLine: number[],
                                 resultData: ChartContentData,
                                 selectedPort: string,
                                 isMDC: boolean) {
    let startLine = 0;
    // for mdc system, the length is not correct (host relative data only exists in the "empty" port line).
    // Needs to use header from the first line.
    // const columnNum = data[0].length;

    if (firstChunk) {
      /**
       * Modified at 2018/10/10,
       * in some case, eg: the nameserver history trace gets modified by Kook, Jin Young's python script,
       * the port show in the first line as well, and does not like the non-mdc system, this kind of file has
       * one port in it. The history for non-mdc system doesn't have port info in the port column.
       */

      // get port for the line 1.
      const firstLinePort = getPort(data[1][1]);
      // Initialize data column with default 'DEFAULT' port if it's not MDC system. MDC system, 'DEFAULT' gets ignored
      if (!isMDC && time[firstLinePort]) {
        resultData[firstLinePort] = [];
        // removed below logic, because first line is the real number, do not need to do the convert.
        // curLine = data[1].slice(3).map(Number);
        for (let j = 3; j < columnNum; j++) {
          const index = j - 3;

          // initialize data array for all columns of the default '0000' port
          resultData[firstLinePort][index] = [];
          // get the first line data of the column if it's included
          if (indexStart === 1) {
            resultData[firstLinePort][index][0] = {x: time[firstLinePort][0], y: lastProcessedLine[index]};
          }
        }
      }
      startLine = 2;
    }

    for (let j = 3; j < columnNum; j++) {
      const index = j - 3;
      for (let i = startLine; i < data.length; i++) {
        // sometime the last line is empty, need to be skipped.
        if (data[i] == null || data[i].length === 0 || (data[i].length === 1 && data[i][0].length === 0)) {
          continue;
        }

        // get port number and initialize the relative port array in data
        const port = getPort(data[i][1]);
        if (resultData[port] == null && isSamePort(port, selectedPort, isMDC)) {
          resultData[port] = [];
        }
        if (resultData[port] && resultData[port][index] == null) {
          resultData[port][index] = [];
        }

        lastProcessedLine[index] = calculateValue(lastProcessedLine[index], data[i][j]);
        if (i >= indexStart && (i <= indexEnd || indexEnd < 0) && indexStart >= 0) {
          if (resultData[port]) {
            const length = resultData[port][index].length;
            resultData[port][index][length] = {x: time[port][length], y: lastProcessedLine[index]};
          }
        } else if (indexEnd > 0 && i > indexEnd) {
          break;
        }
      }
    }
  }

  /**
   * Get Chart data from provided file.
   * @param file the nameserver history file
   * @param startTime
   * @param endTime
   * @param port
   * @param timezone
   * @param maxRowsLimitation prevent browser from crashing, set the max rows limitation.
   * @param progress call back function for updating progress
   */
  public getChartContentFromFile(file: File,
                                 startTime: number,
                                 endTime: number,
                                 port: string,
                                 timezone: string,
                                 maxRowsLimitation: any,
                                 progress: any): Promise<ChartContent> {
    // load done, beginning parsing
    const beginTime = new Date();
    let firstChunk = true;
    // save last processed data just for the later calculation
    let lastProcessedData;
    // save last processed time just for the later calculation
    let lastProcessedTime;
    // save last processed cursor position for progress calculation.
    // let lastProcessedCursor = 0;
    let indexStart = -1, indexEnd = -1;
    const time: ChartContentTime = {};
    const data: ChartContentData = {};
    let header;
    let host;
    let isMDC = false;
    let columnNum;
    let abortType: Abort;

    const rejectAndAbort = (reject, parser) => {
      if (progress) {
        progress(100);
      }
      reject(`${file.name} is empty or the format is not correct.`);
      parser.abort();
    };
    return new Promise((resolve, reject) => {
      parse(file, {
        chunk: (results, parser) => {
          // the progress increment of this step
          // let analyzeStepProgress = (results.meta.cursor - lastProcessedCursor) / file.size * 100;
          printProcessedTime(beginTime, 'step1');
          if (indexEnd >= 0) {
            // already finished, quite.
            return;
          } else {
            // reset start point
            indexStart = -1;
          }

          // get time column
          if (firstChunk) {
            if (!validateData(results.data)) {
              return rejectAndAbort(reject, parser);
            }

            // initialize the header
            header = results.data[0].slice(3);
            // get column number
            columnNum = results.data[0].length;
            // get host name
            host = results.data[1][0];
            // get the first line time info from first line, it is a real number, do not need to do the convert with ">,<".
            lastProcessedTime = getTimeFromTimeZone(parseFloat(results.data[1][2]), timezone);
            // get the first line data info from first line, it is a real number, do not need to do the convert with ">,<".
            lastProcessedData = results.data[1].slice(3).map(Number);
          }

          printProcessedTime(beginTime, 'step2');

          if (!lastProcessedData) {
            return rejectAndAbort(reject, parser);
          }

          // get time column
          ({indexStart, indexEnd, lastProcessedTime, isMDC} = FileService._getTimeColumn(
            results.data, firstChunk, timezone, startTime, endTime, lastProcessedTime, time, port, isMDC, maxRowsLimitation));
          printProcessedTime(beginTime, 'step3');

          if (indexStart == null && indexEnd == null && lastProcessedTime == null && isMDC == null) {
            return rejectAndAbort(reject, parser);
          }

          // get all other data columns
          FileService._getDataColumns(
            columnNum, results.data, firstChunk, time, indexStart, indexEnd, lastProcessedData, data, port, isMDC);

          if (firstChunk) {
            firstChunk = false;
          }

          printProcessedTime(beginTime, 'step4');

          if (indexEnd >= 0) {
            // do not need to process the left parts, manually trigger complete
            const processedLines = Object.keys(time).reduce((total, curKey) => time[curKey] ? total + time[curKey].length : total, 0);
            if (processedLines >= FileService._getMaxRowsLimitation(maxRowsLimitation)) {
              abortType = Abort.maxLineNumReached;
            } else {
              abortType = Abort.maxTimeRangeReached;
            }

            if (progress) {
              progress(100);
            }
            parser.abort();
            return;
          } else {
            // the overall progress if this step is finished
            if (progress) {
              progress(Math.round(results.meta.cursor / file.size * 100));
            }
            // lastProcessedCursor = results.meta.cursor;
          }
        },
        complete: () => {
          printProcessedTime(beginTime, 'step_complete');
          resolve ({header: header, host: host, time: time, data: data, aborted: abortType});
        }
      });
    });
  }

  /**
   * Get all ports from the name server history file
   * @param file the name server history file
   * @param progress call back for updating the progress
   */
  public getPortsFromFile(file: File, progress: any): Promise<string[]> {
    const beginTime = new Date();
    let firstChunk = true;
    const ports = [];
    const defaultPort = getDefaultPort();
    return new Promise((resolve, reject) => {
      parse(file, {
        chunk: (results, parser) => {
          // get time column
          if (firstChunk) {
            if (!validateData(results.data)) {
              if (progress) {
                progress(100);
              }
              reject(`${file.name} is empty or the format is not correct.`);
              parser.abort();
              return;
            }
          }
          printProcessedTime(beginTime, 'port.step1');
          FileService._getPorts(results.data, firstChunk, ports);
          if (firstChunk) {
            firstChunk = false;
          }
          if (progress) {
            progress(Math.round(results.meta.cursor / file.size * 100));
          }
        },
        complete: () => {
          // parsing done
          printProcessedTime(beginTime, 'step_complete');
          if (ports.length === 0) {
            ports[0] = defaultPort;
          }
          resolve (ports);
        }
      });
    });
  }
}
