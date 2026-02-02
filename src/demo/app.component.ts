import {Component, OnInit} from '@angular/core';
import {getAbbreviationAndOffset, getLocalStorage, getTimeZoneFromTopology, setLocalStorage, TimeZoneAbbrOffset, parseHostPortServices, parseTopologyJson} from './demo-util';
import {DemoService} from './demo-service';
import {Alert} from '../nameserver-history-viewer/types';
import { DropdownListComponent } from 'ngx-dropdown-list';
import { NameServerHistoryComponent } from '../nameserver-history-viewer/components/nameserver-history.component';
import { AlertComponent } from '../nameserver-history-viewer/components/alert';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [ CommonModule, AlertComponent, DropdownListComponent, NameServerHistoryComponent ],
  providers: [ DemoService ],
})

export class AppComponent implements OnInit {
  /**
   * max row number limitations
   */
  maxRowLimitations = [
    {id: '100000', value: 100000, text: 100000},
    {id: '200000', value: 200000, text: 200000},
    {id: '300000', value: 300000, text: 300000},
    {id: '400000', value: 400000, text: 400000},
    {id: '500000', value: 500000, text: 500000}
  ];

  /**
   * Default selected Items
   */
  defaultSelectedItems = ['memoryTotalResident', 'indexserverCpu', 'indexserverMemUsed', 'mvccNum'];

  /**
   * measures in control table
   */
  measureItems = [
    {id: 'Max',     value: 'Max',     text: 'Max',     selected: true},
    {id: 'Average', value: 'Average', text: 'Average', selected: true},
    {id: 'Sum',     value: 'Sum',     text: 'Sum',     selected: false},
    {id: 'Last',    value: 'Last',    text: 'Last',    selected: false}
  ];

  /**
   * selected value max row number Limitation.
   */
  maxRowsLimitation;

  /**
   * storage name of max row number limitation
   */
  maxRowsLimitationStorageName = 'maxRowLimitation';

  /**
   * storage name of selected measures
   */
  measureItemsStorageName = 'measureItems';

  /**
   * timezone string
   */
  timezone: string;

  /**
   * alert message content
   */
  alertMessage: string;

  /**
   * alert message type
   */
  alertType: Alert;

  /**
   * host service port info
   */
  hostPortServiceInfo: any;

  constructor(private service: DemoService) {}

  ngOnInit() {
    // Initialize the row limitation with local storage
    const selectedRowLimitation = getLocalStorage(this.maxRowsLimitationStorageName);
    if (selectedRowLimitation) {
      this.maxRowLimitations.forEach((item: any) => item.selected = selectedRowLimitation.includes(item.id));
    }

    // Initialize the measures with local storage
    const selectedMeasures = getLocalStorage(this.measureItemsStorageName);
    if (selectedMeasures) {
      this.measureItems.forEach(item => item.selected = selectedMeasures.includes(item.id));
    }
  }

  /**
   * get hidden measures base on the selected measures
   */
  get hiddenMeasures() {
    return this.measureItems.filter(item => !item.selected).map(measureItem => measureItem.text);
  }

  /**
   * triggered by selection change of max row limitation
   * @param event selected value
   */
  onChangeRowLimitation(event) {
    // save the selected item to local storage
    setLocalStorage(this.maxRowsLimitationStorageName, event == null ? undefined : event.toString());
  }

  /**
   * triggered by selection change of measures
   */
  onChangeMeasure() {
    // save the selected measures to local storage
    setLocalStorage(this.measureItemsStorageName, this.measureItems.filter(item => item.selected).map(item => item.id));
  }

  /**
   * select topology file
   */
  browseFiles(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => this._processFileContent(e.target?.result as string);
    reader.readAsText(file);
  }

  /**
   * Process the uploaded file content
   */
  private _processFileContent(fileContent: string): void {
    const { hosts, timezone } = this._parseFileContent(fileContent);
    
    this.hostPortServiceInfo = hosts;
    console.log(this.hostPortServiceInfo);
    
    this._updateTimezone(timezone.abbreviation, timezone.offset);
  }

  /**
   * Parse file content (JSON or text format)
   */
  private _parseFileContent(fileContent: string): { hosts: any, timezone: { abbreviation: string, offset: number } } {
    try {
      // Try parsing as JSON first
      const jsonContent = JSON.parse(fileContent);
      const result = parseTopologyJson(jsonContent);
      return {
        hosts: result.hosts,
        timezone: result.timezone
      };
    } catch {
      // Fall back to text parsing
      const timezone = getAbbreviationAndOffset(fileContent);
      return {
        hosts: parseHostPortServices(fileContent),
        timezone
      };
    }
  }

  /**
   * Update timezone based on parsed information
   */
  private _updateTimezone(abbreviation: string, offset: number): void {
    const timezone = getTimeZoneFromTopology(abbreviation, offset, this.service.timezoneAbbrMappings);
    if (timezone?.length > 0) {
      this.timezone = timezone;
      this._showMessage(Alert.info, `Timezone is changed to ${this.timezone} based on (${abbreviation}, ${offset * 3600})`);
    } else {
      this._showMessage(Alert.warning,
        'Can not find the timezone information from the provided file, please choose correct "topology.txt" or "nameserver_topology_<host>.json" from full system dump.');
    }
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
}
