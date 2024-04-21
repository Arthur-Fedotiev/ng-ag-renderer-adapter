import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeavyRendererComponentComponent } from './ui';
import { AgGridAngular } from 'ag-grid-angular'; // AG Grid Component
import { ColDef } from 'ag-grid-community';
import { ETF } from './models/etf';

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
  protected readonly gridOptions = {
    defaultColDef: {
      cellRenderer: HeavyRendererComponentComponent,
    },
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

  protected readonly rowData = this.createMockData(1000);

  createMockData(count: number) {
    const fundNames = ['Vanguard', 'iShares', 'SPDR', 'Fidelity', 'Schwab'];
    const assetClasses = [
      'Equity',
      'Fixed Income',
      'Commodity',
      'Real Estate',
      'Multi-Asset',
    ];
    const tickers = [
      'VTI',
      'VOO',
      'SPY',
      'QQQ',
      'BND',
      'GLD',
      'VNQ',
      'IEMG',
      'HYG',
      'XLF',
    ];

    return Array.from({ length: count }, (_, i) => ({
      fundName: `${fundNames[i % fundNames.length]} Fund ${i}`,
      ticker: tickers[i % tickers.length],
      assetClass: assetClasses[i % assetClasses.length],
      totalAssets: Math.floor(Math.random() * 1000000) + 1000000, // 1M - 2M
      yield: +(Math.random() * 10).toFixed(2), // 0.00 - 10.00
      price: +(Math.random() * 300 + 100).toFixed(2), // 100.00 - 400.00
      fundFlows: Math.floor(Math.random() * 1000000) - 500000, // -500K - 500K
      returnYTD: +(Math.random() * 100 - 50).toFixed(2), // -50.00 - 50.00
      return1Year: +(Math.random() * 100 - 50).toFixed(2), // -50.00 - 50.00
      return3Year: +(Math.random() * 300 - 150).toFixed(2), // -150.00 - 150.00
    }));
  }
}
