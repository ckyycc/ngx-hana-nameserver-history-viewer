import {Component, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],

})

export class AppComponent {
  @ViewChild('selectMaxRowsLimitation') rowsLimitationRef: ElementRef;
  maxRowLimitations = [
    {id: '100000', value: 100000, text: 100000},
    {id: '200000', value: 200000, text: 200000},
    {id: '300000', value: 300000, text: 300000},
    {id: '400000', value: 400000, text: 400000},
    {id: '500000', value: 500000, text: 500000}
  ]
  ;
  defaultSelectedItems = ['memoryTotalResident', 'indexserverCpu', 'indexserverMemUsed', 'mvccNum'];
  measureItems = [
    {id: 'Max',     value: 'Max',     text: 'Max',     selected: true},
    {id: 'Average', value: 'Average', text: 'Average', selected: true},
    {id: 'Sum',     value: 'Sum',     text: 'Sum',     selected: false},
    {id: 'Last',    value: 'Last',    text: 'Last',    selected: false}
  ];
  maxRowsLimitation;

  get hiddenMeasures() {
    return this.measureItems.filter(item => !item.selected).map(measureItem => measureItem.text);
  }
}


