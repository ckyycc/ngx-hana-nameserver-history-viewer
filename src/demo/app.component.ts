import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
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

  ngOnInit() {
    // Initialize the row limitation with local storage
    const selectedRowLimitation = this._getLocalStorage(this.maxRowsLimitationStorageName);
    if (selectedRowLimitation) {
      this.maxRowLimitations.forEach((item: any) => item.selected = selectedRowLimitation.includes(item.id));
    }

    // Initialize the measures with local storage
    const selectedMeasures = this._getLocalStorage(this.measureItemsStorageName);
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
    this._setLocalStorage(this.maxRowsLimitationStorageName, event == null ? undefined : event.toString());
  }

  /**
   * triggered by selection change of measures
   */
  onChangeMeasure() {
    // save the selected measures to local storage
    this._setLocalStorage(this.measureItemsStorageName, this.measureItems.filter(item => item.selected).map(item => item.id));
  }

  /**
   * save data to related local storage
   * @param name local storage item name
   * @param data data that needs to be saved in local storage
   */
  private _setLocalStorage(name, data) {
    if (name == null || name.length === 0) {
      return;
    }
    if (data) {
      localStorage.setItem(name, JSON.stringify(data));
    } else {
      localStorage.removeItem(name);
    }
  }

  /**
   * get data from local storage
   * @param name local storage item name
   */
  private _getLocalStorage(name): any {
    if (name == null || name.length === 0) {
      return undefined;
    }

    const data = localStorage.getItem(name);
    if (data != null) {
      return JSON.parse(data);
    } else {
      return undefined;
    }
  }
}
