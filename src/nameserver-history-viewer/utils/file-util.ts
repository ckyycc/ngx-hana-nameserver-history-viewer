import {getTimeFromTimeZone} from './time-util';

const _DEFAULT_PORT = 'DEFAULT';

/**
 * get the default port string (for non-MDC system)
 */
export function getDefaultPort(): string {
  return _DEFAULT_PORT;
}

/**
 * get abbreviated file name
 * @param fileName
 */
export function getAbbreviatedFileName(fileName: string): string {
  return fileName == null || fileName.length <= 22 ? fileName : `${fileName.slice(0, 11)}...${fileName.slice(-11)}`;
}

/**
 * get port if empty return default port
 */
export function getPort(port: string): string {
  return port == null || port.length === 0 ? _DEFAULT_PORT : port;
}

/**
 * get all real ports except the default port "default"
 */
export function getRealPorts(ports: string[], includeDefault: boolean = false): string[] {
  if (ports == null) {
    return [];
  }
  if (includeDefault) {
    return ports;
  } else {
    return ports.filter(port => port !== _DEFAULT_PORT);
  }
}

/**
 * get file from <input>
 * @param inputTarget
 */
export function  getFileFromInput(inputTarget: any): File {
  if (inputTarget && inputTarget.files && inputTarget.files.length >= 0) {
    return inputTarget.files[0];
  }
}

/**
 * get file from drag and drop
 */
export function getFileFromDrop(dragEvent: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (dragEvent.error) {
      reject(dragEvent.error);
    } else {
      if (dragEvent.file) {
        resolve(dragEvent.file);
      }
    }
  });
}

/**
 * Check whether the port from file is the same with the selected port.
 * If the selected port is empty, return true directly. This makes all ports will be selected.
 * @param portFromFile Port read from file
 * @param portFromSelection Port from selection.
 * @param isMDC MDC flag
 */
export function isSamePort(portFromFile: string, portFromSelection: string, isMDC: boolean): boolean {
  // if it's MDC system, and the port From File is default port, return false
  if (isMDC && portFromFile === _DEFAULT_PORT) {
    return false;
  }
  // if selected port is empty, return true directly. This makes all ports being selected
  if (portFromSelection == null || portFromSelection.length === 0) {
    return true;
  }

  return portFromFile === portFromSelection || portFromFile.slice(-2) === portFromSelection.slice(-2);
}

/**
 * As javascript can't get the full path of file, if these two files have same
 * 1. lastModified, 2. name, 3. size, these two files are considered as the same file
 */
export function isSameFile(file1: File, file2: File): boolean {
  if (file1 && file2) {
    if (file1.lastModified === file2.lastModified && file1.name === file2.name && file1.size === file2.size) {
      return true;
    }
  }
  return false;
}

/**
 * Check whether the provided port is a valid port (3xxxx)
 */
export function isValidPort(port: string): boolean {
  return port && port.length === 5 && port[0] === '3';
}

/**
 * get next value from current value base on the operator "<" or ">".
 * Keep using current value until the "nextValue" is not empty.
 */
export function calculateValue(lastValue: number, nextValue: string): number {
  // if the relative value missed, it's null.
  // And if it's missed, just use current value from last line.
  let newValue = lastValue;
  if (nextValue != null && nextValue.length > 0) {
    if (nextValue[0] === '<') {
      newValue = lastValue - parseFloat(nextValue.slice(1));
    } else if (nextValue[0] === '>') {
      newValue = lastValue + parseFloat(nextValue.slice(1));
    } else {
      newValue = parseFloat(nextValue);
    }
  }
  return newValue;
}

/**
 * get next time value from current time base on the operator "<" or ">".
 * If nextValue is not "<" or ">", returns converted time base on the timezone
 */
export function calculateValue4Time(lastValue: number, nextValue: string, timezone: string): number {
  // if the relative value missed, it's null.
  // And if it's missed, just use current value from last line.
  let newValue = lastValue;
  if (nextValue != null && nextValue.length > 0) {
    if (nextValue[0] !== '<' && nextValue[0] !== '>') {
      newValue = getTimeFromTimeZone(parseFloat(nextValue), timezone);
    } else {
      newValue = calculateValue(lastValue, nextValue);
    }
  }
  return newValue;
}

/**
 * check whether the data comes from valid nameserver history file
 */
export function validateData(data: string[][]): boolean {
  return data == null ? false : data.length >= 4 && ['host', 'time'].every(i => data[0].includes(i));
}

/**
 * convert blob to file
 * @param theBlob
 * @param fileName
 */
export function blobToFile (theBlob: Blob, fileName: string): File {
  const blob: any = theBlob;
  // A Blob() is almost a File() - it's just missing the two properties below which we will add
  blob.lastModifiedDate = new Date();
  blob.name = fileName;

  // Cast to a File() type
  return <File>theBlob;
}

/**
 * check the object is a File object or not a File(Blob)
 * @param obj
 */
export function isFile(obj): boolean {
  return obj && typeof obj.name === 'string';
}
