import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  inject,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { ETF } from '../../models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

/**
 * This component is a heavy component that will slow down the rendering of the grid.
 */
@Component({
  selector: 'ngagra-heavy-renderer-component',
  standalone: true,
  imports: [MatInputModule, MatFormFieldModule, CommonModule],
  template: `
    <!-- This is just a dummy component to simulate a heavy component that will slow down the rendering of the grid. -->
    <div style="display: none;">
      <mat-form-field *ngFor="let n of itWillSlooooowThingsDown">
        <mat-label>Input</mat-label>
        <input matInput />
      </mat-form-field>
    </div>
    <input matInput class="value-input" [value]="params.value" />
  `,
  styles: [
    `
      .value-input {
        font-family: var(--ag-font-family);
        width: 100%;
        border: 1px solid red;
        text-align: right;
        font-size: 14px;
        letter-spacing: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeavyRendererComponentComponent
  implements ICellRendererAngularComp
{
  @HostBinding('class.ag-input-cell') readonly hostClass = true;

  protected params!: ICellRendererParams<ETF>;
  protected readonly itWillSlooooowThingsDown = Array(40).fill(0);

  private readonly cdr = inject(ChangeDetectorRef);

  agInit(params: ICellRendererParams<ETF>) {
    this.params = params;
  }

  refresh(params: ICellRendererParams<ETF>) {
    this.params = params;
    this.cdr.detectChanges();

    return true;
  }
}
