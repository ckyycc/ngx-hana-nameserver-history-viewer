import {Component, OnInit} from '@angular/core';
import {getAbbreviationAndOffset, getLocalStorage, getTimeZoneFromTopology, setLocalStorage, TimeZoneAbbrOffset} from './demo-util';
import {DemoService} from './demo-service';
import {Alert} from '../nameserver-history-viewer/types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
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
  browseFiles(event) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const fileContent = e.target.result;
      const {abbreviation, offset}: TimeZoneAbbrOffset = getAbbreviationAndOffset(fileContent);
      const timezone = getTimeZoneFromTopology(abbreviation, offset, this.service.getTimezoneAbbrMappings());
      if (timezone != null && timezone.length > 0) {
        this.timezone = timezone;
        this._showMessage(Alert.info, `Timezone is changed to ${this.timezone} based on (${abbreviation}, ${offset * 3600})`);
      } else {
        this._showMessage(Alert.warning,
          'Can not find the timezone information from the provided file, please choose correct "topology.txt" from full system dump.');
      }
    };
    reader.readAsText(event.target.files[0]);
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
