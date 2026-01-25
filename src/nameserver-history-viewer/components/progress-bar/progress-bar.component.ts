import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'progress-bar',
  styleUrls: ['./progress-bar.component.scss'],
  template: `
    <div class="progress-content">
      <div class="progress">
        <span class="bar" [style.width]="progress + '%'" [class.is-done]="progress == 100"></span>
      </div>
    </div>
    <div class="progress-text-content">
        <span class="progress-text" [class.is-done]="progress === 100">
          <span>{{ progress }}% </span>
          <span *ngIf="progress < 100">Parsing...</span> <!--{{file?.name}}-->
          <span *ngIf="progress === 100">Done</span>
        </span>
    </div>
  `,
  imports: [ CommonModule ]
})

export class ProgressBarComponent {

  @Input()
  public progress: number;

}
