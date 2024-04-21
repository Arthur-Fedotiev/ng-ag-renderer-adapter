import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
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
  imports: [MatCardModule, MatInputModule, MatFormFieldModule, CommonModule],
  template: `
    <!-- This is just a dummy component to simulate a heavy component that will slow down the rendering of the grid. -->
    <div style="display: none;">
      <mat-form-field *ngFor="let n of itWillSlooooowThingsDown">
        <mat-label>Input</mat-label>
        <input matInput />
      </mat-form-field>
    </div>
    <input matInput class="red-outline" [value]="params.value" />
  `,
  styles: [
    `
      mat-card {
        max-width: 400px;
      }

      .red-outline {
        border: 1px solid red;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeavyRendererComponentComponent
  implements ICellRendererAngularComp
{
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
