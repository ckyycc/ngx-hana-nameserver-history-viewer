import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss'],
})

export class AlertComponent implements OnChanges {
  @Input() alertMessage: string;
  @Input() alertType: string;
  @Input() alertTimeout: number;
  @Output() alertMessageChange = new EventEmitter<string>();

  message: string;
  private _timeout;
  ngOnChanges(changes: SimpleChanges) {
    if (changes.alertMessage) {
      this._setMessage(changes.alertMessage.currentValue);
    }
  }

  private _setMessage(msgString: string) {
    this.message = void 0;
    if (msgString && msgString.length > 0) {
      this._showMessage(msgString);
      this._setTimeout();
    }
  }

  private _showMessage(msgString: string) {
    setTimeout(() => this.message = msgString, 100);
  }

  private _setTimeout() {
    if (this.alertTimeout > 0) {
      // clear time out first, it doesn't matter whether the _timeout is undefined or not.
      clearTimeout(this._timeout);
      this._timeout = setTimeout(() => this.clearAlert(), this.alertTimeout);
    }
  }

  clearAlert() {
    this.alertMessage = void 0;
    this.alertType = void 0;
    this.alertMessageChange.emit(this.alertMessage);
    clearTimeout(this._timeout);
  }

  /**
   * get css class base on the alert type
   */
  get alertClassType() {
    if (this.alertType) {
      switch (this.alertType.toLowerCase()) {
        case 'success':
          return 'alert-success';
        case 'error':
          return 'alert-error';
        case 'info':
          return 'alert-info';
        case 'warning':
          return 'alert-warning';
      }
    }
  }
}
