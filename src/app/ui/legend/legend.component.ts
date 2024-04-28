import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'ngagra-legend',
  standalone: true,
  imports: [
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
  ],
  template: `
    <mat-accordion class="accordion">
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>
            Ag-Grid Rendering Performance Optimization (Expand for Details)
          </mat-panel-title>
        </mat-expansion-panel-header>
        <p>
          This solution optimizes the rendering performance of ag-Grid cell
          renderers by providing two different rendering strategies, which are
          demonstrated in two separate tabs in the user interface.
        </p>
        <mat-divider></mat-divider>
        <div class="info-section">
          <div>
            <div class="icon-title">
              <mat-icon class="icon-red">thumb_down</mat-icon>
              <h2 class="legend-header">
                Unoptimized Performance (Red Border)
              </h2>
            </div>

            <p>
              This tab uses a "heavy" cell renderer, which means that each cell
              in the grid is rendered using a complex Angular component. This
              approach can lead to slower performance, especially when dealing
              with large amounts of data, because each cell renderer creates its
              own Angular component instance.
              <br />
              <b
                >NOTE: Angular cell renderers are represented with a
                <span style="color: red;"> red border around the cells</span>.
                In a real-world application, they would be styled to match the
                application's design so that users are unaware of the
                difference.</b
              >
            </p>
          </div>
        </div>
        <mat-divider></mat-divider>
        <div class="info-section">
          <div>
            <div class="icon-title">
              <mat-icon class="icon-green">thumb_up</mat-icon>
              <h2 class="legend-header">
                Optimized Performance (Green Border)
              </h2>
            </div>
            <p>
              This tab uses an optimized cell renderer that improves performance
              by using lightweight native DOM elements for each cell. The cells
              in this tab have a green border to indicate optimized performance.
              When a cell is hovered over or focused, the lightweight native
              element is replaced with the actual Angular Cell renderer
              component, allowing for complex functionality. This approach
              combines the performance benefits of lightweight rendering with
              the flexibility and maintenance benefits of Angular components.
              The user interface remains consistent in both tabs.
            </p>
          </div>
        </div>
      </mat-expansion-panel>
    </mat-accordion>
  `,
  styles: [
    `
      .accordion {
        margin: 1rem auto;
        width: 80%;
      }
      .info-section {
        display: flex;
        align-items: center;
        margin: 10px 0;
      }
      .legend-header {
        margin: 0 1rem 0;
      }
      .icon-title {
        display: flex;
        place-items: center;
      }
      .icon-red {
        color: red;
      }
      .icon-green {
        color: green;
      }
    `,
  ],
})
export class LegendComponent {}
