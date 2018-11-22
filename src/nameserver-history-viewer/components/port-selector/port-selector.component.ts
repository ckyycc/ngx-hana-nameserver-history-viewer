import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { PortSelectorService } from './port-selector.service';
import { Port } from '../../types';

@Component({
  selector: 'port-selector',
  template: `
    <label>
      <ngx-dropdown-list (selectionChange)="onChange($event)"
                         [items]="displayPorts"
                         [multiSelection]="false"
                         [placeHolder]="'Ports'"
                         [(selectedValue)]="port"
                         [filterBox]="true"
                         [disabled]="disabled">
      </ngx-dropdown-list>
    </label>
  `,
  providers: [ PortSelectorService ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortSelectorComponent {
  /**
   * Input: boolean (optional) bind to [disabled]
   */
  @Input() disabled = false;

  /**
   * Output event bind to (port)
   */
  @Output() portChange = new EventEmitter<string>();

  /**
   * Input: string (required) bind to [port]
   */
  @Input() port: string;

  /**
   * Input: array (required) bind to [ports]
   */
  @Input() ports: Port[];

  get displayPorts() {
    return this.service.getPorts(this.ports);
  }

  constructor(private service: PortSelectorService) {}

  /**
   * onChange function called by the "ngx-select" element
   */
  onChange(event: any) {
    this.portChange.emit(event);
  }
}
