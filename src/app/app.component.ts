import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeavyRendererComponentComponent } from './ui';
import { AgGridAngular } from 'ag-grid-angular'; // AG Grid Component
import { ColDef, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { ETF } from './models/etf';
import { createMockEtfData } from './data';
import {
  AgGridComponentManager,
  AgGridNativeRendererAdapter,
} from './ag-native-renderer-adapter';

@Component({
  selector: 'ngagra-root',
  standalone: true,
  imports: [AgGridAngular],
  template: `
    <ag-grid-angular
      style="width: 100%; height: 500px;"
      class="ag-theme-alpine"
      [gridOptions]="gridOptions"
      [columnDefs]="columnDefs"
      [rowData]="rowData"
    >
    </ag-grid-angular>
  `,
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly gridOptions: GridOptions<ETF> = {
    // defaultColDef: this.getDefaultColDefSlow(),
    defaultColDef: this.getDefaultColDefFast(),
    context: { componentManager: inject(AgGridComponentManager) },
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

  private getDefaultColDefSlow(): ColDef<ETF> {
    return {
      cellRenderer: HeavyRendererComponentComponent,
      width: 175,
    };
  }

  private getDefaultColDefFast(): ColDef<ETF> {
    const nativeRendererAdapterParams = {
      component: HeavyRendererComponentComponent,
      nativeRendererAdapterOptions: {
        hostElement: (params: ICellRendererParams<ETF>) =>
          this.createNativeCellWithInputEl(params),
      },
    };

    return {
      cellRenderer: AgGridNativeRendererAdapter,
      cellRendererParams: nativeRendererAdapterParams,
      width: 175,
    };
  }

  private createNativeCellWithInputEl(params: ICellRendererParams<ETF>) {
    const hostElement = document.createElement('div');
    hostElement.className = 'ag-input-cell';
    hostElement.innerHTML = `<div class="native-cell-content">${params.value}</div>`;
    return hostElement;
  }
}
