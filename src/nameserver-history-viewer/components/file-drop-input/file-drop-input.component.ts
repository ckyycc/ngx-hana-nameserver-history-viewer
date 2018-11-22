import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'file-drop-input',
  template: `
    <div class="file-drop-input" [class.file-drop-dropping]="droppingFlag" (drop)="onDropFiles($event)"
         (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)">
      <div class="drop-content">
        <label class="input-button">
          <input type="file" (change)="browseFiles($event)" accept=".trc"/> {{inputAreaText}}&nbsp;
        </label>{{dropAreaText}}
      </div>
    </div>
  `,
  styleUrls: ['./file-drop-input.component.scss']
})

export class FileDropInputComponent {

  @Input()
  dropAreaText = '';
  @Input()
  inputAreaText = '';
  @Output()
  public fileDrop: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  public fileInput: EventEmitter<any> = new EventEmitter<any>();

  droppingFlag = false;

  private static _stopAndPrevent(event) {
    event.stopPropagation(); // Stops some browsers from redirecting.
    event.preventDefault();  // Stops some browsers' default action, like open the file directly
  }

  public browseFiles(event: Event): void {
    this.fileInput.emit(event);
  }

  public onDragOver(event: Event): void {
    FileDropInputComponent._stopAndPrevent(event);
    if (!this.droppingFlag) {
        this.droppingFlag = true;
      }
  }

  public onDragLeave(event: Event): void {
    FileDropInputComponent._stopAndPrevent(event);
    if (this.droppingFlag) {
        this.droppingFlag = false;
      }
  }

  public onDropFiles(event: any) {
    FileDropInputComponent._stopAndPrevent(event);
    this.droppingFlag = false;
    let length = 0;
    if (event.dataTransfer.items) {
      length = event.dataTransfer.items.length;
    } else {
      length = event.dataTransfer.files.length;
    }

    if (length > 1) {
      event.error = 'Multiple files/folders are not supported';
      this.fileDrop.emit(event);
      return;
    }

    if (length === 1) {
      let fileEntry;
      if (event.dataTransfer.items) {
        if (event.dataTransfer.items[0].webkitGetAsEntry) {
          fileEntry = event.dataTransfer.items[0].webkitGetAsEntry();
        }
      } else {
        if (event.dataTransfer.files[0].webkitGetAsEntry) {
          fileEntry = event.dataTransfer.files[0].webkitGetAsEntry();
        }
      }
      if (fileEntry) {
        if (fileEntry.isFile) {
          event.error = void 0;
        } else if (fileEntry.isDirectory) {
          event.error = `Folder (${fileEntry.name}) is not supported.`;
        } else {
          event.error = `Internal error, can not get the type of the dropped item (${fileEntry.name}).`;
        }
      }

      const file: File = event.dataTransfer.files && event.dataTransfer.files.length > 0 ? event.dataTransfer.files[0] : null;
      if (file) {
        event.file = file;
      } else {
        event.error = 'Internal error, can not get the dropped file.';
      }
      this.fileDrop.emit(event);
      return;
    }
  }
}
