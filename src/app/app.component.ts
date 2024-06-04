import { MatCardModule } from '@angular/material/card';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeavyRendererComponentComponent, LegendComponent } from './ui';
import { AgGridAngular } from 'ag-grid-angular'; // AG Grid Component
import { ColDef, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { ETF } from './models/etf';
import { createMockEtfData } from './data';
import {
  AgGridComponentManager,
  AgGridNativeRendererAdapter,
} from './ag-native-renderer-adapter';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngagra-root',
  standalone: true,
  imports: [
    CommonModule,
    AgGridAngular,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
    LegendComponent,
  ],
  template: `
    <ngagra-legend />
    <mat-tab-group>
      <mat-tab label="Un-optimized">
        <ng-template matTabContent>
          <ag-grid-angular
            style="width: 100%; height: 500px;"
            class="ag-theme-alpine"
            [gridOptions]="gridOptions"
            [defaultColDef]="defColDefSlow"
            [columnDefs]="columnDefs"
            [rowData]="rowData"
          >
          </ag-grid-angular>
        </ng-template>
      </mat-tab>
      <mat-tab label="Optimized">
        <ng-template matTabContent>
          <ag-grid-angular
            style="width: 100%; height: 500px;"
            class="ag-theme-alpine"
            [gridOptions]="gridOptions"
            [columnDefs]="columnDefs"
            [defaultColDef]="defColDefFast"
            [rowData]="rowData"
          >
  
                  </ag-grid-angular>
        </ng-template>
      </mat-tab>
    </mat-tab-group>
  `,
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly gridOptions: GridOptions<ETF> = {
    context: { componentManager: inject(AgGridComponentManager) },
  };

  protected readonly defColDefSlow: ColDef<ETF> = {
    cellRenderer: HeavyRendererComponentComponent,
    width: 175,
  };

  protected readonly defColDefFast: ColDef<ETF> = {
    cellRenderer: AgGridNativeRendererAdapter,
    cellRendererParams: {
      component: HeavyRendererComponentComponent,
      nativeRendererAdapterOptions: {
        hostElement: (params: ICellRendererParams<ETF>) =>
          this.createNativeCellWithInputEl(params),
      },
    },
    width: 175,
  };

  protected readonly columnDefs: ColDef<ETF>[] = [
    { headerName: 'Fund Name', field: 'fundName' },
    { headerName: 'Ticker', field: 'ticker' },
    { headerName: 'Asset Class', field: 'assetClass' },
    { headerName: 'Total Assets ($)', field: 'totalAssets' },
    { headerName: 'Yield (%)', field: 'yield' },
    { headerName: 'Price ($)', field: 'price' },
    { headerName: 'Fund Flows ($)', field: 'fundFlows' },
    { headerName: 'Return YTD (%)', field: 'returnYTD' },
    { headerName: 'Return 1 Year (%)', field: 'return1Year' },
    { headerName: 'Return 3 Years (%)', field: 'return3Year' },
  ];

  protected readonly rowData = createMockEtfData(10_000);

  private createNativeCellWithInputEl(params: ICellRendererParams<ETF>) {
    const hostElement = document.createElement('div');
    hostElement.className = 'ag-input-cell';
    hostElement.innerHTML = `<div class="native-cell-content">${params.value}</div>`;
    return hostElement;
  }
}
