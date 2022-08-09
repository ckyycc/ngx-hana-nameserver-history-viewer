import {AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import {
  setChartHeight,
  sleep,
  isEmptyData,
  getDisplayPort,
  getFileFromInput,
  isSameFile,
  getAbbreviatedFileName,
  getFileFromDrop,
  getRealPorts,
  getTimeString,
  printProcessedTime,
  getTimeRangeString,
  generatePorts,
  getDefaultTimezone,
  blobToFile
} from '../utils';
import { Abort, Alert, HtmlElement, Item, ChartContentData, ChartContentHeader, ChartContentTime, Port } from '../types';
import { FileService, ChartService, UIService } from '../services';

import 'hammerjs';
import '../utils/chartjs-downsample';
import '../utils/chartjs-zoom';

enum SearchType {
  searchWithSubHeader = 'searchWithSubHeader',
  searchAll = 'searchAll',
  searchInChildren = 'searchInChildren'
}

@Component({
  selector: 'ngx-hana-nameserver-history-viewer',
  templateUrl: './nameserver-history.component.html',
  styleUrls: [ './nameserver-history.component.scss' ],
  providers: [ FileService, ChartService, UIService ]
})
export class NameServerHistoryComponent implements OnChanges, AfterViewInit {
  @ViewChild('nameserverHistoryAll', { read: ElementRef }) nameserverHistoryAllRef: ElementRef;
  @ViewChild('nameserverHistoryContent', { read: ElementRef }) nameserverHistoryContentRef: ElementRef;

  /**
   * Input (optional) bind to [defaultSelectedItems]
   */
  @Input() defaultSelectedItems: string[];

  /**
   * Input (optional) bind to [hideMeasureColumns]
   */
  @Input() hideMeasureColumns: string[];

  /**
   * Input (optional) bind to [maxRowsLimitation]
   */
  @Input() maxRowsLimitation: number;

  /**
   * Input (optional) bind to [showInstruction]
   */
  @Input() showInstruction = true;

  /**
   * Input (optional) bind to [timezone]
   */
  @Input() timezone: string;

  /**
   * file buffer, use this for stream mode
   */
  @Input() fileBuffer: Blob;

  /**
   * file name for stream mode
   */
  @Input() streamModeFileName: string;

  /**
   * auto display the chart in stream mode
   */
  @Input() autoDisplay: boolean;

  /**
   * selected name server history file
   */
  file: File;

  /**
   * time info of the name server history file
   */
  time: ChartContentTime = {};

  /**
   * data of the name server history file
   */
  data: ChartContentData = {};

  /**
   * header of the name server history file
   */
  header: ChartContentHeader[] = [];

  /**
   * host of the name server history file
   */
  host = 'nameserver history file';

  /**
   * alert message content
   */
  alertMessage: string;

  /**
   * alert message type
   */
  alertType: Alert;

  /**
   * selected port
   */
  port: string;

  /**
   * all the ports from the nameserver history file
   */
  ports: Port[];

  /**
   * selected time range
   */
  dateTimeRange: Date[];

  /**
   * data source for the selection table (right part of the chart)
   */
  tableSource: any[];

  /**
   * the progress for reading file
   */
  readProgress = 0;

  /**
   * selected/dropped file name (abbreviation), full file name will be shown via the tooltips
   */
  abbreviatedFileName = 'or Drop File Here';

  /**
   * for the instruction step 4
   */
  stepShowChart = false;

  /**
   * control flag for showing the name server history chart
   */
  showChartFlag: boolean;

  /**
   * control flag for showing the file reading progress
   */
  showReadFileProgress: boolean;

  /**
   * control flag for "Load" ports button
   */
  enableLoadPortsButton: boolean;

  /**
   * control flag for enabling "Show" chart button
   */
  enableShowChartButton: boolean;

  /**
   * control flag for "Reset" chart button
   */
  enableResetChartButton: boolean;

  searchType = SearchType.searchAll;

  /**
   * selection information for the selection table
   */
  private _selection: SelectionModel<any>;

  /**
   * current displaying port
   */
  private _currentChartPort: string;

  constructor(private fileService: FileService,
              private chartService: ChartService,
              private uiService: UIService) {}

  async ngOnChanges(changes: SimpleChanges) {
    const fbc = changes.fileBuffer;
    if (fbc && fbc.currentValue && fbc.currentValue !== fbc.previousValue) {
      // simulate selecting file
      const simulatedEvent = {target: {files: [blobToFile(this.fileBuffer, this.streamModeFileName)]}};
      await this.fileSelected(simulatedEvent);
      this.port = undefined; // clear the port selection
      if (this.autoDisplay) {
        this.onResize(); // ngAfterViewInit/resize won't work in electron
        this.showChart();
      }
    }
  }

  ngAfterViewInit() {
    // init items' status
    // reset chart button will be disable by default later, only be enabled after zoomed
    this._toggleItems([
      {id: HtmlElement.chartArea, status: false},
      {id: HtmlElement.readFileProgress, status: false},
      {id: HtmlElement.showChartButton, status: false},
      {id: HtmlElement.loadPortsButton, status: true},
      {id: HtmlElement.resetChartButton, status: false}]);
    this.onResize(); // update the size, otherwise there may have a scrollbar (because of the toast) if auto display is set to true
  }

  /**
   * Reset Chart to initial status
   * If legend is already selected/unselected from the list, it wouldn't be restored.
   */
  resetChart(): void {
    this._toggleItems([{id: HtmlElement.resetChartButton, status: false}]);

    if (this.tableSource && this._selection) {
      this.chartService.resetChart(this.tableSource, this._selection)
        .catch(e => this._showMessage(Alert.error, e));
    }
  }

  /**
   * read the file and display the chart
   */
  showChart(): void {
    // after click, this button and reset button needs to be disabled
    this._toggleItems([
      {id: HtmlElement.resetChartButton, status: false},
      {id: HtmlElement.showChartButton, status: false}]);

    this.stepShowChart = true;

    this._initChartEnv().then(() => {
      const selectedTime = this._selectedTimeRange;
      if (selectedTime.startTime > selectedTime.endTime) {
        this._showMessage(Alert.error, 'Time range is not correct.');
        return;
      }
      if (this.file) {
        // it's time for displaying the reading progress bar
        this._toggleItems([{id: HtmlElement.readFileProgress, status: true}]);
        return this._buildChartFromDataFile(this.file, selectedTime.startTime, selectedTime.endTime, this.port);
      }
    }).catch(e => {
      this._showMessage(Alert.error, e);
      this._toggleItems([{id: HtmlElement.readFileProgress, status: false}]);
    });
  }

  /**
   * load all ports from file
   */
  loadPorts(): void {
    // do confirmation actions
    if (this.file) {
      // before start loading ports from file, display progress bar and disable the show chart button
      this._toggleItems([
        {id: HtmlElement.readFileProgress, status: true},
        {id: HtmlElement.showChartButton, status: false}
      ]);
      this._readPortsFromFile(this.file);
    }
  }

  /**
   * select name server history file, currently only supports 1 file.
   */
  async fileSelected(event: any) {
    const selectedFile = getFileFromInput(event.target);
    if (selectedFile) {
      if (!isSameFile(this.file, selectedFile)) {
        // init port selector
        await this._initPortSelector().catch(e => this._showMessage(Alert.error, e));

        this.file = selectedFile;
        this.abbreviatedFileName = getAbbreviatedFileName(this.file.name);
        // after file has been selected, the show chart button needs to be enabled
        this._toggleItems([{id: HtmlElement.showChartButton, status: true}]);
      }
    }
  }

  /**
   * drop name server history file, currently only supports 1 file.
   */
  fileDropped(event: any) {
    getFileFromDrop(event)
      .then(file => {
        if (!isSameFile(this.file, file)) {
          // init port selector
          this.file = file;
          if (this.file) {
            this.abbreviatedFileName = getAbbreviatedFileName(this.file.name);
            // after file has been dropped, the show chart button needs to be enabled
            this._toggleItems([{id: HtmlElement.showChartButton, status: true}]);
          }
        }})
      .then(() =>  {
        return this._initPortSelector();
      })
      .catch(e => this._showMessage(Alert.error, e));
  }

  /**
   * Select one item from selection table, relative dataset will be shown or hidden
   */
  selectItem(event: any) {
    if (event && event.tableRow) {
      const row = event.tableRow;
      this._selection.toggle(row);
      this.chartService.toggleDataInChart(row.KPI, !this._selection.isSelected(row))
        .catch(e => this._showMessage(Alert.error, e));
    }
  }

  /**
   * recalculating chart height when resizing
   */
  onResize() {
    const nameserverHistoryAllElement = this.nameserverHistoryAllRef ? this.nameserverHistoryAllRef.nativeElement : null;
    const nameserverHistoryContentElement = this.nameserverHistoryContentRef ? this.nameserverHistoryContentRef.nativeElement : null;
    setChartHeight(nameserverHistoryAllElement, nameserverHistoryContentElement);
  }

  /**
   * Switch port and reinitialize chart, triggered by changing the port
   * @param port the selected port
   */
  switchPortForChart(port: string): void {
    if (port === this._currentChartPort) {
      // not to switch port, because the relative port is displaying, no need to render twice.
      return;
    }
    if (!this.file || !port || port.length === 0 || port.slice(1, 3) === '**') {
      return;
    } else if (Object.keys(this.time).length > 1 && !getRealPorts(Object.keys(this.time).filter(key => this.time[key])).includes(port)) {
      this._showMessage(Alert.info, `Data of port:${port} is not loaded, please load the data first by clicking the "Show" button.`);
      return;
    }

    // only do switch ports when available ports number > 1
    if (Object.keys(this.time).filter(key => this.time[key]).length > 1) {
      // disable the "show chart" and "reset chart" button first
      this._toggleItems([
        {id: HtmlElement.showChartButton, status: false},
        {id: HtmlElement.resetChartButton, status: false}]);
      // init the environment with switch flag
      this._initChartEnv(true).then(() => {
        return this._buildChart(port, null, true);
      }).catch(e => this._showMessage(Alert.error, e));
    }
  }

  /**
   * get the columns which need to be hidden from the selection table
   */
  get hiddenColumns(): string[] {
    return this.uiService.getHiddenColumns(this.hideMeasureColumns);
  }

  /**
   * get default timezone
   */
  get defaultTimezone(): string {
    return getDefaultTimezone();
  }

  /**
   * get the key column (KPI)
   */
  get kpiColumn(): Item {
    return Item.kpi;
  }

  /**
   * get the key column (KPI)
   */
  get descColumn(): Item {
    return Item.description;
  }

  /**
   * get the selected time range, set second and millisecond part to 0
   */
  private get _selectedTimeRange(): {startTime: number, endTime: number} {
    let startTime = 0;
    let endTime = 4102358400000; // 2099/12/31
    if (this.dateTimeRange != null) {
      if (this.dateTimeRange.length >= 1) {
        // get start time
        if (this.dateTimeRange[0]) {
          startTime = this.dateTimeRange[0].setSeconds(0, 0);
        }
        if (this.dateTimeRange[1]) {
          endTime = this.dateTimeRange[1].setSeconds(0, 0);
        }
      }
    }
    return {startTime: startTime, endTime: endTime};
  }

  /**
   * get the time range string, eg: 2018-10-25 10:25 ~ 2018-10-26 10:26
   */
  private get _selectedTimeRangeString(): string {
    const selectedTimeRangeString = this._selectedTimeRange;
    return `${getTimeString(selectedTimeRangeString.startTime)} ~ ${getTimeString(selectedTimeRangeString.endTime)}`;
  }

  /**
   * get array of header key
   */
  private get _headerKey(): string[] {
    if (this.header) {
      return this.header.map(headerItem => headerItem.key);
    }
  }

  /**
   * get array of header text
   */
  private get _headerText(): string[] {
    return this.header.map(headerItem => headerItem.text);
  }

  /**
   * read ports from the selected nameserver history file
   * @param file nameserver history file
   */
  private _readPortsFromFile(file: File): void {
    this.fileService.getPortsFromFile(file, (progress) => {
      this.readProgress = progress;
    }).then(ports => {
      return sleep(100).then(() => {
        return this._initPortSelector(ports);
      });
    }).catch(e => this._showMessage(Alert.error, e));
  }

  /**
   * build chart from the selected nameserver history file
   * @param file the nameserver history file
   * @param startTime start time
   * @param endTime end time
   * @param selectedPort selected port for nameserver history file (MDC system)
   */
  private _buildChartFromDataFile(file: File, startTime: number, endTime: number, selectedPort: string): Promise<any> {
    return this.fileService.getChartContentFromFile(
      file,
      startTime,
      endTime,
      selectedPort,
      this.timezone,
      this.maxRowsLimitation, progress => this.readProgress = progress)
      .then(result => {
        // parsing done
        const beginTime = new Date();
        const promises = [];
        const ports = getRealPorts(Object.keys(result.time), true);
        ports.forEach(port => {
          // convert the unit and generate controlling data for all ports
          promises.push(this.uiService.convertUnitAndGenerateControlData(result.data[port], result.header, port));
        });

        return Promise.all(promises)
          .then(() => {

            // get all ports from the analyzed data(time)
            // get the port that will be shown in the page
            const port = getDisplayPort(ports, selectedPort);

            printProcessedTime(beginTime, 'converting step');
            ports.forEach( portItem => this.uiService.generateYScale(portItem));
            printProcessedTime(beginTime, 'generating YScale step');
            this.data = result.data;
            this.time = result.time;
            this.header = this.uiService.getHeader(result.header, port);
            this.host = result.host;
            if (result.aborted === Abort.maxLineNumReached) {
              this._showMessage(
                Alert.warning, `Maximum number of lines reached. Processed time range is: ${getTimeRangeString(this.time)}.`);
            } else {
              if (isEmptyData(this.data)) {
                this._showMessage(Alert.info, `Cannot find any data for the selected time period: ${this._selectedTimeRangeString}`);
              } else {
                this._showMessage(Alert.success, `Processed time range is: ${getTimeRangeString(this.time)}.`);
              }
            }
            return sleep(100).then(() => {
              return this._buildChart(port, ports);
            });
          });
      });
  }

  /**
   * reinitialize the port selector with the ports
   */
  private _initPortSelector(ports: string[] = null, selectedPort: string = null): Promise<void> {
    return new Promise(resolve => {
      // initialization for ngx-select
      if (ports != null && ports.length > 1) {
        // MDC, remove default '0000' port
        this.ports = generatePorts(getRealPorts(ports), selectedPort);
      } else {
        this.ports = generatePorts(ports);
      }

      if (ports != null && selectedPort === null) {
        // reset status when doing:
        // 1. loading ports
        // 2. the file doesn't contain the selected Port
        this.readProgress = 0;
        // hide the progress bar and enable the "show chart" button
        this._toggleItems([
          {id: HtmlElement.readFileProgress, status: false},
          {id: HtmlElement.showChartButton, status: true}
        ]);
      }
      resolve();
    });
  }

  /**
   * build and display the chart on page
   * @param port the selected port
   * @param ports all available ports
   * @param switchFlag indicates whether this function is triggered from switching ports (no init port selector needed)
   */
  private _buildChart(port: string, ports: string[], switchFlag = false): Promise<any> {
    const beginTime = new Date();
    if (port) {
      return Promise.resolve(this._loadSettingsForSelectionsTable(port))
        .then( () => {
          // get the config
          return this.chartService.buildChart(
            this.time[port],
            this.data[port],
            this.uiService.getYScale(this._headerKey, port),
            this._headerText,
            this._headerKey,
            this._selection,
            this.tableSource,
            this._getHostTitle(port),
            this.uiService.getDisplayItems(this._headerKey, port, this.defaultSelectedItems),
            this._onZoom.bind(this))
            .then(() => {
              this.readProgress = 0;
              // after chart has been created, show the chart area, hide progress bar and enable the "show chart" button
              this._toggleItems([
                {id: HtmlElement.chartArea, status: true},
                {id: HtmlElement.readFileProgress, status: false},
                {id: HtmlElement.showChartButton, status: true}
              ]);
              // set port to current displaying port
              this._currentChartPort = port;
              printProcessedTime(beginTime, 'step_build_chart');
              if (ports && ports.length > 0) {
                if (!switchFlag) {
                  // initialize port selector. Do not need to do it when switching port.
                  return this._initPortSelector(ports, port);
                }
              }
            });
        });
    } else {
      if (ports.length > 0) {
        this._showMessage(
          Alert.warning,
          'The selected port does not exist in the name server history file. Please choose a correct port and have a try again.');
        if (!switchFlag) {
          // initialize port selector. Do not need to do it when switching port.
          return this._initPortSelector(ports, port);
        }
      }
    }
  }

  /**
   * get the string that will be displayed on the title area of the chart
   * eg: host1 - 30040 (2018-09-05 15:32:32 ~ 2018-09-07 15:32:15)
   * @param port selected port
   */
  private _getHostTitle(port: string): string {
    if (this.host) {
      return  `${this.host} - ${port} ( ${getTimeRangeString(this.time[port])} )`;
    }
  }

  /**
   * after zoom, enable the reset button.
   */
  private _onZoom(): void {
    this._toggleItems([{id: HtmlElement.resetChartButton, status: true}]);
  }

  /**
   * initialize chart, including: destroy current chart, initialize config, initialize all relative data
   */
  private _initChartEnv(switchFlag: boolean = false): Promise<any> {
    return this.chartService.destroyChart().then(() => {
      {
        // cleanup other data
        this._toggleItems([{id: HtmlElement.chartArea, status: false}]);

        if (!switchFlag) {
          Object.keys(this.time).forEach(key => {
            if (this.time[key]) {
              this.time[key].length = 0;
            }});
          this.time = {};
          Object.keys(this.data).forEach(key => {
            if (this.data[key]) {
              this.data[key].length = 0;
            }});
          this.data = {};
          this.header.length = 0;
          this.host = 'nameserver history file';
          this.tableSource = void 0;
          this.readProgress = 0;
          this.uiService.clearLoadHistoryInfos();
        }
      }
    });
  }

  /**
   * Load settings for the selection table (the right part of the chart)
   * @param port the selected port
   */
  private _loadSettingsForSelectionsTable(port: string): void {
    this.tableSource = this.uiService.getSelectionTableRows(this._headerKey, port, this.defaultSelectedItems);
    this._selection = new SelectionModel(true, []);
    this.tableSource.forEach(row => {
      if (this.uiService.getDisplayItems(this._headerKey, port, this.defaultSelectedItems).includes(row.KPI)) {
        this._selection.select(row);
      }
    });
  }

  /**
   * Show messages
   * @param type type of the message
   * @param message message text
   */
  private _showMessage(type: Alert, message: string): void {
    if (type) {
      switch (type) {
        case Alert.success:
        case Alert.info:
          break;
        case Alert.warning:
          console.warn(message);
          break;
        case Alert.error:
          console.error(message);
      }
    }
    if (this.alertMessage === message) {
      // try trigger the change event of the alert.
      this.alertMessage = void 0;
      setTimeout(() => this.alertMessage = message, 100);
    } else {
      this.alertMessage = message;
    }
    this.alertType = type;
  }

  /**
   * toggle items with the provided status (show or hide the relative element on the page)
   * @param items items with the relative id and status.
   */
  private _toggleItems(items: {id: HtmlElement, status: boolean}[]) {
    const getVariableNameByTypeId = (id: HtmlElement) => {
      switch (id) {
        case HtmlElement.chartArea: return 'showChartFlag';
        case HtmlElement.readFileProgress: return 'showReadFileProgress';
        case HtmlElement.showChartButton: return 'enableShowChartButton';
        case HtmlElement.loadPortsButton: return 'enableLoadPortsButton';
        case HtmlElement.resetChartButton: return 'enableResetChartButton';
      }
    };
    if (items) {
      items.forEach(item => {
        this[getVariableNameByTypeId(item.id)] = item.status;
      });
    }
  }
}
