import { CommonModule } from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'instruction',
  templateUrl: './instruction.component.html',
  styleUrls: ['./instruction.component.scss'],
  imports: [ CommonModule ]
})

export class InstructionComponent {
  @Input()
  step1Finished = false;
  @Input()
  step2Finished = false;
  @Input()
  step3Finished = false;
  @Input()
  step4Finished = false;
  @Input()
  step5Finished = false;
  @Input()
  show = true;
  /**
   * Output event bind to (show)
   */
  @Output() showChange = new EventEmitter<boolean>();
  onClose() {
    this.show = false;
    this.showChange.emit(this.show);
  }
}
